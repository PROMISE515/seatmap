import { MapPin } from "lucide-react";
import { gcj02ToWgs84 } from "@/lib/amap";

type MapPreviewProps = {
  lat: number;
  lng: number;
  label: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
};

export function MapPreview({ lat, lng, label, eyebrow, title, subtitle }: MapPreviewProps) {
  const center = gcj02ToWgs84(lat, lng);
  const zoom = 15;
  const tileSize = 256;
  const scale = 2 ** zoom;
  const latRad = (center.lat * Math.PI) / 180;
  const xFloat = ((center.lng + 180) / 360) * scale;
  const yFloat = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale;
  const tileX = Math.floor(xFloat);
  const tileY = Math.floor(yFloat);
  const offsetX = (xFloat - tileX) * tileSize;
  const offsetY = (yFloat - tileY) * tileSize;
  const tiles = [-1, 0, 1].flatMap((dy) =>
    [-1, 0, 1].map((dx) => {
      const x = tileX + dx;
      const y = tileY + dy;
      return {
        key: `${x}:${y}`,
        x: (dx + 1) * tileSize,
        y: (dy + 1) * tileSize,
        src: `https://basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${x}/${y}@2x.png`,
      };
    }),
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="relative aspect-[16/7] min-h-36 overflow-hidden bg-[#e8efe9]">
        <div
          aria-hidden
          className="absolute h-[768px] w-[768px]"
          style={{
            left: `calc(50% - ${tileSize + offsetX}px)`,
            top: `calc(50% - ${tileSize + offsetY}px)`,
          }}
        >
          {tiles.map((tile) => (
            <img
              key={tile.key}
              src={tile.src}
              alt=""
              className="absolute size-64 max-w-none select-none"
              style={{ left: tile.x, top: tile.y }}
              loading="lazy"
              draggable={false}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-primary/5" aria-hidden />
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
