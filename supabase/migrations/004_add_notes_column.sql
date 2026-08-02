-- ==========================================
-- Migration 004: clients tablosuna notes kolonunu ekleme
-- ==========================================
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS max_days_between_posts INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS monthly_reels_target INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS monthly_shoot_target INTEGER DEFAULT 2;
