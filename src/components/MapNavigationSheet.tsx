import { useState } from "react";
import { Apple, Map, Navigation } from "lucide-react";
import type { ToiletDTO } from "@/lib/amap";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useT } from "@/lib/i18n";

type MapNavigationSheetProps = {
  toilet: Pick<ToiletDTO, "name" | "address" | "lat" | "lng">;
  triggerClassName?: string;
  triggerLabel?: string;
};

function buildMapUrls(toilet: Pick<ToiletDTO, "name" | "address" | "lat" | "lng">) {
  const q = encodeURIComponent(`${toilet.name} ${toilet.address}`);
  return {
    apple: `https://maps.apple.com/?daddr=${toilet.lat},${toilet.lng}&q=${q}`,
    google: `https://www.google.com/maps/dir/?api=1&destination=${toilet.lat},${toilet.lng}`,
    amap: `https://uri.amap.com/navigation?to=${toilet.lng},${toilet.lat},${q}&mode=walk`,
  };
}

export function MapNavigationSheet({
  toilet,
  triggerClassName,
  triggerLabel = "Navigate",
}: MapNavigationSheetProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const urls = buildMapUrls(toilet);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        <Navigation className="size-3.5" aria-hidden />
        {triggerLabel}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{t("map.openInMaps")}</SheetTitle>
            <SheetDescription>{t("map.chooseApp")}</SheetDescription>
          </SheetHeader>
          <div className="space-y-2 mt-4">
            <a
              href={urls.apple}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary/40 font-semibold"
            >
              <Apple className="size-4 text-primary" aria-hidden />
              Apple Maps
            </a>
            <a
              href={urls.google}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary/40 font-semibold"
            >
              <Map className="size-4 text-primary" aria-hidden />
              Google Maps
            </a>
            <a
              href={urls.amap}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary/40 font-semibold"
            >
              <Navigation className="size-4 text-primary" aria-hidden />
              Amap (高德地图)
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
