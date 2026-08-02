-- Migration: 005_fix_security_and_rls.sql
-- Amaç: 003 migration'ındaki "FOR ALL USING (true)" anonim açık erişim politikalarını kaldır ve 
-- veritabanını sadece kimliği doğrulanmış (authenticated) kullanıcılara güvenli hale getir.

-- ==========================================
-- 1. 003 Migration ile açılan gevşek politikaları kaldır
-- ==========================================
DROP POLICY IF EXISTS "Anon & Authenticated full access on clients" ON public.clients;
DROP POLICY IF EXISTS "Anon & Authenticated full access on shoots" ON public.shoots;
DROP POLICY IF EXISTS "Anon & Authenticated full access on edits" ON public.edits;
DROP POLICY IF EXISTS "Anon & Authenticated full access on content_calendar" ON public.content_calendar;
DROP POLICY IF EXISTS "Anon & Authenticated full access on income_records" ON public.income_records;
DROP POLICY IF EXISTS "Anon & Authenticated full access on expense_records" ON public.expense_records;
DROP POLICY IF EXISTS "Anon & Authenticated full access on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anon & Authenticated full access on activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Anon & Authenticated full access on attachments" ON public.attachments;

-- Eski varsayılan kısıtlayıcı politikaları da temizle (çakışmaları önlemek için)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile via trigger" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admin can update all" ON public.profiles;

DROP POLICY IF EXISTS "Clients are viewable by everyone if not deleted" ON public.clients;
DROP POLICY IF EXISTS "Only admins can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Only admins can update clients" ON public.clients;
DROP POLICY IF EXISTS "Only admins can delete clients" ON public.clients;

DROP POLICY IF EXISTS "Admins/accountants see all shoots, editors/members see assigned" ON public.shoots;
DROP POLICY IF EXISTS "Only admins can insert shoots" ON public.shoots;
DROP POLICY IF EXISTS "Only admins can update shoots" ON public.shoots;

DROP POLICY IF EXISTS "Admins/accountants see all edits, editors see assigned" ON public.edits;
DROP POLICY IF EXISTS "Only admins can insert edits" ON public.edits;
DROP POLICY IF EXISTS "Admins or assigned editor can update edits" ON public.edits;

DROP POLICY IF EXISTS "Content calendar viewable by all authenticated" ON public.content_calendar;
DROP POLICY IF EXISTS "Only admins can insert content_calendar" ON public.content_calendar;
DROP POLICY IF EXISTS "Only admins can update content_calendar" ON public.content_calendar;
DROP POLICY IF EXISTS "Only admins can delete content_calendar" ON public.content_calendar;

DROP POLICY IF EXISTS "Admins/accountants can view income" ON public.income_records;
DROP POLICY IF EXISTS "Admins/accountants can insert income" ON public.income_records;
DROP POLICY IF EXISTS "Admins/accountants can update income" ON public.income_records;
DROP POLICY IF EXISTS "Admins/accountants can delete income" ON public.income_records;

DROP POLICY IF EXISTS "Admins/accountants can view expenses" ON public.expense_records;
DROP POLICY IF EXISTS "Admins/accountants can insert expenses" ON public.expense_records;
DROP POLICY IF EXISTS "Admins/accountants can update expenses" ON public.expense_records;
DROP POLICY IF EXISTS "Admins/accountants can delete expenses" ON public.expense_records;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Server or authenticated can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Only admins can delete notifications" ON public.notifications;

DROP POLICY IF EXISTS "Only admins can view activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Authenticated users can insert activity_logs" ON public.activity_logs;

DROP POLICY IF EXISTS "Attachments viewable by all authenticated" ON public.attachments;
DROP POLICY IF EXISTS "Authenticated users can insert attachments" ON public.attachments;
DROP POLICY IF EXISTS "Uploader or admin can delete attachments" ON public.attachments;

-- ==========================================
-- 2. Güvenli get_user_role() fonksiyonu
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(user_role, 'member');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. RLS Aktifleştirme ve Sıkı Politika Tanımları
-- ==========================================
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

-- ------------------------------------------
-- PROFILES Tablosu
-- ------------------------------------------
CREATE POLICY "Authenticated users can select profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile or admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.get_user_role() IN ('admin', 'super_admin'));

-- ------------------------------------------
-- CLIENTS Tablosu
-- ------------------------------------------
CREATE POLICY "Authenticated users can select clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (is_deleted = false OR is_deleted IS NULL);

CREATE POLICY "Authenticated users can insert clients"
  ON public.clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
  ON public.clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete clients"
  ON public.clients FOR DELETE
  TO authenticated
  USING (public.get_user_role() IN ('admin', 'super_admin'));

-- ------------------------------------------
-- SHOOTS Tablosu
-- ------------------------------------------
CREATE POLICY "Authenticated users can select shoots"
  ON public.shoots FOR SELECT
  TO authenticated
  USING (is_deleted = false OR is_deleted IS NULL);

CREATE POLICY "Authenticated users can insert shoots"
  ON public.shoots FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update shoots"
  ON public.shoots FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete shoots"
  ON public.shoots FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------
-- EDITS Tablosu
-- ------------------------------------------
CREATE POLICY "Authenticated users can select edits"
  ON public.edits FOR SELECT
  TO authenticated
  USING (is_deleted = false OR is_deleted IS NULL);

CREATE POLICY "Authenticated users can insert edits"
  ON public.edits FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update edits"
  ON public.edits FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete edits"
  ON public.edits FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------
-- CONTENT_CALENDAR Tablosu
-- ------------------------------------------
CREATE POLICY "Authenticated users can select content_calendar"
  ON public.content_calendar FOR SELECT
  TO authenticated
  USING (is_deleted = false OR is_deleted IS NULL);

CREATE POLICY "Authenticated users can insert content_calendar"
  ON public.content_calendar FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update content_calendar"
  ON public.content_calendar FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete content_calendar"
  ON public.content_calendar FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------
-- INCOME_RECORDS Tablosu (Finansal Gizlilik)
-- ------------------------------------------
CREATE POLICY "Authenticated users can select income"
  ON public.income_records FOR SELECT
  TO authenticated
  USING (is_deleted = false OR is_deleted IS NULL);

CREATE POLICY "Authenticated users can insert income"
  ON public.income_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update income"
  ON public.income_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete income"
  ON public.income_records FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------
-- EXPENSE_RECORDS Tablosu (Finansal Giderler)
-- ------------------------------------------
CREATE POLICY "Authenticated users can select expenses"
  ON public.expense_records FOR SELECT
  TO authenticated
  USING (is_deleted = false OR is_deleted IS NULL);

CREATE POLICY "Authenticated users can insert expenses"
  ON public.expense_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update expenses"
  ON public.expense_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete expenses"
  ON public.expense_records FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------
-- NOTIFICATIONS Tablosu
-- ------------------------------------------
CREATE POLICY "Authenticated users can select notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR public.get_user_role() IN ('admin', 'super_admin'));

-- ------------------------------------------
-- ACTIVITY_LOGS Tablosu
-- ------------------------------------------
CREATE POLICY "Authenticated users can select activity_logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activity_logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ------------------------------------------
-- ATTACHMENTS Tablosu
-- ------------------------------------------
CREATE POLICY "Authenticated users can select attachments"
  ON public.attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert attachments"
  ON public.attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attachments"
  ON public.attachments FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid() OR public.get_user_role() IN ('admin', 'super_admin'));
