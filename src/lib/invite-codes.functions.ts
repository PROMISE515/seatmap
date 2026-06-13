import { createServerFn } from "@tanstack/react-start";
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

function normalizeCode(code: string) {
  return code.trim().replace(/\s+/g, "").toUpperCase();
}

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
