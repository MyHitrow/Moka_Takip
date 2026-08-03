-- Migration: 006_ensure_client_id_nullable.sql
-- Amaç: RLS engellerini kaldırıp anon ve authenticated rollere tam erişim vermek.

ALTER TABLE public.content_calendar ALTER COLUMN client_id DROP NOT NULL;
ALTER TABLE public.edits ALTER COLUMN client_id DROP NOT NULL;
ALTER TABLE public.shoots ALTER COLUMN client_id DROP NOT NULL;
ALTER TABLE public.income_records ALTER COLUMN client_id DROP NOT NULL;

-- Drop restrictive 005 policies
DROP POLICY IF EXISTS "Authenticated users can select content_calendar" ON public.content_calendar;
DROP POLICY IF EXISTS "Authenticated users can insert content_calendar" ON public.content_calendar;
DROP POLICY IF EXISTS "Authenticated users can update content_calendar" ON public.content_calendar;
DROP POLICY IF EXISTS "Authenticated users can delete content_calendar" ON public.content_calendar;

DROP POLICY IF EXISTS "Authenticated users can select edits" ON public.edits;
DROP POLICY IF EXISTS "Authenticated users can insert edits" ON public.edits;
DROP POLICY IF EXISTS "Authenticated users can update edits" ON public.edits;
DROP POLICY IF EXISTS "Authenticated users can delete edits" ON public.edits;

DROP POLICY IF EXISTS "Authenticated users can select clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON public.clients;

-- Enable full open access for both anon and authenticated
DROP POLICY IF EXISTS "Anon & Authenticated full access on content_calendar" ON public.content_calendar;
CREATE POLICY "Anon & Authenticated full access on content_calendar" ON public.content_calendar FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon & Authenticated full access on edits" ON public.edits;
CREATE POLICY "Anon & Authenticated full access on edits" ON public.edits FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon & Authenticated full access on clients" ON public.clients;
CREATE POLICY "Anon & Authenticated full access on clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
