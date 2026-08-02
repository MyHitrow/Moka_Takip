import {
  LayoutDashboard,
  Building2,
  Camera,
  Film,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Bell,
  Settings,
  Home,
  DollarSign,
  Menu,
  Bot,
} from 'lucide-react';

// ============================================================
// Menü tanımları
// ============================================================

export const SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'AI Direktör', href: '/ai-direktor', icon: Bot },
  { label: 'İşletmeler', href: '/isletmeler', icon: Building2, permissionKey: 'canManageClients' },
  { label: 'Çekimler', href: '/cekimler', icon: Camera, permissionKey: 'canManageShoots' },
  { label: 'Editler', href: '/editler', icon: Film, permissionKey: 'canManageEdits' },
  { label: 'Paylaşım Takvimi', href: '/paylasim-takvimi', icon: CalendarDays, permissionKey: 'canManageTakvim' },
  { label: 'Gelirler', href: '/gelirler', icon: TrendingUp, permissionKey: 'canManageFinance' },
  { label: 'Giderler', href: '/giderler', icon: TrendingDown, permissionKey: 'canManageFinance' },
  { label: 'Raporlar', href: '/raporlar', icon: BarChart3, permissionKey: 'canManageReports' },
  { label: 'Ekip', href: '/ekip', icon: Users, permissionKey: 'canManageTeam' },
  { label: 'Bildirimler', href: '/bildirimler', icon: Bell },
  { label: 'Ayarlar', href: '/ayarlar', icon: Settings, permissionKey: 'canManageUsers' },
] as const;

export const BOTTOM_NAV_ITEMS = [
  { label: 'Ana Sayfa', href: '/', icon: Home },
  { label: 'Çekimler', href: '/cekimler', icon: Camera, permissionKey: 'canManageShoots' },
  { label: 'Editler', href: '/editler', icon: Film, permissionKey: 'canManageEdits' },
  { label: 'Finans', href: '/gelirler', icon: DollarSign, permissionKey: 'canManageFinance' },
  { label: 'Menü', href: '#menu', icon: Menu },
] as const;

// ============================================================
// Durum etiketleri (Türkçe)
// ============================================================

export const SHOOT_STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  planned: 'Planlandı',
  ready: 'Çekime Hazır',
  shot: 'Çekildi',
  files_transferred: 'Dosyalar Aktarıldı',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
};

export const EDIT_STATUS_LABELS: Record<string, string> = {
  waiting: 'Kurgu Bekliyor',
  assigned: 'Editöre Atandı',
  editing: 'Kurguda',
  internal_review: 'İç Kontrolde',
  client_review: 'Müşteri Onayında',
  revision: 'Revizede',
  ready: 'Yayına Hazır',
  scheduled: 'Planlandı',
  published: 'Paylaşıldı',
};

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  reels: 'Reels',
  post: 'Post',
  story: 'Story',
  youtube: 'YouTube',
  ad_video: 'Reklam Videosu',
  corporate_video: 'Kurumsal Video',
  other: 'Diğer',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  urgent: 'Acil',
};

export const PUBLISH_STATUS_LABELS: Record<string, string> = {
  preparing: 'Hazırlanıyor',
  pending_approval: 'Onay Bekliyor',
  ready: 'Paylaşıma Hazır',
  scheduled: 'Planlandı',
  published: 'Paylaşıldı',
  cancelled: 'İptal Edildi',
};

export const COLLECTION_STATUS_LABELS: Record<string, string> = {
  pending: 'Bekliyor',
  partial: 'Kısmi Ödendi',
  paid: 'Ödendi',
  overdue: 'Gecikti',
  cancelled: 'İptal Edildi',
};

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  personnel: 'Personel',
  transportation: 'Ulaşım',
  food: 'Yemek',
  equipment: 'Ekipman',
  software: 'Yazılım',
  advertising: 'Reklam',
  office: 'Ofis',
  tax: 'Vergi',
  freelance: 'Freelance Hizmet',
  other: 'Diğer',
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Yönetici',
  editor: 'Editör',
  accountant: 'Muhasebe',
  member: 'Ekip Üyesi',
};

// ============================================================
// Durum renkleri (Tailwind sınıfları)
// ============================================================

export const SHOOT_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-500/15 text-zinc-400',
  planned: 'bg-blue-500/15 text-blue-400',
  ready: 'bg-cyan-500/15 text-cyan-400',
  shot: 'bg-violet-500/15 text-violet-400',
  files_transferred: 'bg-amber-500/15 text-amber-400',
  completed: 'bg-emerald-500/15 text-emerald-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

export const EDIT_STATUS_COLORS: Record<string, string> = {
  waiting: 'bg-zinc-500/15 text-zinc-400',
  assigned: 'bg-blue-500/15 text-blue-400',
  editing: 'bg-violet-500/15 text-violet-400',
  internal_review: 'bg-amber-500/15 text-amber-400',
  client_review: 'bg-cyan-500/15 text-cyan-400',
  revision: 'bg-orange-500/15 text-orange-400',
  ready: 'bg-emerald-500/15 text-emerald-400',
  scheduled: 'bg-indigo-500/15 text-indigo-400',
  published: 'bg-green-500/15 text-green-400',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-zinc-500/15 text-zinc-400',
  medium: 'bg-blue-500/15 text-blue-400',
  high: 'bg-amber-500/15 text-amber-400',
  urgent: 'bg-red-500/15 text-red-400',
};

export const COLLECTION_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  partial: 'bg-blue-500/15 text-blue-400',
  paid: 'bg-emerald-500/15 text-emerald-400',
  overdue: 'bg-red-500/15 text-red-400',
  cancelled: 'bg-zinc-500/15 text-zinc-400',
};
