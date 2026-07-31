'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Isletme {
  id: string;
  name: string;
  contact: string;
  phone: string;
  instagram: string;
  fee: string;
  active: boolean;
}

export interface Cekim {
  id: string;
  client: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  status: string;
}

export interface EditItem {
  id: string;
  title: string;
  client: string;
  type: string;
  editor: string;
  deadline: string;
  status: string;
}

export interface Gelir {
  id: string;
  client: string;
  description: string;
  amount: number;
  date: string;
  status: string;
}

export interface Gider {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paidBy: string;
}

export interface TakvimPost {
  id: string;
  client: string;
  title: string;
  platform: string;
  date: string;
  time?: string;
  status: 'preparing' | 'ready' | 'scheduled' | 'published';
}

export interface EkipUyesi {
  id: string;
  name: string;
  role: string;
  phone: string;
  color: string;
  initials: string;
  username?: string;
}

export interface UserPermissions {
  canManageFinance: boolean;
  canManageShoots: boolean;
  canManageEdits: boolean;
  canManageTakvim: boolean;
  canManageTeam: boolean;
  canManageUsers: boolean;
}

export interface SystemUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'member';
  permissions: UserPermissions;
}

export interface HaftalikNot {
  id: string;
  content: string;
  authorUsername: string;
  authorName: string;
  date: string;
  createdAt: string;
}

interface DataContextType {
  isletmeler: Isletme[];
  cekimler: Cekim[];
  editler: EditItem[];
  gelirler: Gelir[];
  giderler: Gider[];
  takvimPosts: TakvimPost[];
  ekip: EkipUyesi[];
  systemUsers: SystemUser[];
  currentUser: SystemUser;
  haftalikNotlar: HaftalikNot[];
  isCloudConnected: boolean;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  addIsletme: (item: Omit<Isletme, 'id'>) => void;
  deleteIsletme: (id: string) => void;
  addCekim: (item: Omit<Cekim, 'id'>) => void;
  deleteCekim: (id: string) => void;
  addEdit: (item: Omit<EditItem, 'id'>) => void;
  deleteEdit: (id: string) => void;
  updateEditStatus: (id: string, status: string) => void;
  addGelir: (item: Omit<Gelir, 'id'>) => void;
  deleteGelir: (id: string) => void;
  updateGelirStatus: (id: string, status: string) => void;
  generateMonthlyIncomes: (targetMonthStr?: string) => number;
  addGider: (item: Omit<Gider, 'id'>) => void;
  deleteGider: (id: string) => void;
  addTakvimPost: (item: Omit<TakvimPost, 'id'>) => void;
  deleteTakvimPost: (id: string) => void;
  updateTakvimPostStatus: (id: string, status: TakvimPost['status']) => void;
  addEkipUyesi: (item: Omit<EkipUyesi, 'id' | 'initials'>, customUsername?: string, customPassword?: string) => void;
  deleteEkipUyesi: (id: string) => void;
  addSystemUser: (user: Omit<SystemUser, 'id'>) => boolean;
  updateSystemUser: (id: string, updatedFields: Partial<SystemUser>) => void;
  deleteSystemUser: (id: string) => void;
  addHaftalikNot: (content: string) => void;
  deleteHaftalikNot: (id: string) => void;
  formatDateTr: (dateStr: string) => string;
}

const defaultSuperAdmin: SystemUser = {
  id: '1',
  username: 'kadorizator',
  password: 'Kc3543**',
  name: 'Kadir (Süper Admin)',
  role: 'super_admin',
  permissions: {
    canManageFinance: true,
    canManageShoots: true,
    canManageEdits: true,
    canManageTakvim: true,
    canManageTeam: true,
    canManageUsers: true,
  },
};

const initialSystemUsers: SystemUser[] = [
  defaultSuperAdmin,
  {
    id: '2',
    username: 'admin',
    password: '123456',
    name: 'Ajans Yöneticisi',
    role: 'admin',
    permissions: {
      canManageFinance: true,
      canManageShoots: true,
      canManageEdits: true,
      canManageTakvim: true,
      canManageTeam: false,
      canManageUsers: false,
    },
  },
];

const initialEkip: EkipUyesi[] = [
  { id: '1', name: 'Kadir (Süper Admin)', initials: 'KS', color: 'bg-purple-500', role: 'Süper Admin', phone: '0555 000 0000', username: 'kadorizator' },
];

