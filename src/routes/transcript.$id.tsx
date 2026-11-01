import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { Loader2 } from "lucide-react";
import { OfficialDocumentButtons, TranscriptSheet } from "@/components/cert/CertificateView";
import { useAuth } from "@/lib/auth";
import { buildCertificateDocument, fetchCertificateRecord, type CertificateRecord } from "@/lib/certificate-data";

export const Route = createFileRoute("/transcript/$id")({
  head: ({ params }) => ({ meta: [{ title: `Transcript ${params.id} — CERTIGO.` }] }),
  component: TranscriptPage,
});

function TranscriptPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [rec, setRec] = useState<CertificateRecord | null | undefined>(undefined);
  useEffect(() => { fetchCertificateRecord(id).then(setRec); }, [id]);
  const doc = useMemo(() => (rec ? buildCertificateDocument(rec) : null), [rec]);

  if (rec === undefined) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!rec || !doc?.transcript) {
    return <div className="min-h-screen bg-background"><Header /><p className="mx-auto max-w-2xl px-5 py-16 text-center text-muted-foreground">Transcript not found.</p></div>;
  }
  const isOwner = !!user && rec.recipient_id === user.id && !rec.revoked;

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      <div className="mx-auto max-w-3xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link to="/certificate/$id" params={{ id: rec.serial }} className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground hover:text-foreground">← back to certificate</Link>
          {isOwner && <div className="flex flex-wrap gap-2"><OfficialDocumentButtons doc={doc} /></div>}
        </div>
        <div className="mt-6">
          <TranscriptSheet {...doc.transcript} />
        </div>
      </div>
    </div>
  );
}
