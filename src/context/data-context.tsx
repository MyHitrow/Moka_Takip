'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Tip tanımları
export type {
  Isletme, Cekim, EditItem, Gelir, Gider,
  TakvimPost, EkipUyesi, UserPermissions, RoleType,
  SystemUser, HaftalikNot,
} from '@/types/app';

import type {
  Isletme, Cekim, EditItem, Gelir, Gider,
  TakvimPost, EkipUyesi, SystemUser, HaftalikNot,
} from '@/types/app';

// Yardımcı fonksiyonlar — re-export (geriye uyumluluk için)
export { formatDateTr, formatRoleLabel, normalizeClientName, isClientMatch } from '@/lib/helpers';
import { formatDateTr } from '@/lib/helpers';

// Modül action factory'leri
import { createIsletmelerActions } from '@/hooks/use-isletmeler';
import { createCekimlerActions } from '@/hooks/use-cekimler';
import { createEditlerActions } from '@/hooks/use-editler';
import { createFinansActions } from '@/hooks/use-finans';
import { createTakvimActions } from '@/hooks/use-takvim';
import { createEkipActions } from '@/hooks/use-ekip';

// ─── Context Tipi ───────────────────────────────────────────────────────────

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
  addHaftalikNot: (content: string, client?: string) => void;
  deleteHaftalikNot: (id: string) => void;
  formatDateTr: (dateStr: string) => string;
}

// ─── Varsayılan Kullanıcılar ────────────────────────────────────────────────

const defaultSuperAdmin: SystemUser = {
  id: '1',
  username: 'kadorizator',
  name: 'Kadir (Süper Admin)',
  role: 'super_admin',
  permissions: {
    canManageFinance: true, canManageShoots: true, canManageEdits: true,
    canManageTakvim: true, canManageTeam: true, canManageUsers: true,
  },
};

const initialSystemUsers: SystemUser[] = [
  defaultSuperAdmin,
  {
    id: '2',
    username: 'admin',
    name: 'Ajans Yöneticisi',
    role: 'admin',
    permissions: {
      canManageFinance: true, canManageShoots: true, canManageEdits: true,
      canManageTakvim: true, canManageTeam: false, canManageUsers: false,
    },
  },
];

const initialEkip: EkipUyesi[] = [
  { id: '1', name: 'Kadir (Süper Admin)', initials: 'KS', color: 'bg-purple-500', role: 'Süper Admin', phone: '0555 000 0000', username: 'kadorizator' },
];

