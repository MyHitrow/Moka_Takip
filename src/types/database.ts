// ============================================================
// Veritabanı tablo tipleri — Supabase şemasına karşılık gelir
// ============================================================

// Kullanıcı rolleri
export type UserRole = 'admin' | 'editor' | 'accountant' | 'member';

// Çekim durumları
export type ShootStatus =
  | 'draft'
  | 'planned'
  | 'ready'
  | 'shot'
  | 'files_transferred'
  | 'completed'
  | 'cancelled';

// Edit durumları
export type EditStatus =
  | 'waiting'
  | 'assigned'
  | 'editing'
  | 'internal_review'
  | 'client_review'
  | 'revision'
  | 'ready'
  | 'scheduled'
  | 'published';

// İçerik türleri
export type ContentType =
  | 'reels'
  | 'post'
  | 'story'
  | 'youtube'
  | 'ad_video'
  | 'corporate_video'
  | 'other';

// Öncelik
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Paylaşım durumları
export type PublishStatus =
  | 'preparing'
  | 'pending_approval'
  | 'ready'
  | 'scheduled'
  | 'published'
  | 'cancelled';

// Tahsilat durumları
export type CollectionStatus =
  | 'pending'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled';

// Gider kategorileri
export type ExpenseCategory =
  | 'personnel'
  | 'transportation'
  | 'food'
  | 'equipment'
  | 'software'
  | 'advertising'
  | 'office'
  | 'tax'
  | 'freelance'
  | 'other';

// ============================================================
// Tablo arayüzleri
// ============================================================

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  logo_url: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  instagram: string | null;
  social_links: Record<string, string>;
  monthly_fee: number;
  payment_day: number | null;
  monthly_shoots: number;
  monthly_reels: number;
  monthly_posts: number;
  monthly_stories: number;
  contract_start: string | null;
  contract_end: string | null;
  drive_link: string | null;
  notes: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Shoot {
  id: string;
  client_id: string;
  title: string;
  shoot_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  shoot_type: string | null;
  equipment: string[];
  content_list: string | null;
  reference_links: string[];
  description: string | null;
  drive_link: string | null;
  status: ShootStatus;
  reminder_date: string | null;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // İlişkisel veriler (join ile gelebilir)
  client?: Client;
  members?: ShootMember[];
}

export interface ShootMember {
  id: string;
  shoot_id: string;
  user_id: string;
  created_at: string;
  // İlişkisel
  profile?: Profile;
}

export interface Edit {
  id: string;
  client_id: string;
  shoot_id: string | null;
  title: string;
  content_type: ContentType;
  assigned_to: string | null;
  priority: Priority;
  deadline: string | null;
  raw_footage_link: string | null;
  preview_link: string | null;
  revision_count: number;
  caption: string | null;
  hashtags: string | null;
  publish_date: string | null;
  published_link: string | null;
  status: EditStatus;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // İlişkisel
  client?: Client;
  shoot?: Shoot;
  editor?: Profile;
  comments?: EditComment[];
}

export interface EditComment {
  id: string;
  edit_id: string;
  user_id: string;
  comment: string;
  is_revision: boolean;
  is_deleted: boolean;
  created_at: string;
  // İlişkisel
  user?: Profile;
}

export interface ContentCalendarItem {
  id: string;
  client_id: string;
  edit_id: string | null;
  platform: string;
  content_type: string;
  publish_date: string;
  publish_time: string | null;
  caption: string | null;
  hashtags: string | null;
  file_link: string | null;
  status: PublishStatus;
  published_link: string | null;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // İlişkisel
  client?: Client;
  edit?: Edit;
}

export interface IncomeRecord {
  id: string;
  client_id: string;
  description: string;
  amount: number;
  due_date: string | null;
  payment_date: string | null;
  payment_method: string | null;
  collection_status: CollectionStatus;
  invoice_status: string | null;
  receipt_url: string | null;
  notes: string | null;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // İlişkisel
  client?: Client;
}

export interface ExpenseRecord {
  id: string;
  category: ExpenseCategory;
  client_id: string | null;
  shoot_id: string | null;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: string | null;
  receipt_url: string | null;
  paid_by: string | null;
  notes: string | null;
  is_deleted: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // İlişkisel
  client?: Client;
  shoot?: Shoot;
  payer?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  // İlişkisel
  user?: Profile;
}

export interface Attachment {
  id: string;
  entity_type: string;
  entity_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
}
