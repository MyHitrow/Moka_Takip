import { SupabaseClient } from '@supabase/supabase-js';
import { EditItem } from '@/types/app';
import { isUUID, normalizeContentType } from '@/lib/helpers';

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
    try {
      await supabase.from('edits').insert({
        client_name: item.client.trim(),
        title: item.title,
        content_type: normalizeContentType(item.type),
        content_type_label: item.type,
        editor_name: item.editor,
        deadline: item.deadline,
        status: item.status || 'waiting',
      });
      fetchCloudData();
    } catch (e) {}
  };

  const deleteEdit = async (id: string) => {
    const target = editler.find((e) => e.id === id);
    setEditler((prev) => prev.filter((i) => i.id !== id));
    try {
      if (isUUID(id)) {
        await supabase.from('edits').delete().eq('id', id);
      } else if (target) {
        await supabase.from('edits').delete().eq('title', target.title);
      }
      fetchCloudData();
    } catch (e) {}
  };

  const updateEditStatus = async (id: string, status: string) => {
    setEditler((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    try {
      if (isUUID(id)) {
        await supabase.from('edits').update({ status }).eq('id', id);
      }
      fetchCloudData();
    } catch (e) {}
  };

  return { addEdit, deleteEdit, updateEditStatus };
}
