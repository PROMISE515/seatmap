import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Check, Star, AlertTriangle } from "lucide-react";
import { verifyPassSession } from "@/lib/payments.functions";
import { getStripeEnvironmentForSessionId } from "@/lib/stripe";
import { removeStoredValue, setStoredValue } from "@/lib/client-storage";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Payment complete — Save your Travel Pass link" },
      {
        name: "description",
        content:
          "Your SeatMap Travel Pass is active. Save your private access link to use it on other devices.",
      },
      { property: "og:title", content: "Your SeatMap Travel Pass is active" },
      {
        property: "og:description",
        content:
          "Copy and save your private access link — it's the only way to restore your pass on another device.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [
      { rel: "canonical", href: "https://swift-restroom-finder.lovable.app/checkout/return" },
    ],
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  const [copied, setCopied] = useState(false);
  const [activated, setActivated] = useState(false);

  const passUrl =
    typeof window !== "undefined" && session_id
      ? `${window.location.origin}/pass?sid=${session_id}`
      : "";

  // Auto-activate locally so they can keep using current device immediately.
  useEffect(() => {
    if (!session_id) return;
    setStoredValue("seatmap.pass.sid", session_id);
    (async () => {
      try {
        const res = await verifyPassSession({
          data: {
            sessionId: session_id,
            environment: getStripeEnvironmentForSessionId(session_id),
          },
        });
        if (res.valid) {
          setStoredValue("seatmap.pass.expiresAt", String(res.expiresAtMs));
          setStoredValue("seatmap.pass.sid", session_id);
          removeStoredValue("seatmap.search.count");
          setActivated(true);
        }
      } catch (e) {
        console.error("verify failed", e);
      }
    })();
  }, [session_id]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(passUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!session_id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <h1 className="text-xl font-bold mb-2">No session</h1>
        <Link to="/" className="text-primary underline">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">✅</div>
          <h1 className="text-2xl font-extrabold mb-1 text-brand-dark">Payment complete</h1>
          <p className="text-sm text-muted-foreground">
            {activated ? "Your Travel Pass is now active on this device." : "Activating your pass…"}
          </p>
        </div>

        <div className="rounded-2xl border-2 border-primary bg-primary/5 p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="size-4 text-primary fill-primary" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
              Save this link
            </h2>
          </div>
          <p className="text-sm text-foreground mb-3 leading-relaxed">
            This is your <strong>only way</strong> to access the pass on another device or after
            clearing your browser cache. Save it now — we won't email it.
          </p>

          <div className="bg-background rounded-xl p-3 mb-3 border border-border">
            <code className="text-xs text-foreground break-all block">{passUrl}</code>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full bg-brand-dark hover:bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="size-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="size-4" /> Copy link
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-muted-foreground mt-3">
            Tip: paste it into your Notes app, email it to yourself, or bookmark it.
          </p>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-left">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden />
          <p className="text-xs leading-relaxed text-amber-900">
            No login is used. This private link is your pass. Save it before leaving this page.
          </p>
        </div>

        <Link
          to="/"
          className="block w-full text-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm uppercase tracking-widest"
        >
          Back to SeatMap
        </Link>
        <div className="mt-3">
          <ManageSubscriptionButton sessionId={session_id} label="Manage or cancel subscription" />
        </div>
      </div>
    </div>
  );
}
