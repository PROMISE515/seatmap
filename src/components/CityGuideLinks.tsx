import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { seoCityCount, seoCityLinks } from "@/lib/seo-city-links";

type CityGuideLinksProps = {
  title?: string;
  intro?: string;
};

export function CityGuideLinks({
  title = "City guides",
  intro = `Western Toilet Map now has city pages for ${seoCityCount} popular China travel destinations, including Hong Kong and Macau.`,
}: CityGuideLinksProps) {
  return (
    <section className="px-6 mt-8">
      <h2 className="text-base font-extrabold text-brand-dark">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{intro}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {seoCityLinks.map((city) => (
          <Link
            key={city.to}
            to={city.to}
            className="flex min-h-16 items-start gap-2 rounded-xl border border-border bg-card px-3 py-3 text-sm font-bold text-foreground hover:border-primary/40"
          >
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0">
              <span className="block leading-tight">{city.label}</span>
              <span className="mt-1 block truncate text-[10px] font-bold uppercase leading-tight tracking-wider text-muted-foreground">
                {city.hint}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
