import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { CertificateSheet, OfficialDocumentButtons, TranscriptSheet } from "@/components/cert/CertificateView";
import { DigitalBadge } from "@/components/cert/DigitalBadge";
import { LinkedInButton } from "@/components/cert/LinkedInButton";
import { StagingShareToggle } from "@/components/cert/StagingShareToggle";
import { formatReference } from "@/lib/cert";
import { useAuth } from "@/lib/auth";
import { buildCertificateDocument, fetchCertificateRecord, type CertificateRecord } from "@/lib/certificate-data";
import { useI18n, languageName } from "@/lib/i18n";
import { useCourseTranslation } from "@/lib/use-course-translation";

export const Route = createFileRoute("/_authenticated/issued/$serial")({
  head: ({ params }) => ({ meta: [{ title: `Issued ${params.serial} — CERTIGO.` }] }),
  component: Issued,
});

function Issued() {
  const { serial } = Route.useParams();
  const { user } = useAuth();
  const [rec, setRec] = useState<CertificateRecord | null | undefined>(undefined);
  const [view, setView] = useState<"digital" | "certificate" | "transcript">("certificate");
  const { t, lang } = useI18n();
  const { translation } = useCourseTranslation(rec?.slug);

  useEffect(() => { fetchCertificateRecord(serial).then(setRec); }, [serial]);
  const doc = useMemo(
    () => (rec ? buildCertificateDocument(rec, { lang, translatedTitle: translation?.title }) : null),
    [rec, lang, translation],
  );

  if (rec === undefined) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!rec || !doc || rec.recipient_id !== user?.id) {
    return <div className="min-h-screen bg-background"><Header /><p className="mx-auto max-w-2xl px-5 py-16 text-center text-muted-foreground">This certificate isn't linked to your account.</p></div>;
  }
  const cert = rec;
  const certTitle = rec.cert_title;
  const issuerName = rec.issuer_name || "CERTIGO.";
  const verifyUrl = doc.verifyUrl;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">◆ {t("cert.issued")}</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter">{t("cert.congrats")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{formatReference(cert.serial)} · {t("cert.score")} {cert.score}%</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant={view === "certificate" ? "default" : "outline"} onClick={() => setView("certificate")} className="min-h-[44px]">Certificate</Button>
          {doc.transcript && <Button variant={view === "transcript" ? "default" : "outline"} onClick={() => setView("transcript")} className="min-h-[44px]">Transcript</Button>}
          <Button variant={view === "digital" ? "default" : "outline"} onClick={() => setView("digital")} className="min-h-[44px]">{t("cert.digital")}</Button>
          <OfficialDocumentButtons doc={doc} />
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
          ) : view === "transcript" && doc.transcript ? (
            <div className="mx-auto max-w-2xl"><TranscriptSheet {...doc.transcript} /></div>
          ) : (
            <CertificateSheet {...doc.certificate} />
          )}
        </div>

        {lang !== "en" && (
          <p className="mt-4 text-xs text-muted-foreground">
            {t("cert.bilingualNote", { lang: languageName(lang) })}
          </p>
        )}

        <StagingShareToggle serial={cert.serial} />

        <div className="mt-8 text-sm text-muted-foreground">
          <Link to="/certificate/$id" params={{ id: cert.serial }} className="hover:text-foreground underline-offset-4 hover:underline">
            {t("cert.publicPage")}
          </Link>{" "}
          ·{" "}
          <Link to="/verify/$id" params={{ id: cert.serial }} className="hover:text-foreground underline-offset-4 hover:underline">
            {t("cert.verifyUrl")}
          </Link>
        </div>
      </div>
    </div>
  );
}
