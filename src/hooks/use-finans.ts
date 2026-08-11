import { SupabaseClient } from '@supabase/supabase-js';
import { Gelir, Gider, Isletme } from '@/types/app';
import { isUUID, isClientMatch, safeExpenseCategory } from '@/lib/helpers';
import { logger } from '@/lib/logger';

interface UseFinansProps {
  gelirler: Gelir[];
  giderler: Gider[];
  isletmeler: Isletme[];
  setGelirler: React.Dispatch<React.SetStateAction<Gelir[]>>;
  setGiderler: React.Dispatch<React.SetStateAction<Gider[]>>;
  supabase: SupabaseClient;
  fetchCloudData: () => Promise<void>;
}

export function createFinansActions({
  gelirler,
  isletmeler,
  setGelirler,
  setGiderler,
  supabase,
  fetchCloudData,
}: UseFinansProps) {
  const addGelir = async (item: Omit<Gelir, 'id'>) => {
    const tempId = `temp_${Date.now()}`;
    const newGelir: Gelir = { id: tempId, ...item };

    // Optimistik UI güncellemesi — anında ekranda göster
    setGelirler((prev) => [newGelir, ...prev]);

    try {
      // 1. Müşteri ID'sini bul veya gerekirse oluştur
      const { data: clients } = await supabase.from('clients').select('id, name');
      let matched = clients?.find((c) => isClientMatch(c.name, item.client));
      let validClientId = matched?.id;

      if (!validClientId && clients && clients.length > 0) {
        validClientId = clients[0].id;
      }

      if (!validClientId) {
        const { data: newClientData } = await supabase.from('clients').insert({
          name: item.client.trim(),
          contact_person: '-',
          phone: '-',
        }).select();
        if (newClientData && newClientData[0]) {
          validClientId = newClientData[0].id;
        }
      }

      // 2. Insert payload'u hazırla
      const payload: Record<string, unknown> = {
        description: item.description || `${item.client} - Tahsilat`,
        amount: item.amount,
        due_date: item.date,
        collection_status: item.status || 'pending',
      };

      if (validClientId) {
        payload.client_id = validClientId;
      }
      payload.client_name = item.client.trim();
      payload.paid_amount = item.paidAmount || (item.status === 'paid' ? item.amount : 0);

      // 3. Supabase'e ekle
      let { data, error } = await supabase.from('income_records').insert(payload).select();

      // Eğer yeni sütunlardan biri (client_name/paid_amount) hata verirse, çekirdek alanlarla tekrar dene
      if (error) {
        logger.error('Gelir ekleme 1. deneme hatası:', error.message);

        const fallbackPayload: Record<string, unknown> = {
          description: item.description || `${item.client} - Tahsilat`,
          amount: item.amount,
          due_date: item.date,
          collection_status: item.status || 'pending',
        };
        if (validClientId) {
          fallbackPayload.client_id = validClientId;
        }

        const retry = await supabase.from('income_records').insert(fallbackPayload).select();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        logger.error('Gelir ekleme nihai hatası:', error.message);
        alert(`Gelir veritabanına kaydedilemedi: ${error.message}`);
        return;
      }

      if (data && data[0]) {
        setGelirler((prev) => prev.map((g) => (g.id === tempId ? { ...g, id: data[0].id } : g)));
      }
      await fetchCloudData();
    } catch (e: any) {
      logger.error('addGelir beklenmeyen hata:', e);
      alert(`Gelir ekleme sırasında bir hata oluştu: ${e?.message || e}`);
    }
  };

  const deleteGelir = async (id: string) => {
    setGelirler((prev) => prev.filter((i) => i.id !== id));
    try {
      if (isUUID(id)) {
        const { error } = await supabase.from('income_records').delete().eq('id', id);
        if (error) logger.error('Gelir silme hatası:', error.message);
        await fetchCloudData();
      }
    } catch (e) {
      logger.error('deleteGelir beklenmeyen hata:', e);
    }
  };

  const updateGelirStatus = async (id: string, status: string, customPaidAmount?: number) => {
    setGelirler((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const finalPaid =
            status === 'paid'
              ? g.amount
              : status === 'partial'
              ? customPaidAmount !== undefined
                ? customPaidAmount
                : g.paidAmount || 0
              : 0;

          return { ...g, status, paidAmount: finalPaid };
        }
        return g;
      })
    );

    try {
      if (isUUID(id)) {
        const item = gelirler.find((g) => g.id === id);
        const finalPaid =
          status === 'paid'
            ? (item?.amount || 0)
            : status === 'partial'
            ? customPaidAmount !== undefined
              ? customPaidAmount
              : item?.paidAmount || 0
            : 0;

        const updateObj: Record<string, unknown> = {
          collection_status: status,
          paid_amount: finalPaid,
        };

        const { error } = await supabase.from('income_records').update(updateObj).eq('id', id);
        if (error) logger.error('Gelir durumu güncelleme hatası:', error.message);
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('updateGelirStatus beklenmeyen hata:', e);
    }
  };

  // Ayın 27'sinden itibaren bir sonraki aya otomatik gelir oluştur
  const generateMonthlyIncomes = async (targetMonthStr?: string): Promise<number> => {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;

    if (!targetMonthStr && today.getDate() >= 27) {
      month += 1;
      if (month > 12) { month = 1; year += 1; }
    }

    const datePrefix = targetMonthStr || `${year}-${String(month).padStart(2, '0')}`;
    const dueDate = `${datePrefix}-05`;

    const { data: existingDbRecords } = await supabase
      .from('income_records')
      .select('client_name')
      .like('due_date', `${datePrefix}%`);

    let count = 0;
    for (const biz of isletmeler) {
      if (!biz.active) continue;
      const numFee = parseFloat(biz.fee.replace(/[^0-9.]/g, '')) || 0;
      if (numFee <= 0) continue;

      const existsInDb = existingDbRecords?.some((rec) => isClientMatch(rec.client_name, biz.name));
      const existsInState = gelirler.some(
        (g) => isClientMatch(g.client, biz.name) && g.date.startsWith(datePrefix)
      );

      if (!existsInDb && !existsInState) {
        try {
          const { error } = await supabase.from('income_records').insert({
            client_name: biz.name.trim(),
            description: `${biz.name.trim()} - Aylık Paket Ücreti (Ayın İlk Haftası)`,
            amount: numFee,
            due_date: dueDate,
            collection_status: 'pending',
          });
          if (error) logger.error('Aylık gelir oluşturma hatası:', error.message);
          else count++;
        } catch (e) {
          logger.error('generateMonthlyIncomes döngü hatası:', e);
        }
      }
    }

    await fetchCloudData();
    return count;
  };

  const addGider = async (item: Omit<Gider, 'id'>) => {
    const tempId = `temp_${Date.now()}`;
    const newGider: Gider = { id: tempId, ...item };

    // Optimistik UI güncellemesi — anında ekranda göster
    setGiderler((prev) => [newGider, ...prev]);

    try {
      const payload: Record<string, unknown> = {
        description: item.title,
        title: item.title,
        category: safeExpenseCategory(item.category),
        amount: item.amount,
        expense_date: item.date,
        paid_by_text: item.paidBy,
      };

      let { data, error } = await supabase.from('expense_records').insert(payload).select();

      // Eğer Supabase'de title veya paid_by_text sütunları yoksa, 001 ana şemadaki 4 çekirdek alanla tekrar dene
      if (error) {
        logger.error('Gider 1. deneme hatası:', error.message);

        const corePayload = {
          description: item.title,
          category: safeExpenseCategory(item.category),
          amount: item.amount,
          expense_date: item.date,
        };

        const retry = await supabase.from('expense_records').insert(corePayload).select();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        logger.error('Gider ekleme nihai hatası:', error.message);
        alert(`Gider veritabanına kaydedilemedi: ${error.message}`);
        return;
      }

      if (data && data[0]) {
        setGiderler((prev) => prev.map((g) => (g.id === tempId ? { ...g, id: data[0].id } : g)));
      }
      await fetchCloudData();
    } catch (e: any) {
      logger.error('addGider beklenmeyen hata:', e);
      alert(`Gider ekleme sırasında hata oluştu: ${e?.message || e}`);
    }
  };

  const deleteGider = async (id: string) => {
    setGiderler((prev) => prev.filter((i) => i.id !== id));
    try {
      if (isUUID(id)) {
        const { error } = await supabase.from('expense_records').delete().eq('id', id);
        if (error) logger.error('Gider silme hatası:', error.message);
        await fetchCloudData();
      }
    } catch (e) {
      logger.error('deleteGider beklenmeyen hata:', e);
    }
  };

  return { addGelir, deleteGelir, updateGelirStatus, generateMonthlyIncomes, addGider, deleteGider };
}
