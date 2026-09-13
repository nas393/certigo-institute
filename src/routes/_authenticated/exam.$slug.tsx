import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { resolveRecipientName } from "@/lib/cert";

export const Route = createFileRoute("/_authenticated/exam/$slug")({
  head: ({ params }) => ({ meta: [{ title: `Exam · ${params.slug} — CERTIGO.` }] }),
  component: Exam,
});

type Q = { q: string; options: string[] };

function Exam() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [cert, setCert] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("certifications").select("id, slug, title, issuer_name, category, summary, skills, question_count, pass_score, questions, created_at, created_by, modules, price_cents").eq("slug", slug).maybeSingle().then(({ data }) => setCert(data));
  }, [slug]);

  const questions: Q[] = useMemo(() => (Array.isArray(cert?.questions) ? cert.questions : []), [cert]);

  if (!cert) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  async function submit() {
    if (!user || !cert) return;
    const total = questions.length;
    if (Object.keys(answers).length < total) {
      toast.error("Answer every question first."); return;
    }
    setSubmitting(true);
    const { data: profile } = await supabase
      .from("profiles").select("display_name").eq("user_id", user.id).maybeSingle();
    const recipientName = resolveRecipientName({
      profileName: profile?.display_name,
      providerName:
        (user.user_metadata?.display_name as string | undefined) ??
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined),
      email: user.email,
    });

    const { data, error } = await supabase.rpc("grade_and_issue", {
      _certification_id: cert.id,
      _answers: answers,
      _recipient_name: recipientName,
    });
    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }
    const row: any = Array.isArray(data) ? data[0] : data;
    const score = row?.score ?? 0;
    if (!row?.passed || !row?.serial) {
      setSubmitting(false);
      toast.error(`You scored ${score}%. Pass mark is ${cert.pass_score}%. Try again.`);
      setAnswers({});
      return;
    }
    toast.success("Certificate issued.");
    nav({ to: "/issued/$serial", params: { serial: row.serial } });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ Exam</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter">{cert.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{questions.length} questions · pass at {cert.pass_score}%</p>

        <div className="mt-8 space-y-6">
          {questions.map((q, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Q{i + 1}</div>
              <div className="mt-2 font-medium">{q.q}</div>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, j) => (
                  <button
                    key={j}
                    onClick={() => setAnswers({ ...answers, [i]: j })}
                    className={"block w-full rounded-md border px-3 py-2 text-left text-sm transition " + (answers[i] === j ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-border hover:border-foreground/40")}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button onClick={submit} disabled={submitting} className="mt-8 bg-emerald-600 text-white hover:bg-emerald-700">
          {submitting ? "Issuing…" : "Submit & issue certificate"}
        </Button>
      </div>
    </div>
  );
}