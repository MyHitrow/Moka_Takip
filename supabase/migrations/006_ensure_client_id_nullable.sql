-- Migration: 006_ensure_client_id_nullable.sql
-- Amaç: content_calendar ve edits tablolarında client_id zorunluluğunu kaldırıp RLS erişimini full izinli yapmak.

ALTER TABLE public.content_calendar ALTER COLUMN client_id DROP NOT NULL;
ALTER TABLE public.edits ALTER COLUMN client_id DROP NOT NULL;
ALTER TABLE public.shoots ALTER COLUMN client_id DROP NOT NULL;
ALTER TABLE public.income_records ALTER COLUMN client_id DROP NOT NULL;

DROP POLICY IF EXISTS "Anon & Authenticated full access on content_calendar" ON public.content_calendar;
CREATE POLICY "Anon & Authenticated full access on content_calendar" ON public.content_calendar FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon & Authenticated full access on edits" ON public.edits;
CREATE POLICY "Anon & Authenticated full access on edits" ON public.edits FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon & Authenticated full access on clients" ON public.clients;
CREATE POLICY "Anon & Authenticated full access on clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
