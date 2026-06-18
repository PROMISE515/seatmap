import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, MapPin, Search, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MapPreview } from "@/components/MapPreview";
import { SeoReviewNote } from "@/components/SeoReviewNote";
import { SEO_LAST_REVIEWED_ISO, SITE_URL } from "@/lib/site";

const GUIDE_URL = `${SITE_URL}/toilets-in-china`;
const GUIDE_TITLE = "Toilets in China for Tourists - Western Toilet Guide | Western Toilet Map";
const GUIDE_DESCRIPTION =
  "A practical guide to public toilets in China for foreign travelers: where to find seated toilets, when to expect squat toilets, and how Western Toilet Map helps nearby.";

const quickRules = [
  "Malls and international hotels are usually safer first checks than small street toilets.",
  "Tourist attractions may have both squat and seated stalls, but signage is often inconsistent.",
  "Coffee chains, airport terminals, rail stations, and newer commercial complexes are good backups.",
  "Use Western Toilet Map when you need the nearest seated-toilet candidate instead of general bathroom advice.",
];

const toiletTypes = [
  {
    title: "Squat toilets",
    body: "Still common in older public toilets, smaller venues, parks, and some scenic-area facilities. They may be the only option in a smaller restroom.",
  },
  {
    title: "Western seated toilets",
    body: "More likely in airports, rail hubs, premium malls, hotels, newer museums, larger cafes, and modern commercial buildings.",
  },
  {
    title: "Accessible stalls",
    body: "Accessible stalls can be a useful clue because they are often seated, but availability and signage vary by venue.",
  },
];

const searchMoments = [
  {
    title: "Planning before a day route",
    body: "Check malls, rail stations, museums, and hotel districts near your planned route before you leave.",
  },
  {
    title: "Already outside and urgent",
    body: "Skip broad guide reading. Use the toilet finder, choose the nearest practical candidate, and navigate.",
  },
  {
    title: "Traveling with family or accessibility needs",
    body: "Prioritize seated-toilet candidates and modern venues before long walks, queues, or scenic-area visits.",
  },
];

const cityLinks = [
  { label: "Shanghai", to: "/shanghai/public-toilets" },
  { label: "Beijing", to: "/beijing/public-toilets" },
  { label: "Hong Kong", to: "/hong-kong/public-toilets" },
  { label: "Macau", to: "/macau/public-toilets" },
  { label: "Chengdu", to: "/chengdu/public-toilets" },
  { label: "Chongqing", to: "/chongqing/public-toilets" },
];

const faqs = [
  {
    question: "Are toilets in China usually squat toilets?",
    answer:
      "China has both squat and seated toilets. Older public toilets and some scenic areas may lean squat, while malls, airports, hotels, and newer commercial venues are more likely to have seated stalls.",
  },
  {
    question: "Where should a foreign tourist look first for a western toilet in China?",
    answer:
      "Start with large malls, international hotels, airports, rail stations, modern museums, and larger coffee chains. Western Toilet Map focuses on nearby places where a seated toilet is more likely.",
  },
  {
    question: "Can Google Maps reliably find toilets in China?",
    answer:
      "Google Maps can be limited in mainland China. Western Toilet Map uses China-local place data and keeps the experience focused on fast toilet discovery and navigation options.",
  },
  {
    question: "Do public toilets in China have toilet paper?",
    answer:
      "Some modern venues do, but tourists should still carry tissues and sanitizer because public toilet supplies vary by city, venue type, and time of day.",
  },
  {
    question: "What app can help me find toilets in China?",
    answer:
      "Western Toilet Map works as an English-first web app for finding nearby seated-toilet candidates in China, then opening navigation in Apple Maps, Google Maps, or AMap.",
  },
];

