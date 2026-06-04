import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Flag, ImagePlus, Loader2, Siren, Star, X } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { submitToiletReport } from "@/lib/reports.functions";

type PendingPhoto = {
  name: string;
  dataUrl: string;
};

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
  const [savingComplaint, setSavingComplaint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);

  const saveReport = async (options: { isComplaint: boolean }) => {
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
          isComplaint: options.isComplaint,
          photoDataUrls: photos.map((photo) => photo.dataUrl),
        },
      });
      setNotes("");
      setType("confirmed_seated");
      setRating(5);
      setPhotos([]);
      setSaved(true);
    } catch {
      setError("Could not save this report. Please check Supabase setup and try again.");
    } finally {
      setSaving(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await saveReport({ isComplaint: false });
  };

  const submitComplaint = async () => {
    if (!placeName.trim()) {
      setError("Add a place name before filing a complaint.");
      return;
    }
    setSavingComplaint(true);
    const originalType = type;
    const originalRating = rating;
    setType("wrong_listing");
    setRating(1);
    try {
      await submitReport({
        data: {
          amapId,
          placeName,
          type: "wrong_listing",
          rating: 1,
          notes: notes || "Complaint: this place does not have a seated toilet.",
          isComplaint: true,
          photoDataUrls: photos.map((photo) => photo.dataUrl),
        },
      });
      setNotes("");
      setPhotos([]);
      setSaved(true);
      setError(null);
    } catch {
      setType(originalType);
      setRating(originalRating);
      setError("Could not file this complaint. Please check Supabase setup and try again.");
    } finally {
      setSavingComplaint(false);
    }
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])].slice(0, Math.max(0, 3 - photos.length));
    if (files.length === 0) return;

    const nextPhotos = await Promise.all(
      files.map(
        (file) =>
          new Promise<PendingPhoto | null>((resolve) => {
            if (!file.type.startsWith("image/") || file.size > 3_000_000) {
              resolve(null);
              return;
            }
            const reader = new FileReader();
            reader.onload = () =>
              resolve(
                typeof reader.result === "string"
                  ? { name: file.name, dataUrl: reader.result }
                  : null,
              );
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          }),
      ),
    );

    setPhotos((current) =>
      [...current, ...nextPhotos.filter((photo): photo is PendingPhoto => Boolean(photo))].slice(
        0,
        3,
      ),
    );
    event.target.value = "";
  };

  return (
    <AppShell>
      <header className="px-6 pt-6 pb-2">
        <div className="mb-5">
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

        <div className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Photos
          </span>
          <label className="mt-2 flex min-h-20 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary">
            <ImagePlus className="size-4" aria-hidden />
            Add photos
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="sr-only"
              onChange={handlePhotoChange}
              disabled={photos.length >= 3}
            />
          </label>
          {photos.length > 0 && (
            <ul className="mt-2 grid grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                <li
                  key={`${photo.name}-${index}`}
                  className="relative overflow-hidden rounded-md bg-surface"
                >
                  <img src={photo.dataUrl} alt="" className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))
                    }
                    className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"
                    aria-label="Remove photo"
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

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

        <button
          type="button"
          onClick={submitComplaint}
          disabled={savingComplaint}
          className="mx-auto inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground transition hover:text-foreground disabled:opacity-60"
        >
          {savingComplaint ? (
            <Loader2 className="size-[11px] animate-spin text-red-600" aria-hidden />
          ) : (
            <Siren className="size-[11px] text-red-600" aria-hidden />
          )}
          {savingComplaint ? "Filing complaint" : "Report this place"}
        </button>
      </form>
    </AppShell>
  );
}
