import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Check, Sparkles, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ToiletCard } from "@/components/ToiletCard";
import { MapPreview } from "@/components/MapPreview";
import { SeoReviewNote } from "@/components/SeoReviewNote";
import { getCityBySlug, type City } from "@/lib/cities";
import { getCuratedCityToilets } from "@/lib/curated-city-toilets";
import { useT } from "@/lib/i18n";
import { SEO_LAST_REVIEWED_ISO, SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/$city/public-toilets")({
  loader: ({ params }) => {
    const city = getCityBySlug(params.city);
    if (!city) throw notFound();
    return { city };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [] };
    const { city } = loaderData;
    const title = `Public Toilets in ${city.name} - Western Toilet Map for Tourists`;
    const description = `Find public toilets and western seated-toilet candidates in ${city.name}. See traveler-friendly malls, hotels, neighborhoods, and live nearby search options.`;
    const url = `${SITE_URL}/${params.city}/public-toilets`;
    const curatedToilets = getCuratedCityToilets(params.city, city.name);
    const graph: Array<Record<string, unknown>> = [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: city.name, item: url },
        ],
      },
      {
        "@type": "WebPage",
        "@id": url,
        name: title,
        description,
        url,
        dateModified: SEO_LAST_REVIEWED_ISO,
      },
      {
        "@type": "FAQPage",
        mainEntity: getCitySeoFaqs(city).map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ];

    if (curatedToilets.length > 0) {
      graph.push({
        "@type": "ItemList",
        "@id": `${url}#curated-venues`,
        name: `Seated-toilet candidate venues in ${city.name}`,
        itemListElement: curatedToilets.slice(0, 8).map((toilet, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Place",
            name: toilet.name,
            address: `${toilet.address}, ${city.name}`,
            geo: {
              "@type": "GeoCoordinates",
              latitude: toilet.lat,
              longitude: toilet.lng,
            },
          },
        })),
      });
    }

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
            "@graph": graph,
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
  const { t } = useT();
  const { city } = Route.useLoaderData();
  const toilets = getCuratedCityToilets(city.slug, city.name);
  const faqs = getCitySeoFaqs(city);
  const firstNeighborhoods = city.neighborhoods.slice(0, 3).join(", ");
  const citySearchCards = getCitySearchCards(city, toilets.length);

  return (
    <AppShell>
      <header className="px-6 pt-6 pb-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("city.back")}
        </Link>
      </header>

      <section className="px-6 mt-4">
        <span className="text-[10px] bg-secondary px-2 py-1 rounded text-secondary-foreground font-bold tracking-wider">
          {city.country.toUpperCase()} · {city.nameLocal}
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-dark leading-tight">
          {t("city.publicToilets", city.name)}
        </h1>
        <p className="mt-1 text-sm font-semibold text-primary">{t("city.tagline")}</p>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{city.intro}</p>
      </section>

      <section className="px-6 mt-4">
        <SeoReviewNote
          source={`${city.name} city coverage, curated venue candidates, and China-local place data.`}
          cadence="Reviewed when city coverage, domain configuration, or search-source logic changes."
        />
      </section>

      <section className="px-6 mt-6">
        <MapPreview
          lat={city.centerLat}
          lng={city.centerLng}
          label={city.name}
          eyebrow={t("city.cityPreview")}
          title={t("city.previewTitle", city.name)}
          subtitle={t("city.homeNavigationHint")}
        />
      </section>

      <section className="px-6 mt-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-bold text-card-foreground">{t("city.previewMode")}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t("city.previewExplain", city.name)}
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-brand transition active:scale-[0.98]"
          >
            <Search className="size-4" aria-hidden />
            {t("city.liveSearchCta")}
          </Link>
        </div>
      </section>

      <section className="px-6 mt-6">
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="size-4 text-primary" aria-hidden />
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
              {t("city.travelerTip")}
            </h2>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{city.travelerTip}</p>
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          {t("city.neighborhoods")}
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

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Where to find western toilets in {city.name}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          For a western toilet in {city.name}, start around {firstNeighborhoods}. The most reliable
          public-toilet plan is to choose modern indoor venues first, then use live search if you
          need a current-location result.
        </p>
        <div className="mt-4 grid gap-3">
          {citySearchCards.map((card) => (
            <article key={card.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {t("city.liveLocations", toilets.length)}
          </h2>
          <span className="text-[10px] font-medium text-muted-foreground">
            {t("city.liveFromAmap")}
          </span>
        </div>

        {toilets.length > 0 ? (
          toilets.map((t) => (
            <ToiletCard key={t.id} toilet={t} showDistance={false} allowNavigation={false} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-card">
            <p className="text-sm font-bold text-card-foreground">
              {t("city.noCuratedTitle", city.name)}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("city.noCuratedBody", city.name)}
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10"
            >
              <Search className="size-4" aria-hidden />
              {t("city.liveSearchCta")}
            </Link>
          </div>
        )}
      </section>

      <section className="px-6 mt-10">
        <h2 className="text-base font-extrabold text-brand-dark mb-3">
          Public toilet map vs live search in {city.name}
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            This city page is a planning page: it shows neighborhoods and curated venue candidates
            where seated toilets are more likely. It is useful before you leave a hotel, station, or
            attraction.
          </p>
          <p>
            The home search is the emergency mode: allow location, pull nearby China-local results,
            and open navigation when you need the closest practical option.
          </p>
        </div>
        <div className="mt-4 grid gap-2">
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-brand transition active:scale-[0.98]"
          >
            <Search className="size-4" aria-hidden />
            Search live toilets near me
          </Link>
          <Link
            to="/western-toilet-china"
            className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-bold text-foreground hover:border-primary/40"
          >
            Read the western toilet guide
          </Link>
        </div>
      </section>

      <section className="px-6 mt-10">
        <h2 className="text-base font-extrabold text-brand-dark mb-3">
          {t("city.whyUse", city.name)}
        </h2>
        <ul className="space-y-2.5">
          {[t("city.reason1"), t("city.reason2"), t("city.reason3"), t("city.reason4")].map(
            (line) => (
              <li key={line} className="flex gap-2 text-sm text-foreground">
                <Check className="size-4 text-primary shrink-0 mt-0.5" aria-hidden />
                <span>{line}</span>
              </li>
            ),
          )}
        </ul>
      </section>

      <section className="px-6 mt-10">
        <h2 className="text-base font-extrabold text-brand-dark mb-3">
          Western toilet tips for {city.name}
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <article key={faq.question}>
              <h3 className="text-sm font-extrabold text-foreground">{faq.question}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 mt-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Western Toilet Map guides
        </h2>
        <div className="grid gap-2">
          <Link
            to="/toilet-finder-china"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:border-primary/40"
          >
            Toilet finder for China
          </Link>
          <Link
            to="/toilets-in-china"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:border-primary/40"
          >
            Toilets in China guide
          </Link>
          <Link
            to="/bathroom-app-china"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:border-primary/40"
          >
            Bathroom app for China
          </Link>
          <Link
            to="/china-public-toilet-app"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:border-primary/40"
          >
            China public toilet app
          </Link>
        </div>
      </section>

      <footer className="px-6 mt-10 pb-4 text-[11px] text-muted-foreground">
        {t("city.footer", city.name)}
      </footer>
    </AppShell>
  );
}

function getCitySearchCards(city: City, venueCount: number) {
  return [
    {
      title: "Best first checks",
      body: `In ${city.name}, large malls, hotel lobbies, transport hubs, museums, and bigger cafes are usually stronger seated-toilet candidates than small standalone public toilets.`,
    },
    {
      title: "Curated planning list",
      body:
        venueCount > 0
          ? `This page currently highlights ${venueCount} curated ${city.name} venue candidates for trip planning. Use live search for real-time nearby choices.`
          : `This page highlights ${city.name} search areas first. Use live search to pull nearby AMap candidates from your current location.`,
    },
    {
      title: "Navigation handoff",
      body: "After you choose a candidate, Western Toilet Map is designed to hand off to Apple Maps, Google Maps, or AMap depending on what works best on your phone.",
    },
  ];
}

function getCitySeoFaqs(city: City) {
  const cityName = city.name;
  const neighborhoods = city.neighborhoods.slice(0, 3).join(", ");

  return [
    {
      question: `Where can I find a western toilet in ${cityName}?`,
      answer: `In ${cityName}, start with large malls, international hotels, modern museums, transport hubs, and bigger coffee chains. Western Toilet Map highlights nearby venue candidates where a seated toilet is more likely.`,
    },
    {
      question: `Are public toilets in ${cityName} usually seated toilets?`,
      answer: `Some public toilets in ${cityName} have seated stalls, but availability can vary. If you need a western toilet quickly, indoor commercial venues are usually more reliable than small standalone public toilets.`,
    },
    {
      question: `Can Western Toilet Map navigate me to a toilet in ${cityName}?`,
      answer: `Yes. Use the live search on the Western Toilet Map home page to get nearby candidates, then start navigation with Apple Maps, Google Maps, or AMap depending on what works best on your phone.`,
    },
    {
      question: `Which areas of ${cityName} are best for public toilets?`,
      answer: `Start around ${neighborhoods}. These areas have stronger odds because they include traveler routes, malls, hotels, transport nodes, or larger commercial venues.`,
    },
    {
      question: `What is the best toilet app for ${cityName}?`,
      answer: `Western Toilet Map works as an English-first web app for ${cityName}: it focuses on nearby seated-toilet candidates instead of broad city browsing, then hands off to your preferred navigation app.`,
    },
  ];
}
