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
  paidAmount?: number;
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

export type RoleType =
  | 'super_admin'
  | 'admin'
  | 'creative_director'
  | 'avukat'
  | 'ads_specialist'
  | 'herbokolog'
  | 'editor'
  | 'member'
  | string;

export interface SystemUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: RoleType;
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
  updateIsletme: (id: string, updatedFields: Partial<Isletme>) => void;
  deleteIsletme: (id: string) => void;
  addCekim: (item: Omit<Cekim, 'id'>) => void;
  deleteCekim: (id: string) => void;
  addEdit: (item: Omit<EditItem, 'id'>) => void;
  deleteEdit: (id: string) => void;
  updateEditStatus: (id: string, status: string) => void;
  addGelir: (item: Omit<Gelir, 'id'>) => void;
  deleteGelir: (id: string) => void;
  updateGelirStatus: (id: string, status: string, paidAmount?: number) => void;
  generateMonthlyIncomes: (targetMonthStr?: string) => Promise<number>;
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
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    if (months[monthIndex]) {
      return `${day} ${months[monthIndex]} ${year}`;
    }
  }
  return dateStr;
}

export function formatRoleLabel(roleKey: string): string {
  switch (roleKey) {
    case 'creative_director':
      return 'Creative Director';
    case 'avukat':
      return 'Avukat';
    case 'ads_specialist':
      return 'Ads Uzmanı';
    case 'herbokolog':
      return 'Herbokolog';
    case 'super_admin':
      return 'Süper Admin';
    case 'admin':
      return 'Admin';
    case 'editor':
      return 'Editör / Kurgucu';
    default:
      return roleKey || 'Ekip Üyesi';
  }
}

// String Normalizer & Strict Client Name Matcher (No False Overlap!)
export function normalizeClientName(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
}

