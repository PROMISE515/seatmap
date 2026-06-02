import { MapPin } from "lucide-react";

type MapPreviewProps = {
  lat: number;
  lng: number;
  label: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
};

export function MapPreview({ lat, lng, label, eyebrow, title, subtitle }: MapPreviewProps) {
  const routeOffset = Math.abs(Math.round((lat + lng) * 10)) % 36;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="relative aspect-[16/7] min-h-36 overflow-hidden bg-[#dce7df]">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,24,39,0.12)_1px,transparent_1px),linear-gradient(0deg,rgba(17,24,39,0.12)_1px,transparent_1px)] bg-[length:42px_42px] opacity-45" />
          <div className="absolute -left-12 top-7 h-8 w-[120%] rotate-[-8deg] rounded-full bg-[#f8f3e7]/90 shadow-[0_0_0_1px_rgba(15,23,42,0.08)]" />
          <div className="absolute -left-8 bottom-10 h-7 w-[115%] rotate-[10deg] rounded-full bg-[#f8f3e7]/90 shadow-[0_0_0_1px_rgba(15,23,42,0.08)]" />
          <div className="absolute left-1/3 -top-10 h-[160%] w-9 rotate-[18deg] rounded-full bg-[#f8f3e7]/90 shadow-[0_0_0_1px_rgba(15,23,42,0.08)]" />
          <div className="absolute right-12 -top-16 h-[170%] w-7 rotate-[-20deg] rounded-full bg-[#f8f3e7]/80 shadow-[0_0_0_1px_rgba(15,23,42,0.06)]" />
          <div
            className="absolute left-8 top-7 h-20 w-24 rounded-[2rem] bg-primary/15"
            style={{ transform: `translateX(${routeOffset}px)` }}
          />
          <div className="absolute right-10 top-8 h-16 w-28 rounded-[2rem] bg-sky-300/25" />
          <div className="absolute bottom-8 left-1/2 h-16 w-24 rounded-[2rem] bg-emerald-200/45" />
        </div>
        <div className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-full place-items-center rounded-full bg-primary text-primary-foreground shadow-brand ring-4 ring-background/80">
          <MapPin className="size-5" aria-hidden />
          <span className="sr-only">{label}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent px-4 pb-4 pt-10">
          {eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {eyebrow}
            </p>
          )}
          <div className="mt-1">
            <div className="min-w-0">
              <h2 className="truncate text-base font-extrabold text-brand-dark">{title}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
