'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  status: string; // planned, ready, shot, completed, cancelled
}

export interface EditItem {
  id: string;
  title: string;
  client: string;
  type: string; // Reels, Video, Post, YouTube
  editor: string;
  deadline: string; // YYYY-MM-DD
  status: string; // waiting, editing, client_review, ready
}

export interface Gelir {
  id: string;
  client: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  status: string; // pending, paid, overdue
}

export interface Gider {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paidBy: string;
}

export interface TakvimPost {
  id: string;
  client: string;
  title: string;
  platform: string; // Instagram Reels, Post, Story, YouTube, TikTok
  date: string; // YYYY-MM-DD
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
  {
    id: '2',
    content: 'Zirve Mimarlık web peşinatı cuma günü hesaba geçecek, takibini yapalım.',
    authorUsername: 'kadorizator',
    authorName: 'Kadir (Süper Admin)',
    date: '2026-08-02',
    createdAt: '09:15',
  },
];

const initialIsletmeler: Isletme[] = [
  { id: '1', name: 'Acme Cafe', contact: 'Ahmet Yılmaz', phone: '0555 123 4567', instagram: '@acmecafe', fee: '5.000 ₺', active: true },
  { id: '2', name: 'Zirve Mimarlık', contact: 'Ayşe Kaya', phone: '0532 987 6543', instagram: '@zirvearch', fee: '12.000 ₺', active: true },
  { id: '3', name: 'Lezzet Dünyası', contact: 'Mehmet Demir', phone: '0505 456 7890', instagram: '@lezzetd', fee: '8.000 ₺', active: false },
];

const initialCekimler: Cekim[] = [
  { id: '1', client: 'Acme Cafe', title: 'Menü Çekimi', date: '2026-08-01', time: '10:00', location: 'Kadıköy, İstanbul', status: 'ready' },
  { id: '2', client: 'Zirve Mimarlık', title: 'Proje Tanıtımı', date: '2026-08-05', time: '14:00', location: 'Şişli, İstanbul', status: 'planned' },
  { id: '3', client: 'Lezzet Dünyası', title: 'Reels Çekimi', date: '2026-08-10', time: '11:30', location: 'Beşiktaş, İstanbul', status: 'completed' },
  { id: '4', client: 'Fitness Club', title: 'Antrenman Videosu', date: '2026-08-12', time: '09:00', location: 'Maltepe, İstanbul', status: 'planned' },
];

const initialEditler: EditItem[] = [
  { id: '1', title: 'Menü Reel', client: 'Acme Cafe', type: 'Reels', editor: 'Ahmet Yılmaz', deadline: '2026-08-02', status: 'waiting' },
  { id: '2', title: 'Proje Özeti', client: 'Zirve Mimarlık', type: 'Video', editor: 'Ayşe Kaya', deadline: '2026-08-06', status: 'editing' },
  { id: '3', title: 'Youtube Vlog', client: 'Gezi Blog', type: 'YouTube', editor: 'Mehmet Demir', deadline: '2026-08-04', status: 'client_review' },
  { id: '4', title: 'Tanıtım Filmi', client: 'Fitness Club', type: 'Video', editor: 'Ayşe Kaya', deadline: '2026-08-01', status: 'ready' },
];

const initialGelirler: Gelir[] = [
  { id: '1', client: 'Acme Cafe', description: 'Acme Cafe - Ağustos Ayı Anlaşma Ücreti (Ayın İlk Haftası)', amount: 5000, date: '2026-08-05', status: 'paid' },
  { id: '2', client: 'Zirve Mimarlık', description: 'Zirve Mimarlık - Ağustos Ayı Anlaşma Ücreti (Ayın İlk Haftası)', amount: 12000, date: '2026-08-05', status: 'pending' },
  { id: '3', client: 'Lezzet Dünyası', description: 'Lezzet Dünyası - Sosyal Medya Yönetimi', amount: 8000, date: '2026-07-05', status: 'overdue' },
];

const initialGiderler: Gider[] = [
  { id: '1', title: 'Ofis Kirası', category: 'office', amount: 12000, date: '2026-08-01', paidBy: 'Şirket Hesabı' },
  { id: '2', title: 'Kamera Ekipmanı Kiralama', category: 'equipment', amount: 4500, date: '2026-08-03', paidBy: 'Ahmet Yılmaz' },
  { id: '3', title: 'Benzin & Ulaşım', category: 'transportation', amount: 1200, date: '2026-08-04', paidBy: 'Mehmet Demir' },
];

