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
        <div className="mx-auto inline-flex items-center gap-2 border-2 border-foreground bg-card px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em]">
          <ShieldCheck className="h-4 w-4 text-wax" /> Public Verification Registry
        </div>
        <h1 className="mt-8 font-display text-4xl uppercase tracking-[-0.04em] md:text-6xl">
          Verify a CERTIGO.<br/><span className="font-serif italic font-semibold normal-case text-foreground/75">credential</span>
        </h1>
        <div className="mx-auto mt-5 h-px w-24 bg-foreground" />
        <p className="mx-auto mt-5 max-w-md font-serif text-lg italic text-muted-foreground">Enter a credential ID or scan its QR code — the Institute returns an immediate authenticity record.</p>
        <form onSubmit={submit} className="mx-auto mt-10 flex max-w-md border-2 border-foreground bg-card">
          <Input value={v} onChange={(e) => setV(e.target.value)} placeholder="e.g. KR-2026-DEMO01" className="h-12 rounded-none border-0 bg-transparent font-mono text-sm tracking-[0.08em] focus-visible:ring-0" />
          <Button type="submit" disabled={busy} className="h-12 rounded-none bg-foreground px-6 font-mono text-[11px] uppercase tracking-[0.22em] text-background hover:bg-wax">Verify ◆</Button>
        </form>
        <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Try demo: <button type="button" className="text-wax underline-offset-4 hover:underline" onClick={() => setV("KR-2026-DEMO01")}>KR-2026-DEMO01</button>
        </div>

        {result && (
          <div className="mx-auto mt-10 max-w-md text-left">
            {result.ok && result.cert ? (
              <div className="border-2 border-foreground bg-card p-6 shadow-frame">
                <div className="flex items-center justify-between border-b border-foreground/30 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2.5 w-2.5 bg-wax" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground">◆ Authenticity Confirmed {result.cert._demo && "· Demo"}</span>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Registry · Live</span>
                </div>
                <h2 className="mt-5 font-display text-3xl uppercase tracking-[-0.04em]">{result.cert.recipient_name}</h2>
                <div className="mt-1 font-serif text-base italic text-muted-foreground">{result.cert.course_topic}</div>
                <dl className="mt-5 space-y-2 border-t border-foreground/15 pt-4 text-sm">
                  {result.cert.score != null && <div className="flex justify-between gap-3"><dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Score</dt><dd className="font-display tracking-tight">{result.cert.score}%</dd></div>}
                  <div className="flex justify-between gap-3"><dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Issued</dt><dd className="font-medium">{new Date(result.cert.issued_at).toLocaleDateString()}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Credential ID</dt><dd className="font-mono text-xs">{result.cert.serial}</dd></div>
                </dl>
                <div className="mt-5 flex gap-2">
                  <Button size="sm" className="flex-1 h-10 rounded-none bg-foreground font-mono text-[10px] uppercase tracking-[0.22em] text-background hover:bg-wax" onClick={() => nav({ to: "/verify/$id", params: { id: result.cert.id } })}>
                    <ExternalLink className="me-2 h-3.5 w-3.5" /> View certificate
                  </Button>
                  <Button size="sm" variant="outline" className="h-10 rounded-none border-2 border-foreground" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/verify/${result.cert.id}`); toast.success("Verify link copied"); }}>
                    <Link2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-wax bg-card p-6 text-center">
                <div className="font-display text-xl uppercase tracking-tight text-wax">◆ Not on Registry</div>
                <p className="mt-2 font-serif text-base italic text-muted-foreground">{result.msg}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
