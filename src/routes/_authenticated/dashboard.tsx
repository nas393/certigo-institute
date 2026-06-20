import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatReference } from "@/lib/cert";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CERTIGO." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [certs, setCerts] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase
      .from("certificates")
      .select("serial, issued_at, score, certifications(title, category)")
      .eq("user_id", user.id)
      .order("issued_at", { ascending: false })
      .then(({ data }) => setCerts(data ?? []));
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ Your credentials</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter">Dashboard</h1>

        {certs.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">No certificates yet.</p>
            <Link to="/catalog" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
              Browse catalog <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {certs.map((c) => (
              <Link
                key={c.serial}
                to="/issued/$serial"
                params={{ serial: c.serial }}
                className="rounded-xl border border-border bg-card p-5 transition hover:border-foreground/40"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ {c.certifications?.category}</div>
                <div className="mt-2 font-display text-xl font-extrabold">{c.certifications?.title}</div>
                <div className="mt-2 font-mono text-[11px] text-muted-foreground">{formatReference(c.serial)}</div>
                <div className="mt-2 text-xs text-muted-foreground">Score {c.score}% · {new Date(c.issued_at).toLocaleDateString()}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}