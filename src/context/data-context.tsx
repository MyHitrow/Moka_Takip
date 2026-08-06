'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

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
import { createUsersActions } from '@/hooks/use-users';

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
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  addIsletme: (item: Omit<Isletme, 'id'>) => void;
  updateIsletme: (id: string, updatedFields: Partial<Isletme>) => void;
  deleteIsletme: (id: string) => void;
  addCekim: (item: Omit<Cekim, 'id'>) => void;
  deleteCekim: (id: string) => void;
  updateCekimStatus: (id: string, status: string) => void;
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
  addTakvimPostsBulk: (items: Omit<TakvimPost, 'id'>[]) => Promise<void> | void;
  deleteTakvimPost: (id: string) => void;
  updateTakvimPostStatus: (id: string, status: TakvimPost['status']) => void;
  addEkipUyesi: (item: Omit<EkipUyesi, 'id' | 'initials'>) => void;
  deleteEkipUyesi: (id: string) => void;
  addSystemUser: (user: Omit<SystemUser, 'id'>) => Promise<{ success: boolean; message?: string }>;
  updateSystemUser: (id: string, updatedFields: Partial<SystemUser>) => Promise<{ success: boolean; message?: string }>;
  deleteSystemUser: (id: string) => Promise<void>;
  addHaftalikNot: (content: string, client?: string) => void;
  deleteHaftalikNot: (id: string) => void;
  formatDateTr: (dateStr: string) => string;
}

// ─── Varsayılan Kullanıcı ───────────────────────────────────────────────────

const defaultAdmin: SystemUser = {
  id: '1',
  username: 'admin',
  name: 'Moka Admin',
  role: 'super_admin',
  permissions: {
    canManageClients: true, canManageShoots: true, canManageEdits: true,
    canManageTakvim: true, canManageFinance: true, canManageReports: true,
    canManageTeam: true, canManageUsers: true,
  },
};

