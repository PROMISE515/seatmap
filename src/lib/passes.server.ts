import type Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { StripeEnv } from "@/lib/stripe.server";

export const ACTIVE_PASS_STATUSES = new Set(["active", "trialing", "past_due", "paid"]);

function toIso(seconds: number | null | undefined) {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

function subscriptionCustomerId(subscription: Stripe.Subscription) {
  const customer = subscription.customer;
  if (typeof customer === "string") return customer;
  if (!customer || customer.deleted) return null;
  return customer.id;
}

function sessionCustomerId(session: Stripe.Checkout.Session) {
  const customer = session.customer;
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  if (customer.deleted) return null;
  return customer.id;
}

export function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const periodStarts = subscription.items.data
    .map((item) => item.current_period_start)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const periodEnds = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  return {
    startsAt: toIso(periodStarts[0]),
    endsAt: toIso(periodEnds[0]),
  };
}

export async function upsertPassFromCheckoutSession({
  environment,
  session,
  subscription,
  eventId,
}: {
  environment: StripeEnv;
  session: Stripe.Checkout.Session;
  subscription: Stripe.Subscription | null;
  eventId: string;
}) {
  const period = subscription
    ? getSubscriptionPeriod(subscription)
    : { startsAt: null, endsAt: null };
  const firstItem = subscription?.items.data[0];
  const priceId =
    firstItem?.price.id ??
    (typeof session.line_items?.data[0]?.price === "string"
      ? session.line_items.data[0].price
      : session.line_items?.data[0]?.price?.id) ??
    null;
  const planLookupKey =
    session.metadata?.plan_lookup_key ?? subscription?.metadata.plan_lookup_key ?? null;
  const passExpiresAt = period.endsAt;
  const status = subscription?.status ?? (session.payment_status === "paid" ? "paid" : "unpaid");

  const row = {
    environment,
    checkout_session_id: session.id,
    stripe_customer_id: sessionCustomerId(session),
    stripe_subscription_id: subscription?.id ?? null,
    stripe_price_id: priceId,
    plan_lookup_key: planLookupKey,
    status,
    payment_status: session.payment_status,
    current_period_start: period.startsAt,
    current_period_end: period.endsAt,
    pass_expires_at: passExpiresAt,
    last_event_id: eventId,
    raw: { session, subscription },
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("stripe_passes")
    .upsert(row, { onConflict: "environment,checkout_session_id" });
  if (error) throw error;
}

export async function upsertPassFromSubscription({
  environment,
  subscription,
  paymentStatus,
  eventId,
}: {
  environment: StripeEnv;
  subscription: Stripe.Subscription;
  paymentStatus?: string;
  eventId: string;
}) {
  const period = getSubscriptionPeriod(subscription);
  const firstItem = subscription.items.data[0];
  const row = {
    environment,
    checkout_session_id: null,
    stripe_customer_id: subscriptionCustomerId(subscription),
    stripe_subscription_id: subscription.id,
    stripe_price_id: firstItem?.price.id ?? null,
    plan_lookup_key: subscription.metadata.plan_lookup_key ?? null,
    status: subscription.status,
    payment_status: paymentStatus ?? null,
    current_period_start: period.startsAt,
    current_period_end: period.endsAt,
    pass_expires_at: period.endsAt,
    last_event_id: eventId,
    raw: subscription,
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: selectError } = await supabaseAdmin
    .from("stripe_passes")
    .select("id")
    .eq("environment", environment)
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();
  if (selectError) throw selectError;

  const query = supabaseAdmin.from("stripe_passes");
  const { error } = existing
    ? await query.update(row).eq("id", existing.id)
    : await query.insert(row);
  if (error) throw error;
}

export async function getPassByCheckoutSession(environment: StripeEnv, sessionId: string) {
  const { data, error } = await supabaseAdmin
    .from("stripe_passes")
    .select("*")
    .eq("environment", environment)
    .eq("checkout_session_id", sessionId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
