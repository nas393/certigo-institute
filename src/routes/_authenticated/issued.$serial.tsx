import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { CertificateCard } from "@/components/cert/CertificateCard";
import { DigitalBadge } from "@/components/cert/DigitalBadge";
import { LinkedInButton } from "@/components/cert/LinkedInButton";
import { CertChecksBanner } from "@/components/dev/CertChecksBanner";
import { StagingShareToggle } from "@/components/cert/StagingShareToggle";
import { downloadCertificatePdf } from "@/lib/cert-pdf";
import { formatReference } from "@/lib/cert";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/issued/$serial")({
  head: ({ params }) => ({ meta: [{ title: `Issued ${params.serial} — CERTIGO.` }] }),
  component: Issued,
});

function Issued() {
  const { serial } = Route.useParams();
  const [cert, setCert] = useState<any>(null);
  const [view, setView] = useState<"digital" | "print">("digital");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    supabase.from("certificates")
      .select("serial, recipient_name, issued_at, score, certifications(title, issuer_name)")
      .eq("serial", serial).maybeSingle()
      .then(({ data }) => setCert(data));
  }, [serial]);

  if (!cert) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const verifyUrl = `${origin}/verify/${cert.serial}`;
  const certTitle = cert.certifications?.title ?? "CERTIGO. Certificate";
  const issuerName = cert.certifications?.issuer_name ?? "CERTIGO.";

  async function download() {
    setDownloading(true);
    try {
      await downloadCertificatePdf({
        serial: cert.serial,
        recipientName: cert.recipient_name,
        certTitle,
        issuerName,
        issuedAt: cert.issued_at,
        scorePct: cert.score,
        verifyUrl,
      });
    } catch (e: any) {
      toast.error(e.message ?? "PDF failed");
    } finally { setDownloading(false); }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">◆ Certificate issued</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter">Congratulations.</h1>
        <p className="mt-2 text-sm text-muted-foreground">{formatReference(cert.serial)} · Score {cert.score}%</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant={view === "digital" ? "default" : "outline"} onClick={() => setView("digital")} className="min-h-[44px]">Digital badge</Button>
          <Button variant={view === "print" ? "default" : "outline"} onClick={() => setView("print")} className="min-h-[44px]">Official print</Button>
          <Button onClick={download} disabled={downloading} className="min-h-[44px] bg-emerald-600 text-white hover:bg-emerald-700">
            <Download className="mr-2 h-4 w-4" /> {downloading ? "Generating…" : "Download PDF"}
          </Button>
          <LinkedInButton
            certTitle={certTitle}
            issuerName={issuerName}
            issuedAt={cert.issued_at}
            serial={cert.serial}
            verifyUrl={verifyUrl}
            className="min-h-[44px]"
          />
        </div>

        <div className="mt-8">
          {view === "digital" ? (
            <DigitalBadge
              serial={cert.serial}
              recipientName={cert.recipient_name}
              certTitle={certTitle}
              issuerName={issuerName}
              issuedAt={cert.issued_at}
              verifyUrl={verifyUrl}
            />
          ) : (
            <CertificateCard
              serial={cert.serial}
              recipientName={cert.recipient_name}
              certTitle={certTitle}
              issuedAt={cert.issued_at}
              score={cert.score}
              verifyUrl={verifyUrl}
            />
          )}
        </div>

        <CertChecksBanner cert={cert} />
        <StagingShareToggle serial={cert.serial} />

        <div className="mt-8 text-sm text-muted-foreground">
          <Link to="/certificate/$id" params={{ id: cert.serial }} className="hover:text-foreground underline-offset-4 hover:underline">
            Public certificate page →
          </Link>{" "}
          ·{" "}
          <Link to="/verify/$id" params={{ id: cert.serial }} className="hover:text-foreground underline-offset-4 hover:underline">
            Verify URL →
          </Link>
        </div>
      </div>
    </div>
  );
}