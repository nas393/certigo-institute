import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/kredo/Header";
import { MonochromeTranscript, type TranscriptModule } from "@/components/certigo/MonochromeTranscript";
import { Loader2 } from "lucide-react";
import { formatSerial } from "@/lib/cert";

export const Route = createFileRoute("/transcript/$id")({
  head: () => ({ meta: [{ title: "Transcript — CERTIGO." }] }),
  component: TranscriptPage,
});

function TranscriptPage() {
  const { id } = Route.useParams();
  const [cert, setCert] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("certificates").select("*").eq("id", id).maybeSingle();
      setCert(data);
      if (data?.course_id) {
        const { data: c } = await supabase.from("courses").select("*").eq("id", data.course_id).maybeSingle();
        setCourse(c);
      }
    })();
  }, [id]);

  if (!cert) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  const outline: any[] = Array.isArray(course?.outline) ? course.outline : [];
  const modules: TranscriptModule[] = (outline.length ? outline : [
    { title: "Module 1" }, { title: "Module 2" }, { title: "Module 3" }, { title: "Module 4" },
  ]).slice(0, 8).map((m: any, i: number) => ({
    code: `M${String(i + 1).padStart(2, "0")}`,
    title: typeof m === "string" ? m : (m.title ?? m.t ?? `Module ${i + 1}`),
    hours: 6,
    grade: cert.score >= 90 ? "A" : cert.score >= 80 ? "B" : cert.score >= 70 ? "C" : "Pass",
    scorePct: cert.score ?? undefined,
  }));

  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${cert.id}`;
  const totalHours = modules.reduce((s, m) => s + m.hours, 0);

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link to="/certificate/$id" params={{ id: cert.id }} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">← Back to certificate</Link>
        <div className="mt-6 rounded-2xl border border-border bg-background p-3 sm:p-5">
          <MonochromeTranscript
            recipientName={cert.recipient_name}
            programmeTitle={cert.course_topic}
            certificateId={formatSerial(cert.serial)}
            issueDate={cert.issued_at}
            verifyUrl={verifyUrl}
            modules={modules}
            finalGrade={cert.score >= 90 ? "A" : cert.score >= 80 ? "B" : cert.score >= 70 ? "C" : "Pass"}
            finalScorePct={cert.score ?? undefined}
            totalHours={totalHours}
          />
        </div>
      </div>
    </div>
  );
}
