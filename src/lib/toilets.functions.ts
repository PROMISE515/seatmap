import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  wgs84ToGcj02,
  walkMinFromMeters,
  classifyToilet,
  parseFloor,
  isLikelyWestern,
  getSeatedConfidence,
  type ToiletDTO,
} from "./amap";
import { getCuratedToiletById } from "./curated-city-toilets";
import { cleanTranslatedName, translateNames } from "./translate.server";

const FALLBACK_PHOTO = "/placeholder.svg";
const AMAP_TOILET_TYPE = "200300";
const SEARCH_STRATEGY_VERSION = "phase1-nursery-pages-v2";
const MIN_DATABASE_RESULTS_BEFORE_LIVE_SEARCH = 20;
const RELIABLE_VENUE_SEARCHES = [
  { types: "060100|060101|060102|060400" },
  { types: "100000|100100" },
];
const ACCESSIBLE_TOILET_SEARCHES = [{ keywords: "无障碍厕所" }];
const NURSERY_SEARCHES = [{ keywords: "母婴室" }, { keywords: "母婴" }];
type SearchMode = "toilet" | "nursery";

type AmapPhoto = { title?: string; url?: string };

type AmapPoi = {
  id: string;
  name: string;
  address?: string | string[];
  location?: string;
  cityname?: string | string[];
  adname?: string | string[];
  pname?: string | string[];
  type?: string;
  tel?: string | string[];
  distance?: string;
  photos?: AmapPhoto[];
};

type SeatMapPoi = AmapPoi & { seatmapSource: "toilet" | "venue" };
type ToiletRow = {
  amap_id: string;
  name: string;
  address: string | null;
  city: string | null;
  district?: string | null;
  province?: string | null;
  lat: number;
  lng: number;
  type?: string | null;
  tel?: string | null;
  photo_url?: string | null;
};

function s(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v.join("");
  if (typeof v === "string") return v;
  return "";
}

function firstPhoto(p: AmapPoi): string | null {
  const photo = p.photos?.find((ph) => ph.url)?.url;
  return photo ?? null;
}

function normalizeVenueKey(input: string) {
  return input
    .toLowerCase()
    .replace(/[（(][^）)]*[）)]/g, "")
    .replace(/男|女|无障碍|第三|公共|公用/g, "")
    .replace(
      /卫生间|洗手间|厕所|公厕|母婴室?|toilet|restroom|bathroom|nursery\s*room|baby\s*care/gi,
      "",
    )
    .replace(/[-_—·,，。/\\]/g, "")
    .replace(/\b(b|l)?\d+\s*(f|层|楼)?\b/gi, "")
    .replace(/地下\d*层?/g, "")
    .replace(/[一二三四五六七八九十]+楼/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function venueKeyForToilet(toilet: ToiletDTO) {
  const rawName = toilet.rawName ?? toilet.name;
  const venueMatch = rawName.match(/[（(]([^）)]+)[）)]/);
  const venueName = venueMatch?.[1] ?? rawName;
  const key = normalizeVenueKey(`${venueName} ${toilet.address}`);
  if (key.length >= 4) return key;
  return `${Math.round(toilet.lat * 1000)}:${Math.round(toilet.lng * 1000)}`;
}

function floorSortValue(floor: string) {
  const basement = floor.match(/^B(\d+)$/i);
  if (basement) return -Number(basement[1]);
  const aboveGround = floor.match(/^(\d+)F$/i);
  if (aboveGround) return Number(aboveGround[1]);
  return null;
}

function formatFloorRange(toilets: ToiletDTO[]) {
  const floors = toilets
    .map((toilet) => toilet.floor)
    .filter((floor): floor is string => Boolean(floor))
    .map((floor) => ({ floor, value: floorSortValue(floor) }))
    .filter((item): item is { floor: string; value: number } => item.value !== null)
    .sort((a, b) => a.value - b.value);

  const unique = [...new Map(floors.map((item) => [item.floor, item])).values()];
  if (unique.length === 0) return undefined;
  if (unique.length === 1) return unique[0].floor;
  return `${unique[0].floor}~${unique[unique.length - 1].floor}`;
}

