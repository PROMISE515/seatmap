import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Baby, Bookmark, Check, Lock, MapPin } from "lucide-react";
import type { ToiletDTO } from "@/lib/amap";
import { MapNavigationSheet } from "@/components/MapNavigationSheet";
import { saveCurrentHomeScroll } from "@/lib/home-scroll";
import { isToiletSaved, saveToilet } from "@/lib/saved-toilets";
import { useT } from "@/lib/i18n";

type CardToilet = ToiletDTO & { topRated?: boolean };

function WheelchairTagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="8" cy="5" r="2" />
      <path d="M9 8v5h5l3 5" />
      <path d="M8 13a5 5 0 1 0 5 5" />
      <path d="M7 10h5" />
    </svg>
  );
}

const TAG_META = {
  "Western Toilet": { Icon: Check, tone: "bg-primary/10 text-primary" },
  Accessible: { Icon: WheelchairTagIcon, tone: "bg-sky-500/10 text-sky-600" },
  Nursery: { Icon: Baby, tone: "bg-pink-500/10 text-pink-600" },
  Free: { Icon: Check, tone: "bg-emerald-500/10 text-emerald-700" },
};

const TAG_ORDER = ["Western Toilet", "Accessible", "Nursery", "Free"];

function displayTags(tags: string[]) {
  const set = new Set(tags);
  return TAG_ORDER.filter((tag) => set.has(tag));
}

export function ToiletCard({
  toilet,
  showDistance = true,
  allowNavigation = toilet.canNavigate,
  locked = false,
  onUnlock,
}: {
  toilet: CardToilet;
  showDistance?: boolean;
  allowNavigation?: boolean;
  locked?: boolean;
  onUnlock?: () => void;
}) {
  const { t } = useT();
  const [saved, setSaved] = useState(false);
  const tags = displayTags(toilet.tags);

  useEffect(() => {
    setSaved(isToiletSaved(toilet.id));
  }, [toilet.id]);

  const handleSave = () => {
    const result = saveToilet(toilet);
    setSaved(true);
    toast(result.alreadySaved ? t("card.alreadySaved") : t("card.saved"), {
      description: result.alreadySaved
        ? t("card.alreadySavedDescription")
        : t("card.savedDescription"),
      action: {
        label: t("card.view"),
        onClick: () => {
          window.location.href = "/saved";
        },
      },
    });
  };

  const primaryTag = tags[0] ?? t("card.likelyWestern");

  return (
    <article
      className={`relative overflow-hidden rounded-2xl bg-card border border-border p-4 shadow-sm ${
        locked ? "cursor-pointer" : ""
      }`}
      onClick={locked ? onUnlock : undefined}
      onPointerDown={locked ? undefined : saveCurrentHomeScroll}
    >
      <div className="flex items-start gap-4">
        {/* Distance hero */}
        <div className="shrink-0 w-16 text-center">
          {showDistance ? (
            <>
              <div className="text-2xl font-extrabold leading-none text-brand-dark tabular-nums">
                {toilet.walkMin}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                {t("card.minWalk")}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                {toilet.distanceM}m
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-extrabold leading-none text-brand-dark">
                {t("card.city")}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                {t("card.preview")}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 min-w-0 pr-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {locked ? (
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                {primaryTag}
              </span>
            ) : (
              <>
                {tags.map((tag) => {
                  const meta = TAG_META[tag as keyof typeof TAG_META];
                  const Icon = meta.Icon;
                  return (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${meta.tone}`}
                    >
                      <Icon className="size-3" aria-hidden />
                      {tag}
                    </span>
                  );
                })}
                {toilet.topRated && (
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    {t("card.topRated")}
                  </span>
                )}
              </>
            )}
          </div>

          {locked ? (
            <>
              <h3 className="font-bold text-card-foreground truncate mt-1.5 select-none blur-sm">
                Premium location
              </h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="size-3 shrink-0" aria-hidden />
                <span className="leading-snug">
                  {showDistance
                    ? t("card.away", toilet.distanceM)
                    : toilet.city || t("card.previewVenue")}
                </span>
              </p>
            </>
          ) : (
            <Link
              to="/toilet/$id"
              params={{ id: toilet.id }}
              onClick={saveCurrentHomeScroll}
              className="mt-1.5 block rounded-lg -mx-1 px-1 py-0.5 transition hover:bg-primary/5"
            >
              <h3 className="font-bold text-card-foreground truncate">{toilet.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="size-3 shrink-0" aria-hidden />
                <span className="leading-snug">
                  {showDistance
                    ? t("card.away", toilet.distanceM)
                    : toilet.city || t("card.previewVenue")}
                </span>
              </p>
            </Link>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={locked ? undefined : handleSave}
        disabled={locked}
        className={`absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-xl border transition ${
          saved
            ? "border-primary/30 bg-primary/10 text-primary"
            : locked
              ? "border-border bg-card text-muted-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
        }`}
        aria-label={saved ? t("card.savedToilet") : t("card.saveToilet")}
        aria-pressed={saved}
      >
        <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} aria-hidden />
      </button>

      <div className={`mt-3 ${locked ? "blur-sm" : ""}`}>
        {allowNavigation && !locked ? (
          <MapNavigationSheet
            toilet={toilet}
            triggerLabel={t("card.navigate")}
            triggerClassName="w-full inline-flex items-center justify-center gap-2 py-3 bg-brand-dark text-primary-foreground rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.99] transition"
          />
        ) : (
          <button
            type="button"
            disabled
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-muted text-muted-foreground rounded-lg text-xs font-bold uppercase tracking-widest cursor-not-allowed"
          >
            {showDistance ? t("card.needsSeated") : t("card.useLocation")}
          </button>
        )}
      </div>
      {locked && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onUnlock?.();
          }}
          className="absolute inset-x-4 bottom-4 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-dark px-4 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-sm"
        >
          <Lock className="size-4" aria-hidden />
          {t("card.unlockResults")}
        </button>
      )}
    </article>
  );
}
