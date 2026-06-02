import { createServerFn } from "@tanstack/react-start";
import type Stripe from "stripe";
import { type StripeEnv, createStripeClient } from "@/lib/stripe.server";
import {
  ACTIVE_PASS_STATUSES,
  getPassByCheckoutSession,
  getSubscriptionPeriod,
  upsertPassFromCheckoutSession,
} from "@/lib/passes.server";

const PLANS: Record<string, { days: number; priceEnvKey: string; lookupKey: string }> = {
  travel_pass_7_price: {
    days: 7,
    priceEnvKey: "STRIPE_TRAVEL_PASS_7_PRICE_ID",
    lookupKey: "travel_pass_7_price",
  },
  travel_pass_15_price: {
    days: 15,
    priceEnvKey: "STRIPE_TRAVEL_PASS_15_PRICE_ID",
    lookupKey: "travel_pass_15_price",
  },
  travel_pass_30_price: {
    days: 30,
    priceEnvKey: "STRIPE_TRAVEL_PASS_30_PRICE_ID",
    lookupKey: "travel_pass_30_price",
  },
};

const DEFAULT_ALLOWED_RETURN_ORIGINS = [
  "https://swift-restroom-finder.lovable.app",
  "https://id-preview--b5949848-4b7a-43e1-928d-0803c9866044.lovable.app",
];

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);

function parseOrigin(rawUrl: string | undefined): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
}

function getAllowedReturnOrigins() {
  const origins = new Set(DEFAULT_ALLOWED_RETURN_ORIGINS);
  const siteOrigin = parseOrigin(process.env.SITE_URL);
  if (siteOrigin) origins.add(siteOrigin);

  for (const rawOrigin of (process.env.PAYMENTS_ALLOWED_RETURN_ORIGINS ?? "").split(",")) {
    const origin = parseOrigin(rawOrigin.trim());
    if (origin) origins.add(origin);
  }

  return origins;
}

function assertSafeReturnUrl(rawUrl: string) {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid returnUrl");
  }
  const isLocalHost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isLocalHost)) {
    throw new Error("Invalid returnUrl protocol");
  }
  const isAllowedHost =
    getAllowedReturnOrigins().has(parsed.origin) ||
    parsed.hostname.endsWith(".lovable.app") ||
    isLocalHost;
  if (!isAllowedHost) {
    throw new Error("returnUrl origin not allowed");
  }
}

function isStripeSubscription(
  value: string | Stripe.Subscription | null,
): value is Stripe.Subscription {
  return Boolean(value && typeof value !== "string" && value.object === "subscription");
}

async function getCheckoutSubscription(
  stripe: Stripe,
  subscription: string | Stripe.Subscription | null,
) {
  if (!subscription) return null;
  if (isStripeSubscription(subscription)) return subscription;
  return stripe.subscriptions.retrieve(subscription);
}

function getSubscriptionPeriodEndMs(subscription: Stripe.Subscription) {
  const period = getSubscriptionPeriod(subscription);
  return period.endsAt ? new Date(period.endsAt).getTime() : null;
}

function getCustomerId(customer: Stripe.Checkout.Session.Customer) {
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  if (customer.deleted) return null;
  return customer.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: { priceId: string; returnUrl: string; environment: StripeEnv }) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(data.priceId)) throw new Error("Invalid priceId");
    if (!PLANS[data.priceId]) throw new Error("Unknown plan");
    assertSafeReturnUrl(data.returnUrl);
    return data;
  })

  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);
    const plan = PLANS[data.priceId];
    const checkoutReturnUrl = new URL(data.returnUrl);
    const cancelUrl = checkoutReturnUrl.origin;

    const configuredPriceId = process.env[plan.priceEnvKey];
    const stripePrice = configuredPriceId
      ? await stripe.prices.retrieve(configuredPriceId)
      : (await stripe.prices.list({ lookup_keys: [plan.lookupKey] })).data[0];
    if (!stripePrice) {
      throw new Error(`Price not found for ${plan.lookupKey}`);
    }

    const productId =
      typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
    const product = await stripe.products.retrieve(productId);
    const productDescription = product.name;
    const metadata = { plan_lookup_key: data.priceId };
    const mode = stripePrice.recurring ? "subscription" : "payment";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: [{ price: stripePrice.id, quantity: 1 }],
      mode,
      ui_mode: "hosted_page",
      success_url: data.returnUrl,
      cancel_url: cancelUrl,
      metadata,
    };

    if (mode === "subscription") {
      sessionParams.subscription_data = { description: productDescription, metadata };
    } else {
      sessionParams.payment_intent_data = { description: productDescription };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) throw new Error("Failed to create checkout URL");
    return session.url;
  });

