import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck, ArrowRight, BadgeCheck } from "lucide-react";
import { formatLongDate } from "@/lib/trust";
import { formatReference } from "@/lib/cert";

export const Route = createFileRoute("/p/$id")({
  head: () => ({
    meta: [
      { title: "Professional Credential Passport — CERTIGO." },
      { name: "description", content: "A verified passport of professional credentials: every certificate, competency and issuing organisation, each independently verifiable." },
      { property: "og:title", content: "Professional Credential Passport — CERTIGO." },
      { property: "og:description", content: "Verified credentials, competencies and issuers in one public record." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Passport,
});

function Passport() {
  const { id } = Route.useParams();
  const [p, setP] = useState<any>(null);
  const [state, setState] = useState<"loading" | "ok" | "miss">("loading");

  useEffect(() => {
    supabase.rpc("public_passport", { _user_id: id }).then(({ data }: { data: any }) => {
      if (!data) { setState("miss"); return; }
      setP(data);
      setState("ok");
    });
  }, [id]);

  if (state === "loading") return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  if (state === "miss") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="font-display text-xl font-black">No passport found.</div>
            <p className="mt-1 text-sm text-muted-foreground">This professional has no public CERTIGO. record.</p>
          </div>
        </div>
      </div>
    );
  }

  const creds: any[] = Array.isArray(p.credentials) ? p.credentials : [];
  const active = creds.filter((c) => !c.revoked);
  const skills = Array.from(new Set(active.flatMap((c) => (Array.isArray(c.competencies) ? c.competencies : []))));
  const issuers = Array.from(new Set(active.map((c) => c.issuer_name).filter(Boolean)));
  const verifiedPct = creds.length ? Math.round((active.length / creds.length) * 100) : 100;

  return (
    <div className="relative min-h-screen bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(20,83,45,0.12)_0%,rgba(20,83,45,0)_70%)]" />
      <Header />
      <div className="relative mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-center gap-4">
            {p.avatar_url ? (
              <img src={p.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-border" />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-full bg-muted font-display text-xl font-black">
                {(p.display_name ?? "C").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-black tracking-tighter sm:text-4xl">{p.display_name ?? "CERTIGO. professional"}</h1>
              <div className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified professional
              </div>
              {p.headline && <p className="mt-2 text-sm text-muted-foreground">{p.headline}</p>}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { n: creds.length, l: "Credentials" },
              { n: skills.length, l: "Verified skills" },
              { n: issuers.length, l: "Issuing organisations" },
              { n: `${verifiedPct}%`, l: "Verification status" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-border/70 p-4">
                <div className="font-display text-2xl font-black tracking-tighter">{s.n}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {skills.length > 0 && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Verified skills</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={String(s)} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{String(s)}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Credentials</div>
          {creds.length === 0 && <p className="text-sm text-muted-foreground">No credentials issued yet.</p>}
          {creds.map((c) => (
            <Link
              key={c.serial}
              to="/verify/$id"
              params={{ id: c.serial }}
              className="block rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-emerald-600/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display text-lg font-extrabold tracking-tight">{c.title}</div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    {c.issuer_name} · Issued {formatLongDate(c.issued_at)} · Score {c.score}%
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{formatReference(c.serial)}</div>
                </div>
                <span className={"inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] " + (c.revoked ? "bg-destructive/10 text-destructive" : "bg-emerald-600/10 text-emerald-700")}>
                  <ShieldCheck className="h-3 w-3" /> {c.revoked ? "Revoked" : "Active"}
                </span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                Open verification record <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
