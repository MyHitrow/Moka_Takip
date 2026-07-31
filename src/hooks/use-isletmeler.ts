import { SupabaseClient } from '@supabase/supabase-js';
import { Isletme, Gelir, Cekim, EditItem, TakvimPost } from '@/types/app';
import { isUUID, isClientMatch } from '@/lib/helpers';

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
    try {
      await supabase.from('clients').insert({
        name: item.name.trim(),
        contact_name: item.contact,
        phone: item.phone,
        instagram: item.instagram,
        monthly_fee: numFee,
        is_active: item.active,
      });

      if (numFee > 0 && item.active) {
        const today = new Date();
        const firstWeekDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-05`;
        await supabase.from('income_records').insert({
          client_name: item.name.trim(),
          description: `${item.name.trim()} - Aylık Paket Ücreti (Ayın İlk Haftası)`,
          amount: numFee,
          due_date: firstWeekDate,
          collection_status: 'pending',
        });
      }
      fetchCloudData();
    } catch (e) {}
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
              description: `${newName} - Aylık Paket Ücreti (Ayın İlk Haftası)`,
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
      const updateData: Record<string, unknown> = {};
      if (updatedFields.name !== undefined) updateData.name = newName;
      if (updatedFields.contact !== undefined) updateData.contact_name = updatedFields.contact;
      if (updatedFields.phone !== undefined) updateData.phone = updatedFields.phone;
      if (updatedFields.instagram !== undefined) updateData.instagram = updatedFields.instagram;
      if (numFee !== undefined) updateData.monthly_fee = numFee;
      if (updatedFields.active !== undefined) updateData.is_active = updatedFields.active;

      if (isUUID(id)) {
        await supabase.from('clients').update(updateData).eq('id', id);
      } else if (target) {
        await supabase.from('clients').update(updateData).eq('name', target.name);
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
      fetchCloudData();
    } catch (e) {}
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
        await supabase.from('clients').delete().eq('id', id);
      } else if (target) {
        await supabase.from('clients').delete().eq('name', target.name);
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
      fetchCloudData();
    } catch (e) {}
  };

  return { addIsletme, updateIsletme, deleteIsletme };
}
