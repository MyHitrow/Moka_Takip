import { SupabaseClient } from '@supabase/supabase-js';
import { EkipUyesi, SystemUser } from '@/types/app';
import { formatRoleLabel } from '@/lib/helpers';

interface UseEkipProps {
  ekip: EkipUyesi[];
  systemUsers: SystemUser[];
  currentUser: SystemUser;
  setEkip: React.Dispatch<React.SetStateAction<EkipUyesi[]>>;
  setSystemUsers: React.Dispatch<React.SetStateAction<SystemUser[]>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<SystemUser>>;
  supabase: SupabaseClient;
  syncSettingsToCloud: (
    updatedUsers?: SystemUser[],
    updatedEkip?: EkipUyesi[],
    updatedNotlar?: never[]
  ) => Promise<void>;
}

export function createEkipActions({
  ekip,
  systemUsers,
  currentUser,
  setEkip,
  setSystemUsers,
  setCurrentUser,
  syncSettingsToCloud,
}: UseEkipProps) {
  const addEkipUyesi = (
    item: Omit<EkipUyesi, 'id' | 'initials'>,
    customUsername?: string,
    customPassword?: string
  ) => {
    const parts = item.name.trim().split(' ');
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : item.name.substring(0, 2).toUpperCase();

    const autoUsername =
      customUsername?.trim().toLowerCase() ||
      item.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const autoPassword = customPassword || undefined;

    const newItem: EkipUyesi = { ...item, id: Date.now().toString(), initials, username: autoUsername };
    const updatedEkip = [...ekip, newItem];
    setEkip(updatedEkip);

    const newSysUser: SystemUser = {
      id: Date.now().toString(),
      username: autoUsername,
      ...(autoPassword ? { password: autoPassword } : {}),
      name: item.name,
      role: item.role,
      permissions: {
        canManageFinance: true,
        canManageShoots: true,
        canManageEdits: true,
        canManageTakvim: true,
        canManageTeam: true,
        canManageUsers: false,
      },
    };

    let updatedUsers = systemUsers;
    const exists = systemUsers.some((u) => u.username === autoUsername);
    if (!exists) {
      updatedUsers = [...systemUsers, newSysUser];
      setSystemUsers(updatedUsers);
    }

    syncSettingsToCloud(updatedUsers, updatedEkip);
  };

  const deleteEkipUyesi = (id: string) => {
    const member = ekip.find((e) => e.id === id);
    const updatedEkip = ekip.filter((e) => e.id !== id);
    setEkip(updatedEkip);

    let updatedUsers = systemUsers;
    if (member?.username) {
      updatedUsers = systemUsers.filter((u) => u.username !== member.username);
      setSystemUsers(updatedUsers);
    }
    syncSettingsToCloud(updatedUsers, updatedEkip);
  };

  const addSystemUser = (user: Omit<SystemUser, 'id'>): boolean => {
    if (currentUser.role !== 'super_admin') return false;
    const exists = systemUsers.some(
      (u) => u.username.toLowerCase() === user.username.toLowerCase()
    );
    if (exists) return false;

    const newUser: SystemUser = { ...user, id: Date.now().toString() };
    const roleLabel = formatRoleLabel(user.role);
    const parts = user.name.trim().split(' ');
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : user.name.substring(0, 2).toUpperCase();

    const newMember: EkipUyesi = {
      id: Date.now().toString(),
      name: user.name,
      role: roleLabel,
      phone: '-',
      color: 'bg-purple-500',
      initials,
      username: user.username,
    };

    const updatedUsers = [...systemUsers, newUser];
    const updatedEkip = [...ekip, newMember];
    setSystemUsers(updatedUsers);
    setEkip(updatedEkip);
    syncSettingsToCloud(updatedUsers, updatedEkip);
    return true;
  };

  const updateSystemUser = (id: string, updatedFields: Partial<SystemUser>) => {
    if (currentUser.role !== 'super_admin') return;
    const targetUser = systemUsers.find((u) => u.id === id);

    const updatedUsers = systemUsers.map((u) => {
      if (u.id === id) {
        const updated = { ...u, ...updatedFields };
        if (currentUser.id === id) setCurrentUser(updated);
        return updated;
      }
      return u;
    });

    const updatedEkip = ekip.map((member) => {
      if (
        (targetUser && member.username === targetUser.username) ||
        (targetUser && member.name.toLowerCase() === targetUser.name.toLowerCase())
      ) {
        const newRole = updatedFields.role || targetUser?.role || 'member';
        return {
          ...member,
          name: updatedFields.name || member.name,
          username: updatedFields.username || member.username,
          role: formatRoleLabel(newRole),
        };
      }
      return member;
    });

    setSystemUsers(updatedUsers);
    setEkip(updatedEkip);
    syncSettingsToCloud(updatedUsers, updatedEkip);
  };

  const deleteSystemUser = (id: string) => {
    if (currentUser.role !== 'super_admin') return;
    const target = systemUsers.find((u) => u.id === id);
    if (target?.username === 'kadorizator') return; // Süper admin silinemez

    const updatedUsers = systemUsers.filter((u) => u.id !== id);
    const updatedEkip = ekip.filter((e) => e.username !== target?.username);
    setSystemUsers(updatedUsers);
    setEkip(updatedEkip);
    syncSettingsToCloud(updatedUsers, updatedEkip);
  };

  return { addEkipUyesi, deleteEkipUyesi, addSystemUser, updateSystemUser, deleteSystemUser };
}
