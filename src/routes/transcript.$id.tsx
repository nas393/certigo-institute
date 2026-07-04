import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { MonochromeTranscript, type TranscriptModule } from "@/components/certigo/MonochromeTranscript";
import { Loader2, Download } from "lucide-react";
import { formatReference } from "@/lib/cert";
import { Button } from "@/components/ui/button";
import { downloadTranscriptPdf } from "@/lib/transcript-pdf";

export const Route = createFileRoute("/transcript/$id")({
  head: ({ params }) => ({ meta: [{ title: `Transcript ${params.id} — CERTIGO.` }] }),
  component: TranscriptPage,
});

function TranscriptPage() {
  const { id } = Route.useParams();
  const [cert, setCert] = useState<any>(null);
  useEffect(() => {
    supabase.rpc("verify_certificate", { lookup: id })
      .then(({ data }: { data: any }) => {
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) return;
        setCert({ ...row, certifications: { title: row.cert_title, skills: row.skills } });
      });
  }, [id]);

  if (!cert) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  const skills: string[] = cert.certifications?.skills ?? [];
  const modules: TranscriptModule[] = (skills.length ? skills : ["Module 1", "Module 2", "Module 3", "Module 4"])
    .slice(0, 8)
    .map((title, i) => ({
      code: `M${String(i + 1).padStart(2, "0")}`,
      title: `Module ${i + 1} · ${title}`,
      subject: title,
      learned: `Applied ${title.toLowerCase()} through short lessons, practical exercises and a knowledge check, then demonstrated competency on the ${cert.certifications?.title ?? "assessment"}.`,
      hours: 6,
      grade: cert.score >= 90 ? "A" : cert.score >= 80 ? "B" : cert.score >= 70 ? "C" : "Pass",
      scorePct: cert.score ?? undefined,
    }));
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const verifyUrl = `${origin}/verify/${cert.serial}`;

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      <div className="mx-auto max-w-3xl px-5 py-8">
        <div className="flex items-center justify-between">
          <Link to="/certificate/$id" params={{ id: cert.serial }} className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground hover:text-foreground">← back to certificate</Link>
          <Button
            onClick={() => downloadTranscriptPdf({
              serial: cert.serial,
              recipientName: cert.recipient_name,
              programmeTitle: cert.certifications?.title ?? "CERTIGO.",
              certificateId: formatReference(cert.serial),
              issueDate: cert.issued_at,
              verifyUrl,
              modules,
              finalScorePct: cert.score,
              totalHours: modules.reduce((s, m) => s + m.hours, 0),
            })}
            size="sm"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Download className="mr-2 h-4 w-4" /> Download transcript
          </Button>
        </div>
        <div className="mt-6">
          <MonochromeTranscript
            recipientName={cert.recipient_name}
            programmeTitle={cert.certifications?.title ?? "CERTIGO."}
            certificateId={formatReference(cert.serial)}
            issueDate={cert.issued_at}
            modules={modules}
            verifyUrl={verifyUrl}
            totalHours={modules.reduce((s, m) => s + m.hours, 0)}
            finalScorePct={cert.score}
          />
        </div>
      </div>
    </div>
  );
}