// ─── Context ────────────────────────────────────────────────────────────────

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

  // ─── Cloud Sync ────────────────────────────────────────────────────────────

  const syncSettingsToCloud = async (
    updatedUsers?: SystemUser[],
    updatedEkip?: EkipUyesi[],
    updatedNotlar?: HaftalikNot[]
  ) => {
    try {
      const payload = JSON.stringify({
        systemUsers: updatedUsers || systemUsers,
        ekip: updatedEkip || ekip,
        haftalikNotlar: updatedNotlar || haftalikNotlar,
      });
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('name', '__SYSTEM_SETTINGS__')
        .maybeSingle();

      if (existing) {
        await supabase.from('clients').update({ contact_name: payload }).eq('id', existing.id);
      } else {
        await supabase.from('clients').insert({ name: '__SYSTEM_SETTINGS__', contact_name: payload, is_active: false });
      }
    } catch (e) {}
  };

  const fetchCloudData = async () => {
    try {
      setIsCloudConnected(true);

      // 1. Sistem ayarları (kullanıcılar, ekip, notlar)
      const { data: sysRecord, error: sysErr } = await supabase
        .from('clients').select('*').eq('name', '__SYSTEM_SETTINGS__').maybeSingle();

      if (sysErr) {
        console.error('Sistem ayarları okuma hatası:', sysErr.message);
      }

      if (sysRecord?.contact_name) {
        try {
          const parsed = JSON.parse(sysRecord.contact_name);
          if (parsed.systemUsers && Array.isArray(parsed.systemUsers) && parsed.systemUsers.length > 0) {
            let loadedUsers: SystemUser[] = parsed.systemUsers;
            // Güvenlik & Kilitlenme Koruması: Listede hiç süper admin kalmadıysa otomatik olarak ilk kullanıcıyı veya varsayılan kullanıcıyı süper admin yap!
            const hasSuperAdmin = loadedUsers.some((u) => u.role === 'super_admin');
            if (!hasSuperAdmin) {
              loadedUsers[0].role = 'super_admin';
              loadedUsers[0].permissions = {
                canManageFinance: true, canManageShoots: true, canManageEdits: true,
                canManageTakvim: true, canManageTeam: true, canManageUsers: true,
              };
            }
            setSystemUsers(loadedUsers);

            // Aktif oturum açmış kullanıcı varsa rolünü güncel tut
            setCurrentUser((prev) => {
              const matched = loadedUsers.find((u) => u.username.toLowerCase() === prev.username.toLowerCase() || u.id === prev.id);
              return matched || loadedUsers[0];
            });
          }
          if (parsed.ekip && Array.isArray(parsed.ekip)) setEkip(parsed.ekip);
          if (parsed.haftalikNotlar && Array.isArray(parsed.haftalikNotlar)) setHaftalikNotlar(parsed.haftalikNotlar);
        } catch (e) {}
      }

      // 2. İşletmeler (clients)
      let currentClientsList: Isletme[] = [];
      const { data: clientsData, error: clientErr } = await supabase.from('clients').select('*');
      if (clientErr) {
        console.error('İşletmeler okuma hatası:', clientErr.message);
      }
      if (clientsData) {
        const realClients = clientsData.filter((c) => c.name !== '__SYSTEM_SETTINGS__');
        currentClientsList = realClients.map((c) => ({
          id: c.id,
          name: c.name.trim(),
          contact: c.contact_name || '-',
          phone: c.phone || '-',
          instagram: c.instagram || '@-',
          fee: c.monthly_fee ? `${c.monthly_fee} ₺` : '0 ₺',
          active: c.is_active ?? true,
          maxDaysBetweenPosts: c.max_days_between_posts || 3,
          monthlyReelsTarget: c.monthly_reels_target || 10,
          monthlyShootTarget: c.monthly_shoot_target || 2,
        }));
        setIsletmeler(currentClientsList);
      }

      // 3. Çekimler
      const { data: shootsData, error: shootErr } = await supabase.from('shoots').select('*');
      if (shootErr) console.error('Çekimler okuma hatası:', shootErr.message);
      if (shootsData) {
        setCekimler(shootsData.map((s) => ({
          id: s.id,
          client: (s.client_name || s.client_id || 'İşletme').toString().trim(),
          title: s.title,
          date: s.shoot_date || new Date().toISOString().split('T')[0],
          time: s.start_time || '10:00',
          location: s.location || 'Stüdyo',
          status: s.status || 'planned',
        })));
      }

      // 4. Editler
      const { data: editsData, error: editErr } = await supabase.from('edits').select('*');
      if (editErr) console.error('Editler okuma hatası:', editErr.message);
      if (editsData) {
        setEditler(editsData.map((e) => ({
          id: e.id,
          title: e.title,
          client: (e.client_name || 'İşletme').trim(),
          type: e.content_type_label || e.content_type || 'Reels',
          editor: e.editor_name || 'Atanmadı',
          deadline: e.deadline || new Date().toISOString().split('T')[0],
          status: e.status || 'waiting',
        })));
      }

      // 5. Takvim
      const { data: calData, error: calErr } = await supabase.from('content_calendar').select('*');
      if (calErr) console.error('Takvim okuma hatası:', calErr.message);
      if (calData) {
        setTakvimPosts(calData.map((t) => ({
          id: t.id,
          client: (t.client_name || 'İşletme').trim(),
          title: t.title || t.content_type || 'İçerik',
          platform: t.platform || 'Instagram Reels',
          date: t.publish_date || new Date().toISOString().split('T')[0],
          time: t.publish_time || '18:00',
          status: t.status || 'scheduled',
        })));
      }

      // 6. Gelirler (orphan temizliği dahil)
      const { data: incomeData, error: incErr } = await supabase.from('income_records').select('*');
      if (incErr) console.error('Gelirler okuma hatası:', incErr.message);
      if (incomeData) {
        const { isClientMatch } = await import('@/lib/helpers');
        const mappedGelirler: Gelir[] = [];
        for (const g of incomeData) {
          const rawClient = (g.client_name || 'Müşteri').trim();
          const matchedBiz = currentClientsList.find((biz) => isClientMatch(biz.name, rawClient));
          if (!matchedBiz) {
            supabase.from('income_records').delete().eq('id', g.id).then(() => {});
            continue;
          }
          const clientName = matchedBiz.name;
          const numFee = parseFloat(matchedBiz.fee.replace(/[^0-9.]/g, '')) || Number(g.amount);
          const finalAmount = g.collection_status !== 'paid' && numFee > 0 ? numFee : Number(g.amount);

          let paidAmt = g.paid_amount !== undefined && g.paid_amount !== null ? Number(g.paid_amount) : 0;
          if (g.collection_status === 'paid' && paidAmt === 0) {
            paidAmt = finalAmount;
          } else if (g.collection_status === 'partial' && paidAmt === 0) {
            const match = g.description ? g.description.match(/(?:Kısmi Ödenen:\s*|kısmi:\s*)(\d+)/i) : null;
            if (match) paidAmt = parseFloat(match[1]) || 0;
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

      // 7. Giderler
      const { data: expData, error: expErr } = await supabase.from('expense_records').select('*');
      if (expErr) console.error('Giderler okuma hatası:', expErr.message);
      if (expData) {
        setGiderler(expData.map((e) => ({
          id: e.id,
          title: e.title || e.description || 'Gider',
          category: e.category || 'office',
          amount: Number(e.amount),
          date: e.expense_date || new Date().toISOString().split('T')[0],
          paidBy: e.paid_by_text || e.paid_by || 'Şirket Hesabı',
        })));
      }
    } catch (err) {
      console.error('fetchCloudData genel hatası:', err);
      setIsCloudConnected(false);
    }
  };

  // ─── Mount & Realtime ──────────────────────────────────────────────────────

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedUser = localStorage.getItem('app_currentUser');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    } catch (e) {}

    fetchCloudData();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => { fetchCloudData(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem('app_currentUser', JSON.stringify(currentUser));
  }, [currentUser, isMounted]);

  // ─── Auth ──────────────────────────────────────────────────────────────────

  const login = (usernameInput: string, passInput: string): boolean => {
    const user = systemUsers.find(
      (u) => u.username.toLowerCase() === usernameInput.trim().toLowerCase() && u.password === passInput
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

  // ─── Haftalık Notlar ───────────────────────────────────────────────────────

  const addHaftalikNot = (content: string, client?: string) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newNot: HaftalikNot = {
      id: Date.now().toString(),
      content,
      client: client || undefined,
      authorUsername: currentUser.username,
      authorName: currentUser.name,
      date: todayStr,
      createdAt: timeStr,
    };
    const updatedNotlar = [newNot, ...haftalikNotlar];
    setHaftalikNotlar(updatedNotlar);
    syncSettingsToCloud(undefined, undefined, updatedNotlar);
  };

  const deleteHaftalikNot = (id: string) => {
    const note = haftalikNotlar.find((n) => n.id === id);
    if (!note) return;
    if (currentUser.role === 'super_admin' || note.authorUsername === currentUser.username) {
      const updatedNotlar = haftalikNotlar.filter((n) => n.id !== id);
      setHaftalikNotlar(updatedNotlar);
      syncSettingsToCloud(undefined, undefined, updatedNotlar);
    }
  };

  // ─── Modül Action'ları ─────────────────────────────────────────────────────

  const isletmelerActions = createIsletmelerActions({
    isletmeler, gelirler, cekimler, editler, takvimPosts,
    setIsletmeler, setGelirler, setCekimler, setEditler, setTakvimPosts,
    supabase, fetchCloudData,
  });

  const cekimlerActions = createCekimlerActions({
    cekimler, setCekimler, supabase, fetchCloudData,
  });

  const editlerActions = createEditlerActions({
    editler, setEditler, supabase, fetchCloudData,
  });

  const finansActions = createFinansActions({
    gelirler, giderler, isletmeler,
    setGelirler, setGiderler, supabase, fetchCloudData,
  });

  const takvimActions = createTakvimActions({
    takvimPosts, setTakvimPosts, supabase, fetchCloudData,
  });

  const ekipActions = createEkipActions({
    ekip, systemUsers, currentUser,
    setEkip, setSystemUsers, setCurrentUser,
    supabase, syncSettingsToCloud,
  });

  // ─── Provider ──────────────────────────────────────────────────────────────

  return (
    <DataContext.Provider
      value={{
        isletmeler, cekimler, editler, gelirler, giderler,
        takvimPosts, ekip, systemUsers, currentUser, haftalikNotlar,
        isCloudConnected,
        login, logout,
        ...isletmelerActions,
        ...cekimlerActions,
        ...editlerActions,
        ...finansActions,
        ...takvimActions,
        ...ekipActions,
        addHaftalikNot, deleteHaftalikNot,
        formatDateTr,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}
