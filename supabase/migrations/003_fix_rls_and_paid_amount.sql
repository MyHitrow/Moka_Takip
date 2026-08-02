-- Migration: 003_fix_rls_and_paid_amount.sql
-- Amaç: Anonim (anon) ve kimliği doğrulanmış (authenticated) erişimleri aç, income_records tablosuna paid_amount ekle.

-- 1. income_records tablosuna paid_amount ekle
ALTER TABLE public.income_records
  ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(12,2) DEFAULT 0;

-- 2. clients RLS izinleri
DROP POLICY IF EXISTS "Anon & Authenticated full access on clients" ON public.clients;
CREATE POLICY "Anon & Authenticated full access on clients" ON public.clients
  FOR ALL USING (true) WITH CHECK (true);

-- 3. shoots RLS izinleri
DROP POLICY IF EXISTS "Anon & Authenticated full access on shoots" ON public.shoots;
CREATE POLICY "Anon & Authenticated full access on shoots" ON public.shoots
  FOR ALL USING (true) WITH CHECK (true);

-- 4. edits RLS izinleri
DROP POLICY IF EXISTS "Anon & Authenticated full access on edits" ON public.edits;
CREATE POLICY "Anon & Authenticated full access on edits" ON public.edits
  FOR ALL USING (true) WITH CHECK (true);

-- 5. content_calendar RLS izinleri
DROP POLICY IF EXISTS "Anon & Authenticated full access on content_calendar" ON public.content_calendar;
CREATE POLICY "Anon & Authenticated full access on content_calendar" ON public.content_calendar
  FOR ALL USING (true) WITH CHECK (true);

-- 6. income_records RLS izinleri
DROP POLICY IF EXISTS "Anon & Authenticated full access on income_records" ON public.income_records;
CREATE POLICY "Anon & Authenticated full access on income_records" ON public.income_records
  FOR ALL USING (true) WITH CHECK (true);

-- 7. expense_records RLS izinleri
DROP POLICY IF EXISTS "Anon & Authenticated full access on expense_records" ON public.expense_records;
CREATE POLICY "Anon & Authenticated full access on expense_records" ON public.expense_records
  FOR ALL USING (true) WITH CHECK (true);

-- 8. notifications RLS izinleri
DROP POLICY IF EXISTS "Anon & Authenticated full access on notifications" ON public.notifications;
CREATE POLICY "Anon & Authenticated full access on notifications" ON public.notifications
  FOR ALL USING (true) WITH CHECK (true);

-- 9. activity_logs RLS izinleri
DROP POLICY IF EXISTS "Anon & Authenticated full access on activity_logs" ON public.activity_logs;
CREATE POLICY "Anon & Authenticated full access on activity_logs" ON public.activity_logs
  FOR ALL USING (true) WITH CHECK (true);

-- 10. attachments RLS izinleri
DROP POLICY IF EXISTS "Anon & Authenticated full access on attachments" ON public.attachments;
CREATE POLICY "Anon & Authenticated full access on attachments" ON public.attachments
  FOR ALL USING (true) WITH CHECK (true);
