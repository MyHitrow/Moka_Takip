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

  const addSystemUser = async (user: Omit<SystemUser, 'id'>): Promise<{ success: boolean; message?: string }> => {
    const cleanUsername = user.username.trim().toLowerCase();
    const exists = systemUsers.some((u) => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      return { success: false, message: 'Bu kullanıcı adı zaten kullanılıyor!' };
    }

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
        return { success: false, message: error.message };
      }

      await fetchCloudData();
      return { success: true };
    } catch (e: any) {
      logger.error('Kullanıcı ekleme beklenmeyen hata:', e);
      setSystemUsers((prev) => prev.filter((u) => u.id !== newId));
      return { success: false, message: e?.message || 'Beklenmeyen bir hata oluştu.' };
    }
  };

  const updateSystemUser = async (id: string, updatedFields: Partial<SystemUser>): Promise<{ success: boolean; message?: string }> => {
    const target = systemUsers.find((u) => u.id === id);
    if (!target) return { success: false, message: 'Kullanıcı bulunamadı.' };

    const cleanUsername = updatedFields.username ? updatedFields.username.trim().toLowerCase() : target.username;
    
    // Check if new username conflicts with another user
    if (cleanUsername !== target.username) {
      const exists = systemUsers.some((u) => u.id !== id && u.username.toLowerCase() === cleanUsername);
      if (exists) return { success: false, message: 'Bu kullanıcı adı zaten kullanılıyor!' };
    }

    const updatedUser: SystemUser = {
      ...target,
      ...updatedFields,
      username: cleanUsername,
    };

    // Optimistic UI update
    setSystemUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));

    try {
      const updateData: Record<string, any> = {};
      if (updatedFields.name) updateData.name = updatedFields.name;
      if (updatedFields.username) updateData.username = cleanUsername;
      if (updatedFields.password) updateData.password = updatedFields.password;
      if (updatedFields.role) updateData.role = updatedFields.role;

      const { error } = await supabase.from('system_users').update(updateData).eq('id', id);

      if (error) {
        logger.error('Kullanıcı güncelleme hatası:', error.message);
        setSystemUsers((prev) => prev.map((u) => (u.id === id ? target : u)));
        return { success: false, message: error.message };
      }

      await fetchCloudData();
      return { success: true };
    } catch (e: any) {
      logger.error('Kullanıcı güncelleme beklenmeyen hata:', e);
      setSystemUsers((prev) => prev.map((u) => (u.id === id ? target : u)));
      return { success: false, message: e?.message || 'Beklenmeyen bir hata oluştu.' };
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

  return { addSystemUser, updateSystemUser, deleteSystemUser };
}
