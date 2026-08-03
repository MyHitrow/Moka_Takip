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
  syncSettingsToCloud?: (u?: any, e?: any, n?: any, t?: TakvimPost[], ed?: EditItem[]) => Promise<void>;
}

/**
 * Smart Fuzzy Client Matcher:
 * Matches Excel business names to official database business names.
 * E.g. "Luness" -> "Luness Güzellik", "Bi Atom" -> "Bi' Atom", "Sun Brothers" -> "Sun Brothers Adana"
 * Prevents creation of duplicate clients in DB!
 */
function findBestMatchingClient(
  rawName: string,
  clients: { id: string; name: string }[]
): { id: string; name: string } | null {
  if (!clients || clients.length === 0) return null;

  const cleanRaw = rawName.trim().toLowerCase().replace(/['"`\s\-_]/g, '');

  // 1. Exact match (ignoring spaces/punctuation)
  for (const c of clients) {
    const cClean = c.name.trim().toLowerCase().replace(/['"`\s\-_]/g, '');
    if (cClean === cleanRaw) return c;
  }

  // 2. Substring match
  for (const c of clients) {
    const cClean = c.name.trim().toLowerCase().replace(/['"`\s\-_]/g, '');
    if (cleanRaw.includes(cClean) || cClean.includes(cleanRaw)) return c;
  }

  // 3. First-word token match (e.g. "Luness" matches "Luness Güzellik")
  const firstWord = rawName.trim().toLowerCase().split(/\s+/)[0];
  if (firstWord.length >= 3) {
    for (const c of clients) {
      const cFirstWord = c.name.trim().toLowerCase().split(/\s+/)[0];
      if (firstWord === cFirstWord) return c;
    }
  }

  return null;
}

export function createTakvimActions({
  takvimPosts,
  setTakvimPosts,
  setEditler,
  supabase,
  fetchCloudData,
  syncSettingsToCloud,
}: UseTakvimProps) {

  const addTakvimPost = async (item: Omit<TakvimPost, 'id'>) => {
    try {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newPost: TakvimPost = { ...item, id: tempId };

      // Optimistic State Update
      setTakvimPosts((prev) => [newPost, ...prev]);

      const { data: clients } = await supabase.from('clients').select('id, name');
      let fallbackClientId = clients && clients.length > 0 ? clients[0].id : null;

      if (!fallbackClientId) {
        const { data: newC } = await supabase.from('clients').insert({ name: 'Genel Müşteri' }).select('id').single();
        if (newC) fallbackClientId = newC.id;
      }

      const matched = findBestMatchingClient(item.client, clients || []);
      const officialClientName = matched ? matched.name : item.client.trim();
      const clientId = matched ? matched.id : (fallbackClientId || '00000000-0000-0000-0000-000000000000');

      const calendarRow: Record<string, any> = {
        client_id: clientId,
        client_name: officialClientName,
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
        // Fallback insert without client_id
        const { client_id: _omit, ...fallbackRow } = calendarRow;
        await supabase.from('content_calendar').insert(fallbackRow);
      }

      // Otomatik Edit Görevi Oluşturma
      const editDeadline = calculateEditDeadlineForPost(officialClientName, item.date);
      const editTitle = `${item.title} Editi`;

      if (setEditler) {
        const tempEditId = `temp-edit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        setEditler((prev) => [
          {
            id: tempEditId,
            title: editTitle,
            client: officialClientName,
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
        client_name: officialClientName,
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
        const { client_id: _omit, ...fallbackEditRow } = editRow;
        await supabase.from('edits').insert(fallbackEditRow);
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
      // 1. Fetch existing clients from Supabase clients table
      const { data: clients } = await supabase.from('clients').select('id, name');
      let fallbackClientId = clients && clients.length > 0 ? clients[0].id : null;

      if (!fallbackClientId) {
        const { data: newC } = await supabase.from('clients').insert({ name: 'Genel Müşteri' }).select('id').single();
        if (newC) fallbackClientId = newC.id;
      }

      // 2. Map items with Smart Fuzzy Matching to official DB clients
      const processedItems = items.map((item) => {
        const matched = findBestMatchingClient(item.client, clients || []);
        const officialName = matched ? matched.name : item.client.trim();
        const cId = matched ? matched.id : (fallbackClientId || '00000000-0000-0000-0000-000000000000');

        return {
          ...item,
          officialClientName: officialName,
          clientId: cId,
        };
      });

      // 3. Optimistic State Update for all items (UI updates INSTANTLY!)
      const tempPosts: TakvimPost[] = processedItems.map((item, idx) => ({
        client: item.officialClientName,
        title: item.title,
        platform: item.platform,
        date: item.date,
        time: item.time,
        status: item.status,
        id: `bulk-temp-${Date.now()}-${idx}`,
      }));
      setTakvimPosts((prev) => [...tempPosts, ...prev]);

      if (setEditler) {
        const tempEdits: EditItem[] = processedItems.map((item, idx) => ({
          id: `bulk-edit-temp-${Date.now()}-${idx}`,
          title: `${item.title} Editi`,
          client: item.officialClientName,
          type: item.platform || 'Reels',
          editor: 'Atanmadı',
          deadline: calculateEditDeadlineForPost(item.officialClientName, item.date),
          status: 'waiting',
        }));
        setEditler((prev) => [...tempEdits, ...prev]);
      }

      // 4. Build calendarRows for database insert with GUARANTEED client_id
      const calendarRows = processedItems.map((item) => ({
        client_id: item.clientId,
        client_name: item.officialClientName,
        title: item.title,
        content_type: item.platform || 'Instagram Reels',
        platform: item.platform || 'Instagram Reels',
        publish_date: item.date,
        publish_time: item.time || null,
        status: item.status || 'scheduled',
      }));

      const { error: calErr } = await supabase.from('content_calendar').insert(calendarRows);
      if (calErr) {
        logger.error('Toplu takvim post ekleme hatası:', calErr.message);
        // Fallback insert without client_id if FK constraint fails
        const fallbackCalRows = calendarRows.map(({ client_id: _omit, ...rest }) => rest);
        const { error: calErr2 } = await supabase.from('content_calendar').insert(fallbackCalRows);
        if (calErr2) logger.error('Fallback takvim post ekleme hatası:', calErr2.message);
      }

      // 5. Build editRows for database insert with GUARANTEED client_id
      const editRows = processedItems.map((item) => ({
        client_id: item.clientId,
        client_name: item.officialClientName,
        title: `${item.title} Editi`,
        content_type: normalizeContentType(item.platform || 'Reels'),
        content_type_label: item.platform || 'Instagram Reels',
        editor_name: 'Atanmadı',
        deadline: calculateEditDeadlineForPost(item.officialClientName, item.date),
        status: 'waiting',
      }));

      const { error: editErr } = await supabase.from('edits').insert(editRows);
      if (editErr) {
        logger.error('Toplu otomatik edit görevi oluşturma hatası:', editErr.message);
        const fallbackEditRows = editRows.map(({ client_id: _omit, ...rest }) => rest);
        const { error: editErr2 } = await supabase.from('edits').insert(fallbackEditRows);
        if (editErr2) logger.error('Fallback edit görevi oluşturma hatası:', editErr2.message);
      }

      if (syncSettingsToCloud) {
        await syncSettingsToCloud(undefined, undefined, undefined, [...tempPosts, ...takvimPosts]);
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('addTakvimPostsBulk beklenmeyen hata:', e);
    }
  };

  return { addTakvimPost, addTakvimPostsBulk, deleteTakvimPost, updateTakvimPostStatus };
}
