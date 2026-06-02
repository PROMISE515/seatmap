# Real Payments Setup

Safe Seat uses Stripe hosted Checkout. The app selects sandbox or live mode from
`VITE_PAYMENTS_CLIENT_TOKEN`:

- `pk_test_...` uses sandbox.
- `pk_live_...` uses real payments.

## Required Stripe Objects

Create prices in Stripe with these lookup keys:

- `travel_pass_7_price` for the US$0.99 / 7 day plan
- `travel_pass_15_price` for the US$1.69 / 15 day plan
- `travel_pass_30_price` for the US$2.99 / 30 day plan

The code resolves prices by `lookup_key`, not by hard-coded Stripe price IDs.
Recurring prices are supported automatically through Stripe subscription mode.

If you did not set lookup keys in Stripe, add the exact price IDs instead:

```bash
STRIPE_TRAVEL_PASS_7_PRICE_ID=price_...
STRIPE_TRAVEL_PASS_15_PRICE_ID=price_...
STRIPE_TRAVEL_PASS_30_PRICE_ID=price_...
```

## Environment Variables

For direct Stripe API usage:

```bash
VITE_PAYMENTS_CLIENT_TOKEN=pk_live_...
STRIPE_LIVE_SECRET_KEY=sk_live_...
PAYMENTS_LIVE_WEBHOOK_SECRET=whsec_...
SITE_URL=https://your-production-domain.com
PAYMENTS_ALLOWED_RETURN_ORIGINS=https://your-production-domain.com,http://localhost:8080
```

For sandbox testing:

```bash
VITE_PAYMENTS_CLIENT_TOKEN=pk_test_...
STRIPE_SANDBOX_SECRET_KEY=sk_test_...
PAYMENTS_SANDBOX_WEBHOOK_SECRET=whsec_...
SITE_URL=http://localhost:8080
PAYMENTS_ALLOWED_RETURN_ORIGINS=http://localhost:8080
```

If you are using the Lovable Stripe connector instead of direct Stripe secret keys,
set `STRIPE_SANDBOX_API_KEY`, `STRIPE_LIVE_API_KEY`, and `LOVABLE_API_KEY`.

## Verification Flow

1. Open the app.
2. Use the free search once.
3. Search again to open the Travel Pass modal.
4. Pick a pass and complete checkout.
5. Stripe returns to `/checkout/return?session_id=...`.
6. The app verifies the Checkout Session and stores the private pass link locally.

For subscription prices, pass access is based on the live Stripe subscription
status and the current billing period end. The `/pass?sid=...` private link can
be opened on another browser or device to restore access without logging in.

## Subscription Management

Enable Stripe Customer Portal in the Stripe Dashboard before launch. The app uses
the private pass link's Checkout Session ID to create a Customer Portal session,
so users can manage or cancel their subscription without creating an account.

Do not paste live Stripe keys into chat. Put them in `.env` locally and in the
production deployment environment.

## Webhook Setup

Create a Stripe webhook endpoint pointing to:

```text
https://your-production-domain.com/api/stripe/webhook
```

Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

The webhook syncs subscription status into Supabase `stripe_passes`, so the
private `/pass?sid=...` link can be restored even when a browser has no local
storage state.
