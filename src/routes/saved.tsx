import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Trash2 } from "lucide-react";
import type { PointerEvent } from "react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ToiletCard } from "@/components/ToiletCard";
import type { ToiletDTO } from "@/lib/amap";
import { getSavedToilets, removeSavedToilet } from "@/lib/saved-toilets";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [{ title: "Saved Toilets — SeatMap" }, { name: "robots", content: "noindex" }],
  }),
  component: SavedPage,
});

function SavedPage() {
  const [saved, setSaved] = useState<ToiletDTO[]>([]);

  useEffect(() => {
    setSaved(getSavedToilets());
  }, []);

  const remove = (id: string) => {
    removeSavedToilet(id);
    setSaved(getSavedToilets());
  };

  return (
    <AppShell>
      <header className="px-6 pt-8 pb-2">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <Bookmark className="size-4" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-brand-dark">
              Saved on this device
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Temporary places kept in this browser only.
            </p>
          </div>
        </div>
      </header>

      <section className="px-6 mt-6 space-y-4">
        {saved.length > 0 ? (
          saved.map((toilet) => (
            <SwipeSavedItem key={toilet.id} toilet={toilet} onRemove={() => remove(toilet.id)} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-card">
            <p className="text-sm text-muted-foreground">
              No saved places on this device yet. Saved items stay in this browser and are not
              synced across phones or browsers.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              Search nearby
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function SwipeSavedItem({ toilet, onRemove }: { toilet: ToiletDTO; onRemove: () => void }) {
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const offset = dragStartX === null ? (open ? -88 : 0) : dragOffset;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    setDragStartX(event.clientX);
    setDragOffset(open ? -88 : 0);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartX === null) return;
    const base = open ? -88 : 0;
    const next = Math.min(0, Math.max(-96, base + event.clientX - dragStartX));
    setDragOffset(next);
  };

  const handlePointerEnd = () => {
    if (dragStartX === null) return;
    setOpen(dragOffset < -44);
    setDragStartX(null);
    setDragOffset(0);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-red-600">
      <button
        type="button"
        onClick={onRemove}
        className="absolute inset-y-0 right-0 flex w-24 items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white"
      >
        <Trash2 className="size-4" aria-hidden />
        Delete
      </button>
      <div
        className="relative touch-pan-y bg-red-600 transition-transform duration-150 ease-out"
        style={{
          transform: `translateX(${offset}px)`,
          transitionDuration: dragStartX === null ? undefined : "0ms",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
      >
        <ToiletCard toilet={toilet} />
      </div>
    </div>
  );
}
