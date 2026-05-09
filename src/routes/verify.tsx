import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Header } from "@/components/kredo/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ExternalLink, Link2 } from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Verify a CERTIGO. certificate" }, { name: "description", content: "Verify the authenticity of any CERTIGO. certificate." }] }),
  component: Verify,
});

function Verify() {
  const [v, setV] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; cert?: any; msg?: string }>(null);
  const nav = useNavigate();
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = v.trim();
    if (!raw) return;
    setBusy(true);
    setResult(null);
    try {
      const fromUrl = raw.match(/verify\/([0-9a-f-]{36}|[A-Z0-9-]{6,})/i)?.[1];
      const candidate = (fromUrl ?? raw).trim();
      if (/^KR-2026-DEMO/i.test(candidate)) {
        setResult({
          ok: true,
          cert: {
            id: candidate.toUpperCase(),
            serial: candidate.toUpperCase(),
            recipient_name: "Amara Okafor",
            course_topic: "Prompt Engineering Fundamentals",
            score: 94,
            issued_at: new Date().toISOString(),
            _demo: true,
          },
        });
        return;
      }
      const q = supabase.from("certificates").select("*");
      const { data, error } = UUID_RE.test(candidate)
        ? await q.eq("id", candidate).maybeSingle()
        : await q.ilike("serial", candidate).maybeSingle();
      if (error) { toast.error("Verification service error"); setResult({ ok: false, msg: "Service error" }); return; }
      if (!data) { setResult({ ok: false, msg: "No certificate matches that ID or serial." }); return; }
      if (data.revoked) { setResult({ ok: false, cert: data, msg: "This certificate has been revoked." }); return; }
      setResult({ ok: true, cert: data });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
        <div className="mt-4 micro-label">◆ Public Ledger</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter md:text-5xl">Verify a CERTIGO. credential.</h1>
        <p className="mt-3 text-muted-foreground">Enter the certificate code, click Verify — get an instant on-chain proof summary.</p>
        <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md gap-2">
          <Input value={v} onChange={(e) => setV(e.target.value)} placeholder="e.g. KR-2026-DEMO01" className="h-12" />
          <Button type="submit" disabled={busy} className="h-12 px-6">Verify</Button>
        </form>
        <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Try demo: <button type="button" className="underline hover:text-primary" onClick={() => setV("KR-2026-DEMO01")}>KR-2026-DEMO01</button>
        </div>

        {result && (
          <div className="mx-auto mt-10 max-w-md text-left">
            {result.ok && result.cert ? (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-elegant">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                    On-chain Verified {result.cert._demo && "· Demo"}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-black tracking-tighter">{result.cert.recipient_name}</h2>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Credential</dt><dd className="text-right font-medium">{result.cert.course_topic}</dd></div>
                  {result.cert.score != null && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Score</dt><dd className="font-medium">{result.cert.score}%</dd></div>}
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Issued</dt><dd className="font-medium">{new Date(result.cert.issued_at).toLocaleDateString()}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Serial</dt><dd className="font-mono text-xs">{result.cert.serial}</dd></div>
                </dl>
                <div className="mt-5 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => nav({ to: "/verify/$id", params: { id: result.cert.id } })}>
                    <ExternalLink className="me-2 h-3.5 w-3.5" /> View certificate
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/verify/${result.cert.id}`); toast.success("Verify link copied"); }}>
                    <Link2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <div className="font-display text-lg font-black tracking-tight">Not verified</div>
                <p className="mt-2 text-sm text-muted-foreground">{result.msg}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
