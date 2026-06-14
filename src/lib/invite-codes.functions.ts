import { createServerFn } from "@tanstack/react-start";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type RedeemedInviteRow = {
  id: string;
  code: string;
  label: string | null;
  pass_days: number;
  redeemed_count: number;
  max_redemptions: number;
};

export type AdminInviteCodeDTO = {
  id: string;
  code: string;
  label: string;
  passDays: number;
  active: boolean;
  maxRedemptions: number;
  redeemedCount: number;
  redeemedAt: string | null;
  lastRedeemedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

type InviteCodeRow = {
  id: string;
  code: string;
  label: string | null;
  pass_days: number;
  active: boolean;
  max_redemptions: number;
  redeemed_count: number;
  redeemed_at: string | null;
  last_redeemed_at: string | null;
  expires_at: string | null;
  created_at: string;
};

function normalizeCode(code: string) {
  return code.trim().replace(/\s+/g, "").toUpperCase();
}

function generateInviteCode() {
  return `SEATMAP-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function adminTokenIsValid(token: string | undefined) {
  const configured = process.env.ADMIN_TOKEN;
  if (!configured) return process.env.NODE_ENV !== "production";
  return token === configured;
}

function mapInviteCode(row: InviteCodeRow): AdminInviteCodeDTO {
  return {
    id: row.id,
    code: row.code,
    label: row.label ?? "",
    passDays: row.pass_days,
    active: row.active,
    maxRedemptions: row.max_redemptions,
    redeemedCount: row.redeemed_count,
    redeemedAt: row.redeemed_at,
    lastRedeemedAt: row.last_redeemed_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

const inviteTable = () =>
  (
    supabaseAdmin as unknown as {
      from: (table: "invite_codes") => {
        select: (columns: string) => {
          order: (
            column: string,
            options: { ascending: boolean },
          ) => {
            limit: (
              count: number,
            ) => Promise<{ data: InviteCodeRow[] | null; error: Error | null }>;
          };
        };
        insert: (row: {
          code: string;
          label: string | null;
          pass_days: number;
          active: boolean;
          max_redemptions: number;
        }) => {
          select: (columns: string) => {
            single: () => Promise<{ data: InviteCodeRow | null; error: Error | null }>;
          };
        };
        update: (row: { active?: boolean; label?: string | null; updated_at: string }) => {
          eq: (
            column: "id",
            value: string,
          ) => {
            select: (columns: string) => {
              single: () => Promise<{ data: InviteCodeRow | null; error: Error | null }>;
            };
          };
        };
      };
    }
  ).from("invite_codes");

export const redeemInviteCode = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        code: z
          .string()
          .min(3)
          .max(64)
          .regex(/^[A-Za-z0-9_-]+$/),
        visitorId: z
          .string()
          .min(8)
          .max(128)
          .regex(/^[A-Za-z0-9_-]+$/),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const code = normalizeCode(data.code);
    const { data: rows, error } = await (
      supabaseAdmin as unknown as {
        rpc: (
          fn: "redeem_invite_code",
          args: { p_code: string; p_visitor_id: string },
        ) => Promise<{ data: RedeemedInviteRow[] | null; error: Error | null }>;
      }
    ).rpc("redeem_invite_code", {
      p_code: code,
      p_visitor_id: data.visitorId,
    });

    if (error) throw error;
    const invite = rows?.[0];
    if (!invite) {
      return { ok: false as const, reason: "invalid_or_used" as const };
    }

    const now = Date.now();
    const expiresAtMs = now + invite.pass_days * MS_PER_DAY;
    return {
      ok: true as const,
      code: invite.code,
      label: invite.label,
      days: invite.pass_days,
      createdAtMs: now,
      expiresAtMs,
      lifetime: invite.pass_days >= 36500,
    };
  });

export const getAdminInviteCodes = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        token: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (!adminTokenIsValid(data.token)) {
      return { authorized: false as const, inviteCodes: [] as AdminInviteCodeDTO[] };
    }

    const { data: rows, error } = await inviteTable()
      .select(
        "id, code, label, pass_days, active, max_redemptions, redeemed_count, redeemed_at, last_redeemed_at, expires_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return {
      authorized: true as const,
      inviteCodes: (rows ?? []).map(mapInviteCode),
    };
  });

export const createAdminInviteCode = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        token: z.string().optional(),
        code: z
          .string()
          .min(3)
          .max(64)
          .regex(/^[A-Za-z0-9_-]+$/)
          .optional(),
        label: z.string().max(160).optional().default(""),
        passDays: z.number().int().min(1).max(36500).default(36500),
        maxRedemptions: z.number().int().min(1).max(1000).default(1),
        active: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (!adminTokenIsValid(data.token)) {
      return { authorized: false as const, inviteCode: null as AdminInviteCodeDTO | null };
    }

    const { data: row, error } = await inviteTable()
      .insert({
        code: data.code ? normalizeCode(data.code) : generateInviteCode(),
        label: data.label.trim() || null,
        pass_days: data.passDays,
        active: data.active,
        max_redemptions: data.maxRedemptions,
      })
      .select(
        "id, code, label, pass_days, active, max_redemptions, redeemed_count, redeemed_at, last_redeemed_at, expires_at, created_at",
      )
      .single();

    if (error) throw error;
    return {
      authorized: true as const,
      inviteCode: row ? mapInviteCode(row) : null,
    };
  });

export const setAdminInviteCodeActive = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        token: z.string().optional(),
        id: z.string().uuid(),
        active: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (!adminTokenIsValid(data.token)) {
      return { authorized: false as const, inviteCode: null as AdminInviteCodeDTO | null };
    }

    const { data: row, error } = await inviteTable()
      .update({
        active: data.active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select(
        "id, code, label, pass_days, active, max_redemptions, redeemed_count, redeemed_at, last_redeemed_at, expires_at, created_at",
      )
      .single();

    if (error) throw error;
    return {
      authorized: true as const,
      inviteCode: row ? mapInviteCode(row) : null,
    };
  });

export const setAdminInviteCodeLabel = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        token: z.string().optional(),
        id: z.string().uuid(),
        label: z.string().max(160).optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (!adminTokenIsValid(data.token)) {
      return { authorized: false as const, inviteCode: null as AdminInviteCodeDTO | null };
    }

    const { data: row, error } = await inviteTable()
      .update({
        label: data.label.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select(
        "id, code, label, pass_days, active, max_redemptions, redeemed_count, redeemed_at, last_redeemed_at, expires_at, created_at",
      )
      .single();

    if (error) throw error;
    return {
      authorized: true as const,
      inviteCode: row ? mapInviteCode(row) : null,
    };
  });
