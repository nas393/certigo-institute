import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { CertificateSheet, OfficialDocumentButtons } from "@/components/cert/CertificateView";
import { DigitalBadge } from "@/components/cert/DigitalBadge";
import { LinkedInButton } from "@/components/cert/LinkedInButton";
import { formatReference } from "@/lib/cert";
import { useAuth } from "@/lib/auth";
import { buildCertificateDocument, fetchCertificateRecord, type CertificateRecord } from "@/lib/certificate-data";
import { useI18n } from "@/lib/i18n";

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
  const { user } = useAuth();
  const [rec, setRec] = useState<CertificateRecord | null | undefined>(undefined);
  const [view, setView] = useState<"digital" | "certificate">("certificate");
  const { t } = useI18n();

  useEffect(() => { fetchCertificateRecord(id).then(setRec); }, [id]);
  // Public page shows the official English certificate; the owner's PDF adds their language copy.
  const doc = useMemo(() => (rec ? buildCertificateDocument(rec) : null), [rec]);

  if (rec === undefined) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!rec || !doc) {
    return <div className="min-h-screen bg-background"><Header /><p className="mx-auto max-w-2xl px-5 py-16 text-center text-muted-foreground">Certificate not found.</p></div>;
  }

  const isOwner = !!user && rec.recipient_id === user.id;
  const issuerName = rec.issuer_name || "CERTIGO.";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ Public certificate</div>
        <h1 className="mt-3 font-display text-3xl font-black tracking-tighter">{rec.recipient_name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{rec.cert_title} · {formatReference(rec.serial)}{rec.revoked ? " · REVOKED" : ""}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant={view === "certificate" ? "default" : "outline"} onClick={() => setView("certificate")}>Certificate</Button>
          <Button variant={view === "digital" ? "default" : "outline"} onClick={() => setView("digital")}>{t("cert.digital")}</Button>
          {isOwner && !rec.revoked && (
            <>
              <OfficialDocumentButtons doc={doc} />
              <LinkedInButton certTitle={rec.cert_title} issuerName={issuerName} issuedAt={rec.issued_at} serial={rec.serial} verifyUrl={doc.verifyUrl} />
            </>
          )}
        </div>
        {!isOwner && (
          <p className="mt-3 text-xs text-muted-foreground">
            Only the certificate holder can download the official PDF.{" "}
            <Link to="/verify/$id" params={{ id: rec.serial }} className="underline underline-offset-4">Print a verification summary</Link> instead.
          </p>
        )}

        <div className="mt-8">
          {view === "digital" ? (
            <DigitalBadge serial={rec.serial} recipientName={rec.recipient_name} certTitle={rec.cert_title} issuerName={issuerName} issuedAt={rec.issued_at} verifyUrl={doc.verifyUrl} />
          ) : (
            <CertificateSheet {...doc.certificate} />
          )}
        </div>
      </div>
    </div>
  );
}
