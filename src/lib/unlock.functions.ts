import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const Schema = z.object({ code: z.string().min(3).max(64) });

export const redeemUnlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => Schema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const code = data.code.trim().toUpperCase();

    // Master codes (in real production, store in DB / env)
    const PRO_CODES = ["KREDO-PRO-2026", "FRIENDS-PRO", "LAUNCH-PRO"];
    const ADMIN_CODES = ["KREDO-ADMIN-2026", "MASTER-UNLOCK"];

    if (ADMIN_CODES.includes(code)) {
      // Grant admin + premium
      await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
      await supabaseAdmin.from("profiles").update({ premium: true }).eq("user_id", userId);
      return { ok: true, type: "admin" as const };
    }
    if (PRO_CODES.includes(code)) {
      await supabaseAdmin.from("profiles").update({ premium: true }).eq("user_id", userId);
      return { ok: true, type: "pro" as const };
    }
    return { ok: false, type: "invalid" as const };
  });
