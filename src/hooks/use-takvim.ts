import { SupabaseClient } from '@supabase/supabase-js';
import { TakvimPost } from '@/types/app';
import { isUUID } from '@/lib/helpers';
import { logger } from '@/lib/logger';

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
      const { error } = await supabase.from('content_calendar').insert({
        client_name: item.client.trim(),
        title: item.title,
        content_type: item.platform, // content_type NOT NULL
        platform: item.platform,
        publish_date: item.date,
        publish_time: item.time || null,
        status: item.status || 'preparing',
      });
      if (error) {
        logger.error('Takvim post ekleme hatası:', error.message);
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('addTakvimPost beklenmeyen hata:', e);
    }
  };

  const deleteTakvimPost = async (id: string) => {
    const target = takvimPosts.find((t) => t.id === id);
    setTakvimPosts((prev) => prev.filter((t) => t.id !== id));
    try {
      if (isUUID(id)) {
        const { error } = await supabase.from('content_calendar').delete().eq('id', id);
        if (error) logger.error('Takvim post silme hatası:', error.message);
      } else if (target) {
        const { error } = await supabase.from('content_calendar').delete().eq('title', target.title);
        if (error) logger.error('Takvim post silme hatası (title):', error.message);
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('deleteTakvimPost beklenmeyen hata:', e);
    }
  };

  const updateTakvimPostStatus = async (id: string, status: TakvimPost['status']) => {
    setTakvimPosts((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      if (isUUID(id)) {
        const { error } = await supabase.from('content_calendar').update({ status }).eq('id', id);
        if (error) logger.error('Takvim post status güncelleme hatası:', error.message);
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('updateTakvimPostStatus beklenmeyen hata:', e);
    }
  };

  return { addTakvimPost, deleteTakvimPost, updateTakvimPostStatus };
}
