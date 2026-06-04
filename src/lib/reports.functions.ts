import { createServerFn } from "@tanstack/react-start";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { wgs84ToGcj02 } from "@/lib/amap";

const REPORT_PHOTO_BUCKET = "toilet-report-photos";
const COMPLAINT_RADIUS_M = 1000;

const reportSchema = z.object({
  amapId: z.string().min(1).max(128).optional(),
  placeName: z.string().min(1).max(240),
  type: z.enum(["confirmed_seated", "wrong_listing", "closed", "other"]),
  rating: z.number().int().min(1).max(5),
  notes: z.string().max(2000).optional().default(""),
  isComplaint: z.boolean().optional().default(false),
  photoDataUrls: z.array(z.string().max(4_000_000)).max(3).optional().default([]),
});

export type ToiletReportDTO = {
  id: string;
  type: "confirmed_seated" | "wrong_listing" | "closed" | "other";
  rating: number | null;
  notes: string;
  isComplaint: boolean;
  photoUrls: string[];
  createdAt: string;
};

export type AdminComplaintDTO = {
  id: string;
  amapId: string | null;
  placeName: string;
  reason: "no_seated_toilet" | "no_nursery_room" | "other";
  description: string;
  createdAt: string;
  blacklisted: boolean;
  toilet: {
    name: string | null;
    nameEn: string | null;
    address: string | null;
    city: string | null;
    lat: number | null;
    lng: number | null;
  } | null;
};

export type AdminBlacklistDTO = {
  id: string;
  amapId: string;
  placeName: string;
  reason: string;
  createdAt: string;
};

function parsePhotoDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  const [, contentType, encoded] = match;
  const extension =
    contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  return {
    contentType,
    extension,
    bytes: Buffer.from(encoded, "base64"),
  };
}

async function uploadReportPhotos(amapId: string | undefined, photoDataUrls: string[]) {
  const urls: string[] = [];
  const folder = (amapId ?? "manual").replace(/[^A-Za-z0-9_-]/g, "-");

  for (const dataUrl of photoDataUrls) {
    const photo = parsePhotoDataUrl(dataUrl);
    if (!photo || photo.bytes.byteLength === 0 || photo.bytes.byteLength > 3_000_000) continue;

    const path = `${folder}/${randomUUID()}.${photo.extension}`;
    const { error } = await supabaseAdmin.storage
      .from(REPORT_PHOTO_BUCKET)
      .upload(path, photo.bytes, {
        contentType: photo.contentType,
        upsert: false,
      });

    if (error) continue;

    const { data } = supabaseAdmin.storage.from(REPORT_PHOTO_BUCKET).getPublicUrl(path);
    if (data.publicUrl) urls.push(data.publicUrl);
  }

  return urls;
}

function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const latRad = (a.lat * Math.PI) / 180;
  const dx = (b.lng - a.lng) * 111000 * Math.cos(latRad);
  const dy = (b.lat - a.lat) * 111000;
  return Math.sqrt(dx * dx + dy * dy);
}

function adminTokenIsValid(token: string | undefined) {
  const configured = process.env.ADMIN_TOKEN;
  if (!configured) return process.env.NODE_ENV !== "production";
  return token === configured;
}

export const submitToiletReport = createServerFn({ method: "POST" })
  .inputValidator((input) => reportSchema.parse(input))
  .handler(async ({ data }) => {
    let toiletId: string | null = null;
    if (data.amapId) {
      const { data: toilet } = await supabaseAdmin
        .from("toilets")
        .select("id")
        .eq("amap_id", data.amapId)
        .maybeSingle();
      toiletId = toilet?.id ?? null;
    }

    const photoUrls = await uploadReportPhotos(data.amapId, data.photoDataUrls);

    const { error } = await supabaseAdmin.from("toilet_reports").insert({
      toilet_id: toiletId,
      amap_id: data.amapId ?? null,
      place_name: data.placeName,
      report_type: data.type,
      rating: data.rating,
      notes: data.notes || null,
      is_complaint: data.isComplaint,
      photo_urls: photoUrls,
    });

    if (error) throw error;
    return { ok: true as const };
  });

export const submitPlaceComplaint = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        amapId: z.string().min(1).max(128),
        placeName: z.string().min(1).max(240),
        reason: z.enum(["no_seated_toilet", "no_nursery_room"]),
        description: z.string().max(1000).optional().default(""),
        userLat: z.number().min(-90).max(90),
        userLng: z.number().min(-180).max(180),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: toilet, error: toiletError } = await supabaseAdmin
      .from("toilets")
      .select("id, amap_id, name, lat, lng")
      .eq("amap_id", data.amapId)
      .maybeSingle();

    if (toiletError) throw toiletError;
    if (!toilet) return { ok: false as const, reason: "missing_place" as const };

    const userGcj = wgs84ToGcj02(data.userLat, data.userLng);
    const distanceM = Math.round(
      distanceMeters(userGcj, { lat: Number(toilet.lat), lng: Number(toilet.lng) }),
    );

    if (distanceM > COMPLAINT_RADIUS_M) {
      return { ok: false as const, reason: "out_of_range" as const, distanceM };
    }

    const { error } = await supabaseAdmin.from("toilet_reports").insert({
      toilet_id: toilet.id,
      amap_id: data.amapId,
      place_name: data.placeName,
      report_type: data.reason === "no_seated_toilet" ? "wrong_listing" : "other",
      rating: null,
      notes: JSON.stringify({
        reason: data.reason,
        description: data.description,
      }),
      is_complaint: true,
      photo_urls: [],
    });

    if (error) throw error;
    return { ok: true as const, distanceM };
  });

