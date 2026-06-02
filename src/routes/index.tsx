import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Bookmark, Loader2, MapPin, Search, Share2 } from "lucide-react";
import { toast } from "sonner";
import { findNearbyToilets } from "@/lib/toilets.functions";
import { verifyPassSession } from "@/lib/payments.functions";
import {
  claimShareReferral,
  ensureShareReferral,
  getShareReferralCredits,
} from "@/lib/share.functions";
import type { ToiletDTO } from "@/lib/amap";
import { wgs84ToGcj02 } from "@/lib/amap";
import { AppShell } from "@/components/AppShell";
import { ToiletCard } from "@/components/ToiletCard";
import { MapPreview } from "@/components/MapPreview";
import { SeatMapLogo } from "@/components/SeatMapLogo";
import { StripeEmbeddedCheckout, PaymentTestModeBanner } from "@/components/StripeEmbeddedCheckout";
import { getStoredValue, setStoredValue } from "@/lib/client-storage";
import { cities } from "@/lib/cities";
import { useT } from "@/lib/i18n";
import { getStripeEnvironment } from "@/lib/stripe";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  codeSplitGroupings: [["loader", "component"]],
  head: () => ({
    meta: [
      { title: "SeatMap — Find a seated toilet nearby in China" },
      {
        name: "description",
        content:
          "SeatMap helps foreign travelers find nearby seated toilets in China in 10 seconds. Fast, calm, reliable.",
      },
      { property: "og:title", content: "SeatMap — Find a seated toilet nearby in China" },
      {
        property: "og:description",
        content: "A calm safety button for travelers in China. Find a seated toilet, fast.",
      },
    ],
    links: [{ rel: "canonical", href: "https://swift-restroom-finder.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://swift-restroom-finder.lovable.app/#organization",
              name: "SeatMap",
              url: "https://swift-restroom-finder.lovable.app",
            },
            {
              "@type": "WebSite",
              "@id": "https://swift-restroom-finder.lovable.app/#website",
              url: "https://swift-restroom-finder.lovable.app",
              name: "SeatMap",
              description: "Find nearby seated toilets in China for travelers.",
              publisher: { "@id": "https://swift-restroom-finder.lovable.app/#organization" },
            },
          ],
        }),
      },
    ],
  }),
  component: HomePage,
});

type Status = "idle" | "locating" | "ready" | "unsupported" | "location_error";

const SEARCH_COUNT_KEY = "seatmap.search.count";
const PASS_EXPIRES_AT_KEY = "seatmap.pass.expiresAt";
const PASS_SESSION_KEY = "seatmap.pass.sid";
const SHARE_BONUS_KEY = "seatmap.share.freeCredits";
const SHARE_REFERRAL_CODE_KEY = "seatmap.share.referralCode";
const SHARE_VISITOR_ID_KEY = "seatmap.share.visitorId";
const SHARE_PARAM = "seatmap_ref";

const PASS_PLANS = [
  {
    days: 7,
    price: "$0.99",
    priceId: "travel_pass_7_price",
  },
  {
    days: 15,
    price: "$1.69",
    priceId: "travel_pass_15_price",
    savingsPercent: 20,
  },
  {
    days: 30,
    price: "$2.99",
    priceId: "travel_pass_30_price",
    savingsPercent: 30,
    best: true,
  },
];

function friendlySearchError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (/not configured|Missing Supabase|environment variable/i.test(message)) {
    return "Search is not configured yet. Add the required service keys and try again.";
  }
  if (/fetch failed|AMap request failed|AMap HTTP|AMap error/i.test(message)) {
    return "Live search is temporarily unavailable. Check the AMap service key or network, then try again.";
  }
  return message || "Search failed. Please try again.";
}

function geolocationErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return "Location permission was denied. Allow location in your browser, then try again.";
  }
  if (error.code === error.POSITION_UNAVAILABLE) {
    return "Your current location is unavailable. Check network/location services, then try again.";
  }
  if (error.code === error.TIMEOUT) {
    return "Location timed out. Try again, or choose an opened city for testing.";
  }
  return "Location failed. Try again, or choose an opened city for testing.";
}

