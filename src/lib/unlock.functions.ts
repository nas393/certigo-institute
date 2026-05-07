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

    // Single master unlock code (kept server-side, never exposed to client)
    const MASTER_CODE = "T101112";

    if (code === MASTER_CODE) {
      await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
      await supabaseAdmin.from("profiles").update({ premium: true }).eq("user_id", userId);
      return { ok: true, type: "admin" as const };
    }
    return { ok: false, type: "invalid" as const };
  });
