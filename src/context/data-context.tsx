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
  addEkipUyesi: (item: Omit<EkipUyesi, 'id' | 'initials'>) => void;
  deleteEkipUyesi: (id: string) => void;
  addSystemUser: (user: Omit<SystemUser, 'id'>) => boolean;
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
  {
    id: '3',
    username: 'editor1',
    password: '123456',
    name: 'Ahmet Kurgu',
    role: 'editor',
    permissions: {
      canManageFinance: false,
      canManageShoots: true,
      canManageEdits: true,
      canManageTakvim: true,
      canManageTeam: false,
      canManageUsers: false,
    },
  },
];

const initialHaftalikNotlar: HaftalikNot[] = [
  {
    id: '1',
    content: 'Bu hafta Kadıköy çekimleri saat 10:00 yerine 11:30 başlayacak, ekip bilgilendirilsin.',
    authorUsername: 'kadorizator',
    authorName: 'Kadir (Süper Admin)',
    date: '2026-08-01',
    createdAt: '14:30',
  },
];

const initialIsletmeler: Isletme[] = [
  { id: '1', name: 'Acme Cafe', contact: 'Ahmet Yılmaz', phone: '0555 123 4567', instagram: '@acmecafe', fee: '5.000 ₺', active: true },
  { id: '2', name: 'Zirve Mimarlık', contact: 'Ayşe Kaya', phone: '0532 987 6543', instagram: '@zirvearch', fee: '12.000 ₺', active: true },
];

const initialCekimler: Cekim[] = [
  { id: '1', client: 'Acme Cafe', title: 'Menü Çekimi', date: '2026-08-01', time: '10:00', location: 'Kadıköy, İstanbul', status: 'ready' },
  { id: '2', client: 'Zirve Mimarlık', title: 'Proje Tanıtımı', date: '2026-08-05', time: '14:00', location: 'Şişli, İstanbul', status: 'planned' },
];

const initialEditler: EditItem[] = [
  { id: '1', title: 'Menü Reel', client: 'Acme Cafe', type: 'Reels', editor: 'Ahmet Yılmaz', deadline: '2026-08-02', status: 'waiting' },
  { id: '2', title: 'Proje Özeti', client: 'Zirve Mimarlık', type: 'Video', editor: 'Ayşe Kaya', deadline: '2026-08-06', status: 'editing' },
];

const initialGelirler: Gelir[] = [
  { id: '1', client: 'Acme Cafe', description: 'Acme Cafe - Ağustos Ayı Anlaşma Ücreti (Ayın İlk Haftası)', amount: 5000, date: '2026-08-05', status: 'paid' },
  { id: '2', client: 'Zirve Mimarlık', description: 'Zirve Mimarlık - Ağustos Ayı Anlaşma Ücreti (Ayın İlk Haftası)', amount: 12000, date: '2026-08-05', status: 'pending' },
];

const initialGiderler: Gider[] = [
  { id: '1', title: 'Ofis Kirası', category: 'office', amount: 12000, date: '2026-08-01', paidBy: 'Şirket Hesabı' },
];

const initialTakvimPosts: TakvimPost[] = [
  { id: '1', client: 'Acme Cafe', title: 'Menü Tanıtım Reels', platform: 'Instagram Reels', date: '2026-08-03', time: '18:00', status: 'scheduled' },
];

