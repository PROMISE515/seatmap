ALTER TABLE public.toilet_reports
  ADD COLUMN IF NOT EXISTS is_complaint BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS photo_urls TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_toilet_reports_complaints
  ON public.toilet_reports (amap_id, is_complaint)
  WHERE is_complaint = true;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'toilet-report-photos',
  'toilet-report-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
