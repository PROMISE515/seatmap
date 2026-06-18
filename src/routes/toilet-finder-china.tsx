import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, MapPin, Navigation, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MapPreview } from "@/components/MapPreview";
import { SeoReviewNote } from "@/components/SeoReviewNote";
import { SEO_LAST_REVIEWED_ISO, SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/toilet-finder-china`;
const PAGE_TITLE = "Toilet Finder China - Find Western Toilets Nearby | Western Toilet Map";
const PAGE_DESCRIPTION =
  "Western Toilet Map is a focused toilet finder for China, helping foreign travelers find nearby seated toilets with fast search and map navigation.";

const steps = [
  "Open Western Toilet Map on your phone.",
  "Allow browser location when you are ready to search.",
  "See nearby seated-toilet candidates from China-local place data.",
  "Start navigation in Apple Maps, Google Maps, or AMap.",
];

const priorityCities = [
  { label: "Hong Kong", to: "/hong-kong/public-toilets", note: "Low-KD priority city" },
  { label: "Macau", to: "/macau/public-toilets", note: "Low-KD priority city" },
  { label: "Chengdu", to: "/chengdu/public-toilets", note: "Traveler-friendly malls" },
  { label: "Chongqing", to: "/chongqing/public-toilets", note: "Strong first-wave target" },
  { label: "Shanghai", to: "/shanghai/public-toilets", note: "Essential gateway city" },
  { label: "Beijing", to: "/beijing/public-toilets", note: "Essential gateway city" },
];

const comparisonRows = [
  {
    label: "Generic map apps",
    body: "Helpful for directions, but restroom labels can be broad and may not explain whether a seated toilet is likely.",
  },
  {
    label: "Generic toilet finder apps",
    body: "Useful in some countries, but many are not built around China-local place data or the seated-vs-squat question.",
  },
  {
    label: "Western Toilet Map",
    body: "Focused on one China travel problem: nearby seated-toilet candidates, a simple list, and fast navigation handoff.",
  },
];

const faqs = [
  {
    question: "What is the best toilet finder for China travel?",
    answer:
      "Western Toilet Map is built for foreign travelers who need a fast way to find nearby seated-toilet candidates in China, then open navigation in Apple Maps, Google Maps, or AMap.",
  },
  {
    question: "Why not just search for public toilets in a map app?",
    answer:
      "A generic public toilet marker may not tell you whether the restroom is likely to have a seated toilet. Western Toilet Map narrows the decision to traveler-friendly candidates where seated stalls are more likely.",
  },
  {
    question: "Does Western Toilet Map guarantee every toilet is western style?",
    answer:
      "No. It shows seated-toilet candidates based on venue type and place data. Travelers should treat results as strong leads and use venue labels or staff help when they arrive.",
  },
  {
    question: "Can I use Western Toilet Map as a China restroom finder app?",
    answer:
      "Yes. It works in the browser as an English-first China restroom finder for travelers who want nearby options and quick navigation without installing a separate app.",
  },
];

export const Route = createFileRoute("/toilet-finder-china")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:url", content: PAGE_URL },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": PAGE_URL,
              name: PAGE_TITLE,
              description: PAGE_DESCRIPTION,
              url: PAGE_URL,
              dateModified: SEO_LAST_REVIEWED_ISO,
            },
            {
              "@type": "SoftwareApplication",
              name: "Western Toilet Map",
              applicationCategory: "TravelApplication",
              operatingSystem: "Web",
              url: SITE_URL,
              description: PAGE_DESCRIPTION,
              dateModified: SEO_LAST_REVIEWED_ISO,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            },
            {
              "@type": "FAQPage",
              "@id": `${PAGE_URL}#faq`,
              mainEntity: faqs.map((faq) => ({
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
  }),
  component: ToiletFinderChinaPage,
});

