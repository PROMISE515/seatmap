import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Flag, Loader2, Star } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { submitToiletReport } from "@/lib/reports.functions";

export const Route = createFileRoute("/report")({
  validateSearch: (search: Record<string, unknown>): { place?: string; amapId?: string } => ({
    place: typeof search.place === "string" ? search.place : undefined,
    amapId: typeof search.amapId === "string" ? search.amapId : undefined,
  }),
  head: () => ({
    meta: [{ title: "Report a Toilet — SeatMap" }, { name: "robots", content: "noindex" }],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { place, amapId } = Route.useSearch();
  const submitReport = useServerFn(submitToiletReport);
  const [placeName, setPlaceName] = useState(place ?? "");
  const [type, setType] = useState<"confirmed_seated" | "wrong_listing" | "closed" | "other">(
    "confirmed_seated",
  );
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await submitReport({
        data: {
          amapId,
          placeName,
          type,
          rating,
          notes,
        },
      });
      setNotes("");
      setType("confirmed_seated");
      setRating(5);
      setSaved(true);
    } catch {
      setError("Could not save this report. Please check Supabase setup and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <header className="px-6 pt-6 pb-2">
        <div className="mb-5 flex items-center justify-between">
          {amapId ? (
            <Link
              to="/toilet/$id"
              params={{ id: amapId }}
              className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
            <Flag className="size-4" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-brand-dark">Report</h1>
            <p className="text-sm text-muted-foreground font-medium">
              Help build the confirmed seated-toilet list.
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={submit} className="px-6 mt-6 space-y-4">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Place name
          </span>
          <input
            value={placeName}
            onChange={(event) => setPlaceName(event.target.value)}
            required
            placeholder="Mall, hotel, accessible restroom, or address"
            className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Report type
          </span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as typeof type)}
            className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          >
            <option value="confirmed_seated">Has seated toilet</option>
            <option value="wrong_listing">No seated toilet</option>
            <option value="closed">Closed or inaccessible</option>
            <option value="other">Other</option>
          </select>
        </label>

        <fieldset className="block">
          <legend className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Rating
          </legend>
          <div className="mt-2 flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1;
              const active = value <= rating;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`grid size-10 place-items-center rounded-md transition ${
                    active ? "text-amber-400" : "text-muted-foreground/40 hover:text-amber-300"
                  }`}
                  aria-label={`${value} out of 5`}
                  aria-pressed={rating === value}
                >
                  <Star className={`size-5 ${active ? "fill-current" : ""}`} aria-hidden />
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Notes
          </span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Floor, nearby landmark, entry notes, cleanliness, paper availability..."
            className="mt-2 min-h-28 w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        {saved && (
          <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
            Report saved. Thank you for helping other travelers.
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 text-sm font-extrabold uppercase tracking-widest text-primary-foreground shadow-brand disabled:opacity-70"
        >
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {saving ? "Saving" : "Save report"}
        </button>
      </form>
    </AppShell>
  );
}
