import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, MapPin, Search, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MapPreview } from "@/components/MapPreview";
import { SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/western-toilet-china`;
const PAGE_TITLE = "Western Toilets in China - Where Tourists Can Find Seated Toilets | SeatMap";
const PAGE_DESCRIPTION =
  "A practical guide to finding western toilets in China, including the best venue types, city tips, and how SeatMap helps foreign travelers find seated toilets fast.";

const bestPlaces = [
  {
    title: "Large malls",
    body: "Premium malls are usually the best first stop because they have modern facilities, floor directories, and a higher chance of seated stalls.",
  },
  {
    title: "International hotels",
    body: "Hotel lobbies and connected commercial areas are useful emergency backups, especially in gateway cities and tourist districts.",
  },
  {
    title: "Airports and rail hubs",
    body: "Newer terminals and major stations often have clearer signs and more predictable restroom layouts than small street facilities.",
  },
  {
    title: "Museums, cafes, and chain restaurants",
    body: "Larger venues near tourist routes can be a good second choice when you are walking between attractions.",
  },
];

const cityLinks = [
  { label: "Hong Kong", to: "/hong-kong/public-toilets" },
  { label: "Macau", to: "/macau/public-toilets" },
  { label: "Shanghai", to: "/shanghai/public-toilets" },
  { label: "Beijing", to: "/beijing/public-toilets" },
  { label: "Chengdu", to: "/chengdu/public-toilets" },
  { label: "Chongqing", to: "/chongqing/public-toilets" },
];

const faqs = [
  {
    question: "Are western toilets common in China?",
    answer:
      "Western toilets are common in airports, newer malls, international hotels, and many modern commercial venues. They are less predictable in older public toilets, smaller restaurants, and some scenic areas.",
  },
  {
    question: "What should I search for if I need a seated toilet?",
    answer:
      "Search around malls, hotels, airports, rail stations, museums, and larger cafes first. SeatMap is designed to reduce that search to nearby seated-toilet candidates.",
  },
  {
    question: "Can I avoid squat toilets completely in China?",
    answer:
      "You can avoid many squat toilets by planning around modern indoor venues, but availability still varies. A focused toilet finder gives you a faster backup when you are already outside.",
  },
];

export const Route = createFileRoute("/western-toilet-china")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:url", content: PAGE_URL },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": `${PAGE_URL}#article`,
              headline: "Western toilets in China",
              description: PAGE_DESCRIPTION,
              mainEntityOfPage: PAGE_URL,
              publisher: {
                "@type": "Organization",
                name: "SeatMap",
                url: SITE_URL,
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
  component: WesternToiletChinaPage,
});

function WesternToiletChinaPage() {
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
          WESTERN TOILET CHINA
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-dark leading-tight">
          Western toilets in China: where tourists can find seated toilets
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          China has both squat and seated toilets. If you are a foreign traveler who needs a
          western toilet quickly, your best odds are modern indoor venues first, then a focused
          nearby search with SeatMap.
        </p>
      </section>

      <section className="px-6 mt-6">
        <MapPreview
          lat={22.3193}
          lng={114.1694}
          label="Western toilet search"
          eyebrow="SeatMap guide"
          title="Find seated-toilet candidates"
          subtitle="Malls, hotels, airports, and traveler-friendly venues first."
        />
      </section>

      <section className="px-6 mt-5 grid gap-3">
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-brand transition active:scale-[0.98]"
        >
          <Search className="size-4" aria-hidden />
          Search western toilets near me
        </Link>
        <Link
          to="/toilet-finder-china"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10"
        >
          Use the China toilet finder
        </Link>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">Best places to look first</h2>
        <div className="mt-4 grid gap-3">
          {bestPlaces.map((place) => (
            <article key={place.title} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" aria-hidden />
                <h3 className="text-sm font-extrabold text-brand-dark">{place.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{place.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">Quick traveler rules</h2>
        <div className="mt-3 space-y-3">
          {[
            "Choose indoor commercial venues before small standalone public toilets.",
            "In tourist areas, check maps for malls and hotel clusters before walking far.",
            "If you are in discomfort, use SeatMap first and navigate directly.",
            "Keep Hong Kong and Macau in your search plan; both are strong seated-toilet destinations.",
          ].map((rule) => (
            <div key={rule} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>{rule}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">City guides</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {cityLinks.map((city) => (
            <Link
              key={city.to}
              to={city.to}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-sm font-bold text-foreground hover:border-primary/40"
            >
              <MapPin className="size-4 text-primary" aria-hidden />
              {city.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">Related guides</h2>
        <div className="mt-3 grid gap-2">
          <Link
            to="/toilets-in-china"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:border-primary/40"
          >
            Toilets in China guide
          </Link>
          <Link
            to="/squat-toilets-china"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:border-primary/40"
          >
            Squat toilets in China
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
        SeatMap helps foreign travelers find western toilets nearby in China.
      </footer>
    </AppShell>
  );
}
