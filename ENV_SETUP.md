# Local Environment Setup

Use `.env.local` for local private keys. It is ignored by git.

## Final Variables To Fill

Supabase:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

AMap:

```bash
AMAP_WEB_SERVICE_KEY=
```

Stripe live payments:

```bash
SITE_URL=http://localhost:8080
PAYMENTS_ALLOWED_RETURN_ORIGINS=http://localhost:8080
VITE_PAYMENTS_CLIENT_TOKEN=pk_live_...
STRIPE_LIVE_SECRET_KEY=sk_live_...
PAYMENTS_LIVE_WEBHOOK_SECRET=whsec_...
STRIPE_TRAVEL_PASS_7_PRICE_ID=price_...
STRIPE_TRAVEL_PASS_15_PRICE_ID=price_...
STRIPE_TRAVEL_PASS_30_PRICE_ID=price_...
```

## Where To Find Them

Supabase:

- `SUPABASE_URL`: Supabase project settings, API section, Project URL.
- `VITE_SUPABASE_URL`: same value as `SUPABASE_URL`.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable/anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role secret key. Keep private.
- `VITE_SUPABASE_PROJECT_ID`: the project ref from the Supabase URL, e.g. `abcdefghijklmno`.

AMap:

- Create an app in AMap Open Platform and use a Web Service API key.

Stripe webhook:

- Add endpoint `/api/stripe/webhook` in Stripe Dashboard after deployment.
- For local testing with a tunnel, use `/api/stripe/webhook?env=live` or `?env=sandbox`.
- Copy the endpoint signing secret into `PAYMENTS_LIVE_WEBHOOK_SECRET` or `PAYMENTS_SANDBOX_WEBHOOK_SECRET`.

## After Editing

Restart the dev server so Vite and server functions read the new environment.
