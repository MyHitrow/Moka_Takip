import { SupabaseClient } from '@supabase/supabase-js';
import { Isletme, Gelir, Cekim, EditItem, TakvimPost } from '@/types/app';
import { isUUID, isClientMatch } from '@/lib/helpers';
import { logger } from '@/lib/logger';

interface UseIsletmelerProps {
  isletmeler: Isletme[];
  gelirler: Gelir[];
  cekimler: Cekim[];
  editler: EditItem[];
  takvimPosts: TakvimPost[];
  setIsletmeler: React.Dispatch<React.SetStateAction<Isletme[]>>;
  setGelirler: React.Dispatch<React.SetStateAction<Gelir[]>>;
  setCekimler: React.Dispatch<React.SetStateAction<Cekim[]>>;
  setEditler: React.Dispatch<React.SetStateAction<EditItem[]>>;
  setTakvimPosts: React.Dispatch<React.SetStateAction<TakvimPost[]>>;
  supabase: SupabaseClient;
  fetchCloudData: () => Promise<void>;
}

export function createIsletmelerActions({
  isletmeler,
  setIsletmeler,
  setGelirler,
  setCekimler,
  setEditler,
  setTakvimPosts,
  supabase,
  fetchCloudData,
}: UseIsletmelerProps) {
  const addIsletme = async (item: Omit<Isletme, 'id'>) => {
    const numFee = parseFloat(item.fee.replace(/[^0-9.]/g, '')) || 0;
    const cleanNotes = item.notes ? item.notes.split('__AI_META__:')[0].trim() : '';
    const cleanContact = item.contact ? item.contact.split('__AI_META__:')[0].trim() : '-';

    try {
      const { data, error } = await supabase.from('clients').insert({
        name: item.name.trim(),
        contact_name: cleanContact,
        phone: item.phone,
        instagram: item.instagram,
        monthly_fee: numFee,
        is_active: item.active,
        max_days_between_posts: item.maxDaysBetweenPosts || 3,
        monthly_reels_target: item.monthlyReelsTarget || 10,
        monthly_shoot_target: item.monthlyShootTarget || 2,
        notes: cleanNotes,
      }).select().single();

      if (error) {
        logger.error('İşletme ekleme hatası:', error.message);
      }

      if (numFee > 0 && item.active) {
        const today = new Date();
        const firstWeekDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-05`;
        const { error: incErr } = await supabase.from('income_records').insert({
          client_name: item.name.trim(),
          description: `${item.name.trim()} - Aylık Paket Ücreti (Ayın İlk Haftası)`,
          amount: numFee,
          due_date: firstWeekDate,
          collection_status: 'pending',
        });
        if (incErr) logger.error('Aylık paket gelir kaydı hatası:', incErr.message);
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('addIsletme beklenmeyen hata:', e);
    }
  };

  const updateIsletme = async (id: string, updatedFields: Partial<Isletme>) => {
    const target = isletmeler.find((i) => i.id === id);
    const oldName = target?.name;
    const numFee = updatedFields.fee !== undefined
      ? parseFloat(updatedFields.fee.replace(/[^0-9.]/g, '')) || 0
      : undefined;
    const newName = (updatedFields.name || oldName || '').trim();

    // Yerel state güncelle
    setIsletmeler((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields, name: newName } : item))
    );

    if (oldName || newName) {
      setGelirler((prev) =>
        prev.map((g) => {
          if (isClientMatch(g.client, oldName || '') || isClientMatch(g.client, newName)) {
            return {
              ...g,
              client: newName,
              description: `${newName} - Aylık Paket Ücreti`,
              amount: numFee !== undefined && g.status !== 'paid' ? numFee : g.amount,
            };
          }
          return g;
        })
      );
      setCekimler((prev) =>
        prev.map((c) => (isClientMatch(c.client, oldName || '') ? { ...c, client: newName } : c))
      );
      setEditler((prev) =>
        prev.map((e) => (isClientMatch(e.client, oldName || '') ? { ...e, client: newName } : e))
      );
      setTakvimPosts((prev) =>
        prev.map((t) => (isClientMatch(t.client, oldName || '') ? { ...t, client: newName } : t))
      );
    }

    try {
      const mergedNotes = updatedFields.notes !== undefined ? updatedFields.notes : (target?.notes || '');
      const cleanNotes = mergedNotes.split('__AI_META__:')[0].trim();
      const mergedContact = (updatedFields.contact !== undefined ? updatedFields.contact : (target?.contact || '-')).split('__AI_META__:')[0].trim();

      const updateData: Record<string, unknown> = {
        contact_name: mergedContact,
        notes: cleanNotes,
      };

      if (updatedFields.name !== undefined) updateData.name = newName;
      if (updatedFields.phone !== undefined) updateData.phone = updatedFields.phone;
      if (updatedFields.instagram !== undefined) updateData.instagram = updatedFields.instagram;
      if (numFee !== undefined) updateData.monthly_fee = numFee;
      if (updatedFields.active !== undefined) updateData.is_active = updatedFields.active;
      if (updatedFields.maxDaysBetweenPosts !== undefined) updateData.max_days_between_posts = updatedFields.maxDaysBetweenPosts;
      if (updatedFields.monthlyReelsTarget !== undefined) updateData.monthly_reels_target = updatedFields.monthlyReelsTarget;
      if (updatedFields.monthlyShootTarget !== undefined) updateData.monthly_shoot_target = updatedFields.monthlyShootTarget;

      if (isUUID(id)) {
        const { error } = await supabase.from('clients').update(updateData).eq('id', id);
        if (error) {
          logger.error('İşletme güncelleme hatası:', error.message);
        }
      } else if (target) {
        const { error } = await supabase.from('clients').update(updateData).eq('name', target.name);
        if (error) {
          logger.error('İşletme güncelleme hatası (name):', error.message);
        }
      }

      // Gelir kayıtlarını da güncelle
      const { data: allIncomes } = await supabase.from('income_records').select('*');
      if (allIncomes) {
        for (const inc of allIncomes) {
          if (isClientMatch(inc.client_name, oldName || '') || isClientMatch(inc.client_name, newName)) {
            const updateInc: Record<string, unknown> = {
              client_name: newName,
              description: `${newName} - Aylık Paket Ücreti (Ayın İlk Haftası)`,
            };
            if (numFee !== undefined && inc.collection_status !== 'paid') {
              updateInc.amount = numFee;
            }
            await supabase.from('income_records').update(updateInc).eq('id', inc.id);
          }
        }
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('updateIsletme beklenmeyen hata:', e);
    }
  };

  const deleteIsletme = async (id: string) => {
    const target = isletmeler.find((i) => i.id === id);
    const targetName = target?.name;

    setIsletmeler((prev) => prev.filter((i) => i.id !== id));
    if (targetName) {
      setGelirler((prev) => prev.filter((g) => !isClientMatch(g.client, targetName)));
      setCekimler((prev) => prev.filter((c) => !isClientMatch(c.client, targetName)));
      setEditler((prev) => prev.filter((e) => !isClientMatch(e.client, targetName)));
      setTakvimPosts((prev) => prev.filter((t) => !isClientMatch(t.client, targetName)));
    }

    try {
      if (isUUID(id)) {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) logger.error('İşletme silme hatası:', error.message);
      } else if (target) {
        const { error } = await supabase.from('clients').delete().eq('name', target.name);
        if (error) logger.error('İşletme silme hatası (name):', error.message);
      }

      if (targetName) {
        for (const table of ['income_records', 'shoots', 'edits', 'content_calendar'] as const) {
          const { data: rows } = await supabase.from(table).select('id, client_name');
          if (rows) {
            for (const row of rows) {
              if (isClientMatch(row.client_name, targetName)) {
                await supabase.from(table).delete().eq('id', row.id);
              }
            }
          }
        }
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('deleteIsletme beklenmeyen hata:', e);
    }
  };

  return { addIsletme, updateIsletme, deleteIsletme };
}
