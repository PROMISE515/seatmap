import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Siren } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useT } from "@/lib/i18n";
import { submitPlaceComplaint } from "@/lib/reports.functions";

type ComplaintReason = "no_seated_toilet" | "no_nursery_room";

export const Route = createFileRoute("/complaint")({
  validateSearch: (search: Record<string, unknown>): { place?: string; amapId?: string } => ({
    place: typeof search.place === "string" ? search.place : undefined,
    amapId: typeof search.amapId === "string" ? search.amapId : undefined,
  }),
  head: () => ({
    meta: [{ title: "Report this place — SeatMap" }, { name: "robots", content: "noindex" }],
  }),
  component: ComplaintPage,
});

function getCurrentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 15000,
    });
  });
}

function ComplaintPage() {
  const { place, amapId } = Route.useSearch();
  const { t } = useT();
  const submitComplaint = useServerFn(submitPlaceComplaint);
  const [reason, setReason] = useState<ComplaintReason>("no_seated_toilet");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!place?.trim()) {
      setError(t("complaint.placeNameNeeded"));
      return;
    }
    if (!amapId) {
      setError(t("complaint.missingPlace"));
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const position = await getCurrentPosition();
      const result = await submitComplaint({
        data: {
          amapId,
          placeName: place,
          reason,
          description,
          userLat: position.coords.latitude,
          userLng: position.coords.longitude,
        },
      });

      if (!result.ok) {
        setError(
          result.reason === "out_of_range"
            ? t("complaint.outOfRange")
            : t("complaint.missingPlace"),
        );
        return;
      }

      setMessage(t("complaint.thanks"));
      setDescription("");
    } catch {
      setError(t("complaint.locationNeeded"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <header className="px-6 pt-6 pb-2">
        <Link
          to={amapId ? "/report" : "/"}
          search={amapId ? { place, amapId } : undefined}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Link>
        <div className="mt-5 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-lg bg-red-600/10 text-red-600">
            <Siren className="size-4" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-brand-dark">
              {t("complaint.title")}
            </h1>
            {place && <p className="text-sm font-medium text-muted-foreground">{place}</p>}
          </div>
        </div>
      </header>

      <section className="px-6 mt-6 space-y-5">
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {t("complaint.reason")}
          </legend>
          <div className="mt-3 grid gap-2">
            {[
              ["no_seated_toilet", t("complaint.noSeated")],
              ["no_nursery_room", t("complaint.noNursery")],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setReason(value as ComplaintReason)}
                className={`rounded-lg border px-4 py-3 text-left text-sm font-bold transition ${
                  reason === value
                    ? "border-red-600 bg-red-600/10 text-red-700"
                    : "border-border bg-card text-foreground hover:border-red-600/40"
                }`}
                aria-pressed={reason === value}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {t("complaint.description")}
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t("complaint.descriptionPlaceholder")}
            className="mt-2 min-h-32 w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <p className="text-xs leading-relaxed text-muted-foreground">{t("complaint.helper")}</p>

        {message && (
          <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            {error}
          </p>
        )}
      </section>

      <div className="h-28" aria-hidden />
      <section className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[420px] bg-background/95 px-6 pb-5 pt-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-4 text-sm font-extrabold uppercase tracking-widest text-white shadow-sm disabled:opacity-70"
        >
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {saving ? t("complaint.submitting") : t("complaint.submit")}
        </button>
      </section>
    </AppShell>
  );
}
