import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Check,
  MapPinned,
  Search,
  ShieldCheck,
  TrainFront,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CityGuideLinks } from "@/components/CityGuideLinks";
import { MapPreview } from "@/components/MapPreview";
import { SeoReviewNote } from "@/components/SeoReviewNote";
import { SEO_LAST_REVIEWED_ISO, SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/china-public-toilet-app`;
const PAGE_TITLE = "China Public Toilet App for Foreign Travelers | Western Toilet Map";
const PAGE_DESCRIPTION =
  "Western Toilet Map is a China public toilet app for foreign travelers who need nearby seated-toilet candidates, map support, and navigation in major China travel cities.";

const publicToiletNeeds = [
  {
    title: "Public toilet labels are not enough",
    body: "A generic public toilet marker may not tell you whether the facility has seated stalls, whether it is easy to access, or whether it is a good tourist backup.",
  },
  {
    title: "Indoor venues can be better than street toilets",
    body: "Western Toilet Map prioritizes malls, hotels, airports, rail hubs, museums, and larger cafes because they are usually better bets for seated toilets.",
  },
  {
    title: "Navigation needs local options",
    body: "Foreign travelers may switch between Apple Maps, Google Maps, and AMap depending on what works best on their device in China.",
  },
];

const publicMapDifferences = [
  {
    title: "Public toilet volume",
    body: "A broad map can show many restroom labels, but volume is not the same as confidence for a foreign traveler who needs a seated toilet.",
  },
  {
    title: "Venue-type confidence",
    body: "Western Toilet Map favors places like malls, hotels, transport hubs, museums, and larger cafes because they are stronger traveler backups.",
  },
  {
    title: "Fast next step",
    body: "The goal is not to browse a dense map. Pick a nearby candidate, then hand off to the navigation app that works best on your phone.",
  },
];

const publicToiletScenarios = [
  {
    title: "Tourist attraction exits",
    icon: MapPinned,
    body: "Attractions can have restroom signs, but the nearest signed public toilet may be crowded, squat-only, or outside the most convenient exit path. Check a stronger indoor fallback before the route gets long.",
  },
  {
    title: "Rail stations and transit hubs",
    icon: TrainFront,
    body: "Major stations usually have restrooms, but luggage, crowds, and floor changes make speed matter. Western Toilet Map helps choose a candidate, then hands off to the navigation app that works best.",
  },
  {
    title: "Malls, hotels, and indoor backups",
    icon: Building2,
    body: "Indoor venues are often better public-toilet backups for foreign travelers because seated stalls, supplies, accessibility, and staff help are more likely than at small street-side facilities.",
  },
];

const regionNotes = [
  {
    title: "Mainland China",
    body: "Use Western Toilet Map to shortlist seated-toilet candidates, then AMap can be useful for final local walking routes when Apple Maps or Google Maps feel incomplete.",
  },
  {
    title: "Hong Kong",
    body: "Public toilets are common in malls, MTR-linked buildings, ferry areas, and major districts. The planning page keeps Hong Kong in the same English-first travel workflow.",
  },
  {
    title: "Macau",
    body: "Senado Square, Cotai, ferry terminals, and casino/mall areas are usually better first checks than chasing every public-toilet marker on a broad map.",
  },
];

const faqs = [
  {
    question: "Is Western Toilet Map a public toilet app for China?",
    answer:
      "Yes. Western Toilet Map focuses on helping foreign travelers find nearby public-toilet candidates where a seated toilet is more likely, then start navigation quickly.",
  },
  {
    question: "Does Western Toilet Map show every public toilet?",
    answer:
      "Western Toilet Map is intentionally focused. It is more useful to prioritize traveler-friendly seated-toilet candidates than to show every possible restroom label.",
  },
  {
    question: "Which China cities should tourists prepare for first?",
    answer:
      "Start with Hong Kong, Macau, Shanghai, Beijing, Chengdu, Chongqing, Guangzhou, Shenzhen, Xi'an, Hangzhou, and other major visitor cities.",
  },
  {
    question: "Is a public toilet in China likely to have a seated toilet?",
    answer:
      "Some public toilets do, especially in modern indoor venues, airports, rail hubs, malls, and hotels. A public-toilet marker alone is not enough to guarantee a seated stall.",
  },
  {
    question: "Should I search public toilets or western toilets in China?",
    answer:
      "Use public toilets when planning broadly, but search for western or seated-toilet candidates when the real need is avoiding a squat-only restroom.",
  },
  {
    question: "Does the public toilet app cover Hong Kong and Macau?",
    answer:
      "Yes. Western Toilet Map keeps Hong Kong and Macau in the city coverage set because many foreign travelers combine them with mainland China trips.",
  },
];

export const Route = createFileRoute("/china-public-toilet-app")({
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
  component: ChinaPublicToiletAppPage,
});

function ChinaPublicToiletAppPage() {
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
          CHINA PUBLIC TOILET APP
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-dark leading-tight">
          A China public toilet app built for foreign travelers
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Public toilet data is useful, but travelers usually need a more specific answer: where is
          the nearest likely seated toilet? Western Toilet Map keeps the search focused on that
          question.
        </p>
      </section>

      <section className="px-6 mt-4">
        <SeoReviewNote
          source="China public-toilet search intent, product venue logic, and city-page coverage."
          cadence="Updated when public-toilet search, city coverage, or seated-toilet labeling changes."
        />
      </section>

      <section className="px-6 mt-6">
        <MapPreview
          lat={22.5431}
          lng={114.0579}
          label="China public toilet app"
          eyebrow="Western Toilet Map search"
          title="Public-toilet candidates"
          subtitle="Prioritize seated-toilet likelihood and simple navigation."
        />
      </section>

      <section className="px-6 mt-5 grid gap-3">
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-brand transition active:scale-[0.98]"
        >
          <Search className="size-4" aria-hidden />
          Search public toilets nearby
        </Link>
        <Link
          to="/bathroom-app-china"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10"
        >
          Compare the bathroom app use case
        </Link>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Why a China-specific public toilet app helps
        </h2>
        <div className="mt-4 grid gap-3">
          {publicToiletNeeds.map((item) => (
            <article key={item.title} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" aria-hidden />
                <h3 className="text-sm font-extrabold text-brand-dark">{item.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Public toilet map vs seated-toilet finder
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          For tourists, the best public toilet app in China is not just the one with the most map
          pins. It is the one that helps choose a practical nearby option quickly.
        </p>
        <div className="mt-4 grid gap-3">
          {publicMapDifferences.map((item) => (
            <article key={item.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          What Western Toilet Map optimizes for
        </h2>
        <div className="mt-3 space-y-3">
          {[
            "Fast nearby discovery when the traveler is already outside.",
            "Seated-toilet likelihood instead of generic restroom volume.",
            "Simple map handoff rather than complex map browsing.",
            "English-first content for visitors who do not read Chinese restroom labels confidently.",
          ].map((point) => (
            <div key={point} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>{point}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Public toilet search situations in China
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A China public toilet app should help before the decision gets urgent. These are the
          common moments where a tourist needs more than a generic restroom marker.
        </p>
        <div className="mt-4 grid gap-3">
          {publicToiletScenarios.map((scenario) => {
            const Icon = scenario.icon;

            return (
              <article key={scenario.title} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-brand-dark">{scenario.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {scenario.body}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Mainland China, Hong Kong, and Macau
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Foreign travelers often move between regions with different map behavior and restroom
          expectations. The search workflow stays English-first, but the navigation choice can
          change by city.
        </p>
        <div className="mt-4 grid gap-3">
          {regionNotes.map((region) => (
            <article key={region.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{region.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{region.body}</p>
            </article>
          ))}
        </div>
      </section>

      <CityGuideLinks intro="These public-toilet planning pages focus on traveler-friendly indoor areas where seated toilets are more likely." />

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">Related guides</h2>
        <div className="mt-3 grid gap-2">
          <Link
            to="/toilet-finder-china"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:border-primary/40"
          >
            Toilet finder for China
          </Link>
          <Link
            to="/china-bathroom-tips"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:border-primary/40"
          >
            China bathroom tips
          </Link>
        </div>
      </section>

      <section className="px-6 mt-8">
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
        Western Toilet Map · Public toilet search for English-speaking China travelers.
      </footer>
    </AppShell>
  );
}
