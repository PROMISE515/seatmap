CREATE TABLE IF NOT EXISTS public.toilet_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amap_id TEXT NOT NULL UNIQUE,
  place_name TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_toilet_blacklist_amap_id
  ON public.toilet_blacklist (amap_id);

ALTER TABLE public.toilet_blacklist ENABLE ROW LEVEL SECURITY;

-- Reads/writes are performed by server functions with the service role key.
