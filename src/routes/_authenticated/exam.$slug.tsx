import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { resolveRecipientName } from "@/lib/cert";
import { useCourseTranslation } from "@/lib/use-course-translation";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/exam/$slug")({
  head: ({ params }) => ({ meta: [{ title: `Exam · ${params.slug} — CERTIGO.` }] }),
  component: Exam,
});

type Item = { i: number; q: string; options: { j: number; text: string }[] };
type Start =
  | { status: "ok"; session_id: string; items: Item[] }
  | { status: "wait"; next_allowed_at: string; attempts: number }
  | { status: "certified"; serial: string };

function Exam() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [cert, setCert] = useState<any>(null);
  const [start, setStart] = useState<Start | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const { t } = useI18n();
  const { translation, loading: translating } = useCourseTranslation(slug);

  useEffect(() => {
    supabase.from("certifications").select("id, slug, title, pass_score").eq("slug", slug).maybeSingle().then(async ({ data }) => {
      setCert(data);
      if (!data) return;
      // The server shuffles questions and options for this attempt and enforces retake waits.
      const { data: st, error } = await supabase.rpc("start_exam", { _certification_id: data.id });
      if (error) { toast.error(error.message); return; }
      setStart(st as unknown as Start);
    });
  }, [slug]);

  // Items keep their original question (i) and option (j) indices, so translations still line up.
  const questions = useMemo(() => {
    if (start?.status !== "ok") return [];
    return start.items.map((it) => ({
      q: translation?.questions?.[it.i]?.q ?? it.q,
      options: it.options.map((o) => translation?.questions?.[it.i]?.options?.[o.j] ?? o.text),
    }));
  }, [start, translation]);

  if (start?.status === "certified") {
    return (
      <div className="min-h-screen bg-background"><Header />
        <div className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8">
          <h1 className="font-display text-3xl font-black tracking-tighter">You're already certified.</h1>
          <Button asChild className="mt-6 bg-emerald-600 text-white hover:bg-emerald-700">
            <Link to="/issued/$serial" params={{ serial: start.serial }}>View certificate</Link>
          </Button>
        </div>
      </div>
    );
  }
  if (start?.status === "wait") {
    const when = new Date(start.next_allowed_at);
    return (
      <div className="min-h-screen bg-background"><Header />
        <div className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8">
          <h1 className="font-display text-3xl font-black tracking-tighter">Your next attempt opens soon.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            You can retake this exam from <strong>{when.toLocaleString()}</strong>.
            The second attempt opens 24 hours after the first; later attempts need 7 days between them.
          </p>
        </div>
      </div>
    );
  }

  if (!cert || start?.status !== "ok") return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

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

    if (start?.status !== "ok") return;
    const { data, error } = await supabase.rpc("submit_exam", {
      _session_id: start.session_id,
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
      toast.error(`You scored ${score}%. Pass mark is ${cert.pass_score}%.`);
      setAnswers({});
      const { data: st } = await supabase.rpc("start_exam", { _certification_id: cert.id });
      if (st) setStart(st as unknown as Start);
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
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter">{translation?.title ?? cert.title}</h1>
        {translating && (
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> {t("course.translating")}
          </p>
        )}
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