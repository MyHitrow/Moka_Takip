-- Migration: 006_ensure_client_id_nullable.sql
-- Amaç: content_calendar ve edits tablolarında client_id zorunluluğunu kaldırıp client_name ile serbest kayda izin vermek.

ALTER TABLE public.content_calendar
  ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE public.edits
  ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE public.shoots
  ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE public.income_records
  ALTER COLUMN client_id DROP NOT NULL;
