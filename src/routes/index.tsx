import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Baby, Loader2, MapPin, Search, Share2 } from "lucide-react";
import { toast } from "sonner";
import { filterBlacklistedToiletIds, findNearbyToilets } from "@/lib/toilets.functions";
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
import { SeatMapLogo } from "@/components/SeatMapLogo";
import { StripeEmbeddedCheckout, PaymentTestModeBanner } from "@/components/StripeEmbeddedCheckout";
import { getStoredValue, removeStoredValue, setStoredValue } from "@/lib/client-storage";
import {
  consumeHomeScrollRestoreRequest,
  getCurrentPageScrollY,
  getHomeScrollRoot,
  readHomeScrollY,
  restoreHomeScrollY,
  writeHomeScrollY,
} from "@/lib/home-scroll";
import { type TranslationKey, useT } from "@/lib/i18n";
import { getStripeEnvironmentForSessionId } from "@/lib/stripe";
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
      { title: "SeatMap — Find a western toilet nearby in China" },
      {
        name: "description",
        content:
          "SeatMap helps foreign travelers find nearby seated toilets in China in 10 seconds. Fast, calm, reliable.",
      },
      { property: "og:title", content: "SeatMap — Find a western toilet nearby in China" },
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

type Status = "idle" | "checking" | "locating" | "ready" | "unsupported" | "location_error";
type SearchMode = "toilet" | "nursery";

const SEARCH_COUNT_KEY = "seatmap.search.count";
const PASS_EXPIRES_AT_KEY = "seatmap.pass.expiresAt";
const PASS_SESSION_KEY = "seatmap.pass.sid";
const SHARE_BONUS_KEY = "seatmap.share.freeCredits";
const SHARE_REFERRAL_CODE_KEY = "seatmap.share.referralCode";
const SHARE_VISITOR_ID_KEY = "seatmap.share.visitorId";
const LAST_SEARCH_STATE_KEY = "seatmap.lastSearchState.v4";
const OLD_LAST_SEARCH_STATE_KEYS = [
  "seatmap.lastSearchState",
  "seatmap.lastSearchState.v2",
  "seatmap.lastSearchState.v3",
];
const SHARE_PARAM = "seatmap_ref";
const LAST_SEARCH_MAX_AGE_MS = 30 * 60 * 1000;

const PASS_PLANS = [
  {
    days: 7,
    label: "7 days",
    price: "$2.99",
    priceId: "travel_pass_7_price",
  },
  {
    days: 14,
    label: "14 days",
    price: "$3.99",
    priceId: "travel_pass_14_price",
    savingsPercent: 33,
    best: true,
  },
  {
    days: 36500,
    label: "Lifetime",
    price: "$19.99",
    priceId: "travel_pass_lifetime_price",
  },
];

type Translate = (key: TranslationKey, ...args: Array<string | number>) => string;

function friendlySearchError(error: unknown, t: Translate) {
  const message = error instanceof Error ? error.message : "";
  if (/not configured|Missing Supabase|environment variable/i.test(message)) {
    return t("home.searchNotConfigured");
  }
  if (/fetch failed|AMap request failed|AMap HTTP|AMap error/i.test(message)) {
    return t("home.searchUnavailable");
  }
  return message || t("home.searchFailed");
}

