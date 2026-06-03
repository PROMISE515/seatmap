import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, Check, Flag, Loader2, MapPin, Share2, Star } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { MapNavigationSheet } from "@/components/MapNavigationSheet";

import { getToiletByAmapId } from "@/lib/toilets.functions";
import type { ToiletDTO } from "@/lib/amap";
import { getToiletReports, type ToiletReportDTO } from "@/lib/reports.functions";
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
  const fetchReports = useServerFn(getToiletReports);
  const [toilet, setToilet] = useState<ToiletDTO | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [saved, setSaved] = useState(false);
  const [reports, setReports] = useState<ToiletReportDTO[]>([]);

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
          void fetchReports({ data: { amapId: res.toilet.id } })
            .then((reportRes) => {
              if (!cancelled) setReports(reportRes.reports);
            })
            .catch(() => {
              if (!cancelled) setReports([]);
            });
        }
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [id, fetchReports, fetchToilet]);

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
          search={{ place: toilet.name, amapId: toilet.id }}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:border-primary/40 hover:text-primary"
        >
          <Flag className="size-3.5" aria-hidden />
          Report
        </Link>
      </header>

      <section className="px-6 mt-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-dark">{toilet.name}</h1>
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
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <button
            type="button"
            onClick={handleSave}
            className={`inline-flex min-w-24 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-xs font-bold uppercase tracking-widest transition ${
              saved
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}
            aria-pressed={saved}
          >
            <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} aria-hidden />
            {saved ? "Saved" : "Save"}
          </button>
          {toilet.canNavigate ? (
            <MapNavigationSheet
              toilet={toilet}
              triggerLabel="Start Navigation"
              triggerClassName="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-brand active:scale-[0.98] transition inline-flex items-center justify-center gap-2 font-bold tracking-tight text-sm"
            />
          ) : (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm font-semibold text-amber-800">
              Navigation is locked until this place has a seated-toilet signal.
            </div>
          )}
        </div>
      </section>

      <section className="px-6 mt-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-brand-dark">Community reports</h2>
            <p className="mt-1 text-xs text-muted-foreground">Traveler feedback for this place.</p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            {reports.length}
          </span>
        </div>

        {reports.length > 0 ? (
          <ul className="mt-4 divide-y divide-border">
            {reports.map((report) => (
              <li key={report.id} className="py-4 text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">
                        {report.type.replace(/_/g, " ")}
                      </p>
                      {report.isComplaint && (
                        <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          Complaint
                        </span>
                      )}
                    </div>
                    {report.rating ? (
                      <span
                        className="mt-2 inline-flex items-center gap-0.5 text-amber-400"
                        aria-label={`${report.rating} out of 5`}
                      >
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`size-3 ${
                              index < report.rating! ? "fill-current" : "text-muted-foreground/25"
                            }`}
                            aria-hidden
                          />
                        ))}
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-muted-foreground transition hover:text-primary"
                    aria-label="Share this report"
                  >
                    <Share2 className="size-4" aria-hidden />
                  </button>
                </div>
                {report.notes && (
                  <p className="mt-2 text-sm leading-relaxed text-foreground">{report.notes}</p>
                )}
                {report.photoUrls.length > 0 && (
                  <ul className="mt-3 grid grid-cols-3 gap-2">
                    {report.photoUrls.map((url) => (
                      <li key={url} className="overflow-hidden rounded-md bg-surface">
                        <img src={url} alt="" className="aspect-square w-full object-cover" />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-border p-4 text-sm leading-relaxed text-muted-foreground">
            No reports yet. If you visit this restroom, report whether it has a seated toilet,
            paper, or access issues.
          </p>
        )}
      </section>
    </AppShell>
  );
}