// ─── Context ────────────────────────────────────────────────────────────────

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  const [currentUser, setCurrentUser] = useState<SystemUser>(defaultAdmin);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([defaultAdmin]);
  const [haftalikNotlar, setHaftalikNotlar] = useState<HaftalikNot[]>([]);

  const [isletmeler, setIsletmeler] = useState<Isletme[]>([]);
  const [cekimler, setCekimler] = useState<Cekim[]>([]);
  const [editler, setEditler] = useState<EditItem[]>([]);
  const [gelirler, setGelirler] = useState<Gelir[]>([]);
  const [giderler, setGiderler] = useState<Gider[]>([]);
  const [takvimPosts, setTakvimPosts] = useState<TakvimPost[]>([]);
  const [ekip, setEkip] = useState<EkipUyesi[]>([]);

  const supabase = createClient();

  // ─── Cloud Sync (Sadece haftalikNotlar için) ──────────────────────────────

  const syncSettingsToCloud = async (
    updatedNotlar?: HaftalikNot[],
  ) => {
    try {
      const nextNotlar = updatedNotlar || haftalikNotlar;

      const payload = JSON.stringify({
        haftalikNotlar: nextNotlar,
      });

      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('name', '__SYSTEM_SETTINGS__')
        .maybeSingle();

      if (existing) {
        const { error: updErr } = await supabase.from('clients').update({ contact_name: payload, is_active: false }).eq('id', existing.id);
        if (updErr) logger.error('syncSettingsToCloud güncelleme hatası:', updErr.message);
      } else {
        const { error: insErr } = await supabase.from('clients').insert({ name: '__SYSTEM_SETTINGS__', contact_name: payload, is_active: false });
        if (insErr) logger.error('syncSettingsToCloud ekleme hatası:', insErr.message);
      }
    } catch (e) { logger.error('syncSettingsToCloud beklenmeyen hata:', e); }
  };

  const fetchCloudData = async () => {
    try {
      setIsCloudConnected(true);

      // Execute queries in parallel for high performance
      const [
        { data: sysRecord, error: sysErr },
        { data: clientsData, error: clientErr },
        { data: shootsData, error: shootErr },
        { data: editsData, error: editErr },
        { data: calData, error: calErr },
        { data: incomeData, error: incErr },
        { data: expData, error: expErr },
        { data: teamData, error: teamErr },
        { data: usersData, error: usersErr },
      ] = await Promise.all([
        supabase.from('clients').select('*').eq('name', '__SYSTEM_SETTINGS__').maybeSingle(),
        supabase.from('clients').select('*'),
        supabase.from('shoots').select('*'),
        supabase.from('edits').select('*'),
        supabase.from('content_calendar').select('*'),
        supabase.from('income_records').select('*'),
        supabase.from('expense_records').select('*'),
        supabase.from('team_members').select('*'),
        supabase.from('system_users').select('*'),
      ]);

      if (sysErr) logger.error('Sistem ayarları okuma hatası:', sysErr.message);
      if (clientErr) logger.error('İşletmeler okuma hatası:', clientErr.message);
      if (shootErr) logger.error('Çekimler okuma hatası:', shootErr.message);
      if (editErr) logger.error('Editler okuma hatası:', editErr.message);
      if (calErr) logger.error('Takvim okuma hatası:', calErr.message);
      if (incErr) logger.error('Gelirler okuma hatası:', incErr.message);
      if (expErr) logger.error('Giderler okuma hatası:', expErr.message);
      if (teamErr) logger.warn('Ekip tablosu okuma uyarısı:', teamErr.message);
      if (usersErr) logger.warn('Kullanıcılar tablosu okuma uyarısı:', usersErr.message);

      // 1. Sistem ayarları (sadece haftalikNotlar)
      if (sysRecord?.contact_name) {
        try {
          const parsed = JSON.parse(sysRecord.contact_name);
          if (parsed.haftalikNotlar && Array.isArray(parsed.haftalikNotlar)) {
            setHaftalikNotlar(parsed.haftalikNotlar);
          }
        } catch (e) {}
      }

      // 2. Sistem Kullanıcıları
      if (usersData && Array.isArray(usersData) && usersData.length > 0) {
        const mappedUsers: SystemUser[] = usersData.map((u) => ({
          id: u.id,
          username: u.username,
          password: u.password,
          name: u.name,
          role: u.role || 'admin',
          permissions: {
            canManageClients: true, canManageShoots: true, canManageEdits: true,
            canManageTakvim: true, canManageFinance: true, canManageReports: true,
            canManageTeam: true, canManageUsers: true,
          },
        }));
        setSystemUsers(mappedUsers);
      }

      // 3. Ekip — team_members tablosundan
      if (teamData && Array.isArray(teamData) && teamData.length > 0) {
        const mappedEkip: EkipUyesi[] = teamData.map((t) => ({
          id: t.id,
          name: t.name,
          role: t.role || 'Ekip Üyesi',
          phone: t.phone || '-',
          color: t.color || 'bg-purple-500',
          initials: t.initials || t.name.substring(0, 2).toUpperCase(),
        }));
        setEkip(mappedEkip);
      }

      // 4. İşletmeler
      let currentClientsList: Isletme[] = [];
      if (clientsData) {
        const realClients = clientsData.filter((c) => c.name !== '__SYSTEM_SETTINGS__');
        currentClientsList = realClients.map((c) => {
          let rawContact = (c.contact_name || '-').split('__AI_META__:')[0].trim();
          let rawNotes = (c.notes || c.ai_notes || '').split('__AI_META__:')[0].trim();
          let maxDays = 3;
          let reelsTarget = 10;
          let shootTarget = 2;

          if (c.contact_name && c.contact_name.includes('__AI_META__:')) {
            try {
              const meta = JSON.parse(c.contact_name.split('__AI_META__:')[1]);
              if (meta.maxDaysBetweenPosts) maxDays = Number(meta.maxDaysBetweenPosts);
              if (meta.monthlyReelsTarget) reelsTarget = Number(meta.monthlyReelsTarget);
              if (meta.monthlyShootTarget) shootTarget = Number(meta.monthlyShootTarget);
              if (meta.notes) rawNotes = meta.notes;
            } catch (e) {}
          }

          const rawFee = c.monthly_fee !== undefined && c.monthly_fee !== null ? c.monthly_fee : c.package_fee;
          const feeStr = rawFee ? `${rawFee} ₺` : '0 ₺';

          return {
            id: c.id,
            name: c.name?.trim() || 'İşletme',
            contact: rawContact || '-',
            phone: c.phone || '-',
            instagram: c.instagram || '-',
            fee: feeStr,
            active: c.is_active !== false,
            maxDaysBetweenPosts: maxDays,
            monthlyReelsTarget: reelsTarget,
            monthlyShootTarget: shootTarget,
            notes: rawNotes || '',
          };
        });
        setIsletmeler(currentClientsList);
      }

      // 5. Çekimler
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

      // 6. Editler
      if (editsData) {
        const cloudEdits: EditItem[] = editsData.map((e) => ({
          id: e.id,
          title: e.title,
          client: (e.client_name || 'İşletme').trim(),
          type: e.content_type_label || e.content_type || 'Reels',
          editor: e.editor_name || 'Atanmadı',
          deadline: e.deadline || new Date().toISOString().split('T')[0],
          status: e.status || 'editing',
        }));

        setEditler(cloudEdits);
      }

      // 7. Takvim
      if (calData) {
        const cloudPosts: TakvimPost[] = calData.map((t) => ({
          id: t.id,
          client: (t.client_name || 'İşletme').trim(),
          title: t.title || t.content_type || 'İçerik',
          platform: t.platform || 'Instagram Reels',
          date: t.publish_date || new Date().toISOString().split('T')[0],
          time: t.publish_time || '18:00',
          status: t.status || 'scheduled',
        }));

        setTakvimPosts((prev) => {
          if (cloudPosts.length === 0) return prev;
          const combined = [...cloudPosts];
          prev.forEach((p) => {
            if (!combined.some((c) => c.title === p.title && c.date === p.date && c.client === p.client)) {
              combined.push(p);
            }
          });
          return combined;
        });
      }

      // 8. Gelirler
      if (incomeData) {
        const { isClientMatch } = await import('@/lib/helpers');
        const mappedGelirler: Gelir[] = incomeData.map((g) => {
          const rawClient = (g.client_name || 'Müşteri').trim();
          const matchedBiz = currentClientsList.find((biz) => isClientMatch(biz.name, rawClient));
          const clientName = matchedBiz ? matchedBiz.name : rawClient;

          const numFee = matchedBiz ? (parseFloat(matchedBiz.fee.replace(/[^0-9.]/g, '')) || Number(g.amount)) : Number(g.amount);
          const finalAmount = g.collection_status !== 'paid' && numFee > 0 ? numFee : Number(g.amount);

          let paidAmt = g.paid_amount !== undefined && g.paid_amount !== null ? Number(g.paid_amount) : 0;
          if (g.collection_status === 'paid' && paidAmt === 0) {
            paidAmt = finalAmount;
          }

          return {
            id: g.id,
            client: clientName,
            description: g.description || `${clientName} - Aylık Paket Ücreti`,
            amount: finalAmount,
            paidAmount: paidAmt,
            date: g.due_date || new Date().toISOString().split('T')[0],
            status: g.collection_status || 'pending',
          };
        });
        setGelirler(mappedGelirler);
      }

      // 9. Giderler
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
      logger.error('fetchCloudData genel hatası:', err);
      setIsCloudConnected(false);
    }
  };

  // ─── Mount & Realtime ──────────────────────────────────────────────────────

  useEffect(() => {
    setIsMounted(true);
    fetchCloudData();

    // Check session user in localStorage
    try {
      const savedUser = localStorage.getItem('app_currentUser');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    } catch (e) {}

    // Realtime subscription
    const channel = supabase.channel('realtime-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchCloudData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shoots' }, () => fetchCloudData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'edits' }, () => fetchCloudData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_calendar' }, () => fetchCloudData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'income_records' }, () => fetchCloudData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_records' }, () => fetchCloudData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => fetchCloudData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_users' }, () => fetchCloudData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Auth (Supabase system_users doğrulama) ────────────────────────────────

  const login = async (usernameInput: string, passInput: string): Promise<boolean> => {
    const cleanUsername = usernameInput.trim().toLowerCase();
    
    // Direct Supabase query for clean & instant auth
    const { data: dbUser, error } = await supabase
      .from('system_users')
      .select('*')
      .eq('username', cleanUsername)
      .single();

    if (error || !dbUser) {
      logger.warn('Giriş başarısız: kullanıcı bulunamadı veya hata', error?.message);
      return false;
    }

    if (dbUser.password !== passInput) {
      logger.warn('Giriş başarısız: şifre hatalı');
      return false;
    }

    const sysUser: SystemUser = {
      id: dbUser.id,
      username: dbUser.username,
      name: dbUser.name,
      role: dbUser.role || 'admin',
      permissions: {
        canManageClients: true, canManageShoots: true, canManageEdits: true,
        canManageTakvim: true, canManageFinance: true, canManageReports: true,
        canManageTeam: true, canManageUsers: true,
      },
    };

    setCurrentUser(sysUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_currentUser', JSON.stringify(sysUser));
    }
    if (typeof document !== 'undefined') {
      document.cookie = 'app_session=true; path=/; max-age=2592000; SameSite=Lax';
    }

    return true;
  };

  const logout = () => {
    setCurrentUser(defaultAdmin);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_currentUser');
    }
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
    syncSettingsToCloud(updatedNotlar);
  };

  const deleteHaftalikNot = (id: string) => {
    const note = haftalikNotlar.find((n) => n.id === id);
    if (!note) return;
    const updatedNotlar = haftalikNotlar.filter((n) => n.id !== id);
    setHaftalikNotlar(updatedNotlar);
    syncSettingsToCloud(updatedNotlar);
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
    takvimPosts, setTakvimPosts, setEditler, supabase, fetchCloudData, syncSettingsToCloud,
  });

  const ekipActions = createEkipActions({
    ekip,
    setEkip,
    supabase,
    syncSettingsToCloud,
  });

  const usersActions = createUsersActions({
    systemUsers,
    setSystemUsers,
    supabase,
    fetchCloudData,
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
        ...usersActions,
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
