-- Migration: 007_open_rls_for_finans.sql
-- Amaç: expense_records ve income_records üzerindeki RLS engellerini kaldırıp anon ve authenticated tüm kullanıcılara (alidogan vb.) tam erişim vermek.

-- 1. expense_records RLS politikalarını sıfırla ve herkese aç
DROP POLICY IF EXISTS "Authenticated users can select expenses" ON public.expense_records;
DROP POLICY IF EXISTS "Authenticated users can insert expenses" ON public.expense_records;
DROP POLICY IF EXISTS "Authenticated users can update expenses" ON public.expense_records;
DROP POLICY IF EXISTS "Authenticated users can delete expenses" ON public.expense_records;
DROP POLICY IF EXISTS "Anon & Authenticated full access on expense_records" ON public.expense_records;

CREATE POLICY "Anon & Authenticated full access on expense_records"
  ON public.expense_records FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 2. income_records RLS politikalarını sıfırla ve herkese aç
DROP POLICY IF EXISTS "Authenticated users can select income" ON public.income_records;
DROP POLICY IF EXISTS "Authenticated users can insert income" ON public.income_records;
DROP POLICY IF EXISTS "Authenticated users can update income" ON public.income_records;
DROP POLICY IF EXISTS "Authenticated users can delete income" ON public.income_records;
DROP POLICY IF EXISTS "Anon & Authenticated full access on income_records" ON public.income_records;

CREATE POLICY "Anon & Authenticated full access on income_records"
  ON public.income_records FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
