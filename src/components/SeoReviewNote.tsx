import { CalendarCheck, Database } from "lucide-react";
import { SEO_LAST_REVIEWED_LABEL } from "@/lib/site";

type SeoReviewNoteProps = {
  source?: string;
  cadence?: string;
};

export function SeoReviewNote({
  source = "China-local place data, traveler search patterns, and product checks.",
  cadence = "Reviewed after major domain, city, or data-source changes.",
}: SeoReviewNoteProps) {
  return (
    <aside className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
          <CalendarCheck className="size-3.5 text-primary" aria-hidden />
          Last reviewed: {SEO_LAST_REVIEWED_LABEL}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Database className="size-3.5 text-primary" aria-hidden />
          {source}
        </span>
      </div>
      <p className="mt-2 leading-relaxed">{cadence}</p>
    </aside>
  );
}