function ToiletFinderChinaPage() {
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
          TOILET FINDER CHINA
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-dark leading-tight">
          A toilet finder for western toilets in China
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Western Toilet Map is built for one stressful travel moment: you need a seated toilet
          nearby, fast. Search once for free, then choose a travel pass if you want unlimited trip
          access.
        </p>
      </section>

      <section className="px-6 mt-4">
        <SeoReviewNote
          source="China-local place data, product search behavior, and first-wave city pages."
          cadence="Updated when the app domain, city coverage, or nearby-search logic changes."
        />
      </section>

      <section className="px-6 mt-6">
        <MapPreview
          lat={30.5728}
          lng={104.0668}
          label="Western Toilet Map toilet finder"
          eyebrow="Live nearby search"
          title="Seated-toilet candidates"
          subtitle="Malls, hotels, and traveler-friendly venues first."
        />
      </section>

      <section className="px-6 mt-5 grid gap-3">
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-brand transition active:scale-[0.98]"
        >
          <Search className="size-4" aria-hidden />
          Search nearby toilets
        </Link>
        <Link
          to="/toilets-in-china"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10"
        >
          Read the China toilet guide
        </Link>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">How Western Toilet Map works</h2>
        <ol className="mt-3 space-y-3">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed text-foreground">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">Why not use a general map?</h2>
        <div className="mt-3 space-y-3">
          {[
            "General maps are not optimized for seated-vs-squat toilet anxiety.",
            "Western Toilet Map keeps the interface focused: location, nearby candidates, and navigation.",
            "The product prioritizes venues with higher seated-toilet likelihood, not every restroom label.",
          ].map((line) => (
            <div key={line} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>{line}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="restroom-finder" className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          China restroom finder vs map apps
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A restroom finder for China has to answer a narrower question than "where is a bathroom?"
          Travelers often need to know where a seated toilet is likely, which venue is worth walking
          to, and which navigation app should open next.
        </p>
        <div className="mt-4 grid gap-3">
          {comparisonRows.map((row) => (
            <article key={row.label} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{row.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{row.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">When to use the toilet finder</h2>
        <div className="mt-3 space-y-3">
          {[
            "Before leaving a hotel, station, or mall for a long walking route.",
            "When a public toilet sign is nearby but you are not sure it has seated stalls.",
            "When traveling with kids, older family members, luggage, or accessibility needs.",
            "When you need a fast nearby option rather than a long guide about China bathrooms.",
          ].map((line) => (
            <div key={line} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>{line}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="bathroom-app" className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Best bathroom app for China travel
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A China bathroom app should not make travelers browse every restroom marker. Western
          Toilet Map is useful because it keeps the decision small: open the app, allow location,
          pick a nearby seated-toilet candidate, and start navigation.
        </p>
        <div className="mt-3 space-y-3">
          {[
            "Built for the emergency moment, not general city browsing.",
            "English-first guidance for foreign visitors who may not read Chinese restroom labels.",
            "One free emergency search before choosing unlimited trip access.",
          ].map((line) => (
            <div key={line} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>{line}</p>
            </div>
          ))}
        </div>
        <Link
          to="/bathroom-app-china"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10"
        >
          Read the bathroom app guide
        </Link>
      </section>

      <section id="public-toilet-app" className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          China public toilet app for foreign travelers
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Public toilet labels can be too broad. Western Toilet Map focuses on candidates where a
          seated toilet is more likely, especially malls, hotels, airports, rail hubs, museums, and
          larger cafes.
        </p>
        <Link
          to="/china-public-toilet-app"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10"
        >
          Read the public toilet app guide
        </Link>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">Helpful China toilet guides</h2>
        <div className="mt-3 grid gap-2">
          <Link
            to="/western-toilet-china"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:border-primary/40"
          >
            Western toilets in China
          </Link>
          <Link
            to="/squat-toilets-china"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:border-primary/40"
          >
            Squat toilets in China
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

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">First-wave city pages</h2>
        <div className="mt-3 grid gap-2">
          {priorityCities.map((city) => (
            <Link
              key={city.to}
              to={city.to}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/40"
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="font-bold text-foreground">{city.label}</span>
              </span>
              <span className="max-w-[132px] text-right text-[10px] font-bold uppercase leading-tight tracking-wider text-muted-foreground">
                {city.note}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="navigation" className="px-6 mt-8">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Navigation className="size-4 text-primary" aria-hidden />
            <h2 className="text-sm font-extrabold text-brand-dark">Navigation options</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Western Toilet Map supports handoff to Apple Maps, Google Maps, and AMap so travelers
            can choose the navigation app that works best on their device in China.
          </p>
        </div>
      </section>

      <section id="faq" className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">FAQ</h2>
        <div className="mt-3 space-y-4">
          {faqs.map((faq) => (
            <article key={faq.question}>
              <h3 className="text-sm font-extrabold text-foreground">{faq.question}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="px-6 mt-10 pb-6 text-[11px] text-muted-foreground">
        Western Toilet Map · Find a western toilet nearby in China in under 10 seconds.
      </footer>
    </AppShell>
  );
}
