import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const Schema = z.object({ code: z.string().min(3).max(64) });

export const redeemUnlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => Schema.parse(input))
  .handler(async ({ data, context }) => {
    try {
      const { userId } = context;
      const code = data.code.trim().toUpperCase();
      const MASTER_CODE = "T101112";

      if (code !== MASTER_CODE) {
        return { ok: false as const, type: "invalid" as const };
      }

      const roleRes = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
      if (roleRes.error) console.error("[unlock] role upsert:", roleRes.error);

      const profRes = await supabaseAdmin
        .from("profiles")
        .update({ premium: true })
        .eq("user_id", userId);
      if (profRes.error) console.error("[unlock] profile update:", profRes.error);

      return { ok: true as const, type: "admin" as const };
    } catch (err) {
      console.error("[unlock] unexpected:", err);
      return { ok: false as const, type: "error" as const };
    }
  });