export const Route = createFileRoute("/toilets-in-china")({
  head: () => ({
    meta: [
      { title: GUIDE_TITLE },
      { name: "description", content: GUIDE_DESCRIPTION },
      { property: "og:title", content: GUIDE_TITLE },
      { property: "og:description", content: GUIDE_DESCRIPTION },
      { property: "og:url", content: GUIDE_URL },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: GUIDE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": `${GUIDE_URL}#article`,
              headline: "Toilets in China for tourists",
              description: GUIDE_DESCRIPTION,
              mainEntityOfPage: GUIDE_URL,
              dateModified: SEO_LAST_REVIEWED_ISO,
              publisher: {
                "@type": "Organization",
                name: "Western Toilet Map",
                url: SITE_URL,
              },
            },
            {
              "@type": "FAQPage",
              "@id": `${GUIDE_URL}#faq`,
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
  component: ToiletsInChinaPage,
});

function ToiletsInChinaPage() {
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
          CHINA TOILET GUIDE
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-dark leading-tight">
          Toilets in China: how to find a seated toilet fast
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          China is not hard to travel, but bathrooms can still surprise first-time visitors. The
          simple rule: when you need a western toilet, look for reliable indoor venues first, then
          use Western Toilet Map for nearby seated-toilet candidates.
        </p>
      </section>

      <section className="px-6 mt-4">
        <SeoReviewNote
          source="Traveler restroom patterns, China-local place categories, and city guide coverage."
          cadence="Reviewed after city-list, domain, or toilet-search coverage updates."
        />
      </section>

      <section className="px-6 mt-6">
        <MapPreview
          lat={31.2304}
          lng={121.4737}
          label="China toilet guide"
          eyebrow="Western Toilet Map search"
          title="Find nearby western toilets"
          subtitle="Use live location when you need the closest option."
        />
      </section>

      <section className="px-6 mt-5">
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-brand transition active:scale-[0.98]"
        >
          <Search className="size-4" aria-hidden />
          Search toilets near me
        </Link>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">What to expect</h2>
        <div className="mt-3 space-y-3">
          {quickRules.map((rule) => (
            <div key={rule} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>{rule}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Squat toilets vs western toilets in China
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The most useful China toilet distinction for tourists is not public versus private. It is
          whether the restroom is likely to have a seated stall when you need one.
        </p>
        <div className="mt-4 grid gap-3">
          {toiletTypes.map((item) => (
            <article key={item.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Best places to find a western toilet
        </h2>
        <div className="mt-4 grid gap-3">
          {[
            {
              title: "Premium malls",
              body: "Large malls often have cleaner restrooms, more seated stalls, and clearer floor directories.",
            },
            {
              title: "International hotels",
              body: "Hotel lobbies and connected shopping areas are strong emergency backups in major cities.",
            },
            {
              title: "Airports and rail hubs",
              body: "Transport hubs usually have more predictable facilities, especially in newer terminals.",
            },
            {
              title: "Coffee chains and museums",
              body: "Larger branches and modern museums can be useful when you are walking between attractions.",
            },
          ].map((item) => (
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
        <h2 className="text-base font-extrabold text-brand-dark">When to use a toilet finder</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A guide helps you understand the pattern. A toilet finder helps when the next decision has
          to be made in seconds.
        </p>
        <div className="mt-4 grid gap-3">
          {searchMoments.map((moment) => (
            <article key={moment.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{moment.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{moment.body}</p>
            </article>
          ))}
        </div>
        <Link
          to="/toilet-finder-china"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10"
        >
          Open the China toilet finder
        </Link>
      </section>

      <section id="bathroom-tips" className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          China bathroom tips for tourists
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The safest bathroom plan in China is practical, not complicated. Carry a small backup kit,
          choose modern indoor venues first, and avoid waiting until you are already in discomfort.
        </p>
        <div className="mt-3 space-y-3">
          {[
            "Carry tissues and hand sanitizer because public toilet supplies can vary.",
            "Check malls, hotel lobbies, airports, rail hubs, museums, and large cafes first.",
            "When a venue has multiple stalls, look for seated-toilet icons before joining a line.",
            "Use Western Toilet Map when you need a nearby seated-toilet candidate quickly.",
          ].map((tip) => (
            <div key={tip} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>{tip}</p>
            </div>
          ))}
        </div>
        <Link
          to="/china-bathroom-tips"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10"
        >
          Read China bathroom tips
        </Link>
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
        <h2 className="text-base font-extrabold text-brand-dark">Related toilet guides</h2>
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
            to="/china-bathroom-tips"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:border-primary/40"
          >
            China bathroom tips
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
        Western Toilet Map helps foreign travelers find seated toilets nearby in China.
      </footer>
    </AppShell>
  );
}
