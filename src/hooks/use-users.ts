import { SupabaseClient } from '@supabase/supabase-js';
import { SystemUser } from '@/types/app';
import { logger } from '@/lib/logger';

interface UseUsersProps {
  systemUsers: SystemUser[];
  setSystemUsers: React.Dispatch<React.SetStateAction<SystemUser[]>>;
  supabase: SupabaseClient;
  fetchCloudData: () => Promise<void>;
}

export function createUsersActions({
  systemUsers,
  setSystemUsers,
  supabase,
  fetchCloudData,
}: UseUsersProps) {

  const addSystemUser = async (user: Omit<SystemUser, 'id'>): Promise<boolean> => {
    const cleanUsername = user.username.trim().toLowerCase();
    const exists = systemUsers.some((u) => u.username.toLowerCase() === cleanUsername);
    if (exists) return false;

    const newId = crypto.randomUUID();
    const newUser: SystemUser = {
      ...user,
      id: newId,
      username: cleanUsername,
    };

    // Optimistic UI update
    setSystemUsers((prev) => [...prev, newUser]);

    try {
      const { error } = await supabase.from('system_users').insert({
        id: newId,
        username: cleanUsername,
        password: user.password || '123456',
        name: user.name,
        role: user.role || 'admin',
      });

      if (error) {
        logger.error('Kullanıcı ekleme hatası:', error.message);
        setSystemUsers((prev) => prev.filter((u) => u.id !== newId));
        return false;
      }

      await fetchCloudData();
      return true;
    } catch (e) {
      logger.error('Kullanıcı ekleme beklenmeyen hata:', e);
      setSystemUsers((prev) => prev.filter((u) => u.id !== newId));
      return false;
    }
  };

  const deleteSystemUser = async (id: string) => {
    const deletedUser = systemUsers.find((u) => u.id === id);
    if (deletedUser?.username === 'admin') {
      logger.warn('Ana admin hesabı silinemez!');
      return;
    }

    setSystemUsers((prev) => prev.filter((u) => u.id !== id));

    try {
      const { error } = await supabase.from('system_users').delete().eq('id', id);
      if (error) {
        logger.error('Kullanıcı silme hatası:', error.message);
        if (deletedUser) setSystemUsers((prev) => [...prev, deletedUser]);
      } else {
        await fetchCloudData();
      }
    } catch (e) {
      logger.error('Kullanıcı silme beklenmeyen hata:', e);
      if (deletedUser) setSystemUsers((prev) => [...prev, deletedUser]);
    }
  };

  return { addSystemUser, deleteSystemUser };
}
