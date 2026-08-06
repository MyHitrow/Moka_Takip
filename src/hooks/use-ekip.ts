import { SupabaseClient } from '@supabase/supabase-js';
import { EkipUyesi } from '@/types/app';
import { logger } from '@/lib/logger';

interface UseEkipProps {
  ekip: EkipUyesi[];
  setEkip: React.Dispatch<React.SetStateAction<EkipUyesi[]>>;
  supabase: SupabaseClient;
  syncSettingsToCloud: () => Promise<void>;
}

export function createEkipActions({
  ekip,
  setEkip,
  supabase,
  syncSettingsToCloud,
}: UseEkipProps) {

  const addEkipUyesi = async (
    item: Omit<EkipUyesi, 'id' | 'initials'>,
  ) => {
    const parts = item.name.trim().split(' ');
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : item.name.substring(0, 2).toUpperCase();

    const newItem: EkipUyesi = {
      ...item,
      id: crypto.randomUUID(),
      initials,
    };

    // Optimistic UI update
    setEkip((prev) => [...prev, newItem]);

    // Persist to Supabase
    try {
      const { error } = await supabase.from('team_members').insert({
        id: newItem.id,
        name: newItem.name,
        role: newItem.role || 'Ekip Üyesi',
        phone: newItem.phone || '-',
        color: newItem.color || 'bg-purple-500',
        initials,
      });

      if (error) {
        logger.error('Ekip üyesi ekleme hatası:', error.message);
        // Revert optimistic update on error
        setEkip((prev) => prev.filter((e) => e.id !== newItem.id));
      }
    } catch (e) {
      logger.error('Ekip üyesi ekleme beklenmeyen hata:', e);
      setEkip((prev) => prev.filter((e) => e.id !== newItem.id));
    }
  };

  const deleteEkipUyesi = async (id: string) => {
    const deletedMember = ekip.find((e) => e.id === id);

    // Optimistic UI update
    setEkip((prev) => prev.filter((e) => e.id !== id));

    // Persist to Supabase
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', id);

      if (error) {
        logger.error('Ekip üyesi silme hatası:', error.message);
        // Revert optimistic update on error
        if (deletedMember) {
          setEkip((prev) => [...prev, deletedMember]);
        }
      }
    } catch (e) {
      logger.error('Ekip üyesi silme beklenmeyen hata:', e);
      if (deletedMember) {
        setEkip((prev) => [...prev, deletedMember]);
      }
    }
  };

  return { addEkipUyesi, deleteEkipUyesi };
}
