import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isSupportedSearchRegion, supportedSearchRegionLabel } from "@/lib/cities";
import {
  wgs84ToGcj02,
  walkMinFromMeters,
  classifyToilet,
  parseFloor,
  isLikelyWestern,
  getSeatedConfidence,
  cityNameToEnglish,
  provinceNameToEnglish,
  type ToiletDTO,
} from "./amap";
import { translateNames } from "./translate.server";

const FALLBACK_PHOTO = "/placeholder.svg";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const AMAP_TOILET_TYPE = "200300";

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
    .replace(/卫生间|洗手间|厕所|公厕|toilet|restroom|bathroom/g, "")
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

function displayNameForVenueGroup(toilet: ToiletDTO) {
  const rawName = toilet.rawName ?? toilet.name;
  const venueMatch = rawName.match(/[（(]([^）)]+)[）)]/);
  return venueMatch?.[1] ?? toilet.name;
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
        const kindScore = (t: ToiletDTO) =>
          t.kind === "indoor" ? 0 : t.kind === "accessible" ? 1 : t.kind === "nursery" ? 2 : 3;
        return kindScore(a) - kindScore(b) || a.distanceM - b.distanceM;
      });
      return {
        ...best,
        name: group.length > 1 ? displayNameForVenueGroup(best) : best.name,
        floor: group.length > 1 ? undefined : best.floor,
        seatedConfidence: group.some((item) => item.seatedConfidence === "confirmed")
          ? "confirmed"
          : "needs_confirmation",
        canNavigate: group.some((item) => item.canNavigate),
        duplicateCount: group.length > 1 ? group.length : undefined,
      };
    })
    .sort((a, b) => a.distanceM - b.distanceM);
}

async function fetchFromAmap(gcjLat: number, gcjLng: number, radius: number) {
  const key = process.env.AMAP_WEB_SERVICE_KEY;
  if (!key) throw new Error("AMAP_WEB_SERVICE_KEY is not configured");

  const url = new URL("https://restapi.amap.com/v3/place/around");
  url.searchParams.set("key", key);
  url.searchParams.set("location", `${gcjLng.toFixed(6)},${gcjLat.toFixed(6)}`);
  url.searchParams.set("types", AMAP_TOILET_TYPE);
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("sortrule", "distance");
  url.searchParams.set("offset", "25");
  url.searchParams.set("page", "1");
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
  return json.pois ?? [];
}

async function reverseGeocodeRegion(gcjLat: number, gcjLng: number) {
  const key = process.env.AMAP_WEB_SERVICE_KEY;
  if (!key) return null;
  try {
    const url = new URL("https://restapi.amap.com/v3/geocode/regeo");
    url.searchParams.set("key", key);
    url.searchParams.set("location", `${gcjLng.toFixed(6)},${gcjLat.toFixed(6)}`);
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const json = (await res.json()) as {
      status: string;
      regeocode?: { addressComponent?: { province?: string | string[]; city?: string | string[] } };
    };
    if (json.status !== "1") return null;
    const provinceCn = s(json.regeocode?.addressComponent?.province) || null;
    const cityCn = s(json.regeocode?.addressComponent?.city) || null;
    const region =
      (cityCn ? cityNameToEnglish(cityCn) : null) ??
      (provinceCn ? provinceNameToEnglish(provinceCn) : null) ??
      null;
    return { provinceCn, cityCn, region };
  } catch {
    return null;
  }
}

// Ensure English names exist for the given (amap_id, chinese_name) pairs.
// Looks up cached translations from `toilets.name_en`; missing ones are
// translated via Lovable AI and persisted. Returns a Map<amap_id, name_en>.
async function ensureTranslations(
  pairs: Array<{ amapId: string; name: string }>,
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (pairs.length === 0) return out;

  const ids = pairs.map((p) => p.amapId);
  const fallback = () => new Map(pairs.map((p) => [p.amapId, p.name]));

  const { data: existing, error } = await supabaseAdmin
    .from("toilets")
    .select("amap_id, name_en")
    .in("amap_id", ids);

  if (error) return fallback();

  const cached = new Map<string, string>();
  for (const r of existing ?? []) {
    if (r.name_en) cached.set(r.amap_id, r.name_en);
  }

  const missing = pairs.filter((p) => !cached.get(p.amapId));
  if (missing.length > 0) {
    const translated = await translateNames(missing.map((m) => m.name));
    const updates = missing.map((m, i) => ({
      amapId: m.amapId,
      nameEn: translated[i] ?? m.name,
    }));
    // Persist translations
    await Promise.all(
      updates.map((u) =>
        supabaseAdmin.from("toilets").update({ name_en: u.nameEn }).eq("amap_id", u.amapId),
      ),
    );
    for (const u of updates) cached.set(u.amapId, u.nameEn);
  }

  for (const p of pairs) {
    out.set(p.amapId, cached.get(p.amapId) ?? p.name);
  }
  return out;
}

