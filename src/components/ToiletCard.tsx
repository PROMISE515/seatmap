import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Accessibility, Baby, Bookmark, Building2, MapPin, Toilet } from "lucide-react";
import type { ToiletDTO, ToiletKind } from "@/lib/amap";
import { MapNavigationSheet } from "@/components/MapNavigationSheet";
import { isToiletSaved, saveToilet } from "@/lib/saved-toilets";
import { type TranslationKey, useT } from "@/lib/i18n";

type CardToilet = ToiletDTO & { topRated?: boolean };

const KIND_META: Record<
  ToiletKind,
  { labelKey: TranslationKey; Icon: typeof Toilet; tone: string }
> = {
  indoor: { labelKey: "card.indoor", Icon: Building2, tone: "bg-primary/10 text-primary" },
  accessible: {
    labelKey: "card.accessible",
    Icon: Accessibility,
    tone: "bg-sky-500/10 text-sky-600",
  },
  nursery: { labelKey: "card.nursery", Icon: Baby, tone: "bg-pink-500/10 text-pink-600" },
  public: { labelKey: "card.public", Icon: Toilet, tone: "bg-muted text-muted-foreground" },
};

export function ToiletCard({
  toilet,
  showDistance = true,
  allowNavigation = toilet.canNavigate,
}: {
  toilet: CardToilet;
  showDistance?: boolean;
  allowNavigation?: boolean;
}) {
  const { t } = useT();
  const meta = KIND_META[toilet.kind];
  const Icon = meta.Icon;
  const [saved, setSaved] = useState(false);

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

  return (
    <article className="rounded-2xl bg-card border border-border p-4 shadow-sm">
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${meta.tone}`}
            >
              <Icon className="size-3" aria-hidden />
              {t(meta.labelKey)}
            </span>
            {toilet.floor && (
              <span className="px-2 py-0.5 rounded-md bg-surface border border-border text-[10px] font-bold text-muted-foreground tabular-nums">
                {toilet.floor}
              </span>
            )}
            {toilet.topRated && (
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                {t("card.topRated")}
              </span>
            )}
            {toilet.duplicateCount && (
              <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                {t("card.entries", toilet.duplicateCount)}
              </span>
            )}
            {toilet.seatedConfidence !== "confirmed" && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                {t("card.needsConfirmation")}
              </span>
            )}
          </div>

          <h3 className="font-bold text-card-foreground truncate mt-1.5">{toilet.name}</h3>

          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <MapPin className="size-3 shrink-0" aria-hidden />
            <span className="leading-snug">
              {showDistance ? t("card.away", toilet.distanceM) : toilet.address || toilet.city}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        {allowNavigation ? (
          <MapNavigationSheet
            toilet={toilet}
            triggerLabel={t("card.navigate")}
            triggerClassName="w-full inline-flex items-center justify-center gap-2 py-3 bg-brand-dark text-primary-foreground rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.99] transition"
          />
        ) : (
          <button
            type="button"
            disabled
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-muted text-muted-foreground rounded-xl text-xs font-bold uppercase tracking-widest cursor-not-allowed"
          >
            {showDistance ? t("card.needsSeated") : t("card.useLocation")}
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          className={`inline-flex size-11 items-center justify-center rounded-xl border transition ${
            saved
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
          }`}
          aria-label={saved ? t("card.savedToilet") : t("card.saveToilet")}
          aria-pressed={saved}
        >
          <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} aria-hidden />
        </button>
      </div>
    </article>
  );
}