export const createCustomerPortalSession = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; returnUrl: string; environment: StripeEnv }) => {
    if (!/^[a-zA-Z0-9_]+$/.test(data.sessionId)) throw new Error("Invalid sessionId");
    assertSafeReturnUrl(data.returnUrl);
    return data;
  })
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);
    const session = await stripe.checkout.sessions.retrieve(data.sessionId, {
      expand: ["customer", "subscription"],
    });
    const customerId = getCustomerId(session.customer);
    if (!customerId) throw new Error("No customer found for this pass");

    const subscription = await getCheckoutSubscription(stripe, session.subscription);
    if (!subscription) throw new Error("No subscription found for this pass");
    if (!ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
      throw new Error(`Subscription is ${subscription.status}`);
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: data.returnUrl,
    });

    return portalSession.url;
  });

// Validates a Stripe Checkout Session by ID and returns pass info.
// For subscriptions, access follows the live subscription status and current
// billing period. The private `/pass?sid=cs_xxx` link remains the no-login
// restore mechanism across browsers/devices.
export const verifyPassSession = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    if (!/^[a-zA-Z0-9_]+$/.test(data.sessionId)) throw new Error("Invalid sessionId");
    return data;
  })
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);
    let session: Stripe.Checkout.Session;

    try {
      session = await stripe.checkout.sessions.retrieve(data.sessionId, {
        expand: ["subscription"],
      });
    } catch (error) {
      const storedPass = await getPassByCheckoutSession(data.environment, data.sessionId);
      if (!storedPass) throw error;

      const expiresAtMs = storedPass.pass_expires_at
        ? new Date(storedPass.pass_expires_at).getTime()
        : null;
      if (!ACTIVE_PASS_STATUSES.has(storedPass.status) || !expiresAtMs) {
        return { valid: false as const, reason: `Subscription is ${storedPass.status}` };
      }

      const days = storedPass.plan_lookup_key ? PLANS[storedPass.plan_lookup_key]?.days : undefined;
      if (!days) {
        return { valid: false as const, reason: "Unknown plan" };
      }

      return {
        valid: true as const,
        days,
        createdAtMs: new Date(storedPass.created_at).getTime(),
        expiresAtMs,
        expired: Date.now() > expiresAtMs,
      };
    }

    if (session.payment_status !== "paid") {
      return { valid: false as const, reason: "Payment not completed" };
    }

    const lookupKey = session.metadata?.plan_lookup_key as string | undefined;
    const days = lookupKey ? PLANS[lookupKey]?.days : undefined;
    if (!days) {
      return { valid: false as const, reason: "Unknown plan" };
    }

    const subscription = await getCheckoutSubscription(stripe, session.subscription);
    if (subscription) {
      await upsertPassFromCheckoutSession({
        environment: data.environment,
        session,
        subscription,
        eventId: "checkout-session-verify",
      });

      if (!ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
        return { valid: false as const, reason: `Subscription is ${subscription.status}` };
      }

      const expiresAtMs = getSubscriptionPeriodEndMs(subscription);
      if (!expiresAtMs) {
        return { valid: false as const, reason: "Subscription period is unavailable" };
      }

      return {
        valid: true as const,
        days,
        createdAtMs: subscription.start_date * 1000,
        expiresAtMs,
        expired: Date.now() > expiresAtMs,
      };
    }

    const createdAtMs = session.created * 1000;
    const expiresAtMs = createdAtMs + days * 24 * 60 * 60 * 1000;
    const now = Date.now();

    return {
      valid: true as const,
      days,
      createdAtMs,
      expiresAtMs,
      expired: now > expiresAtMs,
    };
  });