export const findNearbyToilets = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        radius: z.number().int().min(100).max(50000).default(1000),
        gcj: z.boolean().default(false),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { lat: rawLat, lng: rawLng, radius, gcj } = data;
    const { lat, lng } = gcj ? { lat: rawLat, lng: rawLng } : wgs84ToGcj02(rawLat, rawLng);

    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)},${radius}`;

    const geocodedRegion = await reverseGeocodeRegion(lat, lng);

    async function resolveRegion(provinceCn?: string | null, cityCn?: string | null) {
      if (geocodedRegion?.region) return geocodedRegion.region;
      const fromProv = provinceCn ? provinceNameToEnglish(provinceCn) : null;
      if (fromProv) return fromProv;
      const fromCity = cityCn ? cityNameToEnglish(cityCn) : null;
      return fromCity ?? null;
    }

    const currentRegion = await resolveRegion();
    if (currentRegion && !isSupportedSearchRegion(currentRegion)) {
      return {
        cached: false,
        toilets: [],
        region: currentRegion,
        unsupported: true,
        supportedRegions: supportedSearchRegionLabel(),
      };
    }

    let cached: { amap_ids: string[]; created_at: string } | null = null;
    try {
      const { data, error } = await supabaseAdmin
        .from("toilet_search_cache")
        .select("amap_ids, created_at")
        .eq("cache_key", cacheKey)
        .maybeSingle();
      if (!error) cached = data;
    } catch {
      cached = null;
    }

    const fresh = cached && Date.now() - new Date(cached.created_at).getTime() < CACHE_TTL_MS;

    if (fresh && cached.amap_ids.length > 0) {
      const { data: rows, error } = await supabaseAdmin
        .from("toilets")
        .select("*")
        .in("amap_id", cached.amap_ids);

      if (error) {
        cached = null;
      } else {
        const byId = new Map((rows ?? []).map((r) => [r.amap_id, r]));
        const ordered = cached.amap_ids
          .map((id) => byId.get(id))
          .filter((r): r is NonNullable<typeof r> => Boolean(r));

        const filtered = ordered.filter((r) => isLikelyWestern(r.name, r.address ?? ""));

        const nameMap = await ensureTranslations(
          filtered.map((r) => ({ amapId: r.amap_id, name: r.name })),
        );

        const dtos = filtered.map<ToiletDTO>((r) => {
          const dx = (r.lng - lng) * 111000 * Math.cos((lat * Math.PI) / 180);
          const dy = (r.lat - lat) * 111000;
          const dist = Math.round(Math.sqrt(dx * dx + dy * dy));
          const address = r.address ?? "";
          const kind = classifyToilet(r.name, address);
          const seatedConfidence = getSeatedConfidence(r.name, address);
          return {
            id: r.amap_id,
            name: nameMap.get(r.amap_id) ?? r.name,
            rawName: r.name,
            walkMin: walkMinFromMeters(dist),
            distanceM: dist,
            tags: ["Seated Toilet", "Free"],
            address,
            city: r.city ?? "",
            lat: r.lat,
            lng: r.lng,
            photo: r.photo_url ?? FALLBACK_PHOTO,
            kind,
            floor: parseFloor(address),
            seatedConfidence,
            canNavigate: seatedConfidence === "confirmed",
          };
        });
        const first = filtered[0];
        const region = await resolveRegion(first?.province ?? null, first?.city ?? null);
        return { cached: true, toilets: dedupeVenueResults(dtos), region };
      }
    }

    const allPois = await fetchFromAmap(lat, lng, radius);
    const pois = allPois.filter((p) => isLikelyWestern(p.name ?? "", s(p.address)));

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
          amap_ids: pois.map((p) => p.id),
          created_at: new Date().toISOString(),
        },
        { onConflict: "cache_key" },
      );
    } catch {
      // Cache persistence is optional in local setup.
    }

    const nameMap = await ensureTranslations(pois.map((p) => ({ amapId: p.id, name: p.name })));

    const toilets: ToiletDTO[] = pois.map((p) => {
      const [lngStr, latStr] = (p.location ?? "0,0").split(",");
      const distanceM = Number(p.distance ?? "0") || 0;
      const address = s(p.address);
      const kind = classifyToilet(p.name, address);
      const seatedConfidence = getSeatedConfidence(p.name, address);
      return {
        id: p.id,
        name: nameMap.get(p.id) ?? p.name,
        rawName: p.name,
        walkMin: walkMinFromMeters(distanceM),
        distanceM,
        tags: ["Seated Toilet", "Free"],
        address,
        city: s(p.cityname),
        lat: Number(latStr),
        lng: Number(lngStr),
        photo: firstPhoto(p) ?? FALLBACK_PHOTO,
        kind,
        floor: parseFloor(address),
        seatedConfidence,
        canNavigate: seatedConfidence === "confirmed",
      };
    });

    const region = await resolveRegion(s(allPois[0]?.pname), s(allPois[0]?.cityname));
    return { cached: false, toilets: dedupeVenueResults(toilets), region };
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

    if (!row) return { toilet: null };

    const nameMap = await ensureTranslations([{ amapId: row.amap_id, name: row.name }]);
    const address = row.address ?? "";
    const kind = classifyToilet(row.name, address);
    const seatedConfidence = getSeatedConfidence(row.name, address);
    const dto: ToiletDTO = {
      id: row.amap_id,
      name: nameMap.get(row.amap_id) ?? row.name,
      rawName: row.name,
      walkMin: 0,
      distanceM: 0,
      tags: ["Seated Toilet", "Free"],
      address,
      city: row.city ?? "",
      lat: row.lat,
      lng: row.lng,
      photo: row.photo_url ?? FALLBACK_PHOTO,
      kind,
      floor: parseFloor(address),
      seatedConfidence,
      canNavigate: seatedConfidence === "confirmed",
    };
    return { toilet: dto };
  });
