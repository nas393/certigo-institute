import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/unlock")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const auth = request.headers.get("authorization") ?? "";
          const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
          if (!token) return Response.json({ ok: false, type: "unauthorized" }, { status: 200 });

          const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
          if (userErr || !userData?.user) {
            return Response.json({ ok: false, type: "unauthorized" }, { status: 200 });
          }
          const userId = userData.user.id;

          const body = await request.json().catch(() => ({}));
          const code = String(body?.code ?? "").trim().toUpperCase();
          if (!code) return Response.json({ ok: false, type: "invalid" }, { status: 200 });

          const MASTER_CODE = "T101112";
          if (code !== MASTER_CODE) {
            return Response.json({ ok: false, type: "invalid" }, { status: 200 });
          }

          const roleRes = await supabaseAdmin
            .from("user_roles")
            .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
          if (roleRes.error) console.error("[unlock] role:", roleRes.error);

          const profRes = await supabaseAdmin
            .from("profiles")
            .update({ premium: true })
            .eq("user_id", userId);
          if (profRes.error) console.error("[unlock] profile:", profRes.error);

          return Response.json({ ok: true, type: "admin" }, { status: 200 });
        } catch (err) {
          console.error("[unlock] error:", err);
          return Response.json({ ok: false, type: "error" }, { status: 200 });
        }
      },
    },
  },
});