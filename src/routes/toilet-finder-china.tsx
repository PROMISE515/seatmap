import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, MapPin, Navigation, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MapPreview } from "@/components/MapPreview";
import { SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/toilet-finder-china`;
const PAGE_TITLE = "Toilet Finder China - Find Western Toilets Nearby | SeatMap";
const PAGE_DESCRIPTION =
  "SeatMap is a focused toilet finder for China, helping foreign travelers find nearby seated toilets with fast search and map navigation.";

const steps = [
  "Open SeatMap on your phone.",
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
            },
            {
              "@type": "SoftwareApplication",
              name: "SeatMap",
              applicationCategory: "TravelApplication",
              operatingSystem: "Web",
              url: SITE_URL,
              description: PAGE_DESCRIPTION,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
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
          SeatMap is built for one stressful travel moment: you need a seated toilet nearby, fast.
          Search once for free, then choose a travel pass if you want unlimited trip access.
        </p>
      </section>

      <section className="px-6 mt-6">
        <MapPreview
          lat={30.5728}
          lng={104.0668}
          label="SeatMap toilet finder"
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
        <h2 className="text-base font-extrabold text-brand-dark">How SeatMap works</h2>
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
            "SeatMap keeps the interface focused: location, nearby candidates, and navigation.",
            "The product prioritizes venues with higher seated-toilet likelihood, not every restroom label.",
          ].map((line) => (
            <div key={line} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>{line}</p>
            </div>
          ))}
        </div>
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

      <section className="px-6 mt-8">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Navigation className="size-4 text-primary" aria-hidden />
            <h2 className="text-sm font-extrabold text-brand-dark">Navigation options</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            SeatMap supports handoff to Apple Maps, Google Maps, and AMap so travelers can choose
            the navigation app that works best on their device in China.
          </p>
        </div>
      </section>

      <footer className="px-6 mt-10 pb-6 text-[11px] text-muted-foreground">
        SeatMap · Find a western toilet nearby in China in under 10 seconds.
      </footer>
    </AppShell>
  );
}
