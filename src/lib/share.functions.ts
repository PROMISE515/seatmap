import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SHARE_CODE_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

function validateToken(value: string, label: string) {
  if (!SHARE_CODE_PATTERN.test(value)) {
    throw new Error(`Invalid ${label}`);
  }
  return value;
}

export const ensureShareReferral = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string }) => ({
    code: validateToken(data.code, "share code"),
  }))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("share_referrals")
      .upsert({ code: data.code }, { onConflict: "code", ignoreDuplicates: true });

    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const claimShareReferral = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string; visitorId: string }) => ({
    code: validateToken(data.code, "share code"),
    visitorId: validateToken(data.visitorId, "visitor id"),
  }))
  .handler(async ({ data }) => {
    const { data: claimed, error } = await supabaseAdmin.rpc("claim_share_referral", {
      p_referral_code: data.code,
      p_visitor_id: data.visitorId,
    });

    if (error) throw new Error(error.message);
    return { claimed: Boolean(claimed) };
  });

export const getShareReferralCredits = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string }) => ({
    code: validateToken(data.code, "share code"),
  }))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("share_referrals")
      .select("granted_count")
      .eq("code", data.code)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return { credits: row?.granted_count ?? 0 };
  });
