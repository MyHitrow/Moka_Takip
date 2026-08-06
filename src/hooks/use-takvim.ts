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
  syncSettingsToCloud?: () => Promise<void>;
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
      const matched = findBestMatchingClient(item.client, clients || []);
      const officialClientName = matched ? matched.name : item.client.trim();
      
      let clientId = matched ? matched.id : null;
      if (!clientId) {
        const { data: newC } = await supabase.from('clients').insert({ name: officialClientName }).select('id').single();
        if (newC) clientId = newC.id;
      }

      const calendarRow: Record<string, any> = {
        client_id: clientId,
        client_name: officialClientName,
        title: item.title,
        content_type: item.platform || 'Instagram Reels',
        platform: item.platform || 'Instagram Reels',
        publish_date: item.date,
        publish_time: item.time || '18:00',
        status: item.status || 'scheduled',
      };

      const { error: calErr } = await supabase.from('content_calendar').insert(calendarRow);
      if (calErr) {
        logger.error('Takvim post ekleme hatası:', calErr.message);
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
      const { data: existingClients } = await supabase.from('clients').select('id, name');
      const clientMap: Record<string, string> = {};

      if (existingClients && existingClients.length > 0) {
        existingClients.forEach((c) => {
          clientMap[c.name.trim().toLowerCase()] = c.id;
        });
      }

      // 2. Resolve or create client records in DB for all unique business names in Excel
      const uniqueExcelNames = Array.from(new Set(items.map((i) => i.client.trim())));

      for (const rawName of uniqueExcelNames) {
        const normKey = rawName.toLowerCase();
        const matched = findBestMatchingClient(rawName, existingClients || []);
        if (matched) {
          clientMap[normKey] = matched.id;
        } else {
          // Create missing business record in DB to get a valid UUID
          const { data: newC } = await supabase
            .from('clients')
            .insert({ name: rawName })
            .select('id, name')
            .single();

          if (newC) {
            clientMap[normKey] = newC.id;
            if (existingClients) existingClients.push(newC);
          }
        }
      }

      const defaultFallbackId = existingClients && existingClients.length > 0
        ? existingClients[0].id
        : '00000000-0000-0000-0000-000000000000';

      // 3. Build calendarRows for direct database insert with GUARANTEED client_id
      const calendarRows = items.map((item) => {
        const normKey = item.client.trim().toLowerCase();
        const matched = findBestMatchingClient(item.client, existingClients || []);
        const officialName = matched ? matched.name : item.client.trim();
        const validClientId = clientMap[normKey] || defaultFallbackId;

        return {
          client_id: validClientId,
          client_name: officialName,
          title: item.title,
          content_type: item.platform || 'Instagram Reels',
          platform: item.platform || 'Instagram Reels',
          publish_date: item.date,
          publish_time: item.time || '18:00',
          status: item.status || 'scheduled',
        };
      });

      // 4. Build editRows for direct database insert with GUARANTEED client_id
      const editRows = items.map((item) => {
        const normKey = item.client.trim().toLowerCase();
        const matched = findBestMatchingClient(item.client, existingClients || []);
        const officialName = matched ? matched.name : item.client.trim();
        const validClientId = clientMap[normKey] || defaultFallbackId;

        return {
          client_id: validClientId,
          client_name: officialName,
          title: `${item.title} Editi`,
          content_type: normalizeContentType(item.platform || 'Reels'),
          content_type_label: item.platform || 'Instagram Reels',
          editor_name: 'Atanmadı',
          deadline: calculateEditDeadlineForPost(officialName, item.date),
          status: 'waiting',
        };
      });

      // 5. Direct Supabase Database Insert
      const { error: calErr } = await supabase.from('content_calendar').insert(calendarRows);
      if (calErr) {
        logger.error('Toplu takvim post veritabanı ekleme hatası:', calErr.message);
      }

      const { error: editErr } = await supabase.from('edits').insert(editRows);
      if (editErr) {
        logger.error('Toplu edit veritabanı ekleme hatası:', editErr.message);
      }

      // 6. Backup payload to __SYSTEM_SETTINGS__ as extra redundancy
      if (syncSettingsToCloud) {
        await syncSettingsToCloud();
      }

      await fetchCloudData();
    } catch (e) {
      logger.error('addTakvimPostsBulk beklenmeyen hata:', e);
    }
  };

  return { addTakvimPost, addTakvimPostsBulk, deleteTakvimPost, updateTakvimPostStatus };
}
