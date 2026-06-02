CREATE TABLE IF NOT EXISTS public.stripe_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment TEXT NOT NULL CHECK (environment IN ('sandbox', 'live')),
  checkout_session_id TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  plan_lookup_key TEXT,
  status TEXT NOT NULL,
  payment_status TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  pass_expires_at TIMESTAMPTZ,
  last_event_id TEXT,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (environment, checkout_session_id),
  UNIQUE (environment, stripe_subscription_id)
);

CREATE INDEX IF NOT EXISTS idx_stripe_passes_session
  ON public.stripe_passes (environment, checkout_session_id);

CREATE INDEX IF NOT EXISTS idx_stripe_passes_subscription
  ON public.stripe_passes (environment, stripe_subscription_id);

ALTER TABLE public.stripe_passes ENABLE ROW LEVEL SECURITY;

-- No public read/write policies. The server-side service role owns payment state.
