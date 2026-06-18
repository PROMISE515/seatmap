import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Droplets,
  PackageCheck,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CityGuideLinks } from "@/components/CityGuideLinks";
import { MapPreview } from "@/components/MapPreview";
import { SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/china-bathroom-tips`;
const PAGE_TITLE =
  "China Bathroom Tips for Tourists - Practical Restroom Guide | Western Toilet Map";
const PAGE_DESCRIPTION =
  "Practical China bathroom tips for foreign tourists: where to look first, what to carry, how to avoid squat toilets, and how Western Toilet Map helps find seated toilets nearby.";

const tips = [
  {
    title: "Choose indoor venues first",
    body: "Modern malls, hotels, airports, rail hubs, larger cafes, and museums are more predictable than small standalone public toilets.",
  },
  {
    title: "Carry a small backup kit",
    body: "Keep tissues, hand sanitizer, and a small plastic bag in your day pack. Some public toilets may not provide paper or soap.",
  },
  {
    title: "Do not wait until it is urgent",
    body: "When you are already uncomfortable, decision time gets expensive. Search nearby seated-toilet candidates before the situation becomes stressful.",
  },
  {
    title: "Use local map coverage",
    body: "In mainland China, China-local place data can be more useful than a generic global map. Western Toilet Map keeps that data focused on one travel need.",
  },
];

const toiletPaperSections = [
  {
    title: "Carry tissues even in big cities",
    icon: PackageCheck,
    body: "Many malls, airports, and hotels provide paper, but smaller public toilets, parks, older transit areas, and crowded tourist routes can be inconsistent. A pocket pack of tissues is still the lowest-friction backup.",
  },
  {
    title: "Do not count on soap everywhere",
    icon: Droplets,
    body: "Some restrooms have soap or sanitizer, and some do not. Carry a small sanitizer bottle or wipes when you expect long walking routes, day trips, or rural scenic areas.",
  },
  {
    title: "Follow local signs for bins and flushing",
    icon: Trash2,
    body: "Plumbing expectations can vary by venue. If a restroom asks users to put paper in a bin, follow the local sign. In modern malls and hotels, flushing paper is usually less confusing, but signage still wins.",
  },
];

const faqs = [
  {
    question: "Should tourists carry toilet paper in China?",
    answer:
      "Yes. Many modern venues provide paper, but tourists should still carry tissues and sanitizer because public toilet supplies can vary.",
  },
  {
    question: "Do public toilets in China usually have toilet paper?",
    answer:
      "Some do, especially in modern malls, airports, hotels, and newer attractions, but it is not reliable enough for tourists to assume. Carry a small tissue pack as your backup.",
  },
  {
    question: "Do bathrooms in China usually have soap?",
    answer:
      "Soap is common in better indoor venues but not guaranteed in all public toilets. A small sanitizer bottle or wet wipes can remove a lot of stress on long sightseeing days.",
  },
  {
    question: "Where should I look first for a cleaner bathroom in China?",
    answer:
      "Start with premium malls, international hotels, airports, major rail stations, modern museums, and larger coffee chains.",
  },
  {
    question: "Can I flush toilet paper in China?",
    answer:
      "In many modern venues this is straightforward, but some restrooms ask users to place paper in a bin. Follow the posted sign or local instruction when one is visible.",
  },
  {
    question: "How can I find a seated toilet quickly?",
    answer:
      "Open Western Toilet Map, allow location, choose a nearby seated-toilet candidate, and start navigation. It is built for the emergency travel moment.",
  },
];

export const Route = createFileRoute("/china-bathroom-tips")({
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
              headline: "China bathroom tips for tourists",
              description: PAGE_DESCRIPTION,
              mainEntityOfPage: PAGE_URL,
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
  component: ChinaBathroomTipsPage,
});

function ChinaBathroomTipsPage() {
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
          CHINA BATHROOM TIPS
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-dark leading-tight">
          China bathroom tips every first-time tourist should know
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Bathrooms in China are manageable when you know where to look. The safest pattern is
          simple: prioritize modern indoor venues, carry a small backup kit, and use Western Toilet
          Map when you need a seated toilet nearby.
        </p>
      </section>

      <section className="px-6 mt-6">
        <MapPreview
          lat={39.9042}
          lng={116.4074}
          label="China bathroom tips"
          eyebrow="Travel restroom plan"
          title="Find a better nearby option"
          subtitle="Use malls, hotels, airports, and Western Toilet Map before it becomes urgent."
        />
      </section>

      <section className="px-6 mt-5 grid gap-3">
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-brand transition active:scale-[0.98]"
        >
          <Search className="size-4" aria-hidden />
          Search toilets near me
        </Link>
        <Link
          to="/toilets-in-china"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10"
        >
          Read the full China toilet guide
        </Link>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">The practical checklist</h2>
        <div className="mt-4 grid gap-3">
          {tips.map((tip) => (
            <article key={tip.title} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" aria-hidden />
                <h3 className="text-sm font-extrabold text-brand-dark">{tip.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tip.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">Quick rules</h2>
        <div className="mt-3 space-y-3">
          {[
            "If a venue looks modern and busy, it is usually a better first choice.",
            "Do not assume every tourist attraction has a seated toilet in the nearest restroom.",
            "Use Western Toilet Map when you need speed, not when you have time to read long travel advice.",
          ].map((rule) => (
            <div key={rule} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>{rule}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Do public toilets in China have toilet paper?
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            The safest answer for tourists is: sometimes, but do not rely on it. Better indoor
            venues often provide toilet paper, while standalone public toilets and older facilities
            can be less predictable.
          </p>
          <p>
            Treat toilet paper like a travel essential, not a panic item. Keep tissues, sanitizer,
            and a few wipes in the same pocket or pouch you use for passport copies, transit cards,
            and day-trip basics.
          </p>
        </div>
        <div className="mt-4 grid gap-3">
          {toiletPaperSections.map((section) => {
            const Icon = section.icon;

            return (
              <article key={section.title} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-brand-dark">{section.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {section.body}
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
          Where supplies are more predictable
        </h2>
        <div className="mt-3 grid gap-3">
          {[
            {
              title: "More predictable",
              body: "International hotels, premium malls, airports, larger railway stations, museums, and bigger cafes are better first checks for paper, soap, and seated stalls.",
            },
            {
              title: "Less predictable",
              body: "Standalone public toilets, older parks, small scenic-area toilets, long outdoor routes, and crowded festival areas are where your backup kit matters most.",
            },
            {
              title: "Best emergency pattern",
              body: "Open Western Toilet Map before the situation is urgent, choose a modern indoor candidate nearby, and keep tissues plus sanitizer as the backup layer.",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <CityGuideLinks intro="Check destination pages before long walking routes, especially when traveling with family, luggage, or accessibility needs." />

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">Related guides</h2>
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
        Western Toilet Map · Bathroom confidence for foreign travelers in China.
      </footer>
    </AppShell>
  );
}