const initialEkip: EkipUyesi[] = [
  { id: '1', name: 'Ahmet Yılmaz', initials: 'AY', color: 'bg-blue-500', role: 'Kurgucu', phone: '0555 111 2233' },
  { id: '2', name: 'Ayşe Kaya', initials: 'AK', color: 'bg-purple-500', role: 'Kurgucu / Yönetmen', phone: '0532 444 5566' },
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

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  const [currentUser, setCurrentUser] = useState<SystemUser>(defaultSuperAdmin);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(initialSystemUsers);
  const [haftalikNotlar, setHaftalikNotlar] = useState<HaftalikNot[]>(initialHaftalikNotlar);

  const [isletmeler, setIsletmeler] = useState<Isletme[]>(initialIsletmeler);
  const [cekimler, setCekimler] = useState<Cekim[]>(initialCekimler);
  const [editler, setEditler] = useState<EditItem[]>(initialEditler);
  const [gelirler, setGelirler] = useState<Gelir[]>(initialGelirler);
  const [giderler, setGiderler] = useState<Gider[]>(initialGiderler);
  const [takvimPosts, setTakvimPosts] = useState<TakvimPost[]>(initialTakvimPosts);
  const [ekip, setEkip] = useState<EkipUyesi[]>(initialEkip);

  const supabase = createClient();

  // Load from localStorage FIRST so user edits are NEVER overwritten
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedUser = localStorage.getItem('app_currentUser');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedUsers = localStorage.getItem('app_systemUsers');
      if (savedUsers) setSystemUsers(JSON.parse(savedUsers));

      const savedNotlar = localStorage.getItem('app_haftalikNotlar');
      if (savedNotlar) setHaftalikNotlar(JSON.parse(savedNotlar));

      const savedIsletmeler = localStorage.getItem('app_isletmeler');
      if (savedIsletmeler) setIsletmeler(JSON.parse(savedIsletmeler));

      const savedCekimler = localStorage.getItem('app_cekimler');
      if (savedCekimler) setCekimler(JSON.parse(savedCekimler));

      const savedEditler = localStorage.getItem('app_editler');
      if (savedEditler) setEditler(JSON.parse(savedEditler));

      const savedGelirler = localStorage.getItem('app_gelirler');
      if (savedGelirler) setGelirler(JSON.parse(savedGelirler));

      const savedGiderler = localStorage.getItem('app_giderler');
      if (savedGiderler) setGiderler(JSON.parse(savedGiderler));

      const savedTakvim = localStorage.getItem('app_takvimPosts');
      if (savedTakvim) setTakvimPosts(JSON.parse(savedTakvim));

      const savedEkip = localStorage.getItem('app_ekip');
      if (savedEkip) setEkip(JSON.parse(savedEkip));
    } catch (e) {}
  }, []);

  // Fetch Cloud DB if tables exist
  const fetchCloudData = async () => {
    try {
      const { data: clientsData, error: clientErr } = await supabase.from('clients').select('*');
      if (!clientErr && clientsData && clientsData.length > 0) {
        setIsletmeler(
          clientsData.map((c) => ({
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

      const { data: shootsData, error: shootErr } = await supabase.from('shoots').select('*');
      if (!shootErr && shootsData && shootsData.length > 0) {
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

      const { data: editsData, error: editErr } = await supabase.from('edits').select('*');
      if (!editErr && editsData && editsData.length > 0) {
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

      const { data: calData, error: calErr } = await supabase.from('content_calendar').select('*');
      if (!calErr && calData && calData.length > 0) {
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

      const { data: incomeData, error: incErr } = await supabase.from('income_records').select('*');
      if (!incErr && incomeData && incomeData.length > 0) {
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

      const { data: expData, error: expErr } = await supabase.from('expense_records').select('*');
      if (!expErr && expData && expData.length > 0) {
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

  useEffect(() => {
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

  // Save every user action immediately to localStorage so no data is ever lost or reset
  useEffect(() => {
    if (isMounted) localStorage.setItem('app_currentUser', JSON.stringify(currentUser));
  }, [currentUser, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('app_systemUsers', JSON.stringify(systemUsers));
  }, [systemUsers, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('app_haftalikNotlar', JSON.stringify(haftalikNotlar));
  }, [haftalikNotlar, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('app_isletmeler', JSON.stringify(isletmeler));
  }, [isletmeler, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('app_cekimler', JSON.stringify(cekimler));
  }, [cekimler, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('app_editler', JSON.stringify(editler));
  }, [editler, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('app_gelirler', JSON.stringify(gelirler));
  }, [gelirler, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('app_giderler', JSON.stringify(giderler));
  }, [giderler, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('app_takvimPosts', JSON.stringify(takvimPosts));
  }, [takvimPosts, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('app_ekip', JSON.stringify(ekip));
  }, [ekip, isMounted]);

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

    setSystemUsers((prev) => [...prev, newUser]);
    return true;
  };

  const deleteSystemUser = (id: string) => {
    if (currentUser.role !== 'super_admin') return;
    const target = systemUsers.find((u) => u.id === id);
    if (target?.username === 'kadorizator') return;

    setSystemUsers((prev) => prev.filter((u) => u.id !== id));
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

  const addIsletme = async (item: Omit<Isletme, 'id'>) => {
    const newId = Date.now().toString();
    const newItem = { ...item, id: newId };
    setIsletmeler((prev) => [newItem, ...prev]);

    const numFee = parseFloat(item.fee.replace(/[^0-9.]/g, '')) || 0;
    if (numFee > 0 && item.active) {
      const today = new Date();
      const firstWeekDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-05`;

      const newGelir: Gelir = {
        id: (Date.now() + 1).toString(),
        client: item.name,
        description: `${item.name} - Aylık Paket Ücreti (Ayın İlk Haftası)`,
        amount: numFee,
        date: firstWeekDate,
        status: 'pending',
      };
      setGelirler((prev) => [newGelir, ...prev]);
    }

    try {
      await supabase.from('clients').insert({
        name: item.name,
        contact_name: item.contact,
        phone: item.phone,
        instagram: item.instagram,
        monthly_fee: numFee,
        is_active: item.active,
      });
    } catch (e) {}
  };

  const deleteIsletme = async (id: string) => {
    setIsletmeler((prev) => prev.filter((i) => i.id !== id));
    try {
      await supabase.from('clients').delete().eq('id', id);
    } catch (e) {}
  };

  const addCekim = async (item: Omit<Cekim, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setCekimler((prev) => [newItem, ...prev]);

    try {
      await supabase.from('shoots').insert({
        client_name: item.client,
        title: item.title,
        shoot_date: item.date,
        start_time: item.time,
        location: item.location,
        status: item.status,
      });
    } catch (e) {}
  };

  const deleteCekim = async (id: string) => {
    setCekimler((prev) => prev.filter((i) => i.id !== id));
    try {
      await supabase.from('shoots').delete().eq('id', id);
    } catch (e) {}
  };

  const addEdit = async (item: Omit<EditItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setEditler((prev) => [newItem, ...prev]);

    try {
      await supabase.from('edits').insert({
        client_name: item.client,
        title: item.title,
        content_type: item.type,
        editor_name: item.editor,
        deadline: item.deadline,
        status: item.status,
      });
    } catch (e) {}
  };

  const deleteEdit = async (id: string) => {
    setEditler((prev) => prev.filter((i) => i.id !== id));
    try {
      await supabase.from('edits').delete().eq('id', id);
    } catch (e) {}
  };

  const updateEditStatus = async (id: string, status: string) => {
    setEditler((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    try {
      await supabase.from('edits').update({ status }).eq('id', id);
    } catch (e) {}
  };

  const addGelir = async (item: Omit<Gelir, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setGelirler((prev) => [newItem, ...prev]);

    try {
      await supabase.from('income_records').insert({
        client_name: item.client,
        description: item.description,
        amount: item.amount,
        due_date: item.date,
        collection_status: item.status,
      });
    } catch (e) {}
  };

  const deleteGelir = async (id: string) => {
    setGelirler((prev) => prev.filter((i) => i.id !== id));
    try {
      await supabase.from('income_records').delete().eq('id', id);
    } catch (e) {}
  };

  const updateGelirStatus = async (id: string, status: string) => {
    setGelirler((prev) => prev.map((g) => (g.id === id ? { ...g, status } : g)));
    try {
      await supabase.from('income_records').update({ collection_status: status }).eq('id', id);
    } catch (e) {}
  };

  const generateMonthlyIncomes = (targetMonthStr?: string) => {
    const today = new Date();
    const datePrefix = targetMonthStr || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const dueDate = `${datePrefix}-05`;

    let count = 0;
    const newItems: Gelir[] = [];

    isletmeler.forEach((biz) => {
      if (!biz.active) return;
      const numFee = parseFloat(biz.fee.replace(/[^0-9.]/g, '')) || 0;
      if (numFee <= 0) return;

      const exists = gelirler.some(
        (g) => g.client === biz.name && g.date.startsWith(datePrefix)
      );

      if (!exists) {
        newItems.push({
          id: (Date.now() + Math.random()).toString(),
          client: biz.name,
          description: `${biz.name} - Aylık Paket Tahsilatı (Ayın İlk Haftası)`,
          amount: numFee,
          date: dueDate,
          status: 'pending',
        });
        count++;
      }
    });

    if (newItems.length > 0) {
      setGelirler((prev) => [...newItems, ...prev]);
    }

    return count;
  };

  const addGider = async (item: Omit<Gider, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setGiderler((prev) => [newItem, ...prev]);

    try {
      await supabase.from('expense_records').insert({
        title: item.title,
        category: item.category,
        amount: item.amount,
        expense_date: item.date,
        paid_by: item.paidBy,
      });
    } catch (e) {}
  };

  const deleteGider = async (id: string) => {
    setGiderler((prev) => prev.filter((i) => i.id !== id));
    try {
      await supabase.from('expense_records').delete().eq('id', id);
    } catch (e) {}
  };

  const addTakvimPost = async (item: Omit<TakvimPost, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setTakvimPosts((prev) => [newItem, ...prev]);

    try {
      await supabase.from('content_calendar').insert({
        client_name: item.client,
        title: item.title,
        platform: item.platform,
        publish_date: item.date,
        publish_time: item.time,
        status: item.status,
      });
    } catch (e) {}
  };

  const deleteTakvimPost = async (id: string) => {
    setTakvimPosts((prev) => prev.filter((t) => t.id !== id));
    try {
      await supabase.from('content_calendar').delete().eq('id', id);
    } catch (e) {}
  };

  const updateTakvimPostStatus = async (id: string, status: TakvimPost['status']) => {
    setTakvimPosts((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await supabase.from('content_calendar').update({ status }).eq('id', id);
    } catch (e) {}
  };

  const addEkipUyesi = (item: Omit<EkipUyesi, 'id' | 'initials'>) => {
    const parts = item.name.trim().split(' ');
    const initials = parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : item.name.substring(0, 2).toUpperCase();

    const newItem: EkipUyesi = {
      ...item,
      id: Date.now().toString(),
      initials,
    };
    setEkip((prev) => [...prev, newItem]);
  };

  const deleteEkipUyesi = (id: string) => {
    setEkip((prev) => prev.filter((e) => e.id !== id));
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