function parseComplaintNotes(notes: string | null) {
  if (!notes) return { reason: "other" as const, description: "" };
  try {
    const parsed = JSON.parse(notes) as { reason?: string; description?: string };
    if (parsed.reason === "no_seated_toilet" || parsed.reason === "no_nursery_room") {
      return {
        reason: parsed.reason,
        description: parsed.description ?? "",
      };
    }
  } catch {
    return { reason: "other" as const, description: notes };
  }
  return { reason: "other" as const, description: notes };
}

export const getToiletReports = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        amapId: z.string().min(1).max(128),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("toilet_reports")
      .select("id, report_type, rating, notes, is_complaint, photo_urls, created_at")
      .eq("amap_id", data.amapId)
      .eq("is_complaint", false)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return {
      reports: (rows ?? []).map<ToiletReportDTO>((row) => ({
        id: row.id,
        type: row.report_type as ToiletReportDTO["type"],
        rating: row.rating,
        notes: row.notes ?? "",
        isComplaint: row.is_complaint ?? false,
        photoUrls: row.photo_urls ?? [],
        createdAt: row.created_at,
      })),
    };
  });

export const getAdminComplaints = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        token: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (!adminTokenIsValid(data.token)) {
      return { authorized: false as const, complaints: [] as AdminComplaintDTO[] };
    }

    const { data: reports, error } = await supabaseAdmin
      .from("toilet_reports")
      .select("id, amap_id, place_name, notes, created_at")
      .eq("is_complaint", true)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const amapIds = [
      ...new Set((reports ?? []).map((row) => row.amap_id).filter(Boolean)),
    ] as string[];

    const [{ data: toilets }, { data: blacklistRows }] = await Promise.all([
      amapIds.length
        ? supabaseAdmin
            .from("toilets")
            .select("amap_id, name, name_en, address, city, lat, lng")
            .in("amap_id", amapIds)
        : Promise.resolve({ data: [] }),
      amapIds.length
        ? supabaseAdmin.from("toilet_blacklist").select("amap_id").in("amap_id", amapIds)
        : Promise.resolve({ data: [] }),
    ]);

    const toiletByAmapId = new Map((toilets ?? []).map((row) => [row.amap_id, row]));
    const blacklisted = new Set((blacklistRows ?? []).map((row) => row.amap_id));

    return {
      authorized: true as const,
      complaints: (reports ?? []).map<AdminComplaintDTO>((row) => {
        const toilet = row.amap_id ? toiletByAmapId.get(row.amap_id) : null;
        const complaint = parseComplaintNotes(row.notes);
        return {
          id: row.id,
          amapId: row.amap_id,
          placeName: row.place_name,
          reason: complaint.reason,
          description: complaint.description,
          createdAt: row.created_at,
          blacklisted: row.amap_id ? blacklisted.has(row.amap_id) : false,
          toilet: toilet
            ? {
                name: toilet.name,
                nameEn: toilet.name_en,
                address: toilet.address,
                city: toilet.city,
                lat: toilet.lat,
                lng: toilet.lng,
              }
            : null,
        };
      }),
    };
  });

export const blacklistPlace = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        token: z.string().optional(),
        amapId: z.string().min(1).max(128),
        placeName: z.string().min(1).max(240),
        reason: z.string().max(500).optional().default("Complaint review"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (!adminTokenIsValid(data.token)) return { authorized: false as const };

    const { error } = await supabaseAdmin.from("toilet_blacklist").upsert(
      {
        amap_id: data.amapId,
        place_name: data.placeName,
        reason: data.reason,
      },
      { onConflict: "amap_id" },
    );

    if (error) throw error;
    return { authorized: true as const, ok: true as const };
  });

export const getAdminBlacklist = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        token: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (!adminTokenIsValid(data.token)) {
      return { authorized: false as const, blacklist: [] as AdminBlacklistDTO[] };
    }

    const { data: rows, error } = await supabaseAdmin
      .from("toilet_blacklist")
      .select("id, amap_id, place_name, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    return {
      authorized: true as const,
      blacklist: (rows ?? []).map<AdminBlacklistDTO>((row) => ({
        id: row.id,
        amapId: row.amap_id,
        placeName: row.place_name,
        reason: row.reason ?? "",
        createdAt: row.created_at,
      })),
    };
  });
