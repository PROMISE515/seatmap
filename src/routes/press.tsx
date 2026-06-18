import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Link2, Megaphone, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CityGuideLinks } from "@/components/CityGuideLinks";
import { SeoReviewNote } from "@/components/SeoReviewNote";
import { SEO_LAST_REVIEWED_ISO, SITE_LOGO_URL, SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/press`;
const PAGE_TITLE = "Western Toilet Map Press & Travel Partner Kit";
const PAGE_DESCRIPTION =
  "Official Western Toilet Map description, link targets, anchor text, and travel partner resources for writers covering China bathrooms and western toilets.";

const linkTargets = [
  {
    label: "Western Toilet Map home",
    href: "/",
    use: "Best all-purpose link for app mentions.",
  },
  {
    label: "Toilet finder for China",
    href: "/toilet-finder-china",
    use: "Best link for app roundups and travel tools lists.",
  },
  {
    label: "Western toilets in China",
    href: "/western-toilet-china",
    use: "Best link for travel guides about seated toilets.",
  },
  {
    label: "Toilets in China guide",
    href: "/toilets-in-china",
    use: "Best link for broad first-time visitor advice.",
  },
  {
    label: "Hong Kong public toilets",
    href: "/hong-kong/public-toilets",
    use: "Best city link for low-friction travel content.",
  },
  {
    label: "Shanghai public toilets",
    href: "/shanghai/public-toilets",
    use: "Best city link for mainland gateway travel content.",
  },
];

const anchorText = [
  "Western Toilet Map",
  "toilet finder for China",
  "western toilets in China",
  "find seated toilets in China",
  "China bathroom app for travelers",
];

export const Route = createFileRoute("/press")({
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
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "Western Toilet Map",
              url: SITE_URL,
              logo: {
                "@type": "ImageObject",
                url: SITE_LOGO_URL,
                width: 1254,
                height: 1254,
              },
              description:
                "Western Toilet Map helps foreign travelers in China find nearby seated toilet candidates quickly.",
            },
            {
              "@type": "WebPage",
              "@id": PAGE_URL,
              name: PAGE_TITLE,
              description: PAGE_DESCRIPTION,
              url: PAGE_URL,
              dateModified: SEO_LAST_REVIEWED_ISO,
              about: { "@id": `${SITE_URL}/#organization` },
            },
          ],
        }),
      },
    ],
  }),
  component: PressPage,
});

function PressPage() {
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
        <span className="inline-flex items-center gap-1.5 rounded bg-secondary px-2 py-1 text-[10px] font-bold tracking-wider text-secondary-foreground">
          <Megaphone className="size-3" aria-hidden />
          PRESS & PARTNERS
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-dark leading-tight">
          Western Toilet Map press and travel partner kit
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Western Toilet Map is a mobile web app for foreign travelers in China who need to find a
          nearby seated toilet quickly. This page gives writers, travel planners, directories, and
          partners a clean way to describe and link to the product.
        </p>
      </section>

      <section className="px-6 mt-4">
        <SeoReviewNote
          source="Brand positioning, product pages, and current city guide coverage."
          cadence="Updated when the official domain, city coverage, or recommended link targets change."
        />
      </section>

      <section className="px-6 mt-6">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" aria-hidden />
            <h2 className="text-sm font-extrabold text-brand-dark">Short description</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            Western Toilet Map helps travelers in China find nearby western-style seated toilet
            candidates in seconds, with a focused map, city guides, and one-tap navigation options.
          </p>
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">Recommended link targets</h2>
        <div className="mt-3 grid gap-3">
          {linkTargets.map((target) => (
            <Link
              key={target.href}
              to={target.href}
              className="rounded-xl border border-border bg-card p-4 hover:border-primary/40"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="inline-flex min-w-0 items-center gap-2 text-sm font-extrabold text-foreground">
                  <Link2 className="size-4 shrink-0 text-primary" aria-hidden />
                  {target.label}
                </span>
                <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </span>
              <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                {target.use}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-base font-extrabold text-brand-dark">Suggested anchor text</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {anchorText.map((anchor) => (
            <li
              key={anchor}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground"
            >
              {anchor}
            </li>
          ))}
        </ul>
      </section>

      <CityGuideLinks
        title="City pages to cite"
        intro="Writers can cite destination-specific public-toilet pages for 20 popular China travel cities, including Hong Kong, Macau, Shanghai, Beijing, Chengdu, and Yunnan routes."
      />

      <footer className="px-6 mt-10 pb-6 text-[11px] leading-relaxed text-muted-foreground">
        For accurate attribution, link to the most relevant guide page instead of using copied
        content. Western Toilet Map is English-first and focused on seated-toilet discovery for
        travelers in China.
      </footer>
    </AppShell>
  );
}
