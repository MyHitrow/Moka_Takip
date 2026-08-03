import { SupabaseClient } from '@supabase/supabase-js';
import { TakvimPost } from '@/types/app';
import { isUUID, calculateEditDeadlineForPost, normalizeContentType } from '@/lib/helpers';
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

      // Otomatik Edit Görevi Oluşturma:
      // Dutt için 7 gün önce, diğer işletmeler için 2 gün önce (örn. 7 Ağustos Cuma postu -> 5 Ağustos Çarşamba editi)
      const editDeadline = calculateEditDeadlineForPost(item.client, item.date);
      const editTitle = `${item.title} Editi`;

      const { error: editErr } = await supabase.from('edits').insert({
        client_name: item.client.trim(),
        title: editTitle,
        content_type: normalizeContentType(item.platform || 'Reels'),
        content_type_label: item.platform || 'Instagram Reels',
        editor_name: 'Atanmadı',
        deadline: editDeadline,
        status: 'waiting',
      });
      if (editErr) {
        logger.error('Otomatik edit görevi oluşturma hatası:', editErr.message);
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

  const addTakvimPostsBulk = async (items: Omit<TakvimPost, 'id'>[]) => {
    if (!items || items.length === 0) return;
    try {
      const calendarRows = items.map((item) => ({
        client_name: item.client.trim(),
        title: item.title,
        content_type: item.platform,
        platform: item.platform,
        publish_date: item.date,
        publish_time: item.time || null,
        status: item.status || 'scheduled',
      }));

      const { error: calErr } = await supabase.from('content_calendar').insert(calendarRows);
      if (calErr) {
        logger.error('Toplu takvim post ekleme hatası:', calErr.message);
      }

      // Otomatik Edit Görevleri Toplu Oluşturma
      const editRows = items.map((item) => ({
        client_name: item.client.trim(),
        title: `${item.title} Editi`,
        content_type: normalizeContentType(item.platform || 'Reels'),
        content_type_label: item.platform || 'Instagram Reels',
        editor_name: 'Atanmadı',
        deadline: calculateEditDeadlineForPost(item.client, item.date),
        status: 'waiting',
      }));

      const { error: editErr } = await supabase.from('edits').insert(editRows);
      if (editErr) {
        logger.error('Toplu otomatik edit görevi oluşturma hatası:', editErr.message);
      }

      await fetchCloudData();
    } catch (e) {
      logger.error('addTakvimPostsBulk beklenmeyen hata:', e);
    }
  };

  return { addTakvimPost, addTakvimPostsBulk, deleteTakvimPost, updateTakvimPostStatus };
}
