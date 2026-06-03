import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createCustomerPortalSession } from "@/lib/payments.functions";
import { getStripeEnvironmentForSessionId } from "@/lib/stripe";

export function ManageSubscriptionButton({
  sessionId,
  label = "Manage subscription",
  className,
}: {
  sessionId: string;
  label?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const handleManage = async () => {
    setStatus("loading");
    try {
      const portalUrl = await createCustomerPortalSession({
        data: {
          sessionId,
          returnUrl: window.location.href,
          environment: getStripeEnvironmentForSessionId(sessionId),
        },
      });
      window.location.assign(portalUrl);
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleManage}
        disabled={status === "loading"}
        className={
          className ??
          "w-full border border-border bg-card hover:border-primary/40 text-brand-dark py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition inline-flex items-center justify-center gap-2 disabled:opacity-70"
        }
      >
        {status === "loading" && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {label}
      </button>
      {status === "error" && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Could not open subscription settings. Try again later.
        </p>
      )}
    </div>
  );
}
