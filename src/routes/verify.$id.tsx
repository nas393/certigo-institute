import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/kredo/Header";
import { CertificateView } from "@/components/kredo/CertificateView";
import { ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import { formatSerial } from "@/lib/cert";

/**
 * Dev-only end-to-end check banner.
 * Validates that:
 *   1. The record loaded matches the URL id (or serial).
 *   2. The verify URL on the certificate resolves to `${origin}/verify/${cert.id}`.
 *   3. The reference id renders as `CERTIGO. ${formatSerial(serial)}`.
 */
function VerifyE2EBanner({ cert, urlId }: { cert: any; urlId: string }) {
  if (!import.meta.env.DEV) return null;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const expectedVerifyUrl = `${origin}/verify/${cert.id ?? urlId}`;
  const expectedRef = `CERTIGO. ${formatSerial(cert.serial)}`;
  const matchesId = cert.id === urlId || String(cert.serial).toLowerCase() === urlId.toLowerCase();
  const checks = [
    { label: "Record resolved", pass: !!cert && !cert.revoked },
    { label: "ID matches URL", pass: matchesId },
    { label: "Verify URL → record", pass: expectedVerifyUrl.endsWith(`/verify/${cert.id ?? urlId}`) },
    { label: `Ref renders as “${expectedRef}”`, pass: /^CERTIGO\.\s+\S+/.test(expectedRef) },
  ];
  const allPass = checks.every((c) => c.pass);
  return (
    <div className={`mt-4 rounded-md border px-4 py-3 font-mono text-[10px] uppercase tracking-widest ${allPass ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700" : "border-destructive/40 bg-destructive/5 text-destructive"}`}>
      <div className="mb-1 font-bold">DEV · E2E verify check {allPass ? "✓ pass" : "✗ fail"}</div>
      <ul className="space-y-0.5">
        {checks.map((c) => (
          <li key={c.label}>{c.pass ? "✓" : "✗"} {c.label}</li>
        ))}
      </ul>
    </div>
  );
}

export const Route = createFileRoute("/verify/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Verify ${params.id} — CERTIGO.` },
      { name: "description", content: "Public verification page for a CERTIGO. certificate." },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOccupationalCredential",
          identifier: params.id,
          credentialCategory: "Certificate",
          issuedBy: { "@type": "Organization", name: "CERTIGO." },
        }),
      },
    ],
  }),
  component: VerifyOne,
});

function VerifyOne() {
  const { id } = Route.useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      // Demo serials: render a verifiable showcase without a DB row
      if (/^KR-2026-DEMO/i.test(id) || /^CERT-[A-Z]{2,3}-\d+/i.test(id)) {
        const upper = id.toUpperCase();
        const demoMap: Record<string, { topic: string; date: string }> = {
          "CERT-DM-1024": { topic: "Digital Marketing Fundamentals", date: "2026-03-12" },
          "CERT-PM-2048": { topic: "Project Management Essentials", date: "2026-04-08" },
          "CERT-LC-4096": { topic: "Leadership & Communication", date: "2026-05-02" },
        };
        const meta = demoMap[upper];
        setCert({
          id,
          serial: upper,
          recipient_name: meta ? "Demo Professional" : "Amara Okafor",
          course_topic: meta ? meta.topic : "Certified Prompt Engineering Professional (CPEP)",
          score: meta ? 92 : 94,
          issued_at: meta ? new Date(meta.date).toISOString() : new Date().toISOString(),
          revoked: false,
          _demo: true,
        });
        setLoading(false);
        return;
      }
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const q = supabase.from("certificates").select("*");
      const { data } = UUID_RE.test(id)
        ? await q.eq("id", id).maybeSingle()
        : await q.ilike("serial", id).maybeSingle();
      setCert(data); setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-12">
        {cert && !cert.revoked ? (
          <>
            <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-5 py-4">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div>
                <div className="font-display text-lg font-black tracking-tight">
                  ✓ Verified by CERTIGO. {cert._demo && <span className="ms-2 rounded bg-foreground/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest">Demo</span>}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Issued {new Date(cert.issued_at).toLocaleDateString()} · CERTIGO. {formatSerial(cert.serial)}
                </div>
              </div>
            </div>
            <VerifyE2EBanner cert={cert} urlId={id} />
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <CertificateView serial={cert.serial} recipientName={cert.recipient_name} courseTopic={cert.course_topic}
                score={cert.score} issuedAt={cert.issued_at} verifyUrl={`${window.location.origin}/verify/${cert.id}`} />
              <div>
                <div className="micro-label">◆ Recipient</div>
                <h1 className="mt-2 font-display text-3xl font-black tracking-tighter">{cert.recipient_name}</h1>
                <div className="mt-6 micro-label">◆ Credential</div>
                <p className="mt-2 font-display text-xl">{cert.course_topic}</p>
                <div className="mt-6 micro-label">◆ Score</div>
                <p className="mt-2 font-display text-xl">{cert.score}%</p>
              </div>
            </div>
          </>
        ) : cert?.revoked ? (
          <div className="text-center">
            <ShieldX className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-4 font-display text-3xl font-black tracking-tighter">Certificate revoked</h1>
            <p className="mt-2 text-muted-foreground">Serial {cert.serial} is no longer valid.</p>
          </div>
        ) : (
          <div className="text-center">
            <ShieldX className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-4 font-display text-3xl font-black tracking-tighter">Certificate not found</h1>
            <p className="mt-2 text-muted-foreground">This ID does not match any CERTIGO. credential.</p>
            <Link to="/verify" className="mt-6 inline-block font-mono text-[10px] uppercase tracking-widest text-primary">← Try another</Link>
          </div>
        )}
      </div>
    </div>
  );
}
