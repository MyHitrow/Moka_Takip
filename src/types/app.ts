// Tüm uygulama tip tanımları — merkezi types dosyası

export interface Isletme {
  id: string;
  name: string;
  contact: string;
  phone: string;
  instagram: string;
  fee: string;
  active: boolean;
  maxDaysBetweenPosts?: number; // e.g. 3 days between posts (AI training parameter)
  monthlyReelsTarget?: number; // e.g. 10 Reels/month
  monthlyPostTarget?: number;  // e.g. 4 Posts/month
  monthlyShootTarget?: number; // e.g. 2 Shoots/month
  notes?: string;              // 🧠 AI Hafıza & Kritik İşletme Notları
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
  canManageClients: boolean;
  canManageShoots: boolean;
  canManageEdits: boolean;
  canManageTakvim: boolean;
  canManageFinance: boolean;
  canManageReports: boolean;
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
  password?: string; // Sadece local auth için, kaynak kodda açık saklanmaz
  name: string;
  role: RoleType;
  permissions: UserPermissions;
}

export interface HaftalikNot {
  id: string;
  content: string;
  client?: string;
  authorUsername: string;
  authorName: string;
  date: string;
  createdAt: string;
}
