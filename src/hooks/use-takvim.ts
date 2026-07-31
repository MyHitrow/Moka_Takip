import { SupabaseClient } from '@supabase/supabase-js';
import { TakvimPost } from '@/types/app';
import { isUUID } from '@/lib/helpers';

interface UseTakvimProps {
  takvimPosts: TakvimPost[];
  setTakvimPosts: React.Dispatch<React.SetStateAction<TakvimPost[]>>;
  supabase: SupabaseClient;
  fetchCloudData: () => Promise<void>;
}

export function createTakvimActions({
  takvimPosts,
  setTakvimPosts,
  supabase,
  fetchCloudData,
}: UseTakvimProps) {
  const addTakvimPost = async (item: Omit<TakvimPost, 'id'>) => {
    try {
      await supabase.from('content_calendar').insert({
        client_name: item.client.trim(),
        title: item.title,
        content_type: item.platform, // content_type NOT NULL
        platform: item.platform,
        publish_date: item.date,
        publish_time: item.time || null,
        status: item.status || 'preparing',
      });
      fetchCloudData();
    } catch (e) {}
  };

  const deleteTakvimPost = async (id: string) => {
    const target = takvimPosts.find((t) => t.id === id);
    setTakvimPosts((prev) => prev.filter((t) => t.id !== id));
    try {
      if (isUUID(id)) {
        await supabase.from('content_calendar').delete().eq('id', id);
      } else if (target) {
        await supabase.from('content_calendar').delete().eq('title', target.title);
      }
      fetchCloudData();
    } catch (e) {}
  };

  const updateTakvimPostStatus = async (id: string, status: TakvimPost['status']) => {
    setTakvimPosts((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      if (isUUID(id)) {
        await supabase.from('content_calendar').update({ status }).eq('id', id);
      }
      fetchCloudData();
    } catch (e) {}
  };

  return { addTakvimPost, deleteTakvimPost, updateTakvimPostStatus };
}
