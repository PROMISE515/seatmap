import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Check, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { ToiletCard } from "@/components/ToiletCard";
import { MapPreview } from "@/components/MapPreview";
import { getCityBySlug } from "@/lib/cities";
import { findNearbyToilets } from "@/lib/toilets.functions";
import { wgs84ToGcj02, type ToiletDTO } from "@/lib/amap";

const SITE = "https://swift-restroom-finder.lovable.app";

function friendlySearchError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (/not configured|Missing Supabase|environment variable/i.test(message)) {
    return "Live toilet data is not configured yet.";
  }
  return message || "Failed to load toilets";
}

function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dx = (a.lng - b.lng) * 111000 * Math.cos((a.lat * Math.PI) / 180);
  const dy = (a.lat - b.lat) * 111000;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}

export const Route = createFileRoute("/$city/public-toilets")({
  loader: ({ params }) => {
    const city = getCityBySlug(params.city);
    if (!city) throw notFound();
    return { city };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [] };
    const { city } = loaderData;
    const title = `Public Toilets in ${city.name} — Western Restrooms | SeatMap`;
    const description = `Live public toilet results in ${city.name}, ${city.country}, screened for seated-toilet likelihood and mapped for foreign travelers. Powered by AMap.`;
    const url = `${SITE}/${params.city}/public-toilets`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE },
              { "@type": "ListItem", position: 2, name: city.name, item: url },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <AppShell>
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold">City not covered yet</h2>
        <Link to="/" className="text-primary text-sm mt-2 inline-block">
          ← Back home
        </Link>
      </div>
    </AppShell>
  ),
  errorComponent: CityErrorComponent,
  component: CityPage,
});

function CityErrorComponent({ reset }: { reset: () => void }) {
  const router = useRouter();

  return (
    <AppShell>
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="text-primary text-sm mt-2"
        >
          Try again
        </button>
      </div>
    </AppShell>
  );
}

function CityPage() {
  const { city } = Route.useLoaderData();
  const [toilets, setToilets] = useState<ToiletDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    lat: city.centerLat,
    lng: city.centerLng,
    label: city.name,
  });
  const findNearby = useServerFn(findNearbyToilets);

  useEffect(() => {
    let cancelled = false;
    const cityCenter = { lat: city.centerLat, lng: city.centerLng };

    const loadCityPreview = () => {
      setUsingCurrentLocation(false);
      setMapCenter({ ...cityCenter, label: city.name });
      return findNearby({
        data: { lat: city.centerLat, lng: city.centerLng, radius: city.radius, gcj: true },
      });
    };

    setLoading(true);
    setErrorMsg(null);

    new Promise<Awaited<ReturnType<typeof findNearby>>>((resolve, reject) => {
      if (!navigator.geolocation) {
        loadCityPreview().then(resolve).catch(reject);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const currentGcj = wgs84ToGcj02(pos.coords.latitude, pos.coords.longitude);
          const currentToCity = distanceMeters(currentGcj, cityCenter);
          const isInCity = currentToCity <= Math.max(city.radius + 2000, 15000);

          if (!isInCity) {
            loadCityPreview().then(resolve).catch(reject);
            return;
          }

          setUsingCurrentLocation(true);
          setMapCenter({ lat: currentGcj.lat, lng: currentGcj.lng, label: "You" });
          findNearby({
            data: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              radius: 1000,
              gcj: false,
            },
          })
            .then(resolve)
            .catch(reject);
        },
        () => {
          loadCityPreview().then(resolve).catch(reject);
        },
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 6000 },
      );
    })
      .then((res) => {
        if (!cancelled) {
          setToilets(res.toilets);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setErrorMsg(friendlySearchError(e));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [city.slug, city.name, city.centerLat, city.centerLng, city.radius, findNearby]);

  return (
    <AppShell>
      <header className="px-6 pt-6 pb-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Link>
      </header>

      <section className="px-6 mt-4">
        <span className="text-[10px] bg-secondary px-2 py-1 rounded text-secondary-foreground font-bold tracking-wider">
          {city.country.toUpperCase()} · {city.nameLocal}
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-dark leading-tight">
          Public Toilets in {city.name}
        </h1>
        <p className="mt-1 text-sm font-semibold text-primary">
          Clean Western (seated) restrooms for travelers
        </p>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{city.intro}</p>
      </section>

      <section className="px-6 mt-6">
        <MapPreview
          lat={mapCenter.lat}
          lng={mapCenter.lng}
          label={mapCenter.label}
          eyebrow={usingCurrentLocation ? "Current search area" : "City preview"}
          title={usingCurrentLocation ? `${city.name} results near you` : `${city.name} preview`}
          subtitle={
            usingCurrentLocation
              ? "Distances and navigation use your current location."
              : "Open the green search button on the home page for current-location navigation."
          }
        />
      </section>

      {!usingCurrentLocation && (
        <section className="px-6 mt-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm font-bold text-card-foreground">Preview mode</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              These are {city.name} city-area results, not distances from your current location.
              Navigation is disabled here to avoid sending you to the wrong city.
            </p>
          </div>
        </section>
      )}

      <section className="px-6 mt-6">
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="size-4 text-primary" aria-hidden />
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
              Traveler tip
            </h2>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{city.travelerTip}</p>
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Best neighborhoods to find one
        </h2>
        <ul className="flex flex-wrap gap-2">
          {city.neighborhoods.map((n: string) => (
            <li
              key={n}
              className="px-3 py-1.5 bg-card border border-border text-xs font-semibold rounded-full inline-flex items-center gap-1"
            >
              <MapPin className="size-3 text-primary" aria-hidden />
              {n}
            </li>
          ))}
        </ul>
      </section>

      <section className="px-6 mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {loading ? "Loading…" : `${toilets.length} live locations`}
          </h2>
          <span className="text-[10px] font-medium text-muted-foreground">Live from AMap</span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-card">
            <Loader2 className="size-5 animate-spin mx-auto text-primary" />
          </div>
        ) : toilets.length > 0 ? (
          toilets.map((t) => (
            <ToiletCard
              key={t.id}
              toilet={t}
              showDistance={usingCurrentLocation}
              allowNavigation={usingCurrentLocation && t.canNavigate}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-card">
            <p className="text-sm text-muted-foreground">
              {errorMsg ?? `No public toilets found in ${city.name}.`}
            </p>
          </div>
        )}
      </section>

      <section className="px-6 mt-10">
        <h2 className="text-base font-extrabold text-brand-dark mb-3">
          Why use SeatMap in {city.name}?
        </h2>
        <ul className="space-y-2.5">
          {[
            "Live listings are screened for seated-toilet likelihood",
            "Prioritizes malls, hotels, and traveler-friendly indoor venues",
            "Free-entry options are highlighted when available",
            "Live AMap results are cached for fast repeat searches",
          ].map((line) => (
            <li key={line} className="flex gap-2 text-sm text-foreground">
              <Check className="size-4 text-primary shrink-0 mt-0.5" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="px-6 mt-10 pb-4 text-[11px] text-muted-foreground">
        SeatMap · Find a seated toilet in {city.name} in under 10 seconds.
      </footer>
    </AppShell>
  );
}
