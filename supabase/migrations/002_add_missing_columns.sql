-- Migration: 002_add_missing_columns.sql
-- Amaç: Uygulama kodu ile veritabanı şeması arasındaki uyumsuzlukları gider.
-- Kod client_name (TEXT) kullanırken şema client_id (UUID FK) bekliyordu.
-- Bu migration her iki yaklaşımı da destekler (geriye uyumlu).

-- ==========================================
-- shoots tablosu
-- ==========================================
ALTER TABLE public.shoots
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS shoot_type_label TEXT;

-- ==========================================
-- edits tablosu
-- ==========================================
ALTER TABLE public.edits
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS editor_name TEXT,
  ADD COLUMN IF NOT EXISTS content_type_label TEXT;

-- edits.content_type CHECK kısıtlamasını genişlet (other zaten var, 'Reels' gibi label'lar için)
-- Mevcut CHECK constraint'i kaldır ve daha esnek yap
ALTER TABLE public.edits
  DROP CONSTRAINT IF EXISTS edits_content_type_check;

ALTER TABLE public.edits
  ADD CONSTRAINT edits_content_type_check
  CHECK (content_type IN ('reels', 'post', 'story', 'youtube', 'ad_video', 'corporate_video', 'other', 'Reels', 'Post', 'Story', 'YouTube', 'Reklam', 'Kurumsal', 'Diğer'));

-- ==========================================
-- income_records tablosu
-- ==========================================
ALTER TABLE public.income_records
  ADD COLUMN IF NOT EXISTS client_name TEXT;

-- income_records.collection_status CHECK'i genişlet
ALTER TABLE public.income_records
  DROP CONSTRAINT IF EXISTS income_records_collection_status_check;

ALTER TABLE public.income_records
  ADD CONSTRAINT income_records_collection_status_check
  CHECK (collection_status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled'));

-- ==========================================
-- expense_records tablosu
-- ==========================================
-- paid_by şu an UUID FK, kod TEXT ("Şirket Hesabı" gibi) gönderiyor.
-- paid_by_text sütunu ekle, paid_by (UUID FK) opsiyonel bırak.
ALTER TABLE public.expense_records
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS paid_by_text TEXT;

-- paid_by UUID kısıtlamasını opsiyonel yap (zaten NULL olabilir ama FK var)
-- Yeni kayıtlar paid_by_text kullanacak
ALTER TABLE public.expense_records
  ALTER COLUMN paid_by DROP NOT NULL;

-- expense_records.category CHECK'i koru ama 'other' zaten var
-- Kod 'office' gibi değerler gönderiyor, bunlar zaten CHECK'te var.

-- ==========================================
-- content_calendar tablosu
-- ==========================================
ALTER TABLE public.content_calendar
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT;

-- content_calendar.status CHECK'i güncelle ('preparing' uyumu)
ALTER TABLE public.content_calendar
  DROP CONSTRAINT IF EXISTS content_calendar_status_check;

ALTER TABLE public.content_calendar
  ADD CONSTRAINT content_calendar_status_check
  CHECK (status IN ('preparing', 'pending_approval', 'ready', 'scheduled', 'published', 'cancelled'));

-- ==========================================
-- RLS: income_records için client_name bazlı erişime izin ver
-- ==========================================

-- income_records INSERT: client_id artık opsiyonel (client_name ile de eklenebilir)
ALTER TABLE public.income_records
  ALTER COLUMN client_id DROP NOT NULL;

-- shoots INSERT: client_id opsiyonel (client_name ile de eklenebilir)
ALTER TABLE public.shoots
  ALTER COLUMN client_id DROP NOT NULL;

-- edits INSERT: client_id opsiyonel
ALTER TABLE public.edits
  ALTER COLUMN client_id DROP NOT NULL;

-- content_calendar INSERT: client_id opsiyonel
ALTER TABLE public.content_calendar
  ALTER COLUMN client_id DROP NOT NULL;

-- ==========================================
-- İndeksler (yeni kolonlar için)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_shoots_client_name ON public.shoots(client_name);
CREATE INDEX IF NOT EXISTS idx_edits_client_name ON public.edits(client_name);
CREATE INDEX IF NOT EXISTS idx_income_client_name ON public.income_records(client_name);
CREATE INDEX IF NOT EXISTS idx_content_cal_client_name ON public.content_calendar(client_name);
