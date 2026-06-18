import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Search, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CityGuideLinks } from "@/components/CityGuideLinks";
import { MapPreview } from "@/components/MapPreview";
import { SeoReviewNote } from "@/components/SeoReviewNote";
import { SEO_LAST_REVIEWED_ISO, SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/western-toilet-china`;
const PAGE_TITLE =
  "Western Toilets in China - Where Tourists Can Find Seated Toilets | Western Toilet Map";
const PAGE_DESCRIPTION =
  "A practical guide to western toilets in China: where seated toilets are common, where squat toilets are still likely, and how tourists can find a nearby option fast.";

const directAnswers = [
  {
    title: "Are there western toilets in China?",
    body: "Yes. Western seated toilets are common in airports, major rail hubs, modern malls, international hotels, newer museums, and many premium commercial buildings.",
  },
  {
    title: "Are they everywhere?",
    body: "No. Older public toilets, smaller restaurants, parks, rest stops, and some scenic-area facilities can still be squat-only or mixed.",
  },
  {
    title: "What is the safest first move?",
    body: "Look for the nearest modern indoor venue, then use a focused toilet finder when you need a specific nearby seated-toilet candidate.",
  },
];

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

const reliabilitySignals = [
  {
    title: "Modern indoor venue",
    body: "Newer buildings are more likely to have seated stalls, accessible stalls, cleaner sinks, and clearer restroom signs.",
  },
  {
    title: "International visitor flow",
    body: "Airports, high-speed rail hubs, hotels, museums, and premium shopping areas are stronger bets because they serve mixed traveler needs.",
  },
  {
    title: "Multiple restroom options",
    body: "A large venue with several floors or connected buildings gives you a better backup path if the first restroom is crowded or squat-only.",
  },
];

const weakerPlaces = [
  "Small street-side public toilets in older neighborhoods.",
  "Tiny local restaurants without a modern mall or hotel nearby.",
  "Older scenic-area restrooms during peak tourist hours.",
  "Remote rest stops where signage and supplies may vary.",
];

const venueMatrix = [
  {
    venue: "Airport or high-speed rail station",
    odds: "Strong",
    guidance:
      "Use these before long transfers. Newer terminals and large station halls usually have clearer restroom signs and more seated-stall options.",
  },
  {
    venue: "Premium mall or department store",
    odds: "Strong",
    guidance:
      "This is often the best city-center backup because there may be restrooms on multiple floors and inside connected buildings.",
  },
  {
    venue: "International hotel lobby area",
    odds: "Strong",
    guidance:
      "Useful near tourist districts, business areas, and late-night routes when smaller venues are closed or unreliable.",
  },
  {
    venue: "Museum, gallery, or large attraction",
    odds: "Medium",
    guidance:
      "Often better than outdoor public toilets, but peak queues and mixed squat/seated layouts can still happen.",
  },
  {
    venue: "Street-side public toilet",
    odds: "Mixed",
    guidance:
      "Can be convenient, but seated stalls, toilet paper, and cleanliness are less predictable than modern indoor venues.",
  },
];

const regionNotes = [
  {
    title: "Mainland China",
    body: "Large cities such as Shanghai, Beijing, Guangzhou, Shenzhen, Chengdu, Chongqing, and Xi'an have many modern venues, but older public toilets can still surprise visitors.",
  },
  {
    title: "Hong Kong",
    body: "Public-toilet coverage and seated toilets are generally easier for English-speaking travelers, especially around malls, MTR stations, ferry areas, and attractions.",
  },
  {
    title: "Macau",
    body: "Resort, ferry, casino, and Senado Square routes usually give travelers better seated-toilet odds than small side-street facilities.",
  },
];

const accessibilityNotes = [
  "Accessible stalls are often seated, but they may be locked, occupied, or located on a different floor.",
  "Families, older travelers, and travelers with mobility needs should favor malls, hotels, airports, rail hubs, and museums before outdoor facilities.",
  "If walking distance matters, compare nearby options first instead of assuming the closest public toilet is the best one.",
];

const faqs = [
  {
    question: "What does western toilet mean in China?",
    answer:
      "For most foreign travelers, a western toilet means a seated toilet rather than a squat toilet. In China, both types can exist in the same venue, so the safest plan is to search for modern indoor venues first.",
  },
  {
    question: "Are western toilets common in China?",
    answer:
      "Western toilets are common in airports, newer malls, international hotels, and many modern commercial venues. They are less predictable in older public toilets, smaller restaurants, and some scenic areas.",
  },
  {
    question: "Do hotels in China have western toilets?",
    answer:
      "Most international hotels and many modern city hotels have western seated toilets. Smaller guesthouses and older properties can vary, so check room details before booking if seated toilets are important.",
  },
  {
    question: "Are train stations and airports good places to find western toilets?",
    answer:
      "Major airports and high-speed rail stations are usually stronger bets than small public toilets, especially in newer terminals and large station halls. Still, individual stalls can vary, so leave a little time before boarding.",
  },
  {
    question: "What should I search for if I need a seated toilet?",
    answer:
      "Search around malls, hotels, airports, rail stations, museums, and larger cafes first. Western Toilet Map is designed to reduce that search to nearby seated-toilet candidates.",
  },
  {
    question: "Are Hong Kong and Macau easier for western toilets?",
    answer:
      "Hong Kong and Macau are generally easier for English-speaking travelers because many malls, transport hubs, resorts, and tourist districts have seated-toilet options. Western Toilet Map keeps both destinations in the city coverage.",
  },
  {
    question: "Can I avoid squat toilets completely in China?",
    answer:
      "You can avoid many squat toilets by planning around modern indoor venues, but availability still varies. A focused toilet finder gives you a faster backup when you are already outside.",
  },
  {
    question: "How do I find western toilets near me in China?",
    answer:
      "Open Western Toilet Map, allow location, and choose a nearby candidate. The web app is designed for fast seated-toilet search and then hands off to Apple Maps, Google Maps, or AMap for navigation.",
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
              dateModified: SEO_LAST_REVIEWED_ISO,
              publisher: {
                "@type": "Organization",
                name: "Western Toilet Map",
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
          China has both squat and seated toilets. If you are a foreign traveler who needs a western
          toilet quickly, your best odds are modern indoor venues first, then a focused nearby
          search with Western Toilet Map.
        </p>
      </section>

      <section className="px-6 mt-4">
        <SeoReviewNote
          source="Venue-type guidance, first-wave city coverage, and China-local place data."
          cadence="Reviewed after domain changes, city expansions, and seated-toilet search updates."
        />
      </section>

      <section className="px-6 mt-6">
        <MapPreview
          lat={22.3193}
          lng={114.1694}
          label="Western toilet search"
          eyebrow="Western Toilet Map guide"
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
        <h2 className="text-base font-extrabold text-brand-dark">Direct answer for travelers</h2>
        <div className="mt-4 grid gap-3">
          {directAnswers.map((item) => (
            <article key={item.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="are-there-western-toilets" className="px-6 mt-8">
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

      <section id="how-to-find-western-toilets" className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">Quick traveler rules</h2>
        <div className="mt-3 space-y-3">
          {[
            "Choose indoor commercial venues before small standalone public toilets.",
            "In tourist areas, check maps for malls and hotel clusters before walking far.",
            "If you are in discomfort, use Western Toilet Map first and navigate directly.",
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
        <h2 className="text-base font-extrabold text-brand-dark">
          Western toilet odds by venue type
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          If you only have a few minutes, do not search every bathroom equally. Rank nearby options
          by how likely they are to have a seated stall and a predictable restroom layout.
        </p>
        <div className="mt-4 grid gap-3">
          {venueMatrix.map((item) => (
            <article key={item.venue} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-extrabold text-brand-dark">{item.venue}</h3>
                <span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-[10px] font-extrabold text-secondary-foreground">
                  {item.odds}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.guidance}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          What "western toilet" usually means
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          In China travel discussions, "western toilet" usually means a seated toilet. It does not
          guarantee a private room, toilet paper, soap, or the same layout you expect at home. The
          useful question is simpler: where is the nearest venue where a seated stall is likely?
        </p>
        <div className="mt-4 grid gap-3">
          {reliabilitySignals.map((item) => (
            <article key={item.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="accessibility" className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Families, older travelers, and accessibility needs
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Travelers who cannot comfortably use squat toilets should plan more deliberately. The
          closest bathroom is not always the best bathroom.
        </p>
        <div className="mt-3 space-y-3">
          {accessibilityNotes.map((note) => (
            <div key={note} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>{note}</p>
            </div>
          ))}
        </div>
        <Link
          to="/toilet-finder-china"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10"
        >
          Find a western toilet fast
        </Link>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">Places to treat as lower odds</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          These places can still have a seated toilet, but they are weaker emergency bets if you do
          not have time to compare options.
        </p>
        <div className="mt-3 space-y-3">
          {weakerPlaces.map((place) => (
            <div key={place} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>{place}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Mainland China, Hong Kong, and Macau
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Western Toilet Map keeps Hong Kong and Macau in the China travel plan because many
          visitors combine them with mainland routes. The search wording is slightly different by
          place, but the user need is the same: a nearby seated toilet you can reach quickly.
        </p>
        <div className="mt-4 grid gap-3">
          {regionNotes.map((note) => (
            <article key={note.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{note.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{note.body}</p>
            </article>
          ))}
        </div>
      </section>

      <CityGuideLinks intro="Use these city pages to plan where seated toilets are most likely before opening live nearby search." />

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
        Western Toilet Map helps foreign travelers find western toilets nearby in China.
      </footer>
    </AppShell>
  );
}