const initialTakvimPosts: TakvimPost[] = [
  { id: '1', client: 'Acme Cafe', title: 'Menü Tanıtım Reels', platform: 'Instagram Reels', date: '2026-08-03', time: '18:00', status: 'scheduled' },
  { id: '2', client: 'Zirve Mimarlık', title: 'Ofis Turları #2', platform: 'Instagram Post', date: '2026-08-07', time: '14:00', status: 'ready' },
  { id: '3', client: 'Fitness Club', title: 'Motivasyon Story', platform: 'Instagram Story', date: '2026-08-10', time: '11:00', status: 'published' },
  { id: '4', client: 'Lezzet Dünyası', title: 'Şefin Özel Tarifi', platform: 'YouTube', date: '2026-08-15', time: '19:30', status: 'preparing' },
];

const initialEkip: EkipUyesi[] = [
  { id: '1', name: 'Ahmet Yılmaz', initials: 'AY', color: 'bg-blue-500', role: 'Kurgucu', phone: '0555 111 2233' },
  { id: '2', name: 'Ayşe Kaya', initials: 'AK', color: 'bg-purple-500', role: 'Kurgucu / Yönetmen', phone: '0532 444 5566' },
  { id: '3', name: 'Mehmet Demir', initials: 'MD', color: 'bg-emerald-500', role: 'Sosyal Medya Uzmanı', phone: '0505 777 8899' },
  { id: '4', name: 'Ali Veli', initials: 'AV', color: 'bg-amber-500', role: 'Grafiker', phone: '0544 999 0011' },
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

  // Load state from localStorage ONLY after mounting in the browser (prevents SSR hydration error)
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
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
  }, []);

  // Sync to localStorage only after client component mounts
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

  // Auth Methods
  const login = (usernameInput: string, passInput: string): boolean => {
    const user = systemUsers.find(
      (u) =>
        u.username.toLowerCase() === usernameInput.trim().toLowerCase() &&
        u.password === passInput
    );

    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(defaultSuperAdmin);
  };

  const addSystemUser = (user: Omit<SystemUser, 'id'>): boolean => {
    // Only super_admin can manage users
    if (currentUser.role !== 'super_admin') {
      return false;
    }

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
    // Don't allow deleting super_admin account 'kadorizator'
    const target = systemUsers.find((u) => u.id === id);
    if (target?.username === 'kadorizator') return;

    setSystemUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Weekly Notes Methods
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

    // Super admin can delete any note, users can delete their own notes
    if (currentUser.role === 'super_admin' || note.authorUsername === currentUser.username) {
      setHaftalikNotlar((prev) => prev.filter((n) => n.id !== id));
    }
  };

  // Business / Shoot / Edit / Finance Methods
  const addIsletme = (item: Omit<Isletme, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
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
  };

  const deleteIsletme = (id: string) => {
    setIsletmeler((prev) => prev.filter((i) => i.id !== id));
  };

  const addCekim = (item: Omit<Cekim, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setCekimler((prev) => [newItem, ...prev]);
  };

  const deleteCekim = (id: string) => {
    setCekimler((prev) => prev.filter((i) => i.id !== id));
  };

  const addEdit = (item: Omit<EditItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setEditler((prev) => [newItem, ...prev]);
  };

  const deleteEdit = (id: string) => {
    setEditler((prev) => prev.filter((i) => i.id !== id));
  };

  const updateEditStatus = (id: string, status: string) => {
    setEditler((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const addGelir = (item: Omit<Gelir, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setGelirler((prev) => [newItem, ...prev]);
  };

  const deleteGelir = (id: string) => {
    setGelirler((prev) => prev.filter((i) => i.id !== id));
  };

  const updateGelirStatus = (id: string, status: string) => {
    setGelirler((prev) => prev.map((g) => (g.id === id ? { ...g, status } : g)));
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

  const addGider = (item: Omit<Gider, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setGiderler((prev) => [newItem, ...prev]);
  };

  const deleteGider = (id: string) => {
    setGiderler((prev) => prev.filter((i) => i.id !== id));
  };

  const addTakvimPost = (item: Omit<TakvimPost, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setTakvimPosts((prev) => [newItem, ...prev]);
  };

  const deleteTakvimPost = (id: string) => {
    setTakvimPosts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTakvimPostStatus = (id: string, status: TakvimPost['status']) => {
    setTakvimPosts((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
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
