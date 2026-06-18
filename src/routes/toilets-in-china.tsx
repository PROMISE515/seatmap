import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Search, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CityGuideLinks } from "@/components/CityGuideLinks";
import { MapPreview } from "@/components/MapPreview";
import { SeoReviewNote } from "@/components/SeoReviewNote";
import { SEO_LAST_REVIEWED_ISO, SITE_URL } from "@/lib/site";

const GUIDE_URL = `${SITE_URL}/toilets-in-china`;
const GUIDE_TITLE = "Toilets in China for Tourists - Western Toilet Guide | Western Toilet Map";
const GUIDE_DESCRIPTION =
  "A practical guide to toilets in China for foreign travelers: public toilet expectations, squat vs seated toilets, toilet paper, hygiene tips, and how to find a nearby option fast.";

const directAnswers = [
  {
    title: "China has both squat and seated toilets",
    body: "Many public restrooms have mixed stall types. Modern malls, airports, rail hubs, hotels, and newer attractions are better bets for seated toilets.",
  },
  {
    title: "Public toilets are useful but variable",
    body: "Some city public toilets are clean and easy to use, while older street facilities may have fewer supplies, more squat stalls, or inconsistent signage.",
  },
  {
    title: "Carry a small backup kit",
    body: "Tissues and hand sanitizer are still worth carrying because toilet paper, soap, and hand dryers vary by venue and time of day.",
  },
];

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

const publicToiletExpectations = [
  {
    title: "Availability",
    body: "Public toilets are common in large Chinese cities, transport hubs, parks, scenic areas, malls, and some pedestrian streets. The challenge is not always finding any toilet; it is finding a suitable seated toilet quickly.",
  },
  {
    title: "Cost",
    body: "Many public toilets are free. A small fee can still appear in older facilities, scenic areas, transport-adjacent areas, or privately managed sites, so carrying a little local payment flexibility helps.",
  },
  {
    title: "Cleanliness",
    body: "Cleanliness varies by city, venue type, maintenance cycle, and crowd level. Large indoor venues are usually more predictable than small older public restrooms.",
  },
  {
    title: "Signage",
    body: "Toilet signs may use icons, English, Chinese, or a mix. If you need a seated stall, check the stall icon or look for accessible/restroom family-room signs before joining a long line.",
  },
];

const supplies = [
  {
    title: "Toilet paper",
    body: "Do not assume every public toilet has toilet paper inside the stall. Some modern venues do; many travelers still carry tissues as a default.",
  },
  {
    title: "Soap and sanitizer",
    body: "Soap is common in better malls, hotels, airports, and museums, but it is not guaranteed everywhere. A pocket sanitizer is a low-effort backup.",
  },
  {
    title: "Trash bins",
    body: "Some restrooms use stall bins or shared bins. Follow the local setup in the stall rather than assuming the disposal pattern is the same as at home.",
  },
  {
    title: "Water and hand dryers",
    body: "Sinks are common, but dryers or paper towels can vary. Plan as if you may need to dry hands without paper towels.",
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

const venueDecisionGuide = [
  {
    situation: "You have 10 minutes before a train or ride",
    move: "Use the station or terminal restroom first, then choose a mall or hotel backup only if the first option is crowded or squat-only.",
  },
  {
    situation: "You are walking between attractions",
    move: "Look for a mall, museum, hotel cluster, or larger cafe on the route instead of relying on the nearest street-side public toilet.",
  },
  {
    situation: "You are with kids, older travelers, or mobility needs",
    move: "Prioritize seated-toilet candidates, accessible stalls, and indoor venues even when they are slightly farther away.",
  },
  {
    situation: "You are in Hong Kong or Macau",
    move: "Search for public toilets around MTR/ferry areas, malls, resorts, and attractions; seated options are generally easier than in older mainland facilities.",
  },
];

const regionPatterns = [
  {
    title: "Mainland gateway cities",
    body: "Shanghai, Beijing, Guangzhou, Shenzhen, Chengdu, Chongqing, and Xi'an have many modern venues, but older neighborhoods and scenic-area restrooms can still be mixed.",
  },
  {
    title: "Hong Kong",
    body: "Public toilets, malls, MTR-linked buildings, ferry areas, and tourist districts are generally easier for English-speaking travelers to navigate.",
  },
  {
    title: "Macau",
    body: "Resorts, ferry terminals, casino malls, and Senado Square routes usually give travelers stronger seated-toilet odds than side-street facilities.",
  },
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
    question: "Are public toilets in China free?",
    answer:
      "Many public toilets in China are free, especially in malls, airports, rail stations, museums, and modern city facilities. Some older or privately managed facilities may still involve a small fee or purchase expectation.",
  },
  {
    question: "Are public toilets in China clean?",
    answer:
      "Cleanliness varies a lot. Modern indoor venues are usually more predictable, while small street-side public toilets and busy scenic-area restrooms can vary by maintenance cycle and crowd level.",
  },
  {
    question: "What should tourists carry for toilets in China?",
    answer:
      "Carry tissues, hand sanitizer, and a little patience for mixed stall layouts. If you need a seated toilet, plan around modern indoor venues and use a focused toilet finder when outside.",
  },
  {
    question: "Are toilets in Hong Kong and Macau different from mainland China?",
    answer:
      "Hong Kong and Macau are usually easier for English-speaking travelers, especially around malls, transit hubs, resorts, and attractions. Western Toilet Map keeps both destinations in the China travel coverage.",
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
        <h2 className="text-base font-extrabold text-brand-dark">
          Direct answer: public toilets in China
        </h2>
        <div className="mt-4 grid gap-3">
          {directAnswers.map((item) => (
            <article key={item.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="public-toilets-in-china" className="px-6 mt-8">
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
          Public toilet realities tourists should know
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Public toilets in China are not one single experience. The right expectation depends on
          the venue type, city, crowd level, and how urgently you need a seated stall.
        </p>
        <div className="mt-4 grid gap-3">
          {publicToiletExpectations.map((item) => (
            <article key={item.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
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

      <section id="toilet-paper" className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          Toilet paper, soap, and what to carry
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The most common China bathroom surprise is not the existence of squat toilets. It is the
          small supply gap that appears when you are already outside.
        </p>
        <div className="mt-4 grid gap-3">
          {supplies.map((item) => (
            <article key={item.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
        <Link
          to="/china-bathroom-tips"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10"
        >
          Read the China bathroom tips checklist
        </Link>
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

      <section id="near-me" className="px-6 mt-8">
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

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">
          How to choose the best nearby option
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          When every minute matters, prioritize the option with the highest chance of a suitable
          stall, not simply the closest map pin.
        </p>
        <div className="mt-4 grid gap-3">
          {venueDecisionGuide.map((item) => (
            <article key={item.situation} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{item.situation}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.move}</p>
            </article>
          ))}
        </div>
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
        <h2 className="text-base font-extrabold text-brand-dark">
          Mainland China, Hong Kong, and Macau patterns
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Many travelers combine mainland China with Hong Kong or Macau. Keep all three in the same
          practical bathroom plan, but adjust expectations by destination.
        </p>
        <div className="mt-4 grid gap-3">
          {regionPatterns.map((item) => (
            <article key={item.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-extrabold text-brand-dark">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <CityGuideLinks intro="Start with the destination page for your China route, then use live search when you need the closest seated-toilet candidate." />

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
