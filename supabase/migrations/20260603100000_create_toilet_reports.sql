CREATE TABLE IF NOT EXISTS public.toilet_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  toilet_id UUID REFERENCES public.toilets(id) ON DELETE SET NULL,
  amap_id TEXT,
  place_name TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (
    report_type IN ('confirmed_seated', 'wrong_listing', 'closed', 'other')
  ),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_toilet_reports_amap_id
  ON public.toilet_reports (amap_id);

CREATE INDEX IF NOT EXISTS idx_toilet_reports_toilet_id
  ON public.toilet_reports (toilet_id);

ALTER TABLE public.toilet_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read toilet reports"
  ON public.toilet_reports FOR SELECT
  USING (true);

-- Writes are performed by server functions with the service role key.
