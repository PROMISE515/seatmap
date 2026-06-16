import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, MapPin, Search, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MapPreview } from "@/components/MapPreview";
import { SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/squat-toilets-china`;
const PAGE_TITLE = "Squat Toilets in China - Practical Guide for Tourists | Western Toilet Map";
const PAGE_DESCRIPTION =
  "A practical guide to squat toilets in China for first-time visitors, including where they are common, how to avoid them, and when to use Western Toilet Map to find a seated toilet.";

const commonPlaces = [
  "Older standalone public toilets",
  "Some scenic-area restrooms",
  "Small local restaurants and older transport facilities",
  "Rural stops and older neighborhood facilities",
];

const avoidSteps = [
  "Search nearby malls, hotels, airports, rail stations, museums, and larger cafes first.",
  "Use Western Toilet Map before you are desperate so you can choose a better route.",
  "In a venue with multiple stalls, check for seated-stall icons before joining a line.",
  "If the first option is unclear, navigate to the next indoor candidate instead of walking randomly.",
];

const cityLinks = [
  { label: "Hong Kong", to: "/hong-kong/public-toilets" },
  { label: "Macau", to: "/macau/public-toilets" },
  { label: "Shanghai", to: "/shanghai/public-toilets" },
  { label: "Beijing", to: "/beijing/public-toilets" },
  { label: "Xi'an", to: "/xian/public-toilets" },
  { label: "Zhangjiajie", to: "/zhangjiajie/public-toilets" },
];

const faqs = [
  {
    question: "How common are squat toilets in China?",
    answer:
      "Squat toilets are still common in some public toilets, older venues, scenic areas, and smaller local facilities. Seated toilets are easier to find in modern malls, airports, hotels, and newer commercial districts.",
  },
  {
    question: "Can tourists avoid squat toilets in China?",
    answer:
      "Tourists can avoid many squat toilets by prioritizing modern indoor venues and using a focused seated-toilet finder. It is not guaranteed everywhere, so having backup options matters.",
  },
  {
    question: "What should I do in an emergency?",
    answer:
      "Open Western Toilet Map, allow location, pick the closest likely seated-toilet candidate, and start navigation. Speed matters more than reading long advice in that moment.",
  },
];

export const Route = createFileRoute("/squat-toilets-china")({
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
              headline: "Squat toilets in China",
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
  component: SquatToiletsChinaPage,
});

function SquatToiletsChinaPage() {
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
          SQUAT TOILETS CHINA
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-dark leading-tight">
          Squat toilets in China: a practical guide for first-time visitors
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Squat toilets are part of travel in China, but you do not have to rely on luck. Know where
          they are more common, where seated toilets are more likely, and when to use Western Toilet Map to
          find a better nearby option.
        </p>
      </section>

      <section className="px-6 mt-6">
        <MapPreview
          lat={34.3416}
          lng={108.9398}
          label="Squat toilet backup plan"
          eyebrow="Western Toilet Map travel guide"
          title="Find a seated option nearby"
          subtitle="Use indoor venue candidates when squat toilets are a concern."
        />
      </section>

      <section className="px-6 mt-5 grid gap-3">
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-brand transition active:scale-[0.98]"
        >
          <Search className="size-4" aria-hidden />
          Find a seated toilet nearby
        </Link>
        <Link
          to="/western-toilet-china"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10"
        >
          Read the western toilet guide
        </Link>
      </section>

      <section className="px-6 mt-8">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-primary" aria-hidden />
            <h2 className="text-sm font-extrabold text-brand-dark">
              The short answer for tourists
            </h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Expect both toilet types in China. If you strongly prefer a seated toilet, choose modern
            malls, hotels, airports, rail hubs, and larger cafes before older public facilities.
          </p>
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Where squat toilets are more common
        </h2>
        <div className="mt-3 space-y-3">
          {commonPlaces.map((place) => (
            <div key={place} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>{place}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">How to avoid squat toilets</h2>
        <ol className="mt-3 space-y-3">
          {avoidSteps.map((step, index) => (
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
            to="/toilet-finder-china"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:border-primary/40"
          >
            Toilet finder for China
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
        Western Toilet Map · Find a seated toilet nearby in China in under 10 seconds.
      </footer>
    </AppShell>
  );
}
