import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getStripeEnvironment } from "@/lib/stripe";
import { createCheckoutSession } from "@/lib/payments.functions";

interface Props {
  priceId: string;
  returnUrl?: string;
}

export function StripeEmbeddedCheckout({ priceId, returnUrl }: Props) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function redirectToCheckout() {
      try {
        const checkoutUrl = await createCheckoutSession({
          data: {
            priceId,
            returnUrl:
              returnUrl ||
              `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
            environment: getStripeEnvironment(),
          },
        });
        if (cancelled) return;
        window.location.assign(checkoutUrl);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not start checkout");
        }
      }
    }

    redirectToCheckout();

    return () => {
      cancelled = true;
    };
  }, [priceId, returnUrl]);

  return (
    <div className="min-h-56 grid place-items-center px-6 py-10 text-center">
      {error ? (
        <div>
          <p className="text-sm font-semibold text-brand-dark">Checkout could not start</p>
          <p className="mt-2 text-xs text-muted-foreground">{error}</p>
        </div>
      ) : (
        <div className="inline-flex flex-col items-center gap-3">
          <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
          <p className="text-sm font-semibold text-brand-dark">Opening secure Stripe checkout…</p>
        </div>
      )}
    </div>
  );
}

export function PaymentTestModeBanner() {
  const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;
  if (!clientToken?.startsWith("pk_test_")) return null;
  return (
    <div className="w-full bg-orange-100 border-b border-orange-300 px-4 py-2 text-center text-xs text-orange-800">
      Test mode — use card 4242 4242 4242 4242 to try checkout.
    </div>
  );
}