export function formatDateTr(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylü', 'Ekim', 'Kasım', 'Aralık'
    ];
    if (months[monthIndex]) {
      return `${day} ${months[monthIndex]} ${year}`;
    }
  }
  return dateStr;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  const [currentUser, setCurrentUser] = useState<SystemUser>(defaultSuperAdmin);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(initialSystemUsers);
  const [haftalikNotlar, setHaftalikNotlar] = useState<HaftalikNot[]>([]);

  const [isletmeler, setIsletmeler] = useState<Isletme[]>([]);
  const [cekimler, setCekimler] = useState<Cekim[]>([]);
  const [editler, setEditler] = useState<EditItem[]>([]);
  const [gelirler, setGelirler] = useState<Gelir[]>([]);
  const [giderler, setGiderler] = useState<Gider[]>([]);
  const [takvimPosts, setTakvimPosts] = useState<TakvimPost[]>([]);
  const [ekip, setEkip] = useState<EkipUyesi[]>(initialEkip);

  const supabase = createClient();

  // Helper to persist system config (SystemUsers & Ekip) into Supabase Cloud DB via contact_name column
  const syncSettingsToCloud = async (updatedUsers: SystemUser[], updatedEkip: EkipUyesi[]) => {
    try {
      const payload = JSON.stringify({ systemUsers: updatedUsers, ekip: updatedEkip });
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('name', '__SYSTEM_SETTINGS__')
        .maybeSingle();

      if (existing) {
        await supabase.from('clients').update({ contact_name: payload }).eq('id', existing.id);
      } else {
        await supabase.from('clients').insert({
          name: '__SYSTEM_SETTINGS__',
          contact_name: payload,
          is_active: false,
        });
      }
    } catch (e) {}
  };

  // Mount effect - Fetch cloud data FIRST!
  useEffect(() => {
    setIsMounted(true);

    try {
      const savedUser = localStorage.getItem('app_currentUser');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    } catch (e) {}

    fetchCloudData();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchCloudData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Save current active logged in user to LocalStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('app_currentUser', JSON.stringify(currentUser));
    }
  }, [currentUser, isMounted]);

  const fetchCloudData = async () => {
    try {
      // 1. Fetch system users & team members from Supabase Cloud DB record
      const { data: sysRecord } = await supabase
        .from('clients')
        .select('*')
        .eq('name', '__SYSTEM_SETTINGS__')
        .maybeSingle();

      if (sysRecord && sysRecord.contact_name) {
        try {
          const parsed = JSON.parse(sysRecord.contact_name);
          if (parsed.systemUsers && Array.isArray(parsed.systemUsers)) {
            setSystemUsers(parsed.systemUsers);
          }
          if (parsed.ekip && Array.isArray(parsed.ekip)) {
            setEkip(parsed.ekip);
          }
        } catch (e) {}
      }

      // 2. Fetch clients
      const { data: clientsData } = await supabase.from('clients').select('*');
      if (clientsData && clientsData.length > 0) {
        const realClients = clientsData.filter((c) => c.name !== '__SYSTEM_SETTINGS__');
        setIsletmeler(
          realClients.map((c) => ({
            id: c.id,
            name: c.name,
            contact: c.contact_name || '-',
            phone: c.phone || '-',
            instagram: c.instagram || '@-',
            fee: c.monthly_fee ? `${c.monthly_fee} ₺` : '0 ₺',
            active: c.is_active ?? true,
          }))
        );
        setIsCloudConnected(true);
      }

      // 3. Fetch Shoots
      const { data: shootsData } = await supabase.from('shoots').select('*');
      if (shootsData && shootsData.length > 0) {
        setCekimler(
          shootsData.map((s) => ({
            id: s.id,
            client: s.client_name || 'İşletme',
            title: s.title,
            date: s.shoot_date || new Date().toISOString().split('T')[0],
            time: s.start_time || '10:00',
            location: s.location || 'Stüdyo',
            status: s.status || 'planned',
          }))
        );
      }

      // 4. Fetch Edits
      const { data: editsData } = await supabase.from('edits').select('*');
      if (editsData && editsData.length > 0) {
        setEditler(
          editsData.map((e) => ({
            id: e.id,
            title: e.title,
            client: e.client_name || 'İşletme',
            type: e.content_type || 'Reels',
            editor: e.editor_name || 'Atanmadı',
            deadline: e.deadline || new Date().toISOString().split('T')[0],
            status: e.status || 'waiting',
          }))
        );
      }

      // 5. Fetch Content Calendar
      const { data: calData } = await supabase.from('content_calendar').select('*');
      if (calData && calData.length > 0) {
        setTakvimPosts(
          calData.map((t) => ({
            id: t.id,
            client: t.client_name || 'İşletme',
            title: t.title,
            platform: t.platform || 'Instagram Reels',
            date: t.publish_date || new Date().toISOString().split('T')[0],
            time: t.publish_time || '18:00',
            status: t.status || 'scheduled',
          }))
        );
      }

      // 6. Fetch Income Records
      const { data: incomeData } = await supabase.from('income_records').select('*');
      if (incomeData && incomeData.length > 0) {
        setGelirler(
          incomeData.map((g) => ({
            id: g.id,
            client: g.client_name || 'Müşteri',
            description: g.description,
            amount: Number(g.amount) || 0,
            date: g.due_date || new Date().toISOString().split('T')[0],
            status: g.collection_status || 'pending',
          }))
        );
      }

      // 7. Fetch Expense Records
      const { data: expData } = await supabase.from('expense_records').select('*');
      if (expData && expData.length > 0) {
        setGiderler(
          expData.map((gx) => ({
            id: gx.id,
            title: gx.title,
            category: gx.category || 'office',
            amount: Number(gx.amount) || 0,
            date: gx.expense_date || new Date().toISOString().split('T')[0],
            paidBy: gx.paid_by || 'Kredi Kartı',
          }))
        );
      }
    } catch (err) {}
  };

  const login = (usernameInput: string, passInput: string): boolean => {
    const user = systemUsers.find(
      (u) =>
        u.username.toLowerCase() === usernameInput.trim().toLowerCase() &&
        u.password === passInput
    );

    if (user) {
      setCurrentUser(user);
      if (typeof document !== 'undefined') {
        document.cookie = 'app_session=true; path=/; max-age=2592000; SameSite=Lax';
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(defaultSuperAdmin);
    if (typeof document !== 'undefined') {
      document.cookie = 'app_session=; path=/; max-age=0; SameSite=Lax';
      window.location.href = '/login';
    }
  };

  const addSystemUser = (user: Omit<SystemUser, 'id'>): boolean => {
    if (currentUser.role !== 'super_admin') return false;

    const exists = systemUsers.some(
      (u) => u.username.toLowerCase() === user.username.toLowerCase()
    );
    if (exists) return false;

    const newUser: SystemUser = {
      ...user,
      id: Date.now().toString(),
    };

    const updatedUsers = [...systemUsers, newUser];
    setSystemUsers(updatedUsers);

    // Sync to Ekip
    const roleLabel =
      user.role === 'super_admin'
        ? 'Süper Admin'
        : user.role === 'admin'
        ? 'Admin'
        : user.role === 'editor'
        ? 'Kurgucu / Editör'
        : 'Ekip Üyesi';

    const parts = user.name.trim().split(' ');
    const initials = parts.length >= 2
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

    const updatedEkip = [...ekip, newMember];
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
        if (currentUser.id === id) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    });

    // Real-time sync with Ekip members!
    const updatedEkip = ekip.map((member) => {
      if (
        (targetUser && member.username === targetUser.username) ||
        (targetUser && member.name.toLowerCase() === targetUser.name.toLowerCase())
      ) {
        const newRole = updatedFields.role || targetUser?.role;
        const roleLabel =
          newRole === 'super_admin'
            ? 'Süper Admin'
            : newRole === 'admin'
            ? 'Admin'
            : newRole === 'editor'
            ? 'Kurgucu / Editör'
            : 'Ekip Üyesi';

        return {
          ...member,
          name: updatedFields.name || member.name,
          username: updatedFields.username || member.username,
          role: roleLabel,
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
    if (target?.username === 'kadorizator') return;

    const updatedUsers = systemUsers.filter((u) => u.id !== id);
    const updatedEkip = ekip.filter((e) => e.username !== target?.username);

    setSystemUsers(updatedUsers);
    setEkip(updatedEkip);
    syncSettingsToCloud(updatedUsers, updatedEkip);
  };

  const addHaftalikNot = (content: string) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newNot: HaftalikNot = {
      id: Date.now().toString(),
      content,
      authorUsername: currentUser.username,
      authorName: currentUser.name,
      date: todayStr,
      createdAt: timeStr,
    };

    setHaftalikNotlar((prev) => [newNot, ...prev]);
  };

  const deleteHaftalikNot = (id: string) => {
    const note = haftalikNotlar.find((n) => n.id === id);
    if (!note) return;

    if (currentUser.role === 'super_admin' || note.authorUsername === currentUser.username) {
      setHaftalikNotlar((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const addIsletme = async (item: Omit<Isletme, 'id'>) => {
    const numFee = parseFloat(item.fee.replace(/[^0-9.]/g, '')) || 0;

    try {
      await supabase.from('clients').insert({
        name: item.name,
        contact_name: item.contact,
        phone: item.phone,
        instagram: item.instagram,
        monthly_fee: numFee,
        is_active: item.active,
      });

      if (numFee > 0 && item.active) {
        const today = new Date();
        const firstWeekDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-05`;

        await supabase.from('income_records').insert({
          client_name: item.name,
          description: `${item.name} - Aylık Paket Ücreti (Ayın İlk Haftası)`,
          amount: numFee,
          due_date: firstWeekDate,
          collection_status: 'pending',
        });
      }

      fetchCloudData();
    } catch (e) {}
  };

  const deleteIsletme = async (id: string) => {
    const target = isletmeler.find((i) => i.id === id);
    setIsletmeler((prev) => prev.filter((i) => i.id !== id));

    try {
      if (isUUID(id)) {
        await supabase.from('clients').delete().eq('id', id);
      } else if (target) {
        await supabase.from('clients').delete().eq('name', target.name);
      }
      fetchCloudData();
    } catch (e) {}
  };

  const addCekim = async (item: Omit<Cekim, 'id'>) => {
    try {
      await supabase.from('shoots').insert({
        client_name: item.client,
        title: item.title,
        shoot_date: item.date,
        start_time: item.time,
        location: item.location,
        status: item.status,
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

  const addEdit = async (item: Omit<EditItem, 'id'>) => {
    try {
      await supabase.from('edits').insert({
        client_name: item.client,
        title: item.title,
        content_type: item.type,
        editor_name: item.editor,
        deadline: item.deadline,
        status: item.status,
      });
      fetchCloudData();
    } catch (e) {}
  };

  const deleteEdit = async (id: string) => {
    const target = editler.find((e) => e.id === id);
    setEditler((prev) => prev.filter((i) => i.id !== id));

    try {
      if (isUUID(id)) {
        await supabase.from('edits').delete().eq('id', id);
      } else if (target) {
        await supabase.from('edits').delete().eq('title', target.title);
      }
      fetchCloudData();
    } catch (e) {}
  };

  const updateEditStatus = async (id: string, status: string) => {
    setEditler((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    try {
      if (isUUID(id)) {
        await supabase.from('edits').update({ status }).eq('id', id);
      }
      fetchCloudData();
    } catch (e) {}
  };

  const addGelir = async (item: Omit<Gelir, 'id'>) => {
    try {
      await supabase.from('income_records').insert({
        client_name: item.client,
        description: item.description,
        amount: item.amount,
        due_date: item.date,
        collection_status: item.status,
      });
      fetchCloudData();
    } catch (e) {}
  };

  const deleteGelir = async (id: string) => {
    const target = gelirler.find((g) => g.id === id);
    setGelirler((prev) => prev.filter((i) => i.id !== id));

    try {
      if (isUUID(id)) {
        await supabase.from('income_records').delete().eq('id', id);
      } else if (target) {
        await supabase.from('income_records').delete().eq('description', target.description);
      }
      fetchCloudData();
    } catch (e) {}
  };

  const updateGelirStatus = async (id: string, status: string) => {
    setGelirler((prev) => prev.map((g) => (g.id === id ? { ...g, status } : g)));
    try {
      if (isUUID(id)) {
        await supabase.from('income_records').update({ collection_status: status }).eq('id', id);
      }
      fetchCloudData();
    } catch (e) {}
  };

  const generateMonthlyIncomes = (targetMonthStr?: string) => {
    const today = new Date();
    const datePrefix = targetMonthStr || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const dueDate = `${datePrefix}-05`;

    let count = 0;

    isletmeler.forEach(async (biz) => {
      if (!biz.active) return;
      const numFee = parseFloat(biz.fee.replace(/[^0-9.]/g, '')) || 0;
      if (numFee <= 0) return;

      const exists = gelirler.some(
        (g) => g.client === biz.name && g.date.startsWith(datePrefix)
      );

      if (!exists) {
        try {
          await supabase.from('income_records').insert({
            client_name: biz.name,
            description: `${biz.name} - Aylık Paket Tahsilatı (Ayın İlk Haftası)`,
            amount: numFee,
            due_date: dueDate,
            collection_status: 'pending',
          });
          count++;
        } catch (e) {}
      }
    });

    fetchCloudData();
    return count;
  };

  const addGider = async (item: Omit<Gider, 'id'>) => {
    try {
      await supabase.from('expense_records').insert({
        title: item.title,
        category: item.category,
        amount: item.amount,
        expense_date: item.date,
        paid_by: item.paidBy,
      });
      fetchCloudData();
    } catch (e) {}
  };

  const deleteGider = async (id: string) => {
    const target = giderler.find((g) => g.id === id);
    setGiderler((prev) => prev.filter((i) => i.id !== id));

    try {
      if (isUUID(id)) {
        await supabase.from('expense_records').delete().eq('id', id);
      } else if (target) {
        await supabase.from('expense_records').delete().eq('title', target.title);
      }
      fetchCloudData();
    } catch (e) {}
  };

  const addTakvimPost = async (item: Omit<TakvimPost, 'id'>) => {
    try {
      await supabase.from('content_calendar').insert({
        client_name: item.client,
        title: item.title,
        platform: item.platform,
        publish_date: item.date,
        publish_time: item.time,
        status: item.status,
      });
      fetchCloudData();
    } catch (e) {}
  };

  const deleteTakvimPost = async (id: string) => {
    const target = takvimPosts.find((t) => t.id === id);
    setTakvimPosts((prev) => prev.filter((t) => t.id !== id));

    try {
      if (isUUID(id)) {
        await supabase.from('content_calendar').delete().eq('id', id);
      } else if (target) {
        await supabase.from('content_calendar').delete().eq('title', target.title);
      }
      fetchCloudData();
    } catch (e) {}
  };

  const updateTakvimPostStatus = async (id: string, status: TakvimPost['status']) => {
    setTakvimPosts((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      if (isUUID(id)) {
        await supabase.from('content_calendar').update({ status }).eq('id', id);
      }
      fetchCloudData();
    } catch (e) {}
  };

  const addEkipUyesi = (
    item: Omit<EkipUyesi, 'id' | 'initials'>,
    customUsername?: string,
    customPassword?: string
  ) => {
    const parts = item.name.trim().split(' ');
    const initials = parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : item.name.substring(0, 2).toUpperCase();

    const autoUsername = customUsername?.trim().toLowerCase() ||
      item.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const autoPassword = customPassword || '123456';

    const newItem: EkipUyesi = {
      ...item,
      id: Date.now().toString(),
      initials,
      username: autoUsername,
    };

    const updatedEkip = [...ekip, newItem];
    setEkip(updatedEkip);

    const userRole: SystemUser['role'] = item.role.toLowerCase().includes('admin')
      ? 'admin'
      : item.role.toLowerCase().includes('kurgu') || item.role.toLowerCase().includes('edit')
      ? 'editor'
      : 'member';

    const newSysUser: SystemUser = {
      id: Date.now().toString(),
      username: autoUsername,
      password: autoPassword,
      name: item.name,
      role: userRole,
      permissions: {
        canManageFinance: userRole === 'admin',
        canManageShoots: true,
        canManageEdits: true,
        canManageTakvim: true,
        canManageTeam: userRole === 'admin',
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

  return (
    <DataContext.Provider
      value={{
        isletmeler,
        cekimler,
        editler,
        gelirler,
        giderler,
        takvimPosts,
        ekip,
        systemUsers,
        currentUser,
        haftalikNotlar,
        isCloudConnected,
        login,
        logout,
        addIsletme,
        deleteIsletme,
        addCekim,
        deleteCekim,
        addEdit,
        deleteEdit,
        updateEditStatus,
        addGelir,
        deleteGelir,
        updateGelirStatus,
        generateMonthlyIncomes,
        addGider,
        deleteGider,
        addTakvimPost,
        deleteTakvimPost,
        updateTakvimPostStatus,
        addEkipUyesi,
        deleteEkipUyesi,
        addSystemUser,
        updateSystemUser,
        deleteSystemUser,
        addHaftalikNot,
        deleteHaftalikNot,
        formatDateTr,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
