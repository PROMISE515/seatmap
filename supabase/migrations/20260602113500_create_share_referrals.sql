CREATE TABLE IF NOT EXISTS public.share_referrals (
  code TEXT PRIMARY KEY,
  granted_count INTEGER NOT NULL DEFAULT 0 CHECK (granted_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.share_referral_claims (
  referral_code TEXT NOT NULL REFERENCES public.share_referrals(code) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (referral_code, visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_share_referral_claims_visitor
  ON public.share_referral_claims (visitor_id);

ALTER TABLE public.share_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_referral_claims ENABLE ROW LEVEL SECURITY;

-- No public read/write policies. Server functions use the service role.

CREATE OR REPLACE FUNCTION public.claim_share_referral(
  p_referral_code TEXT,
  p_visitor_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count INTEGER;
BEGIN
  IF p_referral_code !~ '^[A-Za-z0-9_-]{16,64}$' THEN
    RETURN false;
  END IF;

  IF p_visitor_id !~ '^[A-Za-z0-9_-]{16,64}$' THEN
    RETURN false;
  END IF;

  INSERT INTO public.share_referrals(code)
  VALUES (p_referral_code)
  ON CONFLICT (code) DO NOTHING;

  INSERT INTO public.share_referral_claims(referral_code, visitor_id)
  VALUES (p_referral_code, p_visitor_id)
  ON CONFLICT (referral_code, visitor_id) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;

  IF inserted_count > 0 THEN
    UPDATE public.share_referrals
    SET granted_count = granted_count + 1,
        updated_at = now()
    WHERE code = p_referral_code;

    RETURN true;
  END IF;

  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_share_referral(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_share_referral(TEXT, TEXT) TO service_role;
