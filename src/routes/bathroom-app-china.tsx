import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Navigation, Search, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CityGuideLinks } from "@/components/CityGuideLinks";
import { MapPreview } from "@/components/MapPreview";
import { SeoReviewNote } from "@/components/SeoReviewNote";
import { SEO_LAST_REVIEWED_ISO, SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/bathroom-app-china`;
const PAGE_TITLE = "Bathroom App for China Travel - Find Seated Toilets Fast | Western Toilet Map";
const PAGE_DESCRIPTION =
  "Western Toilet Map is a bathroom app for China travel, helping foreign visitors find nearby seated toilets with location search and navigation to Apple Maps, Google Maps, or AMap.";

const appReasons = [
  "You do not need a full travel planner when the problem is urgent.",
  "The interface stays focused on location, nearby toilet candidates, and navigation.",
  "Western Toilet Map prioritizes venues where seated toilets are more likely: malls, hotels, airports, rail hubs, and modern cafes.",
  "Travelers can start with one free emergency search before choosing a travel pass.",
];

const navigationOptions = [
  "Apple Maps for iPhone travelers who prefer the native map handoff.",
  "Google Maps when it works for the traveler's device and route.",
  "AMap for stronger local China place and navigation coverage.",
];

const appChoiceRows = [
  {
    title: "Use a map app when",
    body: "you already know the venue name, need full walking directions, or want a broader city route.",
  },
  {
    title: "Use Western Toilet Map when",
    body: "you need a nearby seated-toilet candidate quickly and do not want to compare every restroom marker yourself.",
  },
  {
    title: "Use a China-local map when",
    body: "the final walking route needs stronger mainland China navigation detail after you pick a toilet candidate.",
  },
];

const appComparisonRows = [
  {
    app: "Western Toilet Map",
    bestFor: "A fast seated-toilet decision",
    note: "Best when you are already out in the city and need a nearby western-style toilet candidate, not a full travel-planning map.",
  },
  {
    app: "AMap / Gaode",
    bestFor: "Local walking navigation",
    note: "Best after you choose a destination because mainland China routing and local POI coverage can be stronger.",
  },
  {
    app: "Apple Maps or Google Maps",
    bestFor: "Familiar navigation handoff",
    note: "Useful for travelers who prefer a familiar map interface, especially when their device and network setup already work well.",
  },
  {
    app: "Generic toilet finder apps",
    bestFor: "Broad restroom browsing",
    note: "Can be useful in other countries, but often do not focus on the China-specific seated-vs-squat toilet problem.",
  },
];

const planningMoments = [
  "Before leaving a hotel or rail station for a long walking route.",
  "Before visiting an older attraction, park, night market, or scenic area.",
  "When traveling with kids, older relatives, luggage, or accessibility needs.",
  "When moving between mainland China, Hong Kong, and Macau where map behavior can differ.",
];

const faqs = [
  {
    question: "What is a good bathroom app for China travel?",
    answer:
      "Western Toilet Map is built for foreign travelers who need to find a seated toilet nearby in China quickly, without sorting through unrelated map results.",
  },
  {
    question: "Does Western Toilet Map work with navigation apps?",
    answer:
      "Yes. Western Toilet Map supports handoff to Apple Maps, Google Maps, and AMap so travelers can choose the navigation option that works best for their device in China.",
  },
  {
    question: "Is the first Western Toilet Map search free?",
    answer:
      "Western Toilet Map is designed with emergency access in mind: travelers can search once for free, then choose a travel pass for unlimited trip access.",
  },
  {
    question: "What is the best toilet app in China for tourists?",
    answer:
      "There is no single best app for every moment. Western Toilet Map is best for the seated-toilet decision, while AMap, Apple Maps, or Google Maps can be better for the final walking route.",
  },
  {
    question: "Does Western Toilet Map work for Hong Kong and Macau?",
    answer:
      "Western Toilet Map keeps Hong Kong and Macau in the travel coverage set, but navigation handoff and local map behavior may differ from mainland China.",
  },
  {
    question: "Can any bathroom app guarantee toilet type or cleanliness?",
    answer:
      "No. A bathroom app can reduce uncertainty by prioritizing stronger venue candidates, but travelers should still verify signs, venue access, and the actual stall type when they arrive.",
  },
];

export const Route = createFileRoute("/bathroom-app-china")({
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
  component: BathroomAppChinaPage,
});

function BathroomAppChinaPage() {
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
          BATHROOM APP CHINA
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-dark leading-tight">
          A bathroom app for China travel when you need a seated toilet fast
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Western Toilet Map is a focused bathroom app for foreign visitors in China. Open it, allow
          location, scan nearby seated-toilet candidates, and start navigation without digging
          through a general map.
        </p>
      </section>

      <section className="px-6 mt-4">
        <SeoReviewNote
          source="Product behavior, navigation handoff, and app-intent keyword review."
          cadence="Updated when app flow, map handoff, or China-local toilet search changes."
        />
      </section>

      <section className="px-6 mt-6">
        <MapPreview
          lat={30.5728}
          lng={104.0668}
          label="Western Toilet Map bathroom app"
          eyebrow="Emergency access"
          title="One focused search"
          subtitle="Nearby seated-toilet candidates, then navigation."
        />
      </section>

      <section className="px-6 mt-5 grid gap-3">
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-brand transition active:scale-[0.98]"
        >
          <Search className="size-4" aria-hidden />
          Open Western Toilet Map
        </Link>
        <Link
          to="/toilet-finder-china"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10"
        >
          See how the toilet finder works
        </Link>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Why use a focused bathroom app?
        </h2>
        <div className="mt-3 space-y-3">
          {appReasons.map((reason) => (
            <div key={reason} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>{reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Choosing the best toilet app in China
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The best bathroom app for China depends on the moment. Western Toilet Map is strongest
          when the user has one job: find a seated-toilet candidate nearby and move.
        </p>
        <div className="mt-4 grid gap-3">
          {appChoiceRows.map((row) => (
            <article key={row.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{row.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{row.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Navigation className="size-4 text-primary" aria-hidden />
            <h2 className="text-sm font-extrabold text-brand-dark">Navigation handoff</h2>
          </div>
          <div className="mt-3 space-y-2">
            {navigationOptions.map((option) => (
              <p key={option} className="text-sm leading-relaxed text-muted-foreground">
                {option}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Which bathroom app should you use in China?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The right app depends on the job. Western Toilet Map is the decision layer for finding a
          likely seated toilet. A navigation app is the routing layer after you choose where to go.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
          {appComparisonRows.map((row, index) => (
            <article key={row.app} className={`p-4 ${index > 0 ? "border-t border-border" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-extrabold text-brand-dark">{row.app}</h3>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  {row.bestFor}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{row.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">Plan before these moments</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A bathroom app is most useful before the search becomes urgent. These are the moments
          where checking a seated-toilet option early can save real travel stress.
        </p>
        <div className="mt-3 space-y-3">
          {planningMoments.map((moment) => (
            <div key={moment} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>{moment}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" aria-hidden />
            <h2 className="text-sm font-extrabold text-brand-dark">Important limitation</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            No toilet app can guarantee every stall type, opening condition, or cleanliness level in
            China. The practical goal is to reduce uncertainty quickly by choosing stronger nearby
            candidates and handing off to navigation.
          </p>
        </div>
      </section>

      <CityGuideLinks
        title="Best cities to prepare for"
        intro="Use the city pages before travel days in major tourist destinations, then switch to the bathroom app flow for live nearby choices."
      />

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">Related guides</h2>
        <div className="mt-3 grid gap-2">
          <Link
            to="/china-public-toilet-app"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:border-primary/40"
          >
            China public toilet app
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
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" aria-hidden />
            <h2 className="text-sm font-extrabold text-brand-dark">Built for the travel moment</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Western Toilet Map is not trying to be a full city guide. It solves one high-stress
            problem: finding a nearby seated toilet quickly enough to be useful.
          </p>
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
        Western Toilet Map · A bathroom app for China travel emergencies.
      </footer>
    </AppShell>
  );
}
