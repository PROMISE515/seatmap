import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Trash2 } from "lucide-react";
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
            <div key={toilet.id} className="space-y-2">
              <ToiletCard toilet={toilet} />
              <button
                type="button"
                onClick={() => remove(toilet.id)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground"
              >
                <Trash2 className="size-3.5" aria-hidden />
                Remove
              </button>
            </div>
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
