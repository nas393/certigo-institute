import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Briefcase, Check, Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/kredo/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/c_/$slug/mission")({
  head: ({ params }) => ({ meta: [{ title: `Mission — ${params.slug} — CERTIGO.` }] }),
  component: MissionPage,
});

type Info = {
  title: string;
  role: string;
  company: string;
  briefing: string;
  steps: number;
  skills: string[];
  pass_score: number;
  signed_in: boolean;
  resume: boolean;
  next_allowed_at: string | null;
  best: { score: number; skills: Record<string, number> } | null;
};
type Step = { n: number; total: number; skill: string; text: string; choices: string[] };
type Result = {
  score: number;
  passed: boolean;
  pass_score: number;
  skills: Record<string, number>;
};
// Mission functions are new and not in the generated types yet.
const rpc = (fn: string, args: Record<string, unknown>) =>
  (supabase.rpc as any)(fn, args) as Promise<{ data: any; error: any }>;

function MissionPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [info, setInfo] = useState<Info | null | undefined>(undefined);
  const [run, setRun] = useState<string | null>(null);
  const [step, setStep] = useState<Step | null>(null);
  const [fb, setFb] = useState<{
    text: string;
    points: number;
    next?: Step;
    result?: Result;
  } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    rpc("mission_info", { _slug: slug }).then(({ data }) => setInfo(data ?? null));
  }, [slug, user?.id]);

  async function start() {
    if (!user) {
      nav({ to: "/auth" });
      return;
    }
    setBusy(true);
    const { data, error } = await rpc("start_mission", { _slug: slug });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data?.status === "wait") {
      toast.error(`Next attempt opens at ${new Date(data.next_allowed_at).toLocaleTimeString()}.`);
      return;
    }
    setRun(data.run);
    setStep(data.step);
    setFb(null);
    setResult(null);
    setPicked(null);
  }

  async function answer(i: number) {
    if (!run || busy || fb) return;
    setPicked(i);
    setBusy(true);
    const { data, error } = await rpc("answer_mission_step", { _run: run, _choice: i });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      setPicked(null);
      return;
    }
    setFb({ text: data.feedback, points: data.points, next: data.next, result: data.result });
  }

  function next() {
    if (!fb) return;
    if (fb.result) {
      setResult(fb.result);
      setStep(null);
      rpc("mission_info", { _slug: slug }).then(({ data }) => setInfo(data ?? null));
    } else if (fb.next) setStep(fb.next);
    setFb(null);
    setPicked(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-8 sm:px-8">
        <Link
          to="/c/$slug"
          params={{ slug }}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the course
        </Link>
        {children}
      </main>
    </div>
  );

  if (info === undefined)
    return shell(
      <div className="py-24 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
      </div>,
    );
  if (info === null)
    return shell(
      <p className="py-16 text-center text-muted-foreground">This course has no mission yet.</p>,
    );

  if (result) {
    return shell(
      <section className="mt-6 rounded-xl border border-border p-6">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          ◆ Mission debrief
        </div>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tighter">{result.score}%</h1>
        <p className={`mt-1 font-medium ${result.passed ? "text-emerald-700" : "text-red-700"}`}>
          {result.passed
            ? "Mission passed. The certificate exam is unlocked."
            : `Not yet. You need ${result.pass_score}% to unlock the exam.`}
        </p>
        <ul className="mt-6 space-y-3">
          {Object.entries(result.skills).map(([k, v]) => (
            <li key={k}>
              <div className="flex justify-between text-sm">
                <span>{k}</span>
                <span className="font-mono">{v}%</span>
              </div>
              <div className="mt-1 h-2 rounded bg-muted">
                <div
                  className={`h-2 rounded ${v >= 70 ? "bg-emerald-600" : "bg-amber-500"}`}
                  style={{ width: `${v}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-8 grid gap-2">
          {result.passed ? (
            <Button
              size="lg"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => nav({ to: "/exam/$slug", params: { slug } })}
            >
              Go to the certificate exam <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button size="lg" variant="outline" asChild>
              <Link to="/c/$slug" params={{ slug }}>
                Review the lessons (next try in 1 hour)
              </Link>
            </Button>
          )}
          <Button size="lg" variant="ghost" onClick={start}>
            <RotateCcw className="mr-2 h-4 w-4" /> Play again
          </Button>
        </div>
      </section>,
    );
  }

  if (step) {
    return shell(
      <section className="mt-6">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          <span>
            Decision {step.n} of {step.total}
          </span>
          <span>{step.skill}</span>
        </div>
        <div className="mt-2 h-1.5 rounded bg-muted">
          <div
            className="h-1.5 rounded bg-emerald-600 transition-all"
            style={{ width: `${((step.n - 1) / step.total) * 100}%` }}
          />
        </div>
        <div className="mt-6 rounded-xl border border-border bg-card p-5 text-[17px] leading-relaxed">
          {step.text}
        </div>
        <div className="mt-4 grid gap-3" role="list">
          {step.choices.map((c, i) => {
            const chosen = picked === i;
            const tone =
              fb && chosen
                ? fb.points === 2
                  ? "border-emerald-600 bg-emerald-50"
                  : fb.points === 1
                    ? "border-amber-500 bg-amber-50"
                    : "border-red-500 bg-red-50"
                : "border-border hover:border-foreground";
            return (
              <button
                key={i}
                role="listitem"
                disabled={!!fb || busy}
                onClick={() => answer(i)}
                className={`min-h-[52px] rounded-lg border-2 px-4 py-3 text-left text-[15px] transition ${tone} ${fb && !chosen ? "opacity-50" : ""}`}
              >
                {c}
              </button>
            );
          })}
        </div>
        {fb && (
          <div className="mt-5 rounded-xl border border-border p-5" aria-live="polite">
            <div
              className={`flex items-center gap-2 font-medium ${fb.points === 2 ? "text-emerald-700" : fb.points === 1 ? "text-amber-700" : "text-red-700"}`}
            >
              {fb.points === 2 ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {fb.points === 2
                ? "Strong decision"
                : fb.points === 1
                  ? "Acceptable, not best"
                  : "Poor decision"}
            </div>
            <p className="mt-2 text-[15px] leading-relaxed">{fb.text}</p>
            <Button size="lg" className="mt-4 w-full" onClick={next}>
              {fb.result ? "See my debrief" : "Next decision"}{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
        {busy && !fb && <Loader2 className="mx-auto mt-6 h-5 w-5 animate-spin" />}
      </section>,
    );
  }

  return shell(
    <section className="mt-6 rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        <Briefcase className="h-4 w-4" /> Mission · free
      </div>
      <h1 className="mt-2 font-display text-3xl font-black tracking-tighter">{info.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your role: <b className="text-foreground">{info.role}</b> · {info.company}
      </p>
      <p className="mt-4 leading-relaxed">{info.briefing}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {info.skills.map((s) => (
          <li key={s} className="rounded-full border border-border px-3 py-1 text-xs">
            {s}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">
        {info.steps} decisions. Choices are final. Pass with {info.pass_score}% to unlock the
        certificate exam; your skill profile is shown on your certificate.
      </p>
      {info.best && (
        <p className="mt-2 text-sm font-medium text-emerald-700">
          Your best: {info.best.score}% (passed)
        </p>
      )}
      <Button
        size="lg"
        className="mt-6 w-full bg-emerald-600 text-white hover:bg-emerald-700"
        disabled={busy}
        onClick={start}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {info.resume
              ? "Resume the mission"
              : info.signed_in
                ? "Start the mission"
                : "Sign in to start"}{" "}
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      {info.next_allowed_at && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Next attempt opens at {new Date(info.next_allowed_at).toLocaleTimeString()}.
        </p>
      )}
    </section>,
  );
}