function dedupeVenueResults(toilets: ToiletDTO[]) {
  const groups = new Map<string, ToiletDTO[]>();
  for (const toilet of toilets) {
    const key = venueKeyForToilet(toilet);
    groups.set(key, [...(groups.get(key) ?? []), toilet]);
  }

  return [...groups.values()]
    .map((group) => {
      const [best] = group.sort((a, b) => {
        const aHasToilet = a.tags.includes("Western Toilet") ? 0 : 1;
        const bHasToilet = b.tags.includes("Western Toilet") ? 0 : 1;
        if (aHasToilet !== bHasToilet) return aHasToilet - bHasToilet;
        return a.distanceM - b.distanceM;
      });
      return {
        ...best,
        name: best.name,
        tags: mergeTags(group.flatMap((item) => item.tags)),
        floor: group.length > 1 ? formatFloorRange(group) : best.floor,
        hasAccessible: group.some((item) => item.kind === "accessible" || item.hasAccessible),
        seatedConfidence: group.some((item) => item.seatedConfidence === "confirmed")
          ? "confirmed"
          : group.some((item) => item.seatedConfidence === "likely")
            ? "likely"
            : "needs_confirmation",
        canNavigate: group.some((item) => item.canNavigate),
        duplicateCount: group.length > 1 ? group.length : undefined,
      };
    })
    .sort((a, b) => a.distanceM - b.distanceM);
}

function filterResultsForMode(toilets: ToiletDTO[], mode: SearchMode) {
  if (mode === "nursery") return toilets.filter((toilet) => toilet.tags.includes("Nursery"));
  return toilets.filter((toilet) => toilet.tags.includes("Western Toilet"));
}

function distanceMeters(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const dx = (toLng - fromLng) * 111000 * Math.cos((fromLat * Math.PI) / 180);
  const dy = (toLat - fromLat) * 111000;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}

