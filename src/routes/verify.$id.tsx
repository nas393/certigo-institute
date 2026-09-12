import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, ShieldX, Loader2, ArrowRight, Check, X } from "lucide-react";
import { formatReference } from "@/lib/cert";
import { computeTrust, formatLongDate, type VerificationRecord } from "@/lib/trust";

export const Route = createFileRoute("/verify/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Verification record ${params.id} — CERTIGO.` },
      { name: "description", content: "Public verification record for a CERTIGO. credential: issuer, recipient, competencies, assessment and status." },
      { property: "og:title", content: `CERTIGO. verification record ${params.id}` },
      { property: "og:description", content: "Independent verification of a professional credential: issuer, recipient, assessment and current status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerifyOne,
});

function Row({ label, value, ok = true }: { label: string; value: React.ReactNode; ok?: boolean }) {
  return (
    <div className="flex items-start gap-3 border-b border-border/70 py-3 last:border-0">
      <span className={"mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full " + (ok ? "bg-emerald-600/10 text-emerald-700" : "bg-destructive/10 text-destructive")}>
        {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{label}</div>
        <div className="mt-0.5 break-words text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function VerifyOne() {
  const { id } = Route.useParams();
  const [state, setState] = useState<"loading" | "ok" | "miss" | "revoked">("loading");
  const [r, setR] = useState<VerificationRecord | null>(null);

  useEffect(() => {
    supabase.rpc("verify_record", { lookup: id }).then(({ data }: { data: any }) => {
      if (!data?.found) { setState("miss"); return; }
      setR(data as VerificationRecord);
      setState(data.revoked ? "revoked" : "ok");
    });
  }, [id]);

  if (state === "loading") return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  if (state === "miss" || !r) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
          <div className="rounded-2xl border-2 border-destructive bg-destructive/5 p-6 text-destructive shadow-card">
            <ShieldX className="h-5 w-5" />
            <div className="mt-2 font-display text-xl font-black">No credential record matches {id}.</div>
            <p className="mt-1 text-sm">Nothing in the CERTIGO. registry carries this reference. Treat the claim as unverified.</p>
          </div>
        </div>
      </div>
    );
  }

  const trust = computeTrust(r);
  const revoked = state === "revoked";
  const modules: any[] = Array.isArray(r.modules) ? r.modules : [];

  return (
    <div className="relative min-h-screen bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(20,83,45,0.12)_0%,rgba(20,83,45,0)_70%)]" />
      <Header />
      <div className="relative mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <div className={"flex items-center gap-2 rounded-xl border-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.32em] " + (revoked ? "border-destructive bg-destructive/5 text-destructive" : "border-emerald-600 bg-emerald-600/5 text-emerald-700")}>
          {revoked ? <ShieldX className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          CERTIGO<span>.</span> {revoked ? "REVOKED — do not accept" : "VERIFIED"}
        </div>

        <h1 className="mt-6 font-display text-4xl font-black tracking-tighter sm:text-5xl">{r.cert_title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Awarded to <span className="font-semibold text-foreground">{r.recipient_name}</span> · {r.issuer_name}
        </p>

        {/* Trust status */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-baseline justify-between gap-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">CERTIGO. trust status</div>
            <div className="font-display text-3xl font-black tracking-tighter">
              {trust.score}<span className="text-base text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={"h-full rounded-full transition-all " + (trust.band === "high" ? "bg-emerald-600" : trust.band === "medium" ? "bg-amber-500" : "bg-destructive")}
              style={{ width: `${trust.score}%` }}
            />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {trust.factors.map((f) => (
              <div key={f.label} className="flex items-start gap-2 rounded-lg border border-border/70 p-3">
                <span className={"mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full " + (f.ok ? "bg-emerald-600/10 text-emerald-700" : "bg-destructive/10 text-destructive")}>
                  {f.ok ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                </span>
                <div>
                  <div className="text-sm font-semibold">{f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification record */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Verification record</div>
          <div className="mt-3">
            <Row label="Credential authentic" value="Signed record found in the CERTIGO. registry" />
            <Row label="Issuer verified" value={r.issuer_name} />
            <Row label="Recipient verified" value={r.recipient_name} />
            <Row label="Credential status" value={revoked ? "REVOKED" : "ACTIVE"} ok={!revoked} />
            <Row label="Issue date" value={formatLongDate(r.issued_at)} />
            <Row label="Validity" value="No expiry — credential does not lapse" />
            <Row
              label="Verification checks"
              value={
                <span data-testid="scan-count">
                  {(r.scan_count ?? 1) === 1 ? "1 check — this one" : `${r.scan_count} checks, including this one`}
                </span>
              }
            />
            <Row label="Verification ID" value={<span className="font-mono">{formatReference(r.serial)}</span>} />
            <Row label="Course" value={`${r.cert_title} · ${r.category}`} />
            <Row
              label="Assessment method"
              value={`Multiple-choice examination · ${r.question_count} questions · pass mark ${r.pass_score}% · scored ${r.score}%`}
              ok={r.score >= r.pass_score}
            />
            <Row label="Hours" value={r.hours > 0 ? `${r.hours} guided learning hours` : "Assessment-only credential"} />
            <Row
              label="Competencies"
              value={
                (r.competencies?.length ?? 0) > 0 ? (
                  <span className="flex flex-wrap gap-1.5">
                    {r.competencies.map((c) => (
                      <span key={c} className="rounded-full bg-muted px-2.5 py-1 text-[11px]">{c}</span>
                    ))}
                  </span>
                ) : "None recorded"
              }
              ok={(r.competencies?.length ?? 0) > 0}
            />
            <Row
              label="Evidence / syllabus"
              value={
                modules.length > 0 ? (
                  <ol className="mt-1 space-y-1 text-sm text-muted-foreground">
                    {modules.map((m: any, i: number) => (
                      <li key={i}>
                        <span className="font-mono text-[10px] text-foreground">M{String(i + 1).padStart(2, "0")}</span>{" "}
                        {String(m?.title ?? `Module ${i + 1}`)}
                      </li>
                    ))}
                  </ol>
                ) : `${r.question_count}-question examination transcript on file`
              }
              ok={modules.length > 0}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link to="/certificate/$id" params={{ id: r.serial }} className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline">
            Open certificate <ArrowRight className="h-3 w-3" />
          </Link>
          <Link to="/p/$id" params={{ id: r.recipient_id }} className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline">
            Credential passport <ArrowRight className="h-3 w-3" />
          </Link>
          <Link to="/hr" className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground">
            Check a CV <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
