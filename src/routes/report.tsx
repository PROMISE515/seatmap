import { createFileRoute } from "@tanstack/react-router";
import { Flag } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { saveReport } from "@/lib/reports";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [{ title: "Report a Toilet — SeatMap" }, { name: "robots", content: "noindex" }],
  }),
  component: ReportPage,
});

function ReportPage() {
  const [placeName, setPlaceName] = useState("");
  const [type, setType] = useState<"confirmed_seated" | "wrong_listing" | "closed" | "other">(
    "confirmed_seated",
  );
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    saveReport({ placeName, type, notes });
    setPlaceName("");
    setNotes("");
    setType("confirmed_seated");
    setSaved(true);
  };

  return (
    <AppShell>
      <header className="px-6 pt-8 pb-2">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
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
            className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Report type
          </span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as typeof type)}
            className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          >
            <option value="confirmed_seated">Has seated toilet</option>
            <option value="wrong_listing">No seated toilet</option>
            <option value="closed">Closed or inaccessible</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Notes
          </span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Floor, nearby landmark, entry notes, cleanliness, paper availability..."
            className="mt-2 min-h-28 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        {saved && (
          <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
            Saved locally. We can sync these to Supabase review later.
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-2xl bg-primary py-4 text-sm font-extrabold uppercase tracking-widest text-primary-foreground shadow-brand"
        >
          Save report
        </button>
      </form>
    </AppShell>
  );
}
