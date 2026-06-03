import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  Accessibility,
  ArrowLeft,
  Baby,
  Bookmark,
  Building2,
  Check,
  Flag,
  Loader2,
  MapPin,
  Toilet,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { MapNavigationSheet } from "@/components/MapNavigationSheet";

import { getToiletByAmapId } from "@/lib/toilets.functions";
import type { ToiletDTO } from "@/lib/amap";
import { getStoredReports } from "@/lib/reports";
import { isToiletSaved, saveToilet } from "@/lib/saved-toilets";

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
  const [saved, setSaved] = useState(false);

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
          setSaved(isToiletSaved(res.toilet.id));
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

  const reports = getStoredReports().filter((report) =>
    report.placeName.toLowerCase().includes(toilet.name.toLowerCase()),
  );

  const handleSave = () => {
    const result = saveToilet(toilet);
    setSaved(true);
    toast(result.alreadySaved ? "Already saved" : "Saved on this device");
  };

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
        <Link
          to="/report"
          search={{ place: toilet.name }}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:border-primary/40 hover:text-primary"
        >
          <Flag className="size-3.5" aria-hidden />
          Report
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
        <div className="mb-3 grid grid-cols-[auto_1fr] gap-2">
          <button
            type="button"
            onClick={handleSave}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-widest transition ${
              saved
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}
            aria-pressed={saved}
          >
            <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} aria-hidden />
            {saved ? "Saved" : "Save"}
          </button>
          <Link
            to="/saved"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:border-primary/40 hover:text-primary"
          >
            Saved places
          </Link>
        </div>
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

      <section className="px-6 mt-8">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-brand-dark">Community reports</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Traveler feedback for this place.
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              {reports.length}
            </span>
          </div>

          {reports.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {reports.map((report) => (
                <li key={report.id} className="rounded-xl bg-surface p-3 text-left">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">
                    {report.type.replace(/_/g, " ")}
                  </p>
                  {report.notes && (
                    <p className="mt-1 text-sm leading-relaxed text-foreground">{report.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm leading-relaxed text-muted-foreground">
              No reports yet. If you visit this restroom, report whether it has a seated toilet,
              paper, or access issues.
            </p>
          )}
        </div>
      </section>
    </AppShell>
  );
}
