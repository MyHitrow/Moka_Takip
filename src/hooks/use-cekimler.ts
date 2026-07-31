import { SupabaseClient } from '@supabase/supabase-js';
import { Cekim } from '@/types/app';
import { isUUID } from '@/lib/helpers';

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
      await supabase.from('shoots').insert({
        client_name: item.client.trim(),
        title: item.title,
        shoot_date: item.date,
        start_time: item.time,
        location: item.location,
        status: item.status || 'planned',
      });
      fetchCloudData();
    } catch (e) {}
  };

  const deleteCekim = async (id: string) => {
    const target = cekimler.find((c) => c.id === id);
    setCekimler((prev) => prev.filter((i) => i.id !== id));
    try {
      if (isUUID(id)) {
        await supabase.from('shoots').delete().eq('id', id);
      } else if (target) {
        await supabase.from('shoots').delete().eq('title', target.title);
      }
      fetchCloudData();
    } catch (e) {}
  };

  return { addCekim, deleteCekim };
}
