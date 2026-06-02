import { createFileRoute } from "@tanstack/react-router";
import type Stripe from "stripe";
import {
  constructStripeWebhookEvent,
  createStripeClient,
  type StripeEnv,
} from "@/lib/stripe.server";
import { upsertPassFromCheckoutSession, upsertPassFromSubscription } from "@/lib/passes.server";

type VerifiedEvent = {
  event: Stripe.Event;
  environment: StripeEnv;
};

async function verifyEvent(request: Request): Promise<VerifiedEvent> {
  const url = new URL(request.url);
  const requestedEnv = url.searchParams.get("env");
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const envs: StripeEnv[] =
    requestedEnv === "sandbox" || requestedEnv === "live" ? [requestedEnv] : ["live", "sandbox"];

  let lastError: unknown;
  for (const environment of envs) {
    try {
      const event = (await constructStripeWebhookEvent(
        body,
        signature,
        environment,
      )) as Stripe.Event;
      return { event, environment };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Invalid Stripe webhook");
}

async function getSubscription(stripe: Stripe, subscription: string | Stripe.Subscription | null) {
  if (!subscription) return null;
  if (typeof subscription !== "string") return subscription;
  return stripe.subscriptions.retrieve(subscription);
}

function getInvoiceSubscription(invoice: Stripe.Invoice) {
  const parent = invoice.parent;
  if (parent?.type === "subscription_details") {
    return parent.subscription_details.subscription;
  }
  return null;
}

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { event, environment } = await verifyEvent(request);
          const stripe = createStripeClient(environment);

          switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded": {
              const session = event.data.object as Stripe.Checkout.Session;
              const subscription = await getSubscription(stripe, session.subscription);
              await upsertPassFromCheckoutSession({
                environment,
                session,
                subscription,
                eventId: event.id,
              });
              break;
            }

            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted": {
              await upsertPassFromSubscription({
                environment,
                subscription: event.data.object as Stripe.Subscription,
                eventId: event.id,
              });
              break;
            }

            case "invoice.payment_succeeded":
            case "invoice.payment_failed": {
              const invoice = event.data.object as Stripe.Invoice;
              const subscription = await getSubscription(stripe, getInvoiceSubscription(invoice));
              if (subscription) {
                await upsertPassFromSubscription({
                  environment,
                  subscription,
                  paymentStatus: event.type === "invoice.payment_succeeded" ? "paid" : "failed",
                  eventId: event.id,
                });
              }
              break;
            }
          }

          return Response.json({ received: true });
        } catch (error) {
          console.error(error);
          return Response.json({ error: "Invalid webhook" }, { status: 400 });
        }
      },
    },
  },
});
