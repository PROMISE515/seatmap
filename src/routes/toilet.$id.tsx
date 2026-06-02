import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  Accessibility,
  ArrowLeft,
  Baby,
  Building2,
  Check,
  Loader2,
  MapPin,
  Toilet,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MapNavigationSheet } from "@/components/MapNavigationSheet";

import { getToiletByAmapId } from "@/lib/toilets.functions";
import type { ToiletDTO } from "@/lib/amap";

export const Route = createFileRoute("/toilet/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Toilet ${params.id} — SeatMap` },
      { name: "description", content: "Traveler-friendly seated toilet near you on SeatMap." },
      { name: "robots", content: "noindex" },
    ],
  }),
  notFoundComponent: () => (
    <AppShell>
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold">Toilet not found</h2>
        <Link to="/" className="text-primary text-sm mt-2 inline-block">
          ← Back to nearby
        </Link>
      </div>
    </AppShell>
  ),
  errorComponent: ToiletErrorComponent,
  component: ToiletDetail,
});

function ToiletErrorComponent({ reset }: { reset: () => void }) {
  const router = useRouter();

  return (
    <AppShell>
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="text-primary text-sm mt-2"
        >
          Try again
        </button>
      </div>
    </AppShell>
  );
}

function ToiletNotFound() {
  return (
    <AppShell>
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold">Toilet not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This listing may have expired or has not been saved from live map data yet.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
          >
            Search live nearby toilets
          </Link>
          <Link
            to="/$city/public-toilets"
            params={{ city: "shanghai" }}
            className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-bold text-foreground"
          >
            View Shanghai live results
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function ToiletDetail() {
  const { id } = Route.useParams();
  const fetchToilet = useServerFn(getToiletByAmapId);
  const [toilet, setToilet] = useState<ToiletDTO | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetchToilet({ data: { amapId: id } })
      .then((res) => {
        if (cancelled) return;
        if (!res.toilet) {
          setStatus("missing");
        } else {
          setToilet(res.toilet);
          setStatus("ready");
        }
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [id, fetchToilet]);

  if (status === "loading") {
    return (
      <AppShell>
        <div className="p-12 text-center text-muted-foreground inline-flex items-center justify-center gap-2 w-full">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Loading…
        </div>
      </AppShell>
    );
  }

  if (status === "missing" || !toilet) {
    return <ToiletNotFound />;
  }

  if (status === "error") {
    return (
      <AppShell>
        <div className="p-8 text-center">
          <h2 className="text-lg font-bold">Couldn't load this toilet</h2>
          <Link to="/" className="text-primary text-sm mt-2 inline-block">
            ← Back to nearby
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="px-6 pt-6 pb-2 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Link>
      </header>

      <section className="px-6 mt-4">
        {(() => {
          const KIND = {
            indoor: { label: "Indoor venue", Icon: Building2 },
            accessible: { label: "Accessible", Icon: Accessibility },
            nursery: { label: "Nursery room", Icon: Baby },
            public: { label: "Public toilet", Icon: Toilet },
          } as const;
          const k = KIND[toilet.kind];
          const KIcon = k.Icon;
          return (
            <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-secondary to-card p-6 flex items-center gap-5">
              <div className="size-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <KIcon className="size-10" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {k.label}
                </p>
                <p className="mt-1 text-3xl font-extrabold leading-none text-brand-dark tabular-nums">
                  {toilet.distanceM}
                  <span className="text-base font-bold text-muted-foreground ml-1">m</span>
                </p>
                {toilet.floor && (
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">
                    Floor · {toilet.floor}
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-brand-dark">
          {toilet.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
          <MapPin className="size-3.5" aria-hidden />
          {toilet.distanceM > 0 ? `${toilet.distanceM}m away` : "Nearby"}
          {toilet.floor ? ` · Floor ${toilet.floor}` : ""}
        </p>

        <ul className="mt-5 flex flex-wrap gap-2">
          {toilet.tags.map((tag: string) => (
            <li
              key={tag}
              className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md inline-flex items-center gap-1"
            >
              <Check className="size-3" aria-hidden />
              {tag}
            </li>
          ))}
        </ul>
      </section>

      <section className="px-6 mt-8">
        {toilet.canNavigate ? (
          <MapNavigationSheet
            toilet={toilet}
            triggerLabel="Start Navigation"
            triggerClassName="w-full bg-primary text-primary-foreground py-5 rounded-2xl shadow-brand active:scale-[0.98] transition inline-flex items-center justify-center gap-2 font-bold tracking-tight text-lg"
          />
        ) : (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm font-semibold text-amber-800">
            Navigation is locked until this place has a seated-toilet signal.
          </div>
        )}
      </section>
    </AppShell>
  );
}
