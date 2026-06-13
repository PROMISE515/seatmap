CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT,
  pass_days INT NOT NULL DEFAULT 36500 CHECK (pass_days > 0),
  active BOOLEAN NOT NULL DEFAULT true,
  max_redemptions INT NOT NULL DEFAULT 1 CHECK (max_redemptions > 0),
  redeemed_count INT NOT NULL DEFAULT 0 CHECK (redeemed_count >= 0),
  redeemed_at TIMESTAMPTZ,
  last_redeemed_at TIMESTAMPTZ,
  redeemed_by_visitor_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_code_lower
  ON public.invite_codes (lower(code));

ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- No public policies. Invite-code reads/writes happen through trusted server functions.

CREATE OR REPLACE FUNCTION public.redeem_invite_code(
  p_code TEXT,
  p_visitor_id TEXT
)
RETURNS TABLE (
  id UUID,
  code TEXT,
  label TEXT,
  pass_days INT,
  redeemed_count INT,
  max_redemptions INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.invite_codes AS invite
  SET
    redeemed_count = invite.redeemed_count + 1,
    redeemed_at = COALESCE(invite.redeemed_at, now()),
    last_redeemed_at = now(),
    redeemed_by_visitor_id = p_visitor_id,
    updated_at = now()
  WHERE lower(invite.code) = lower(trim(p_code))
    AND invite.active = true
    AND (invite.expires_at IS NULL OR invite.expires_at > now())
    AND invite.redeemed_count < invite.max_redemptions
  RETURNING
    invite.id,
    invite.code,
    invite.label,
    invite.pass_days,
    invite.redeemed_count,
    invite.max_redemptions;
END;
$$;
