import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { verifyPassSession } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { removeStoredValue, setStoredValue } from "@/lib/client-storage";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";

export const Route = createFileRoute("/pass")({
  validateSearch: (search: Record<string, unknown>): { sid?: string } => ({
    sid: typeof search.sid === "string" ? search.sid : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Restore your Travel Pass — SeatMap" },
      {
        name: "description",
        content: "Restore your SeatMap Travel Pass on a new device using your private access link.",
      },
      { property: "og:title", content: "Restore your SeatMap Travel Pass" },
      {
        property: "og:description",
        content:
          "Open your private access link to reactivate unlimited toilet searches on this device.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://swift-restroom-finder.lovable.app/pass" }],
  }),
  component: PassPage,
});

type State =
  | { kind: "loading" }
  | { kind: "ok"; expiresAtMs: number; days: number }
  | { kind: "expired"; expiresAtMs: number }
  | { kind: "invalid"; reason: string };

function PassPage() {
  const { sid } = Route.useSearch();
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!sid) {
      setState({ kind: "invalid", reason: "Missing link" });
      return;
    }
    (async () => {
      try {
        const res = await verifyPassSession({
          data: { sessionId: sid, environment: getStripeEnvironment() },
        });
        if (!res.valid) {
          setState({ kind: "invalid", reason: res.reason });
          return;
        }
        if (res.expired) {
          setState({ kind: "expired", expiresAtMs: res.expiresAtMs });
          return;
        }
        setStoredValue("seatmap.pass.expiresAt", String(res.expiresAtMs));
        setStoredValue("seatmap.pass.sid", sid);
        removeStoredValue("seatmap.search.count");
        setState({ kind: "ok", expiresAtMs: res.expiresAtMs, days: res.days });
        setTimeout(() => navigate({ to: "/" }), 1500);
      } catch (e) {
        console.error("verify failed", e);
        setState({ kind: "invalid", reason: "Could not verify link" });
      }
    })();
  }, [sid, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <h1 className="sr-only">Restore your SeatMap Travel Pass</h1>

      {state.kind === "loading" && (
        <>
          <Loader2 className="size-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Restoring your Travel Pass…</p>
        </>
      )}

      {state.kind === "ok" && (
        <>
          <div className="text-6xl mb-3">✅</div>
          <h2 className="text-2xl font-extrabold mb-2 text-brand-dark">Pass restored</h2>
          <p className="text-sm text-muted-foreground mb-1">
            Active until {new Date(state.expiresAtMs).toLocaleDateString()}
          </p>
          {sid && (
            <div className="mt-5 w-full max-w-xs">
              <ManageSubscriptionButton sessionId={sid} />
            </div>
          )}
          <p className="text-xs text-muted-foreground">Redirecting…</p>
        </>
      )}

      {state.kind === "expired" && (
        <>
          <div className="text-5xl mb-3">⏰</div>
          <h2 className="text-2xl font-extrabold mb-2 text-brand-dark">Pass expired</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This pass expired on {new Date(state.expiresAtMs).toLocaleDateString()}.
          </p>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm uppercase tracking-widest"
          >
            Get a new pass
          </Link>
        </>
      )}

      {state.kind === "invalid" && (
        <>
          <div className="text-5xl mb-3">❌</div>
          <h2 className="text-2xl font-extrabold mb-2 text-brand-dark">Invalid link</h2>
          <p className="text-sm text-muted-foreground mb-6">{state.reason}</p>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm uppercase tracking-widest"
          >
            Back to SeatMap
          </Link>
        </>
      )}
    </div>
  );
}