function boundsForRadius(lat: number, lng: number, radius: number) {
  const latDelta = radius / 111000;
  const lngDelta = radius / (111000 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

async function getBlacklistedAmapIds(amapIds: string[]) {
  const unique = [...new Set(amapIds.filter(Boolean))];
  if (unique.length === 0) return new Set<string>();

  try {
    const { data, error } = await supabaseAdmin
      .from("toilet_blacklist")
      .select("amap_id")
      .in("amap_id", unique);
    if (error) return new Set<string>();
    return new Set((data ?? []).map((row) => row.amap_id));
  } catch {
    return new Set<string>();
  }
}

async function fetchFromAmap(
  gcjLat: number,
  gcjLng: number,
  radius: number,
  options: { types?: string; keywords?: string } = {},
  pages = 1,
) {
  const key = process.env.AMAP_WEB_SERVICE_KEY;
  if (!key) throw new Error("AMAP_WEB_SERVICE_KEY is not configured");

  const allPois: AmapPoi[] = [];
  const safePages = Math.max(1, Math.min(pages, 4));

  for (let page = 1; page <= safePages; page += 1) {
    const url = new URL("https://restapi.amap.com/v3/place/around");
    url.searchParams.set("key", key);
    url.searchParams.set("location", `${gcjLng.toFixed(6)},${gcjLat.toFixed(6)}`);
    if (options.types) url.searchParams.set("types", options.types);
    if (options.keywords) url.searchParams.set("keywords", options.keywords);
    url.searchParams.set("radius", String(radius));
    url.searchParams.set("sortrule", "distance");
    url.searchParams.set("offset", "25");
    url.searchParams.set("page", String(page));
    url.searchParams.set("extensions", "all");

    let res: Response;
    try {
      res = await fetch(url.toString());
    } catch {
      throw new Error("AMap request failed");
    }
    if (!res.ok) throw new Error(`AMap HTTP ${res.status}`);
    const json = (await res.json()) as { status: string; info?: string; pois?: AmapPoi[] };
    if (json.status !== "1") throw new Error(`AMap error: ${json.info ?? "unknown"}`);

    const pois = json.pois ?? [];
    allPois.push(...pois);
    if (pois.length < 25) break;
  }

  return allPois;
}

async function fetchSeatMapCandidates(
  gcjLat: number,
  gcjLng: number,
  radius: number,
  mode: SearchMode,
) {
  if (mode === "nursery") {
    const groups = await Promise.all(
      NURSERY_SEARCHES.map((search) =>
        fetchFromAmap(gcjLat, gcjLng, radius, search, 2)
          .then((pois) => pois.map((p) => ({ ...p, seatmapSource: "venue" as const })))
          .catch(() => [] as SeatMapPoi[]),
      ),
    );
    const byId = new Map<string, SeatMapPoi>();
    for (const poi of groups.flat()) {
      if (!poi.id || !poi.location) continue;
      byId.set(poi.id, poi);
    }
    return [...byId.values()];
  }

  const searches = [
    fetchFromAmap(gcjLat, gcjLng, radius, { types: AMAP_TOILET_TYPE }).then((pois) =>
      pois.map((p) => ({ ...p, seatmapSource: "toilet" as const })),
    ),
    ...RELIABLE_VENUE_SEARCHES.map((search) =>
      fetchFromAmap(gcjLat, gcjLng, radius, search)
        .then((pois) => pois.map((p) => ({ ...p, seatmapSource: "venue" as const })))
        .catch(() => [] as SeatMapPoi[]),
    ),
    ...ACCESSIBLE_TOILET_SEARCHES.map((search) =>
      fetchFromAmap(gcjLat, gcjLng, radius, search)
        .then((pois) => pois.map((p) => ({ ...p, seatmapSource: "toilet" as const })))
        .catch(() => [] as SeatMapPoi[]),
    ),
    ...NURSERY_SEARCHES.map((search) =>
      fetchFromAmap(gcjLat, gcjLng, radius, search)
        .then((pois) => pois.map((p) => ({ ...p, seatmapSource: "venue" as const })))
        .catch(() => [] as SeatMapPoi[]),
    ),
  ];

  const groups = await Promise.all(searches);
  const byId = new Map<string, SeatMapPoi>();
  for (const poi of groups.flat()) {
    if (!poi.id || !poi.location) continue;
    const existing = byId.get(poi.id);
    if (!existing || existing.seatmapSource === "venue") {
      byId.set(poi.id, poi);
    }
  }
  return [...byId.values()];
}

function hasNurserySignal(name: string, address = "") {
  return /母婴|nursery|baby\s*care|family\s*room/i.test(`${name} ${address}`);
}

function hasAccessibleSignal(name: string, address = "") {
  return /无障碍|accessible/i.test(`${name} ${address}`);
}

function hasFreeSignal(name: string, address = "") {
  return /免费|free/i.test(`${name} ${address}`);
}

function mergeTags(tags: string[]) {
  const ordered = ["Western Toilet", "Accessible", "Nursery", "Free"];
  const set = new Set(tags);
  return ordered.filter((tag) => set.has(tag));
}

function hasUsefulPoiName(name: string) {
  const cleaned = name
    .replace(/[（）()]/g, "")
    .replace(/母婴室?|nursery\s*room|baby\s*care/gi, "")
    .replace(/\b(b|l)?\d+\s*(f|层|楼)?\b/gi, "")
    .replace(/地下\d*层?/g, "")
    .replace(/[一二三四五六七八九十]+楼/g, "")
    .replace(/[-_.·,，。/\\\s]/g, "");
  return cleaned.length >= 2;
}

function stripGenericPoiText(input: string) {
  return input
    .replace(/[（）]/g, (match) => (match === "（" ? "(" : ")"))
    .replace(/母婴室?|母婴|亲子卫生间|第三卫生间|卫生间|洗手间|厕所|公厕/gi, "")
    .replace(/nursery\s*room|baby\s*care|family\s*room|restroom|bathroom|toilet/gi, "")
    .replace(/\b(b|l)?\d+\s*(f|层|楼)?\b/gi, "")
    .replace(/地下\d*层?/g, "")
    .replace(/[一二三四五六七八九十]+楼/g, "")
    .replace(/^[\s/\\._·,，。;；:-]+/g, "")
    .replace(/[\s/\\._·,，。;；:-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function displaySourceNameForPoi(mode: SearchMode, name: string, address = "") {
  if (hasUsefulPoiName(name)) return name;
  if (mode !== "nursery" && !hasNurserySignal(name, address)) return name;

  const fromAddress = stripGenericPoiText(address);
  if (hasUsefulPoiName(fromAddress)) return fromAddress;

  const fromCombined = stripGenericPoiText(`${name} ${address}`);
  if (hasUsefulPoiName(fromCombined)) return fromCombined;

  return name;
}

function hasUsefulDisplaySource(mode: SearchMode, name: string, address = "") {
  return hasUsefulPoiName(displaySourceNameForPoi(mode, name, address));
}

function hasChinese(text: string) {
  return /[\u3400-\u9fff]/.test(text);
}

function isUsableDisplayName(name: string) {
  const cleaned = cleanTranslatedName(name);
  if (!cleaned || hasChinese(cleaned)) return false;
  if (/^[-_.()\s/\\·,]+$/.test(cleaned)) return false;
  if (
    /^(nursery room|baby care|family room|restroom|bathroom|toilet|public toilet|shopping mall|mall|plaza|hotel|venue|traveler-friendly venue|traveler-friendly hotel|traveler-friendly mall)$/i.test(
      cleaned,
    )
  ) {
    return false;
  }
  if (
    /^(the\s+)?(nursery room|restroom|bathroom|toilet|shopping mall|mall|plaza|hotel)\s*\d*$/i.test(
      cleaned,
    )
  ) {
    return false;
  }
  return true;
}

function filterDisplayableToilets(toilets: ToiletDTO[]) {
  return toilets.filter((toilet) => isUsableDisplayName(toilet.name));
}

function isModeCandidate(mode: SearchMode, name: string, address = "") {
  if (mode === "nursery") {
    return hasNurserySignal(name, address) && hasUsefulDisplaySource(mode, name, address);
  }

  return (
    isLikelyWestern(name, address) ||
    (hasNurserySignal(name, address) && hasUsefulDisplaySource(mode, name, address))
  );
}

function tagsForPoi(mode: SearchMode, name: string, address: string) {
  if (mode === "nursery") return ["Nursery", "Free"];
  const seatedConfidence = getSeatedConfidence(name, address);
  const tags = seatedConfidence === "needs_confirmation" ? ["Free"] : ["Western Toilet", "Free"];
  if (hasAccessibleSignal(name, address)) tags.push("Accessible");
  if (hasNurserySignal(name, address)) tags.push("Nursery");
  if (hasFreeSignal(name, address)) tags.push("Free");
  return mergeTags(tags);
}

function canNavigateToPoi(mode: SearchMode, name: string, address: string) {
  if (mode === "nursery") return true;
  const seatedConfidence = getSeatedConfidence(name, address);
  return seatedConfidence === "confirmed" || seatedConfidence === "likely";
}

// Ensure English names exist for the given (amap_id, chinese_name) pairs.
// Looks up cached translations from `toilets.name_en`; missing ones are
// translated via Youdao/local fallbacks and persisted. Returns a Map<amap_id, name_en>.
async function ensureTranslations(
  pairs: Array<{ amapId: string; name: string }>,
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (pairs.length === 0) return out;

  const ids = pairs.map((p) => p.amapId);
  const isUsableTranslatedName = (value: string) => {
    const cleaned = cleanTranslatedName(value);
    if (!isUsableDisplayName(cleaned)) return false;
    if (/^[-_.()\s/\\·,]+$/.test(cleaned)) return false;
    if (/^\([^)]*\)$/.test(cleaned)) return false;
    if (/\(\s*\)$/.test(cleaned)) return false;
    if (
      /^(hotel|mall|restroom|toilet|public toilet|traveler-friendly venue|traveler-friendly hotel|traveler-friendly mall)$/i.test(
        cleaned,
      )
    ) {
      return false;
    }
    return true;
  };
  const fallback = async () => {
    const translated = await translateNames(pairs.map((p) => p.name));
    return new Map(pairs.map((p, i) => [p.amapId, translated[i] ?? p.name]));
  };

  const { data: existing, error } = await supabaseAdmin
    .from("toilets")
    .select("amap_id, name_en")
    .in("amap_id", ids);

  if (error) return fallback();

  const cached = new Map<string, string>();
  for (const r of existing ?? []) {
    if (r.name_en) {
      const cleanedName = cleanTranslatedName(r.name_en);
      if (isUsableTranslatedName(cleanedName)) cached.set(r.amap_id, cleanedName);
    }
  }

  const missing = pairs.filter((p) => !cached.get(p.amapId));
  if (missing.length > 0) {
    const translated = await translateNames(missing.map((m) => m.name));
    const updates = missing.map((m, i) => ({
      amapId: m.amapId,
      nameEn: cleanTranslatedName(translated[i] ?? m.name),
    }));
    // Persist translations
    await Promise.all(
      updates.map((u) =>
        supabaseAdmin.from("toilets").update({ name_en: u.nameEn }).eq("amap_id", u.amapId),
      ),
    );
    for (const u of updates) {
      if (isUsableTranslatedName(u.nameEn)) cached.set(u.amapId, u.nameEn);
    }
  }

  for (const p of pairs) {
    out.set(p.amapId, cached.get(p.amapId) ?? p.name);
  }
  return out;
}

async function rowsToToiletDTOs(rows: ToiletRow[], lat: number, lng: number, mode: SearchMode) {
  const filtered = rows.filter((row) => isModeCandidate(mode, row.name, row.address ?? ""));
  const nameMap = await ensureTranslations(
    filtered.map((row) => ({
      amapId: row.amap_id,
      name: displaySourceNameForPoi(mode, row.name, row.address ?? ""),
    })),
  );

  return filtered.map<ToiletDTO>((row) => {
    const address = row.address ?? "";
    const distanceM = distanceMeters(lat, lng, row.lat, row.lng);
    const kind = classifyToilet(row.name, address);
    const seatedConfidence = getSeatedConfidence(row.name, address);
    return {
      id: row.amap_id,
      name: nameMap.get(row.amap_id) ?? row.name,
      rawName: row.name,
      walkMin: walkMinFromMeters(distanceM),
      distanceM,
      tags: tagsForPoi(mode, row.name, address),
      address,
      city: row.city ?? "",
      lat: row.lat,
      lng: row.lng,
      photo: row.photo_url ?? FALLBACK_PHOTO,
      kind,
      hasAccessible: kind === "accessible",
      floor: parseFloor(address),
      seatedConfidence,
      canNavigate: canNavigateToPoi(mode, row.name, address),
    };
  });
}

async function fetchDatabaseToilets(lat: number, lng: number, radius: number, mode: SearchMode) {
  const bounds = boundsForRadius(lat, lng, radius);

  const { data, error } = await supabaseAdmin
    .from("toilets")
    .select("*")
    .gte("lat", bounds.minLat)
    .lte("lat", bounds.maxLat)
    .gte("lng", bounds.minLng)
    .lte("lng", bounds.maxLng)
    .limit(300);

  if (error) return [];

  const rows = ((data ?? []) as ToiletRow[])
    .map((row) => ({
      row,
      distanceM: distanceMeters(lat, lng, row.lat, row.lng),
    }))
    .filter((item) => item.distanceM <= radius)
    .sort((a, b) => a.distanceM - b.distanceM)
    .map((item) => item.row);

  const blacklisted = await getBlacklistedAmapIds(rows.map((row) => row.amap_id));
  const safeRows = rows.filter((row) => !blacklisted.has(row.amap_id));
  const dtos = await rowsToToiletDTOs(safeRows, lat, lng, mode);
  return filterDisplayableToilets(filterResultsForMode(dedupeVenueResults(dtos), mode));
}

export const findNearbyToilets = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        radius: z.number().int().min(100).max(50000).default(1000),
        gcj: z.boolean().default(false),
        searchMode: z.enum(["toilet", "nursery"]).default("toilet"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { lat: rawLat, lng: rawLng, radius, gcj, searchMode } = data;
    const { lat, lng } = gcj ? { lat: rawLat, lng: rawLng } : wgs84ToGcj02(rawLat, rawLng);

    const databaseToilets = await fetchDatabaseToilets(lat, lng, radius, searchMode);
    if (databaseToilets.length >= MIN_DATABASE_RESULTS_BEFORE_LIVE_SEARCH) {
      return {
        cached: true,
        toilets: databaseToilets,
        region: null,
      };
    }

    const cacheKey = `${SEARCH_STRATEGY_VERSION}:${searchMode}:${lat.toFixed(3)},${lng.toFixed(3)},${radius}`;

    let allPois: SeatMapPoi[] = [];
    try {
      allPois = await fetchSeatMapCandidates(lat, lng, radius, searchMode);
    } catch (error) {
      if (databaseToilets.length > 0) {
        return {
          cached: true,
          toilets: databaseToilets,
          region: null,
        };
      }
      throw error;
    }
    const blacklisted = await getBlacklistedAmapIds(allPois.map((p) => p.id));
    const pois = allPois.filter((p) =>
      blacklisted.has(p.id) ? false : isModeCandidate(searchMode, p.name ?? "", s(p.address)),
    );

    const liveRows: ToiletRow[] = [];
    if (pois.length > 0) {
      const rows = pois.map((p) => {
        const [lngStr, latStr] = (p.location ?? "0,0").split(",");
        return {
          amap_id: p.id,
          name: p.name,
          address: s(p.address) || null,
          city: s(p.cityname) || null,
          district: s(p.adname) || null,
          province: s(p.pname) || null,
          lat: Number(latStr),
          lng: Number(lngStr),
          type: p.type ?? null,
          tel: s(p.tel) || null,
          photo_url: firstPhoto(p),
          raw: JSON.parse(JSON.stringify(p)),
          updated_at: new Date().toISOString(),
        };
      });
      liveRows.push(...rows);
      try {
        await supabaseAdmin.from("toilets").upsert(rows, { onConflict: "amap_id" });
      } catch {
        // Live AMap search should still work before Supabase migrations are applied.
      }
    }

    try {
      await supabaseAdmin.from("toilet_search_cache").upsert(
        {
          cache_key: cacheKey,
          lat,
          lng,
          radius_m: radius,
          amap_ids: [...databaseToilets.map((toilet) => toilet.id), ...pois.map((p) => p.id)],
          created_at: new Date().toISOString(),
        },
        { onConflict: "cache_key" },
      );
    } catch {
      // Cache persistence is optional in local setup.
    }

    const liveToilets = await rowsToToiletDTOs(liveRows, lat, lng, searchMode);
    const combined = [...databaseToilets, ...liveToilets];
    const byId = new Map<string, ToiletDTO>();
    for (const toilet of combined) {
      const existing = byId.get(toilet.id);
      if (!existing || toilet.distanceM < existing.distanceM) byId.set(toilet.id, toilet);
    }

    return {
      cached: false,
      toilets: filterDisplayableToilets(
        filterResultsForMode(dedupeVenueResults([...byId.values()]), searchMode),
      ),
      region: null,
    };
  });

export const filterBlacklistedToiletIds = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        ids: z.array(z.string().min(1).max(128)).max(100),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const blacklisted = await getBlacklistedAmapIds(data.ids);
    return { ids: [...blacklisted] };
  });

// --- Detail lookup ------------------------------------------------------

export const getToiletByAmapId = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        amapId: z
          .string()
          .min(1)
          .max(64)
          .regex(/^[A-Za-z0-9_-]+$/),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin
      .from("toilets")
      .select("*")
      .eq("amap_id", data.amapId)
      .maybeSingle();

    if (!row) {
      if (data.amapId.startsWith("curated-")) {
        return { toilet: getCuratedToiletById(data.amapId) };
      }
      return { toilet: null };
    }

    const blacklisted = await getBlacklistedAmapIds([row.amap_id]);
    if (blacklisted.has(row.amap_id)) return { toilet: null };

    const nameMap = await ensureTranslations([{ amapId: row.amap_id, name: row.name }]);
    const address = row.address ?? "";
    const kind = classifyToilet(row.name, address);
    const seatedConfidence = getSeatedConfidence(row.name, address);
    const isNursery = kind === "nursery" || hasNurserySignal(row.name, address);
    const dto: ToiletDTO = {
      id: row.amap_id,
      name: nameMap.get(row.amap_id) ?? row.name,
      rawName: row.name,
      walkMin: 0,
      distanceM: 0,
      tags: isNursery ? ["Nursery"] : tagsForPoi("toilet", row.name, address),
      address,
      city: row.city ?? "",
      lat: row.lat,
      lng: row.lng,
      photo: row.photo_url ?? FALLBACK_PHOTO,
      kind,
      hasAccessible: kind === "accessible",
      floor: parseFloor(address),
      seatedConfidence,
      canNavigate: isNursery || seatedConfidence === "confirmed" || seatedConfidence === "likely",
    };
    return { toilet: dto };
  });
