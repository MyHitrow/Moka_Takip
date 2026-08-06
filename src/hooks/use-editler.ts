import { SupabaseClient } from '@supabase/supabase-js';
import { EditItem } from '@/types/app';
import { isUUID, normalizeContentType } from '@/lib/helpers';
import { logger } from '@/lib/logger';

interface UseEditlerProps {
  editler: EditItem[];
  setEditler: React.Dispatch<React.SetStateAction<EditItem[]>>;
  supabase: SupabaseClient;
  fetchCloudData: () => Promise<void>;
}

export function createEditlerActions({
  editler,
  setEditler,
  supabase,
  fetchCloudData,
}: UseEditlerProps) {
  const addEdit = async (item: Omit<EditItem, 'id'>) => {
    const tempId = `temp_${Date.now()}`;
    const newEdit: EditItem = { id: tempId, ...item };
    setEditler((prev) => [newEdit, ...prev]);

    try {
      const { data, error } = await supabase.from('edits').insert({
        client_name: item.client.trim(),
        title: item.title,
        content_type: normalizeContentType(item.type),
        content_type_label: item.type,
        editor_name: item.editor,
        deadline: item.deadline,
        status: item.status || 'editing',
      }).select();

      if (error) {
        logger.error('Edit ekleme hatası:', error.message);
      } else if (data && data[0]) {
        setEditler((prev) => prev.map((e) => (e.id === tempId ? { ...e, id: data[0].id } : e)));
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('addEdit beklenmeyen hata:', e);
    }
  };

  const deleteEdit = async (id: string) => {
    const target = editler.find((e) => e.id === id);
    setEditler((prev) => prev.filter((i) => i.id !== id));
    try {
      if (isUUID(id)) {
        const { error } = await supabase.from('edits').delete().eq('id', id);
        if (error) logger.error('Edit silme hatası:', error.message);
      } else if (target) {
        const { error } = await supabase.from('edits').delete().eq('title', target.title).eq('client_name', target.client);
        if (error) logger.error('Edit silme hatası (title):', error.message);
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('deleteEdit beklenmeyen hata:', e);
    }
  };

  const updateEditStatus = async (id: string, status: string) => {
    setEditler((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    try {
      if (isUUID(id)) {
        const { error } = await supabase.from('edits').update({ status }).eq('id', id);
        if (error) logger.error('Edit status güncelleme hatası:', error.message);
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('updateEditStatus beklenmeyen hata:', e);
    }
  };

  return { addEdit, deleteEdit, updateEditStatus };
}
