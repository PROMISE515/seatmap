
CREATE TABLE public.toilets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amap_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  district TEXT,
  province TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  type TEXT,
  tel TEXT,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_toilets_lat_lng ON public.toilets (lat, lng);
CREATE INDEX idx_toilets_city ON public.toilets (city);

CREATE TABLE public.toilet_search_cache (
  cache_key TEXT PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  radius_m INT NOT NULL,
  amap_ids TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.toilets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toilet_search_cache ENABLE ROW LEVEL SECURITY;

-- Public read (this is public POI data, no PII)
CREATE POLICY "Toilets are publicly readable"
  ON public.toilets FOR SELECT
  USING (true);

CREATE POLICY "Search cache is publicly readable"
  ON public.toilet_search_cache FOR SELECT
  USING (true);

-- No insert/update/delete policies = only service role (server) can write
