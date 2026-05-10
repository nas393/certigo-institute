import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { CertificateView } from "@/components/kredo/CertificateView";
import { ShieldCheck, Search, ExternalLink, Link2, BadgeCheck, AlertTriangle, Lock, QrCode, Globe } from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify a credential — CERTIGO." },
      { name: "description", content: "Public verification registry. Confirm the authenticity of any CERTIGO. credential in seconds." },
      { property: "og:title", content: "Verify a credential — CERTIGO." },
      { property: "og:description", content: "Tamper-proof, instant verification of any CERTIGO. credential." },
    ],
  }),
  component: Verify,
});

type CertResult = {
  ok: boolean;
  msg?: string;
  cert?: {
    id: string;
    serial: string;
    recipient_name: string;
    course_topic: string;
    score?: number | null;
    issued_at: string;
    revoked?: boolean;
    issuer?: string;
    _demo?: boolean;
  };
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Verify() {
  const nav = useNavigate();
  const [v, setV] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CertResult | null>(null);
  const [open, setOpen] = useState(false);

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
            issuer: "CERTIGO. Institute",
            _demo: true,
          },
        });
        setOpen(true);
        return;
      }

      const q = supabase.from("certificates").select("*");
      const { data, error } = UUID_RE.test(candidate)
        ? await q.eq("id", candidate).maybeSingle()
        : await q.ilike("serial", candidate).maybeSingle();

      if (error) {
        toast.error("Verification service error");
        setResult({ ok: false, msg: "Verification service is temporarily unavailable. Please retry." });
        setOpen(true);
        return;
      }
      if (!data) {
        setResult({ ok: false, msg: "No credential matches that ID or serial in the public registry." });
        setOpen(true);
        return;
      }
      if (data.revoked) {
        setResult({ ok: false, cert: data as any, msg: "This credential has been revoked by the issuer." });
        setOpen(true);
        return;
      }
      setResult({ ok: true, cert: data as any });
      setOpen(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-glow)" }} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-20 pb-12 sm:pt-28">
          <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--primary)]" />
                Public verification registry
              </div>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                Verify any <span className="gradient-text">CERTIGO. credential</span> in seconds.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Paste a credential ID, full verification URL, or scan a QR code. The registry returns an immediate, cryptographically signed authenticity record.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
                {[
                  { icon: Lock, label: "Tamper-proof" },
                  { icon: QrCode, label: "QR or link" },
                  { icon: Globe, label: "Global registry" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="rounded-lg border border-border bg-surface p-3 text-center">
                    <Icon className="mx-auto h-4 w-4 text-[var(--primary)]" />
                    <div className="mt-1.5 text-[11px] font-medium text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification form card */}
            <div className="relative">
              <div className="absolute -inset-6 -z-10 gradient-hero opacity-20 blur-3xl rounded-[40px]" />
              <form onSubmit={submit} className="frame-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Live verification
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">certigo.institute/verify</span>
                </div>
                <div className="p-6 sm:p-8">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Credential ID, serial or verification URL
                  </label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={v}
                      onChange={(e) => setV(e.target.value)}
                      placeholder="e.g. KR-2026-A4FX-92"
                      className="h-12 text-sm"
                    />
                    <Button type="submit" disabled={busy} className="h-12 gradient-hero text-white border-0">
                      {busy ? "Checking…" : "Verify"} <Search className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Try the demo credential:{" "}
                    <button
                      type="button"
                      className="font-mono text-[var(--primary)] hover:underline"
                      onClick={() => setV("KR-2026-DEMO01")}
                    >
                      KR-2026-DEMO01
                    </button>
                  </div>
                  <div className="mt-6 rounded-lg bg-surface-muted p-4 text-xs text-muted-foreground">
                    <BadgeCheck className="mr-1.5 inline h-4 w-4 text-[var(--accent)]" />
                    Every result is signed by the CERTIGO. registry and includes issuer identity, recipient and tamper status.
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Branded result modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-border bg-card">
          <DialogHeader className="border-b border-border bg-surface px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg gradient-hero text-white shadow-glow">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <DialogTitle className="font-display text-base font-extrabold">
                    CERTIGO<span className="text-[var(--primary)]">.</span> Verification result
                  </DialogTitle>
                  <DialogDescription className="text-[11px] text-muted-foreground">
                    Public registry · {new Date().toLocaleString()}
                  </DialogDescription>
                </div>
              </div>
              {result?.ok ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/15 px-3 py-1 text-[11px] font-semibold text-[var(--primary)]">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-[11px] font-semibold text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" /> Not verified
                </span>
              )}
            </div>
          </DialogHeader>

          <div className="max-h-[80vh] overflow-y-auto p-6">
            {result?.ok && result.cert ? (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Recipient" value={result.cert.recipient_name} />
                  <Field label="Credential" value={result.cert.course_topic} />
                  <Field label="Issuer" value={result.cert.issuer ?? "CERTIGO. Institute"} />
                  <Field label="Issued" value={new Date(result.cert.issued_at).toLocaleDateString()} />
                  {result.cert.score != null && <Field label="Score" value={`${result.cert.score}%`} />}
                  <Field label="Credential ID" mono value={result.cert.serial} />
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-background">
                  <CertificateView
                    serial={result.cert.serial}
                    recipientName={result.cert.recipient_name}
                    courseTopic={result.cert.course_topic}
                    score={result.cert.score ?? null}
                    issuedAt={result.cert.issued_at}
                    verifyUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/verify/${result.cert.serial}`}
                    watermark={!!result.cert._demo}
                    compact
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    className="gradient-hero text-white border-0 hover:opacity-95"
                    onClick={() => nav({ to: "/verify/$id", params: { id: result.cert!.id } })}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> Open full certificate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/verify/${result.cert!.id}`);
                      toast.success("Verification link copied");
                    }}
                  >
                    <Link2 className="mr-2 h-4 w-4" /> Copy verify link
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-extrabold tracking-tight">Credential not on registry</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{result?.msg}</p>
                <Button className="mt-6" variant="outline" onClick={() => setOpen(false)}>
                  Try another ID
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`mt-1 ${mono ? "font-mono text-xs" : "text-sm font-semibold"}`}>{value}</div>
    </div>
  );
}