export function isClientMatch(nameA: string, nameB: string): boolean {
  const normA = normalizeClientName(nameA);
  const normB = normalizeClientName(nameB);
  if (!normA || !normB) return false;

  if (normA === normB) return true;

  // Prefix match for variations like "Villa Kursları" vs "Villa Koleji" if base name matches
  if (normA.startsWith('villa') && normB.startsWith('villa')) return true;

  return false;
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
      let currentClientsList: Isletme[] = [];
      const { data: clientsData } = await supabase.from('clients').select('*');
      if (clientsData && clientsData.length > 0) {
        const realClients = clientsData.filter((c) => c.name !== '__SYSTEM_SETTINGS__');
        currentClientsList = realClients.map((c) => ({
          id: c.id,
          name: c.name.trim(),
          contact: c.contact_name || '-',
          phone: c.phone || '-',
          instagram: c.instagram || '@-',
          fee: c.monthly_fee ? `${c.monthly_fee} ₺` : '0 ₺',
          active: c.is_active ?? true,
        }));
        setIsletmeler(currentClientsList);
        setIsCloudConnected(true);
      }

      // 3. Fetch Shoots
      const { data: shootsData } = await supabase.from('shoots').select('*');
      if (shootsData && shootsData.length > 0) {
        setCekimler(
          shootsData.map((s) => ({
            id: s.id,
            client: (s.client_name || 'İşletme').trim(),
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
            client: (e.client_name || 'İşletme').trim(),
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
            client: (t.client_name || 'İşletme').trim(),
            title: t.title,
            platform: t.platform || 'Instagram Reels',
            date: t.publish_date || new Date().toISOString().split('T')[0],
            time: t.publish_time || '18:00',
            status: t.status || 'scheduled',
          }))
        );
      }

      // 6. Fetch Income Records and PURGE ORPHAN INCOMES whose business is no longer active in Isletmeler!
      const { data: incomeData } = await supabase.from('income_records').select('*');
      if (incomeData && incomeData.length > 0) {
        const mappedGelirler: Gelir[] = [];

        for (const g of incomeData) {
          const rawClient = (g.client_name || 'Müşteri').trim();
          // Find matching business strictly
          const matchedBiz = currentClientsList.find((biz) => isClientMatch(biz.name, rawClient));

          // IF THE BUSINESS WAS DELETED FROM ISLETMELER, DO NOT LOAD OR SHOW ORPHAN INCOMES!
          if (!matchedBiz) {
            // Clean up orphan record from Supabase DB asynchronously!
            supabase.from('income_records').delete().eq('id', g.id).then(() => {});
            continue;
          }

          const clientName = matchedBiz.name;
          const numFee = parseFloat(matchedBiz.fee.replace(/[^0-9.]/g, '')) || Number(g.amount);
          const finalAmount = g.collection_status !== 'paid' && numFee > 0 ? numFee : Number(g.amount);

          let paidAmt = 0;
          if (g.collection_status === 'paid') {
            paidAmt = finalAmount;
          } else if (g.collection_status === 'partial') {
            const match = g.description ? g.description.match(/(?:Kısmi Ödenen:\s*|kısmi:\s*)(\d+)/i) : null;
            if (match) {
              paidAmt = parseFloat(match[1]) || 0;
            }
          }

          mappedGelirler.push({
            id: g.id,
            client: clientName,
            description: g.description || `${clientName} - Aylık Paket Ücreti (Ayın İlk Haftası)`,
            amount: finalAmount,
            paidAmount: paidAmt,
            date: g.due_date || new Date().toISOString().split('T')[0],
            status: g.collection_status || 'pending',
          });
        }

        setGelirler(mappedGelirler);
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

  const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const addIsletme = async (item: Omit<Isletme, 'id'>) => {
    const numFee = parseFloat(item.fee.replace(/[^0-9.]/g, '')) || 0;

    try {
      await supabase.from('clients').insert({
        name: item.name.trim(),
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
          client_name: item.name.trim(),
          description: `${item.name.trim()} - Aylık Paket Ücreti (Ayın İlk Haftası)`,
          amount: numFee,
          due_date: firstWeekDate,
          collection_status: 'pending',
        });
      }

      fetchCloudData();
    } catch (e) {}
  };

  const updateIsletme = async (id: string, updatedFields: Partial<Isletme>) => {
    const target = isletmeler.find((i) => i.id === id);
    const oldName = target?.name;

    const numFee = updatedFields.fee !== undefined
      ? parseFloat(updatedFields.fee.replace(/[^0-9.]/g, '')) || 0
      : undefined;

    const newName = (updatedFields.name || oldName || '').trim();

    // 1. Update Isletmeler local state
    setIsletmeler((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields, name: newName } : item))
    );

    // 2. Update Gelirler (Income Records) local state IMMEDIATELY!
    if (oldName || newName) {
      setGelirler((prev) =>
        prev.map((g) => {
          if (isClientMatch(g.client, oldName || '') || isClientMatch(g.client, newName)) {
            return {
              ...g,
              client: newName,
              description: `${newName} - Aylık Paket Ücreti (Ayın İlk Haftası)`,
              amount: numFee !== undefined && g.status !== 'paid' ? numFee : g.amount,
            };
          }
          return g;
        })
      );

      // Sync local state for Cekimler, Editler, TakvimPosts too!
      setCekimler((prev) =>
        prev.map((c) => (isClientMatch(c.client, oldName || '') ? { ...c, client: newName } : c))
      );
      setEditler((prev) =>
        prev.map((e) => (isClientMatch(e.client, oldName || '') ? { ...e, client: newName } : e))
      );
      setTakvimPosts((prev) =>
        prev.map((t) => (isClientMatch(t.client, oldName || '') ? { ...t, client: newName } : t))
      );
    }

    try {
      // 3. Update Supabase clients table
      if (isUUID(id)) {
        const updateData: any = {};
        if (updatedFields.name !== undefined) updateData.name = newName;
        if (updatedFields.contact !== undefined) updateData.contact_name = updatedFields.contact;
        if (updatedFields.phone !== undefined) updateData.phone = updatedFields.phone;
        if (updatedFields.instagram !== undefined) updateData.instagram = updatedFields.instagram;
        if (numFee !== undefined) updateData.monthly_fee = numFee;
        if (updatedFields.active !== undefined) updateData.is_active = updatedFields.active;

        await supabase.from('clients').update(updateData).eq('id', id);
      } else if (target) {
        const updateData: any = {};
        if (updatedFields.name !== undefined) updateData.name = newName;
        if (updatedFields.contact !== undefined) updateData.contact_name = updatedFields.contact;
        if (updatedFields.phone !== undefined) updateData.phone = updatedFields.phone;
        if (updatedFields.instagram !== undefined) updateData.instagram = updatedFields.instagram;
        if (numFee !== undefined) updateData.monthly_fee = numFee;
        if (updatedFields.active !== undefined) updateData.is_active = updatedFields.active;

        await supabase.from('clients').update(updateData).eq('name', target.name);
      }

      // 4. REAL-TIME SYNC TO SUPABASE DB FOR ALL INCOME RECORDS MATCHING OLD NAME OR NEW NAME
      const { data: allIncomes } = await supabase.from('income_records').select('*');
      if (allIncomes) {
        for (const inc of allIncomes) {
          if (isClientMatch(inc.client_name, oldName || '') || isClientMatch(inc.client_name, newName)) {
            const updateInc: any = {
              client_name: newName,
              description: `${newName} - Aylık Paket Ücreti (Ayın İlk Haftası)`
            };
            if (numFee !== undefined && inc.collection_status !== 'paid') {
              updateInc.amount = numFee;
            }
            await supabase.from('income_records').update(updateInc).eq('id', inc.id);
          }
        }
      }

      fetchCloudData();
    } catch (e) {}
  };

  const deleteIsletme = async (id: string) => {
    const target = isletmeler.find((i) => i.id === id);
    const targetName = target?.name;

    // 1. Delete from Isletmeler state
    setIsletmeler((prev) => prev.filter((i) => i.id !== id));

    // 2. Delete all associated records from Gelirler, Cekimler, Editler, TakvimPosts states IMMEDIATELY
    if (targetName) {
      setGelirler((prev) => prev.filter((g) => !isClientMatch(g.client, targetName)));
      setCekimler((prev) => prev.filter((c) => !isClientMatch(c.client, targetName)));
      setEditler((prev) => prev.filter((e) => !isClientMatch(e.client, targetName)));
      setTakvimPosts((prev) => prev.filter((t) => !isClientMatch(t.client, targetName)));
    }

    try {
      // 3. Delete client from Supabase DB
      if (isUUID(id)) {
        await supabase.from('clients').delete().eq('id', id);
      } else if (target) {
        await supabase.from('clients').delete().eq('name', target.name);
      }

      // 4. Delete all associated records from Supabase DB tables!
      if (targetName) {
        const { data: incomes } = await supabase.from('income_records').select('id, client_name');
        if (incomes) {
          for (const inc of incomes) {
            if (isClientMatch(inc.client_name, targetName)) {
              await supabase.from('income_records').delete().eq('id', inc.id);
            }
          }
        }

        const { data: shoots } = await supabase.from('shoots').select('id, client_name');
        if (shoots) {
          for (const s of shoots) {
            if (isClientMatch(s.client_name, targetName)) {
              await supabase.from('shoots').delete().eq('id', s.id);
            }
          }
        }

        const { data: edits } = await supabase.from('edits').select('id, client_name');
        if (edits) {
          for (const ed of edits) {
            if (isClientMatch(ed.client_name, targetName)) {
              await supabase.from('edits').delete().eq('id', ed.id);
            }
          }
        }

        const { data: posts } = await supabase.from('content_calendar').select('id, client_name');
        if (posts) {
          for (const p of posts) {
            if (isClientMatch(p.client_name, targetName)) {
              await supabase.from('content_calendar').delete().eq('id', p.id);
            }
          }
        }
      }

      fetchCloudData();
    } catch (e) {}
  };

  const addCekim = async (item: Omit<Cekim, 'id'>) => {
    try {
      await supabase.from('shoots').insert({
        client_name: item.client.trim(),
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
        client_name: item.client.trim(),
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
        client_name: item.client.trim(),
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

  const updateGelirStatus = async (id: string, status: string, customPaidAmount?: number) => {
    setGelirler((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const finalPaid = status === 'paid'
            ? g.amount
            : status === 'partial'
            ? (customPaidAmount !== undefined ? customPaidAmount : g.paidAmount || 0)
            : 0;

          let desc = g.description;
          if (status === 'partial' && customPaidAmount !== undefined) {
            desc = `${g.client} - Aylık Paket Ücreti (Kısmi Ödenen: ${customPaidAmount} ₺)`;
          }

          return {
            ...g,
            status,
            description: desc,
            paidAmount: finalPaid,
          };
        }
        return g;
      })
    );

    try {
      if (isUUID(id)) {
        const updateObj: any = { collection_status: status };
        if (status === 'partial' && customPaidAmount !== undefined) {
          const item = gelirler.find((g) => g.id === id);
          const clientName = item ? item.client : 'Müşteri';
          updateObj.description = `${clientName} - Aylık Paket Ücreti (Kısmi Ödenen: ${customPaidAmount} ₺)`;
        }

        await supabase.from('income_records').update(updateObj).eq('id', id);
      }
      fetchCloudData();
    } catch (e) {}
  };

  // GENERATE MONTHLY INCOMES WITH STRICT SUPABASE DATABASE DEDUPLICATION CHECK!
  const generateMonthlyIncomes = async (targetMonthStr?: string): Promise<number> => {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1; // 1-12

    // Rule: On the 27th day or later of the month, auto-generate NEXT month's collection receipts!
    if (!targetMonthStr && today.getDate() >= 27) {
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }

    const datePrefix = targetMonthStr || `${year}-${String(month).padStart(2, '0')}`;
    const dueDate = `${datePrefix}-05`;

    // Direct Database Query to PREVENT DUPLICATES!
    const { data: existingDbRecords } = await supabase
      .from('income_records')
      .select('client_name')
      .like('due_date', `${datePrefix}%`);

    let count = 0;

    for (const biz of isletmeler) {
      if (!biz.active) continue;
      const numFee = parseFloat(biz.fee.replace(/[^0-9.]/g, '')) || 0;
      if (numFee <= 0) continue;

      const existsInDb = existingDbRecords?.some((rec) => isClientMatch(rec.client_name, biz.name));
      const existsInState = gelirler.some((g) => isClientMatch(g.client, biz.name) && g.date.startsWith(datePrefix));

      if (!existsInDb && !existsInState) {
        try {
          await supabase.from('income_records').insert({
            client_name: biz.name.trim(),
            description: `${biz.name.trim()} - Aylık Paket Ücreti (Ayın İlk Haftası)`,
            amount: numFee,
            due_date: dueDate,
            collection_status: 'pending',
          });
          count++;
        } catch (e) {}
      }
    }

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
        client_name: item.client.trim(),
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

    const userRole: SystemUser['role'] = item.role;

    const newSysUser: SystemUser = {
      id: Date.now().toString(),
      username: autoUsername,
      password: autoPassword,
      name: item.name,
      role: userRole,
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

    const newUser: SystemUser = {
      ...user,
      id: Date.now().toString(),
    };

    const updatedUsers = [...systemUsers, newUser];
    setSystemUsers(updatedUsers);

    // Sync to Ekip
    const roleLabel = formatRoleLabel(user.role);

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
        const newRole = updatedFields.role || targetUser?.role || 'member';
        const roleLabel = formatRoleLabel(newRole);

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
        updateIsletme,
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
