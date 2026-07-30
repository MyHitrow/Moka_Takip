-- Migration: 001_initial_schema.sql

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- Helper Functions
-- ==========================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- Tables
-- ==========================================

-- 1. profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'editor', 'accountant', 'member')),
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. clients
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    instagram TEXT,
    social_links JSONB DEFAULT '{}',
    monthly_fee NUMERIC(12,2) DEFAULT 0,
    payment_day INTEGER CHECK (payment_day >= 1 AND payment_day <= 31),
    monthly_shoots INTEGER DEFAULT 0,
    monthly_reels INTEGER DEFAULT 0,
    monthly_posts INTEGER DEFAULT 0,
    monthly_stories INTEGER DEFAULT 0,
    contract_start DATE,
    contract_end DATE,
    drive_link TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. shoots
CREATE TABLE public.shoots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    shoot_date DATE,
    start_time TIME,
    end_time TIME,
    location TEXT,
    shoot_type TEXT,
    equipment TEXT[] DEFAULT '{}',
    content_list TEXT,
    reference_links TEXT[] DEFAULT '{}',
    description TEXT,
    drive_link TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'planned', 'ready', 'shot', 'files_transferred', 'completed', 'cancelled')),
    reminder_date TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. shoot_members
CREATE TABLE public.shoot_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shoot_id UUID NOT NULL REFERENCES public.shoots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shoot_id, user_id)
);

-- 5. edits
CREATE TABLE public.edits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    shoot_id UUID REFERENCES public.shoots(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('reels', 'post', 'story', 'youtube', 'ad_video', 'corporate_video', 'other')),
    assigned_to UUID REFERENCES public.profiles(id),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    deadline DATE,
    raw_footage_link TEXT,
    preview_link TEXT,
    revision_count INTEGER DEFAULT 0,
    caption TEXT,
    hashtags TEXT,
    publish_date DATE,
    published_link TEXT,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'assigned', 'editing', 'internal_review', 'client_review', 'revision', 'ready', 'scheduled', 'published')),
    is_deleted BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. edit_comments
CREATE TABLE public.edit_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edit_id UUID NOT NULL REFERENCES public.edits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_revision BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. content_calendar
CREATE TABLE public.content_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    edit_id UUID REFERENCES public.edits(id) ON DELETE SET NULL,
    platform TEXT NOT NULL,
    content_type TEXT NOT NULL,
    publish_date DATE NOT NULL,
    publish_time TIME,
    caption TEXT,
    hashtags TEXT,
    file_link TEXT,
    status TEXT DEFAULT 'preparing' CHECK (status IN ('preparing', 'pending_approval', 'ready', 'scheduled', 'published', 'cancelled')),
    published_link TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. income_records
