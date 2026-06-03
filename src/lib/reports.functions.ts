import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const reportSchema = z.object({
  amapId: z.string().min(1).max(128).optional(),
  placeName: z.string().min(1).max(240),
  type: z.enum(["confirmed_seated", "wrong_listing", "closed", "other"]),
  rating: z.number().int().min(1).max(5),
  notes: z.string().max(2000).optional().default(""),
});

export type ToiletReportDTO = {
  id: string;
  type: "confirmed_seated" | "wrong_listing" | "closed" | "other";
  rating: number | null;
  notes: string;
  createdAt: string;
};

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

    const { error } = await supabaseAdmin.from("toilet_reports").insert({
      toilet_id: toiletId,
      amap_id: data.amapId ?? null,
      place_name: data.placeName,
      report_type: data.type,
      rating: data.rating,
      notes: data.notes || null,
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
      .select("id, report_type, rating, notes, created_at")
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
        createdAt: row.created_at,
      })),
    };
  });
