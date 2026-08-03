import { SupabaseClient } from '@supabase/supabase-js';
import { TakvimPost, EditItem } from '@/types/app';
import { isUUID, calculateEditDeadlineForPost, normalizeContentType } from '@/lib/helpers';
import { logger } from '@/lib/logger';

interface UseTakvimProps {
  takvimPosts: TakvimPost[];
  setTakvimPosts: React.Dispatch<React.SetStateAction<TakvimPost[]>>;
  setEditler?: React.Dispatch<React.SetStateAction<EditItem[]>>;
  supabase: SupabaseClient;
  fetchCloudData: () => Promise<void>;
}

export function createTakvimActions({
  takvimPosts,
  setTakvimPosts,
  setEditler,
  supabase,
  fetchCloudData,
}: UseTakvimProps) {
  /**
   * Resolves or auto-creates a client in Supabase 'clients' table to ensure valid UUID client_id
   */
  const ensureClientId = async (clientName: string): Promise<string> => {
    const trimmed = clientName.trim();
    const norm = trimmed.toLowerCase();
    try {
      const { data: clients } = await supabase.from('clients').select('id, name');
      if (clients && clients.length > 0) {
        const found = clients.find(
          (c) => c.name.trim().toLowerCase() === norm || norm.includes(c.name.trim().toLowerCase())
        );
        if (found) return found.id;
      }

      // Auto-create missing client record in DB
      const { data: newClient, error: createErr } = await supabase
        .from('clients')
        .insert({ name: trimmed })
        .select('id')
        .single();

      if (!createErr && newClient) {
        return newClient.id;
      }
    } catch (e) {
      logger.error('ensureClientId error:', e);
    }
    return '00000000-0000-0000-0000-000000000000';
  };

  const addTakvimPost = async (item: Omit<TakvimPost, 'id'>) => {
    try {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newPost: TakvimPost = { ...item, id: tempId };

      // Optimistic State Update
      setTakvimPosts((prev) => [newPost, ...prev]);

      const clientId = await ensureClientId(item.client);

      const calendarRow: Record<string, any> = {
        client_id: clientId,
        client_name: item.client.trim(),
        title: item.title,
        content_type: item.platform || 'Instagram Reels',
        platform: item.platform || 'Instagram Reels',
        publish_date: item.date,
        publish_time: item.time || null,
        status: item.status || 'scheduled',
      };

      const { error: calErr } = await supabase.from('content_calendar').insert(calendarRow);
      if (calErr) {
        logger.error('Takvim post ekleme hatası:', calErr.message);
      }

      // Otomatik Edit Görevi Oluşturma
      const editDeadline = calculateEditDeadlineForPost(item.client, item.date);
      const editTitle = `${item.title} Editi`;

      if (setEditler) {
        const tempEditId = `temp-edit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        setEditler((prev) => [
          {
            id: tempEditId,
            title: editTitle,
            client: item.client.trim(),
            type: item.platform || 'Reels',
            editor: 'Atanmadı',
            deadline: editDeadline,
            status: 'waiting',
          },
          ...prev,
        ]);
      }

      const editRow: Record<string, any> = {
        client_id: clientId,
        client_name: item.client.trim(),
        title: editTitle,
        content_type: normalizeContentType(item.platform || 'Reels'),
        content_type_label: item.platform || 'Instagram Reels',
        editor_name: 'Atanmadı',
        deadline: editDeadline,
        status: 'waiting',
      };

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
      // 1. Optimistic State Update for all items (UI updates INSTANTLY!)
      const tempPosts: TakvimPost[] = items.map((item, idx) => ({
        ...item,
        id: `bulk-temp-${Date.now()}-${idx}`,
      }));
      setTakvimPosts((prev) => [...tempPosts, ...prev]);

      if (setEditler) {
        const tempEdits: EditItem[] = items.map((item, idx) => ({
          id: `bulk-edit-temp-${Date.now()}-${idx}`,
          title: `${item.title} Editi`,
          client: item.client.trim(),
          type: item.platform || 'Reels',
          editor: 'Atanmadı',
          deadline: calculateEditDeadlineForPost(item.client, item.date),
          status: 'waiting',
        }));
        setEditler((prev) => [...tempEdits, ...prev]);
      }

      // 2. Fetch existing clients & auto-create any missing client records in DB
      const { data: clients } = await supabase.from('clients').select('id, name');
      const clientMap: Record<string, string> = {};

      if (clients && clients.length > 0) {
        clients.forEach((c) => {
          clientMap[c.name.trim().toLowerCase()] = c.id;
        });
      }

      const uniqueNames = Array.from(new Set(items.map((i) => i.client.trim())));
      for (const name of uniqueNames) {
        const norm = name.toLowerCase();
        if (!clientMap[norm]) {
          const match = clients?.find((c) => norm.includes(c.name.trim().toLowerCase()));
          if (match) {
            clientMap[norm] = match.id;
          } else {
            // Auto create missing client in DB
            const { data: newC } = await supabase
              .from('clients')
              .insert({ name })
              .select('id')
              .single();
            if (newC) {
              clientMap[norm] = newC.id;
            }
          }
        }
      }

      const fallbackClientId = clients && clients.length > 0 ? clients[0].id : '00000000-0000-0000-0000-000000000000';

      // 3. Build calendarRows with 100% valid client_id UUIDs
      const calendarRows = items.map((item) => {
        const normName = item.client.trim().toLowerCase();
        const cId = clientMap[normName] || fallbackClientId;

        return {
          client_id: cId,
          client_name: item.client.trim(),
          title: item.title,
          content_type: item.platform || 'Instagram Reels',
          platform: item.platform || 'Instagram Reels',
          publish_date: item.date,
          publish_time: item.time || null,
          status: item.status || 'scheduled',
        };
      });

      const { error: calErr } = await supabase.from('content_calendar').insert(calendarRows);
      if (calErr) {
        logger.error('Toplu takvim post ekleme hatası:', calErr.message);
      }

      // 4. Build editRows with 100% valid client_id UUIDs
      const editRows = items.map((item) => {
        const normName = item.client.trim().toLowerCase();
        const cId = clientMap[normName] || fallbackClientId;

        return {
          client_id: cId,
          client_name: item.client.trim(),
          title: `${item.title} Editi`,
          content_type: normalizeContentType(item.platform || 'Reels'),
          content_type_label: item.platform || 'Instagram Reels',
          editor_name: 'Atanmadı',
          deadline: calculateEditDeadlineForPost(item.client, item.date),
          status: 'waiting',
        };
      });

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