function OpenedCityLinks() {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground hover:border-primary/40 hover:text-primary"
      >
        {t("home.viewOpenedCities")}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[360px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold tracking-tight text-brand-dark">
              {t("home.openedCities")}
            </DialogTitle>
            <DialogDescription>{t("home.openedCitiesDescription")}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            {cities.map((city) => (
              <Link
                key={city.slug}
                to="/$city/public-toilets"
                params={{ city: city.slug }}
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold text-foreground hover:border-primary/40 hover:text-primary"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function freeSearchLimit() {
  return 1 + Math.max(0, Number(getStoredValue(SHARE_BONUS_KEY) || "0"));
}

function createShareToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replaceAll("-", "");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`.padEnd(16, "0");
}

function getOrCreateStoredToken(key: string) {
  const existing = getStoredValue(key);
  if (existing) return existing;
  const token = createShareToken();
  setStoredValue(key, token);
  return token;
}

async function copyShareLink(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!copied) throw new Error("Copy failed");
}

function HomePage() {
  const { t } = useT();
  const [status, setStatus] = useState<Status>("idle");
  const [showPaywall, setShowPaywall] = useState(false);
  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);
  const [toilets, setToilets] = useState<ToiletDTO[]>([]);
  const [region, setRegion] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; label: string } | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [supportedRegions, setSupportedRegions] = useState("Shanghai, Beijing and Qingdao");
  const findNearby = useServerFn(findNearbyToilets);
  const ensureReferral = useServerFn(ensureShareReferral);
  const claimReferral = useServerFn(claimShareReferral);
  const getReferralCredits = useServerFn(getShareReferralCredits);
  const verifyPass = useServerFn(verifyPassSession);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const referralCode = url.searchParams.get(SHARE_PARAM);
    const ownCode = getStoredValue(SHARE_REFERRAL_CODE_KEY);

    if (referralCode) {
      url.searchParams.delete(SHARE_PARAM);
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);

      if (referralCode !== ownCode) {
        const visitorId = getOrCreateStoredToken(SHARE_VISITOR_ID_KEY);
        void claimReferral({ data: { code: referralCode, visitorId } })
          .then((result) => {
            if (result.claimed) {
              toast(t("home.openedSeatMap"), {
                description: t("home.friendEarned"),
              });
            }
          })
          .catch(() => {
            toast(t("home.rewardSaveFailed"), {
              description: t("home.rewardSaveFailedDescription"),
            });
          });
      }
    }

    if (ownCode) {
      void getReferralCredits({ data: { code: ownCode } })
        .then((result) => {
          const currentCredits = Math.max(0, Number(getStoredValue(SHARE_BONUS_KEY) || "0"));
          if (result.credits > currentCredits) {
            setStoredValue(SHARE_BONUS_KEY, String(result.credits));
            toast(t("home.freeSearchEarned"), {
              description: t("home.sharedSearches", result.credits),
            });
          }
        })
        .catch(() => undefined);
    }
  }, [claimReferral, getReferralCredits, t]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const passExpiresAt = Number(getStoredValue(PASS_EXPIRES_AT_KEY) || "0");
    if (passExpiresAt > Date.now()) return;

    const sessionId = getStoredValue(PASS_SESSION_KEY);
    if (!sessionId) return;

    void verifyPass({
      data: { sessionId, environment: getStripeEnvironment() },
    })
      .then((res) => {
        if (!res.valid || res.expired) return;
        setStoredValue(PASS_EXPIRES_AT_KEY, String(res.expiresAtMs));
        setStoredValue(PASS_SESSION_KEY, sessionId);
        setStoredValue(SEARCH_COUNT_KEY, "0");
      })
      .catch(() => undefined);
  }, [verifyPass]);

  const handleShare = async () => {
    if (typeof window === "undefined" || shareBusy) return;
    setShareBusy(true);

    const code = getOrCreateStoredToken(SHARE_REFERRAL_CODE_KEY);
    try {
      await ensureReferral({ data: { code } });
    } catch {
      toast(t("home.shareUnavailable"), {
        description: t("home.shareUnavailableDescription"),
      });
      return;
    }

    const url = new URL(window.location.origin);
    url.searchParams.set(SHARE_PARAM, code);
    const shareData = {
      title: "SeatMap",
      text: "Open my SeatMap invite link.",
      url: url.toString(),
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast(t("home.shareSent"), {
          description: t("home.shareEarnDescription"),
        });
      } else {
        await copyShareLink(shareData.url);
        toast(t("home.shareCopied"), {
          description: t("home.shareEarnDescription"),
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await copyShareLink(shareData.url);
        toast(t("home.shareCopied"), {
          description: t("home.shareEarnDescription"),
        });
      } catch {
        toast(t("home.shareFailed"), {
          description: t("home.shareFailedDescription"),
        });
      }
    } finally {
      setShareBusy(false);
    }
  };

  const runSearch = async (coords: { lat: number; lng: number; gcj: boolean }) => {
    setErrorMsg(null);
    const center = coords.gcj ? coords : wgs84ToGcj02(coords.lat, coords.lng);
    setMapCenter({ lat: center.lat, lng: center.lng, label: "You" });
    try {
      const res = await findNearby({ data: { ...coords, radius: 1000 } });
      setRegion(res.region ?? null);
      if (res.unsupported) {
        setToilets([]);
        setSupportedRegions(res.supportedRegions ?? "Shanghai, Beijing and Qingdao");
        setStatus("unsupported");
        return;
      }
      setToilets(res.toilets);
      setStatus("ready");
    } catch (e) {
      setErrorMsg(friendlySearchError(e));
      setStatus("ready");
    }
  };

  const handleFind = () => {
    if (typeof window === "undefined") return;

    const passExpiresAt = Number(getStoredValue(PASS_EXPIRES_AT_KEY) || "0");
    const hasActivePass = passExpiresAt > Date.now();

    if (!hasActivePass) {
      const count = Number(getStoredValue(SEARCH_COUNT_KEY) || "0");
      if (count >= freeSearchLimit()) {
        setShowPaywall(true);
        return;
      }
    }

    setStatus("locating");
    setToilets([]);
    setRegion(null);
    setMapCenter(null);
    setErrorMsg(null);
    const bump = () => {
      if (!hasActivePass) {
        const count = Number(getStoredValue(SEARCH_COUNT_KEY) || "0");
        setStoredValue(SEARCH_COUNT_KEY, String(count + 1));
      }
    };

    if (!navigator.geolocation) {
      setErrorMsg(
        "This browser does not support location. Search is only available in opened cities.",
      );
      setStatus("location_error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        bump();
        runSearch({ lat: pos.coords.latitude, lng: pos.coords.longitude, gcj: false });
      },
      (error) => {
        setErrorMsg(geolocationErrorMessage(error));
        setStatus("location_error");
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 8000 },
    );
  };

  return (
    <AppShell>
      {/* Header */}
      <header className="px-6 pt-8 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SeatMapLogo className="size-10 shrink-0" />
              <h1 className="text-xl font-extrabold tracking-tight text-brand-dark uppercase">
                SeatMap <span className="sr-only">— Find seated toilets nearby in China</span>
              </h1>
            </div>
            <p className="text-sm text-muted-foreground font-medium">{t("home.subtitle")}</p>
          </div>
          <Link
            to="/saved"
            className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:border-primary/40 hover:text-primary"
          >
            <Bookmark className="size-3" aria-hidden />
            {t("home.saved")}
          </Link>
        </div>
      </header>

      {/* Hero CTA */}
      <section className="px-6 mt-6">
        <button
          type="button"
          onClick={handleFind}
          disabled={status === "locating"}
          className="w-full bg-primary hover:bg-brand-dark text-primary-foreground py-6 rounded-2xl shadow-brand transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-2 disabled:opacity-80"
        >
          {status === "locating" ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden />
              <span className="text-lg font-bold tracking-tight">{t("home.locatingTitle")}</span>
              <span className="text-xs font-medium text-primary-foreground/80 uppercase tracking-widest">
                {t("home.locatingCaption")}
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 text-lg font-bold tracking-tight">
                {status === "location_error" ? (
                  <MapPin className="size-5" aria-hidden />
                ) : (
                  <Search className="size-5" aria-hidden />
                )}
                {status === "location_error" ? t("home.tryLocation") : t("home.findNearby")}
              </span>
              <span className="text-xs font-medium text-primary-foreground/80 uppercase tracking-widest">
                {status === "location_error" ? t("home.requestLocation") : t("home.searchRadius")}
              </span>
            </>
          )}
        </button>
      </section>

      {/* Map status */}
      <section className="px-6 mt-8">
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {t("home.mapCheck")}
          </h2>
          <span className="text-[10px] bg-secondary px-2 py-1 rounded text-secondary-foreground font-bold tracking-wider uppercase">
            {region
              ? `${region} · CN`
              : status === "idle"
                ? t("home.tapToLocate")
                : status === "locating"
                  ? t("home.checking")
                  : status === "location_error"
                    ? t("home.locationNeeded")
                    : t("home.openedCities")}
          </span>
        </div>
        {mapCenter ? (
          <MapPreview
            lat={mapCenter.lat}
            lng={mapCenter.lng}
            label={mapCenter.label === "You" ? t("home.you") : mapCenter.label}
            eyebrow={region ? `${region} · CN` : t("home.currentSearchArea")}
            title={
              status === "ready"
                ? t("home.openedResultsNearYou", toilets.length)
                : status === "unsupported"
                  ? t("home.areaNotOpen", region ?? t("home.thisArea"))
                  : t("home.checkingCity")
            }
            subtitle={
              status === "unsupported"
                ? `Opened cities: ${supportedRegions}`
                : t("home.mapPreviewCurrent")
            }
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="size-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-card-foreground">
                  {status === "location_error"
                    ? t("home.locationUnavailable")
                    : t("home.noMapBeforeLocation")}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {status === "location_error"
                    ? (errorMsg ?? t("home.turnOnLocation"))
                    : t("home.noMapHint")}
                </p>
              </div>
            </div>
          </div>
        )}
        {(status === "idle" || status === "location_error") && <OpenedCityLinks />}
      </section>

      {status !== "location_error" && (
        <section className="px-6 mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {status === "ready"
                ? t("home.nearestOptions")
                : status === "unsupported"
                  ? t("home.serviceNotOpen")
                  : t("home.readyWhen")}
            </h2>
            {status === "ready" && (
              <span className="text-[10px] font-medium text-muted-foreground">
                {t("home.sortedByDistance")}
              </span>
            )}
          </div>

          {status === "ready" ? (
            toilets.length > 0 ? (
              toilets.map((t) => <ToiletCard key={t.id} toilet={t} />)
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-card">
                <p className="text-sm text-muted-foreground">{errorMsg ?? t("home.noToilets")}</p>
              </div>
            )
          ) : status === "unsupported" ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-card">
              <p className="text-sm text-muted-foreground">
                {t("home.unsupported", region ?? "This area", supportedRegions)}
              </p>
              <Link
                to="/report"
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
              >
                {t("home.reportSeated")}
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-card">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("home.readyCopy").split("\n")[0]}
                <br />
                {t("home.readyCopy").split("\n")[1]}
              </p>
            </div>
          )}
        </section>
      )}

      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="max-w-[360px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold tracking-tight text-brand-dark">
              {t("home.paywallTitle")}
            </DialogTitle>
            <DialogDescription>{t("home.paywallDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 my-2">
            {PASS_PLANS.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => {
                  setShowPaywall(false);
                  setCheckoutPriceId(p.priceId);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition ${
                  p.best
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div>
                  <p className="font-bold">{p.days} days</p>
                  <p className="text-xs text-muted-foreground">
                    {t("home.unlimited")} · {t("home.days", p.days)}
                  </p>
                  {p.savingsPercent && (
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {t("home.saveAbout", p.savingsPercent)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-brand-dark">{p.price}</p>
                  {p.best && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {t("home.best")}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-extrabold text-brand-dark">{t("home.earnSearch")}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {t("home.shareExplain")}
            </p>
            <button
              type="button"
              onClick={handleShare}
              disabled={shareBusy}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10 disabled:opacity-70"
            >
              {shareBusy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Share2 className="size-4" aria-hidden />
              )}
              {shareBusy ? t("home.preparingLink") : t("home.shareButton")}
            </button>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <p className="text-[10px] text-center text-muted-foreground">{t("home.noAccount")}</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!checkoutPriceId} onOpenChange={(open) => !open && setCheckoutPriceId(null)}>
        <DialogContent className="max-w-[420px] p-0 rounded-3xl overflow-hidden">
          <PaymentTestModeBanner />
          <div className="p-2">
            {checkoutPriceId && <StripeEmbeddedCheckout priceId={checkoutPriceId} />}
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
