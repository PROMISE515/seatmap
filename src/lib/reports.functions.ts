import { createServerFn } from "@tanstack/react-start";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const REPORT_PHOTO_BUCKET = "toilet-report-photos";

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
