import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShieldCheck, ShieldX, ShieldAlert, Upload, ArrowRight } from "lucide-react";
import { extractSerials, summariseChecks, type SerialCheck } from "@/lib/hr";
import { formatLongDate } from "@/lib/trust";
import { toast } from "sonner";

export const Route = createFileRoute("/hr")({
  head: () => ({
    meta: [
      { title: "Verify credentials on a CV — CERTIGO. for HR" },
      { name: "description", content: "Paste or upload a candidate CV. CERTIGO. detects claimed credentials, verifies each against the registry and flags revoked or unverified claims." },
      { property: "og:title", content: "CERTIGO. for HR — verify credentials on a CV" },
      { property: "og:description", content: "Detect, verify and flag credential claims on any candidate CV in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HrChecker,
});

function HrChecker() {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<SerialCheck[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    const serials = extractSerials(text);
    if (serials.length === 0) {
      toast.error("No CERTIGO. credential references found in this document.");
      setRows([]);
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc("verify_serials", { _serials: serials });
    setBusy(false);
    if (error) { toast.error("Verification failed. Try again."); return; }
    setRows((data ?? []) as SerialCheck[]);
  }

  async function onFile(f: File | undefined) {
    if (!f) return;
    try {
      const content = await f.text();
      setText(content);
      toast.success(`Loaded ${f.name}`);
    } catch {
      toast.error("Could not read that file. Paste the CV text instead.");
    }
  }

  const summary = rows ? summariseChecks(rows) : null;

  return (
    <div className="relative min-h-screen bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(20,83,45,0.12)_0%,rgba(20,83,45,0)_70%)]" />
      <Header />
      <div className="relative mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">◆ CERTIGO. for HR</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter sm:text-5xl">Verify what a CV claims.</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Paste or upload a candidate CV. Every CERTIGO. credential reference is detected, checked against the registry, and flagged if revoked or unverifiable.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Paste the CV text here — CERTIGO. references look like CERT-ABCD-1234"
            className="resize-y"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={run} disabled={busy} className="min-h-[44px] bg-emerald-600 text-white hover:bg-emerald-700">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {busy ? "Checking…" : "Check credentials"}
            </Button>
            <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:border-foreground/40">
              <Upload className="h-4 w-4" /> Upload .txt CV
              <input type="file" accept=".txt,.md,text/plain" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
          </div>
        </div>

        {summary && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { n: summary.total, l: "Claims detected" },
              { n: summary.active, l: "Verified active" },
              { n: summary.revoked, l: "Revoked" },
              { n: summary.unverified, l: "Unverified" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="font-display text-2xl font-black tracking-tighter">{s.n}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {rows && rows.length > 0 && (
          <div className="mt-6 space-y-3">
            {rows.map((r) => (
              <div key={r.input} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-xs uppercase tracking-[0.2em]">{r.input}</div>
                    <div className="mt-1 font-display text-lg font-extrabold tracking-tight">
                      {r.cert_title ?? "No matching credential"}
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {r.found
                        ? `${r.recipient_name} · ${r.issuer_name} · Issued ${formatLongDate(r.issued_at ?? "")}`
                        : "This reference does not exist in the CERTIGO. registry."}
                    </div>
                  </div>
                  <span
                    className={
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] " +
                      (r.status === "active"
                        ? "bg-emerald-600/10 text-emerald-700"
                        : r.status === "revoked"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-amber-500/10 text-amber-700")
                    }
                  >
                    {r.status === "active" ? <ShieldCheck className="h-3 w-3" /> : r.status === "revoked" ? <ShieldX className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                    {r.status}
                  </span>
                </div>
                {r.found && r.serial && (
                  <Link to="/verify/$id" params={{ id: r.serial }} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline">
                    Open verification record <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
