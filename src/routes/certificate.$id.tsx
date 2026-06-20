import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { CertificateCard } from "@/components/cert/CertificateCard";
import { DigitalBadge } from "@/components/cert/DigitalBadge";
import { LinkedInButton } from "@/components/cert/LinkedInButton";
import { CertChecksBanner } from "@/components/dev/CertChecksBanner";
import { downloadCertificatePdf } from "@/lib/cert-pdf";
import { formatReference } from "@/lib/cert";

export const Route = createFileRoute("/certificate/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Certificate ${params.id} — CERTIGO.` },
      { name: "description", content: "A QR-verified CERTIGO. certificate." },
    ],
  }),
  component: CertPage,
});

function CertPage() {
  const { id } = Route.useParams();
  const [cert, setCert] = useState<any>(null);
  const [view, setView] = useState<"digital" | "print">("digital");

  useEffect(() => {
    const s = id.toUpperCase();
    supabase.from("certificates")
      .select("serial, recipient_name, issued_at, score, revoked, certifications(title, issuer_name)")
      .or(`serial.eq.${s},id.eq.${id}`).maybeSingle()
      .then(({ data }) => setCert(data));
  }, [id]);

  if (!cert) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const verifyUrl = `${origin}/verify/${cert.serial}`;
  const certTitle = cert.certifications?.title ?? "CERTIGO. Certificate";
  const issuerName = cert.certifications?.issuer_name ?? "CERTIGO.";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ Public certificate</div>
        <h1 className="mt-3 font-display text-3xl font-black tracking-tighter">{cert.recipient_name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{certTitle} · {formatReference(cert.serial)}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant={view === "digital" ? "default" : "outline"} onClick={() => setView("digital")}>Digital badge</Button>
          <Button variant={view === "print" ? "default" : "outline"} onClick={() => setView("print")}>Official print</Button>
          <Button
            onClick={() => downloadCertificatePdf({ serial: cert.serial, recipientName: cert.recipient_name, certTitle, issuerName, issuedAt: cert.issued_at, scorePct: cert.score, verifyUrl })}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <LinkedInButton certTitle={certTitle} issuerName={issuerName} issuedAt={cert.issued_at} serial={cert.serial} verifyUrl={verifyUrl} />
        </div>

        <div className="mt-8">
          {view === "digital" ? (
            <DigitalBadge serial={cert.serial} recipientName={cert.recipient_name} certTitle={certTitle} issuerName={issuerName} issuedAt={cert.issued_at} verifyUrl={verifyUrl} />
          ) : (
            <CertificateCard serial={cert.serial} recipientName={cert.recipient_name} certTitle={certTitle} issuedAt={cert.issued_at} score={cert.score} verifyUrl={verifyUrl} />
          )}
        </div>

        <CertChecksBanner cert={cert} />
      </div>
    </div>
  );
}