CREATE TABLE public.income_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    due_date DATE,
    payment_date DATE,
    payment_method TEXT,
    collection_status TEXT DEFAULT 'pending' CHECK (collection_status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
    invoice_status TEXT DEFAULT 'pending',
    receipt_url TEXT,
    notes TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. expense_records
CREATE TABLE public.expense_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('personnel', 'transportation', 'food', 'equipment', 'software', 'advertising', 'office', 'tax', 'freelance', 'other')),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    shoot_id UUID REFERENCES public.shoots(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method TEXT,
    receipt_url TEXT,
    paid_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. activity_logs
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. attachments
CREATE TABLE public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Indexes
-- ==========================================
CREATE INDEX idx_clients_is_deleted_active_created_by ON public.clients(is_deleted, is_active, created_by);
CREATE INDEX idx_shoots_client_date_status_deleted ON public.shoots(client_id, shoot_date, status, is_deleted);
CREATE INDEX idx_edits_client_assigned_status_deadline_deleted ON public.edits(client_id, assigned_to, status, deadline, is_deleted);
CREATE INDEX idx_edit_comments_edit_id ON public.edit_comments(edit_id);
CREATE INDEX idx_content_calendar_client_date_status_deleted ON public.content_calendar(client_id, publish_date, status, is_deleted);
CREATE INDEX idx_income_records_client_status_due_deleted ON public.income_records(client_id, collection_status, due_date, is_deleted);
CREATE INDEX idx_expense_records_client_category_date_deleted ON public.expense_records(client_id, category, expense_date, is_deleted);
CREATE INDEX idx_notifications_user_is_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_activity_logs_user_entity ON public.activity_logs(user_id, entity_type, entity_id);
CREATE INDEX idx_attachments_entity ON public.attachments(entity_type, entity_id);

-- ==========================================
-- Triggers (updated_at)
-- ==========================================
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shoots_updated_at BEFORE UPDATE ON public.shoots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_edits_updated_at BEFORE UPDATE ON public.edits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_calendar_updated_at BEFORE UPDATE ON public.content_calendar FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_income_records_updated_at BEFORE UPDATE ON public.income_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expense_records_updated_at BEFORE UPDATE ON public.expense_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- Auth Trigger
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- RLS Policies
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shoots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shoot_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert their own profile via trigger" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile or admin can update all" ON public.profiles FOR UPDATE USING (auth.uid() = id OR get_user_role() = 'admin');

-- clients
CREATE POLICY "Clients are viewable by everyone if not deleted" ON public.clients FOR SELECT USING (auth.role() = 'authenticated' AND is_deleted = false);
CREATE POLICY "Only admins can insert clients" ON public.clients FOR INSERT WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "Only admins can update clients" ON public.clients FOR UPDATE USING (get_user_role() = 'admin');
CREATE POLICY "Only admins can delete clients" ON public.clients FOR DELETE USING (get_user_role() = 'admin');

-- shoots
CREATE POLICY "Admins/accountants see all shoots, editors/members see assigned" ON public.shoots FOR SELECT USING (
  is_deleted = false AND (
    get_user_role() IN ('admin', 'accountant') OR
    EXISTS (SELECT 1 FROM public.shoot_members WHERE shoot_id = id AND user_id = auth.uid())
  )
);
CREATE POLICY "Only admins can insert shoots" ON public.shoots FOR INSERT WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "Only admins can update shoots" ON public.shoots FOR UPDATE USING (get_user_role() = 'admin');

-- shoot_members
CREATE POLICY "Shoot members viewable by all authenticated" ON public.shoot_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can insert shoot_members" ON public.shoot_members FOR INSERT WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "Only admins can update shoot_members" ON public.shoot_members FOR UPDATE USING (get_user_role() = 'admin');
CREATE POLICY "Only admins can delete shoot_members" ON public.shoot_members FOR DELETE USING (get_user_role() = 'admin');

-- edits
CREATE POLICY "Admins/accountants see all edits, editors see assigned" ON public.edits FOR SELECT USING (
  is_deleted = false AND (
    get_user_role() IN ('admin', 'accountant') OR
    assigned_to = auth.uid()
  )
);
CREATE POLICY "Only admins can insert edits" ON public.edits FOR INSERT WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "Admins or assigned editor can update edits" ON public.edits FOR UPDATE USING (
  get_user_role() = 'admin' OR assigned_to = auth.uid()
);

-- edit_comments
CREATE POLICY "Edit comments viewable by all authenticated" ON public.edit_comments FOR SELECT USING (auth.role() = 'authenticated' AND is_deleted = false);
CREATE POLICY "Authenticated users can insert edit comments" ON public.edit_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments or admin" ON public.edit_comments FOR UPDATE USING (user_id = auth.uid() OR get_user_role() = 'admin');
CREATE POLICY "Users can delete own comments or admin" ON public.edit_comments FOR DELETE USING (user_id = auth.uid() OR get_user_role() = 'admin');

-- content_calendar
CREATE POLICY "Content calendar viewable by all authenticated" ON public.content_calendar FOR SELECT USING (auth.role() = 'authenticated' AND is_deleted = false);
CREATE POLICY "Only admins can insert content_calendar" ON public.content_calendar FOR INSERT WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "Only admins can update content_calendar" ON public.content_calendar FOR UPDATE USING (get_user_role() = 'admin');
CREATE POLICY "Only admins can delete content_calendar" ON public.content_calendar FOR DELETE USING (get_user_role() = 'admin');

-- income_records
CREATE POLICY "Admins/accountants can view income" ON public.income_records FOR SELECT USING (is_deleted = false AND get_user_role() IN ('admin', 'accountant'));
CREATE POLICY "Admins/accountants can insert income" ON public.income_records FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'accountant'));
CREATE POLICY "Admins/accountants can update income" ON public.income_records FOR UPDATE USING (get_user_role() IN ('admin', 'accountant'));
CREATE POLICY "Admins/accountants can delete income" ON public.income_records FOR DELETE USING (get_user_role() IN ('admin', 'accountant'));

-- expense_records
CREATE POLICY "Admins/accountants can view expenses" ON public.expense_records FOR SELECT USING (is_deleted = false AND get_user_role() IN ('admin', 'accountant'));
CREATE POLICY "Admins/accountants can insert expenses" ON public.expense_records FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'accountant'));
CREATE POLICY "Admins/accountants can update expenses" ON public.expense_records FOR UPDATE USING (get_user_role() IN ('admin', 'accountant'));
CREATE POLICY "Admins/accountants can delete expenses" ON public.expense_records FOR DELETE USING (get_user_role() IN ('admin', 'accountant'));

-- notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Server or authenticated can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Only admins can delete notifications" ON public.notifications FOR DELETE USING (get_user_role() = 'admin');

-- activity_logs
CREATE POLICY "Only admins can view activity_logs" ON public.activity_logs FOR SELECT USING (get_user_role() = 'admin');
CREATE POLICY "Authenticated users can insert activity_logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- attachments
CREATE POLICY "Attachments viewable by all authenticated" ON public.attachments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert attachments" ON public.attachments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Uploader or admin can delete attachments" ON public.attachments FOR DELETE USING (uploaded_by = auth.uid() OR get_user_role() = 'admin');
