import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Check, Sparkles, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ToiletCard } from "@/components/ToiletCard";
import { MapPreview } from "@/components/MapPreview";
import { getCityBySlug } from "@/lib/cities";
import { getCuratedCityToilets } from "@/lib/curated-city-toilets";
import { useT } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

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
    const description = `Curated seated-toilet candidates in ${city.name}, ${city.country}, focused on malls, hotels, and traveler-friendly venues.`;
    const url = `${SITE_URL}/${params.city}/public-toilets`;
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
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                  { "@type": "ListItem", position: 2, name: city.name, item: url },
                ],
              },
              {
                "@type": "FAQPage",
                mainEntity: getCitySeoFaqs(city.name).map((faq) => ({
                  "@type": "Question",
                  name: faq.question,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: faq.answer,
                  },
                })),
              },
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
  const { t } = useT();
  const { city } = Route.useLoaderData();
  const toilets = getCuratedCityToilets(city.slug, city.name);
  const faqs = getCitySeoFaqs(city.name);

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
          SeatMap guides
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
        </div>
      </section>

      <footer className="px-6 mt-10 pb-4 text-[11px] text-muted-foreground">
        {t("city.footer", city.name)}
      </footer>
    </AppShell>
  );
}

function getCitySeoFaqs(cityName: string) {
  return [
    {
      question: `Where can I find a western toilet in ${cityName}?`,
      answer: `In ${cityName}, start with large malls, international hotels, modern museums, transport hubs, and bigger coffee chains. SeatMap highlights nearby venue candidates where a seated toilet is more likely.`,
    },
    {
      question: `Are public toilets in ${cityName} usually seated toilets?`,
      answer: `Some public toilets in ${cityName} have seated stalls, but availability can vary. If you need a western toilet quickly, indoor commercial venues are usually more reliable than small standalone public toilets.`,
    },
    {
      question: `Can SeatMap navigate me to a toilet in ${cityName}?`,
      answer: `Yes. Use the live search on the SeatMap home page to get nearby candidates, then start navigation with Apple Maps, Google Maps, or AMap depending on what works best on your phone.`,
    },
  ];
}