function geolocationErrorMessage(error: GeolocationPositionError, t: Translate) {
  if (error.code === error.PERMISSION_DENIED) {
    return t("home.locationDenied");
  }
  if (error.code === error.POSITION_UNAVAILABLE) {
    return t("home.locationUnavailableDetailed");
  }
  if (error.code === error.TIMEOUT) {
    return t("home.locationTimeout");
  }
  return t("home.locationFailed");
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

type LastSearchState = {
  savedAt: number;
  status: Extract<Status, "ready" | "unsupported" | "location_error">;
  searchMode: SearchMode;
  toilets: ToiletDTO[];
  region: string | null;
  mapCenter: { lat: number; lng: number; label: string } | null;
  errorMsg: string | null;
  supportedRegions: string;
};

function readLastSearchState(): LastSearchState | null {
  const raw = getStoredValue(LAST_SEARCH_STATE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<LastSearchState>;
    if (!parsed.savedAt || Date.now() - parsed.savedAt > LAST_SEARCH_MAX_AGE_MS) return null;
    if (!Array.isArray(parsed.toilets)) return null;
    return {
      savedAt: parsed.savedAt,
      status:
        parsed.status === "unsupported" || parsed.status === "location_error"
          ? parsed.status
          : "ready",
      searchMode: parsed.searchMode === "nursery" ? "nursery" : "toilet",
      toilets: parsed.toilets,
      region: parsed.region ?? null,
      mapCenter: parsed.mapCenter ?? null,
      errorMsg: parsed.errorMsg ?? null,
      supportedRegions: parsed.supportedRegions ?? "Shanghai, Beijing and Qingdao",
    };
  } catch {
    return null;
  }
}

function writeLastSearchState(state: Omit<LastSearchState, "savedAt">) {
  setStoredValue(LAST_SEARCH_STATE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
}

function hasDirtyDisplayName(name: string) {
  const cleaned = name
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")")
    .replace(/^\(([^)]+)\)$/g, "$1")
    .replace(/^[\s/\\._·,-]+/g, "")
    .replace(/[\s/\\._·,-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return true;
  if (/[\u3400-\u9fff]/.test(cleaned)) return true;
  return /^(nursery room|baby care|family room|restroom|bathroom|toilet|public toilet|shopping mall|mall|plaza|hotel|venue|traveler-friendly venue|traveler-friendly hotel|traveler-friendly mall)$/i.test(
    cleaned,
  );
}

function filterDisplayableToilets(toilets: ToiletDTO[]) {
  return toilets.filter((toilet) => !hasDirtyDisplayName(toilet.name));
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
  const [hasActivePass, setHasActivePass] = useState(false);
  const [passSessionId, setPassSessionId] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<
    "unknown" | "prompt" | "granted" | "denied"
  >("unknown");
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [pendingLocationMode, setPendingLocationMode] = useState<SearchMode>("toilet");
  const [supportedRegions, setSupportedRegions] = useState("Shanghai, Beijing and Qingdao");
  const [searchMode, setSearchMode] = useState<SearchMode>("toilet");
  const findNearby = useServerFn(findNearbyToilets);
  const filterBlacklisted = useServerFn(filterBlacklistedToiletIds);
  const ensureReferral = useServerFn(ensureShareReferral);
  const claimReferral = useServerFn(claimShareReferral);
  const getReferralCredits = useServerFn(getShareReferralCredits);
  const verifyPass = useServerFn(verifyPassSession);
  const shouldRestoreScrollRef = useRef(false);
  const restoredScrollRef = useRef(false);
  const isRestoringScrollRef = useRef(false);
  const restoreScrollTargetRef = useRef(0);
  const lastHomeScrollYRef = useRef(0);
  const scrollListenerMountedAtRef = useRef(0);

  useEffect(() => {
    OLD_LAST_SEARCH_STATE_KEYS.forEach(removeStoredValue);
    const lastSearch = readLastSearchState();
    const restoreRequested = consumeHomeScrollRestoreRequest();
    const scrollY = readHomeScrollY();
    lastHomeScrollYRef.current = scrollY;
    if (!lastSearch) {
      shouldRestoreScrollRef.current = restoreRequested && scrollY > 0;
      restoreScrollTargetRef.current = scrollY;
      isRestoringScrollRef.current = scrollY > 0;
      return;
    }
    shouldRestoreScrollRef.current = restoreRequested || scrollY > 0;
    restoreScrollTargetRef.current = scrollY;
    isRestoringScrollRef.current = scrollY > 0;
    setStatus(lastSearch.status);
    setToilets(filterDisplayableToilets(lastSearch.toilets));
    setRegion(lastSearch.region);
    setMapCenter(lastSearch.mapCenter);
    setErrorMsg(lastSearch.errorMsg);
    setSupportedRegions(lastSearch.supportedRegions);
    setSearchMode(lastSearch.searchMode);
  }, []);

  useEffect(() => {
    if (toilets.length === 0) return;
    let cancelled = false;

    const removeBlacklisted = async () => {
      try {
        const result = await filterBlacklisted({
          data: { ids: toilets.map((toilet) => toilet.id) },
        });
        if (cancelled || result.ids.length === 0) return;
        const blacklisted = new Set(result.ids);
        setToilets((current) => {
          const next = current.filter((toilet) => !blacklisted.has(toilet.id));
          if (next.length !== current.length) {
            writeLastSearchState({
              status: next.length > 0 ? "ready" : "unsupported",
              searchMode,
              toilets: next,
              region,
              mapCenter,
              errorMsg,
              supportedRegions,
            });
          }
          return next;
        });
      } catch {
        // Search already filters blacklist server-side; this pass only cleans stale local state.
      }
    };

    void removeBlacklisted();
    window.addEventListener("focus", removeBlacklisted);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", removeBlacklisted);
    };
  }, [errorMsg, filterBlacklisted, mapCenter, region, searchMode, supportedRegions, toilets]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;
    let cancelled = false;
    void navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((permission) => {
        if (cancelled) return;
        setLocationPermission(permission.state);
        permission.onchange = () => setLocationPermission(permission.state);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const scrollRoot = getHomeScrollRoot() ?? window;
    let pending = false;
    scrollListenerMountedAtRef.current = Date.now();

    const saveScroll = () => {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(() => {
        if (!isRestoringScrollRef.current) {
          const currentY = getCurrentPageScrollY();
          const mountedLongEnough = Date.now() - scrollListenerMountedAtRef.current > 1000;
          if (currentY > 0 || mountedLongEnough) {
            lastHomeScrollYRef.current = currentY;
            writeHomeScrollY(currentY);
          }
        }
        pending = false;
      });
    };

    scrollRoot.addEventListener("scroll", saveScroll, { passive: true });
    return () => {
      scrollRoot.removeEventListener("scroll", saveScroll);
      if (!isRestoringScrollRef.current) {
        writeHomeScrollY(lastHomeScrollYRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!shouldRestoreScrollRef.current || restoredScrollRef.current) return;
    if (status === "idle" || status === "checking" || status === "locating") return;

    const scrollY = restoreScrollTargetRef.current || readHomeScrollY();
    if (scrollY <= 0) return;
    restoredScrollRef.current = true;

    const restore = () => restoreHomeScrollY(scrollY);
    window.requestAnimationFrame(() => window.requestAnimationFrame(restore));
    const firstTimer = window.setTimeout(restore, 50);
    const secondTimer = window.setTimeout(restore, 150);
    const thirdTimer = window.setTimeout(restore, 350);
    const fourthTimer = window.setTimeout(() => {
      restore();
      isRestoringScrollRef.current = false;
      writeHomeScrollY(scrollY);
    }, 700);

    return () => {
      window.clearTimeout(firstTimer);
      window.clearTimeout(secondTimer);
      window.clearTimeout(thirdTimer);
      window.clearTimeout(fourthTimer);
    };
  }, [mapCenter, status, toilets.length]);

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
    const storedSessionId = getStoredValue(PASS_SESSION_KEY);
    setPassSessionId(storedSessionId);
    if (passExpiresAt > Date.now()) {
      setHasActivePass(true);
      return;
    }

    const sessionId = storedSessionId;
    if (!sessionId) return;

    void verifyPass({
      data: { sessionId, environment: getStripeEnvironmentForSessionId(sessionId) },
    })
      .then((res) => {
        if (!res.valid || res.expired) {
          setHasActivePass(false);
          return;
        }
        setStoredValue(PASS_EXPIRES_AT_KEY, String(res.expiresAtMs));
        setStoredValue(PASS_SESSION_KEY, sessionId);
        setStoredValue(SEARCH_COUNT_KEY, "0");
        setPassSessionId(sessionId);
        setHasActivePass(true);
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
      title: t("home.shareTitle"),
      text: t("home.shareText"),
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

  const runSearch = async (
    coords: { lat: number; lng: number; gcj: boolean },
    mode: SearchMode,
  ) => {
    setErrorMsg(null);
    const center = coords.gcj ? coords : wgs84ToGcj02(coords.lat, coords.lng);
    setMapCenter({ lat: center.lat, lng: center.lng, label: "You" });
    try {
      const res = await findNearby({ data: { ...coords, radius: 20000, searchMode: mode } });
      const displayableToilets = filterDisplayableToilets(res.toilets);
      setRegion(res.region ?? null);
      if (res.unsupported) {
        setToilets([]);
        setSupportedRegions(res.supportedRegions ?? "");
        setErrorMsg(t("home.noToilets"));
        setStatus("ready");
        writeLastSearchState({
          status: "ready",
          searchMode: mode,
          toilets: [],
          region: res.region ?? null,
          mapCenter: center ? { lat: center.lat, lng: center.lng, label: "You" } : null,
          errorMsg: t("home.noToilets"),
          supportedRegions: res.supportedRegions ?? "",
        });
        return;
      }
      setToilets(displayableToilets);
      setStatus("ready");
      writeLastSearchState({
        status: "ready",
        searchMode: mode,
        toilets: displayableToilets,
        region: res.region ?? null,
        mapCenter: { lat: center.lat, lng: center.lng, label: "You" },
        errorMsg: null,
        supportedRegions,
      });
    } catch (e) {
      const message = friendlySearchError(e, t);
      setErrorMsg(message);
      setStatus("ready");
      writeLastSearchState({
        status: "ready",
        searchMode: mode,
        toilets: [],
        region: null,
        mapCenter: { lat: center.lat, lng: center.lng, label: "You" },
        errorMsg: message,
        supportedRegions,
      });
    }
  };

  const restorePassFromCheckout = async () => {
    const passExpiresAt = Number(getStoredValue(PASS_EXPIRES_AT_KEY) || "0");
    if (passExpiresAt > Date.now()) {
      setHasActivePass(true);
      return true;
    }

    const sessionId = getStoredValue(PASS_SESSION_KEY);
    if (!sessionId) return false;

    try {
      const res = await verifyPass({
        data: { sessionId, environment: getStripeEnvironmentForSessionId(sessionId) },
      });
      if (!res.valid || res.expired) {
        setHasActivePass(false);
        return false;
      }
      setStoredValue(PASS_EXPIRES_AT_KEY, String(res.expiresAtMs));
      setStoredValue(PASS_SESSION_KEY, sessionId);
      setStoredValue(SEARCH_COUNT_KEY, "0");
      setPassSessionId(sessionId);
      setHasActivePass(true);
      return true;
    } catch {
      setHasActivePass(false);
      return false;
    }
  };

  const startLocationSearch = async (mode: SearchMode) => {
    if (typeof window === "undefined") return;
    setSearchMode(mode);

    const passExpiresAt = Number(getStoredValue(PASS_EXPIRES_AT_KEY) || "0");
    const activePass = passExpiresAt > Date.now();
    setHasActivePass(activePass);
    if (!activePass) {
      setStatus("checking");
      await restorePassFromCheckout();
    }

    setStatus("locating");
    setToilets([]);
    setRegion(null);
    setMapCenter(null);
    setErrorMsg(null);
    if (!navigator.geolocation) {
      setErrorMsg(t("home.locationUnsupported"));
      setStatus("location_error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationPermission("granted");
        runSearch({ lat: pos.coords.latitude, lng: pos.coords.longitude, gcj: false }, mode);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) setLocationPermission("denied");
        setErrorMsg(geolocationErrorMessage(error, t));
        setStatus("location_error");
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 8000 },
    );
  };

  const handleFind = async (mode: SearchMode = "toilet") => {
    setSearchMode(mode);
    if (locationPermission === "granted") {
      await startLocationSearch(mode);
      return;
    }
    setPendingLocationMode(mode);
    setShowLocationPrompt(true);
  };

  const confirmLocationPrompt = async () => {
    setShowLocationPrompt(false);
    await startLocationSearch(pendingLocationMode);
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
          <button
            type="button"
            onClick={handleShare}
            disabled={shareBusy}
            className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:border-primary/40 hover:text-primary"
          >
            {shareBusy ? (
              <Loader2 className="size-3 animate-spin" aria-hidden />
            ) : (
              <Share2 className="size-3" aria-hidden />
            )}
            {shareBusy ? t("home.checking") : t("home.share")}
          </button>
        </div>
      </header>

      {/* Hero CTA */}
      <section className="px-6 mt-6">
        <button
          type="button"
          onClick={() => handleFind("toilet")}
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

      <section className="px-6 mt-4">
        <button
          type="button"
          onClick={() => handleFind("nursery")}
          disabled={status === "locating"}
          className="inline-flex flex-col items-center gap-1.5 rounded-lg px-1 py-1 text-center text-[11px] font-bold text-muted-foreground transition hover:text-foreground disabled:opacity-60"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-pink-50 text-pink-600">
            {status === "locating" && searchMode === "nursery" ? (
              <Loader2 className="size-5 animate-spin" aria-hidden />
            ) : (
              <Baby className="size-5" aria-hidden />
            )}
          </span>
          <span className="leading-tight">{t("home.nurseryRoom")}</span>
        </button>
      </section>

      {status !== "location_error" && (
        <section className="px-6 mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {status === "ready"
                ? searchMode === "nursery"
                  ? t("home.nearbyNurseryRooms")
                  : t("home.nearestOptions")
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
              toilets.map((t, index) => (
                <ToiletCard
                  key={t.id}
                  toilet={t}
                  locked={!hasActivePass && index > 0}
                  onUnlock={() => setShowPaywall(true)}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-card">
                <p className="text-sm text-muted-foreground">{errorMsg ?? t("home.noToilets")}</p>
              </div>
            )
          ) : status === "unsupported" ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-card">
              <p className="text-sm text-muted-foreground">
                {t("home.unsupported", region ?? t("home.thisArea"), supportedRegions)}
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
                  <p className="font-bold">{p.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("home.unlimited")} ·{" "}
                    {p.days >= 36500 ? t("home.lifetime") : t("home.days", p.days)}
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

      <Dialog open={showLocationPrompt} onOpenChange={setShowLocationPrompt}>
        <DialogContent className="max-w-[360px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold tracking-tight text-brand-dark">
              Use your current location
            </DialogTitle>
            <DialogDescription>
              SeatMap needs your location to sort nearby places by walking distance and open the
              right navigation destination.
            </DialogDescription>
          </DialogHeader>

          {locationPermission === "denied" && (
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
              Your browser may have blocked location. If the next step does not work, open this
              site's settings and allow location.
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <button
              type="button"
              onClick={confirmLocationPrompt}
              className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-extrabold uppercase tracking-widest text-primary-foreground"
            >
              Allow location
            </button>
            <button
              type="button"
              onClick={() => setShowLocationPrompt(false)}
              className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Not now
            </button>
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
