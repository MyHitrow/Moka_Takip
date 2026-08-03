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
  const resolveClientId = async (clientName: string): Promise<string | null> => {
    try {
      const norm = clientName.trim().toLowerCase();
      const { data: clients } = await supabase.from('clients').select('id, name');
      if (clients && clients.length > 0) {
        const found = clients.find(
          (c) => c.name.trim().toLowerCase() === norm || norm.includes(c.name.trim().toLowerCase())
        );
        return found ? found.id : clients[0].id;
      }
    } catch (e) {
      logger.error('Client ID resolve hatasi:', e);
    }
    return null;
  };

  const addTakvimPost = async (item: Omit<TakvimPost, 'id'>) => {
    try {
      const clientId = await resolveClientId(item.client);

      const calendarRow: Record<string, any> = {
        client_name: item.client.trim(),
        title: item.title,
        content_type: item.platform || 'Instagram Reels',
        platform: item.platform || 'Instagram Reels',
        publish_date: item.date,
        publish_time: item.time || null,
        status: item.status || 'scheduled',
      };
      if (clientId) calendarRow.client_id = clientId;

      const { error } = await supabase.from('content_calendar').insert(calendarRow);
      if (error) {
        logger.error('Takvim post ekleme hatası:', error.message);
      }

      // Otomatik Edit Görevi Oluşturma
      const editDeadline = calculateEditDeadlineForPost(item.client, item.date);
      const editTitle = `${item.title} Editi`;

      const editRow: Record<string, any> = {
        client_name: item.client.trim(),
        title: editTitle,
        content_type: normalizeContentType(item.platform || 'Reels'),
        content_type_label: item.platform || 'Instagram Reels',
        editor_name: 'Atanmadı',
        deadline: editDeadline,
        status: 'waiting',
      };
      if (clientId) editRow.client_id = clientId;

      const { error: editErr } = await supabase.from('edits').insert(editRow);
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
