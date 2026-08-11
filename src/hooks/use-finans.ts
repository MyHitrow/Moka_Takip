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
      const { data, error } = await supabase.from('income_records').insert({
        client_name: item.client.trim(),
        description: item.description || `${item.client} - Tahsilat`,
        amount: item.amount,
        due_date: item.date,
        collection_status: item.status || 'pending',
        paid_amount: item.paidAmount || (item.status === 'paid' ? item.amount : 0),
      }).select();

      if (error) {
        logger.error('Gelir ekleme hatası:', error.message);
      } else if (data && data[0]) {
        setGelirler((prev) => prev.map((g) => (g.id === tempId ? { ...g, id: data[0].id } : g)));
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('addGelir hatası:', e);
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

  const updateGelirStatus = async (id: string, status: string, paidAmount?: number) => {
    setGelirler((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const newPaidAmount = paidAmount !== undefined ? paidAmount : status === 'paid' ? g.amount : g.paidAmount || 0;
        return { ...g, status, paidAmount: newPaidAmount };
      })
    );

    try {
      if (isUUID(id)) {
        const updatePayload: Record<string, unknown> = { collection_status: status };
        if (paidAmount !== undefined) {
          updatePayload.paid_amount = paidAmount;
        } else if (status === 'paid') {
          const currentItem = gelirler.find((g) => g.id === id);
          if (currentItem) updatePayload.paid_amount = currentItem.amount;
        }

        const { error } = await supabase.from('income_records').update(updatePayload).eq('id', id);
        if (error) {
          logger.error('Gelir durumu güncelleme hatası:', error.message);
          delete updatePayload.paid_amount;
          await supabase.from('income_records').update(updatePayload).eq('id', id);
        }
        await fetchCloudData();
      }
    } catch (e) {
      logger.error('updateGelirStatus beklenmeyen hata:', e);
    }
  };

  // Ayın 27'sinden itibaren bir sonraki aya otomatik gelir oluştur
  const generateMonthlyIncomes = async (targetMonthStr?: string): Promise<number> => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    let targetDate = new Date();
    if (targetMonthStr) {
      const [y, m] = targetMonthStr.split('-');
      targetDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
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
      const { data, error } = await supabase.from('expense_records').insert({
        title: item.title,
        description: item.title,
        amount: item.amount,
        category: safeExpenseCategory(item.category),
        expense_date: item.date,
        paid_by_text: item.paidBy || 'Şirket Hesabı',
      }).select();

      if (error) {
        logger.error('Gider ekleme hatası:', error.message);
      } else if (data && data[0]) {
        setGiderler((prev) => prev.map((g) => (g.id === tempId ? { ...g, id: data[0].id } : g)));
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('addGider hatası:', e);
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
