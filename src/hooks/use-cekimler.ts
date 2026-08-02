import { SupabaseClient } from '@supabase/supabase-js';
import { Cekim } from '@/types/app';
import { isUUID } from '@/lib/helpers';
import { logger } from '@/lib/logger';

interface UseCekimlerProps {
  cekimler: Cekim[];
  setCekimler: React.Dispatch<React.SetStateAction<Cekim[]>>;
  supabase: SupabaseClient;
  fetchCloudData: () => Promise<void>;
}

export function createCekimlerActions({
  cekimler,
  setCekimler,
  supabase,
  fetchCloudData,
}: UseCekimlerProps) {
  const addCekim = async (item: Omit<Cekim, 'id'>) => {
    try {
      const { error } = await supabase.from('shoots').insert({
        client_name: item.client.trim(),
        title: item.title,
        shoot_date: item.date,
        start_time: item.time,
        location: item.location,
        status: item.status || 'planned',
      });
      if (error) {
        logger.error('Çekim ekleme hatası:', error.message);
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('addCekim beklenmeyen hata:', e);
    }
  };

  const deleteCekim = async (id: string) => {
    const target = cekimler.find((c) => c.id === id);
    setCekimler((prev) => prev.filter((i) => i.id !== id));
    try {
      if (isUUID(id)) {
        const { error } = await supabase.from('shoots').delete().eq('id', id);
        if (error) logger.error('Çekim silme hatası:', error.message);
      } else if (target) {
        const { error } = await supabase.from('shoots').delete().eq('title', target.title);
        if (error) logger.error('Çekim silme hatası (title):', error.message);
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('deleteCekim beklenmeyen hata:', e);
    }
  };

  const updateCekimStatus = async (id: string, status: string) => {
    // Optimistik güncelleme — önce local state'i güncelle
    setCekimler((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    try {
      if (isUUID(id)) {
        const { error } = await supabase.from('shoots').update({ status }).eq('id', id);
        if (error) logger.error('Çekim durum güncelleme hatası:', error.message);
      }
      await fetchCloudData();
    } catch (e) {
      logger.error('updateCekimStatus beklenmeyen hata:', e);
    }
  };

  return { addCekim, deleteCekim, updateCekimStatus };
}

