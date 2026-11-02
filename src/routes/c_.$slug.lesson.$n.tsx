import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock, Loader2, X, Presentation, BookOpen, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/kredo/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { loadLessonPack, type LessonPack } from "@/content/lessons";
import { LessonSlides } from "@/components/course/LessonSlides";
import { LessonBody, lessonSteps } from "@/components/course/LessonBlocks";
import { normalizeModules } from "@/components/course/SkillsMap";

export const Route = createFileRoute("/c_/$slug/lesson/$n")({
  head: ({ params }) => ({ meta: [{ title: `Lesson ${params.n} — ${params.slug} — CERTIGO.` }] }),
  component: LessonPage,
});

function LessonPage() {
  const { slug, n } = Route.useParams();
  const idx = Math.max(0, (parseInt(n, 10) || 1) - 1);
  const { user } = useAuth();
  const nav = useNavigate();
  const [c, setC] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [pack, setPack] = useState<LessonPack | null | undefined>(undefined);

  useEffect(() => {
    supabase.from("certifications").select("id, slug, title, modules").eq("slug", slug).maybeSingle().then(({ data }) => setC(data));
    void loadLessonPack(slug).then(setPack);
  }, [slug]);
  useEffect(() => { setStep(0); }, [idx]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [idx, step]);

  const modules = useMemo(() => normalizeModules(c?.modules), [c]);
  if (!c || pack === undefined) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;
  const m = modules[idx];
  const total = modules.length;
  if (!m) return <div className="min-h-screen bg-background"><Header /><p className="p-10 text-center text-muted-foreground">Lesson not found.</p></div>;
  const body = pack?.bodies[idx] ?? m.body ?? "";
  const slides = pack?.slides?.[idx] ?? [];
  const minutes = pack?.minutes[idx] ?? m.minutes;

  // One short screen at a time: overview slides, the lesson's sections, then the lesson check.
  type Step = { kind: "overview" | "section" | "check"; title: string; text?: string };
  const steps: Step[] = [
    ...(slides.length ? [{ kind: "overview" as const, title: "Overview" }] : []),
    ...lessonSteps(body).map((x) => ({ kind: "section" as const, title: x.title, text: x.text })),
    ...(m.check?.options?.length ? [{ kind: "check" as const, title: "Lesson check" }] : []),
  ];
  const cur = steps[Math.min(step, steps.length - 1)] ?? { kind: "section", title: "", text: "" };
  const atEnd = step >= steps.length - 1;
  const go = (d: number) => setStep((x) => Math.min(steps.length - 1, Math.max(0, x + d)));
  const nextLesson = () => idx < total - 1 ? nav({ to: "/c/$slug/lesson/$n", params: { slug, n: String(idx + 2) } }) : nav({ to: "/c/$slug", params: { slug } });

  return (
    <div className="min-h-screen bg-muted/30 pb-28">
      <Header />
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-5 py-2.5 sm:px-8">
          <div className="flex items-center justify-between gap-3 text-xs">
            <Link to="/c/$slug" params={{ slug }} className="inline-flex min-w-0 items-center gap-1 truncate text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3 shrink-0" /> <span className="truncate">{c.title}</span></Link>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-700">Lesson {idx + 1}/{total}</span>
          </div>
          <div className="mt-2 flex gap-1" role="tablist" aria-label="Lesson steps">
            {steps.map((st, i) => (
              <button key={i} role="tab" aria-selected={i === step} aria-label={`Step ${i + 1}: ${st.title}`} onClick={() => setStep(i)}
                className={"h-1.5 flex-1 rounded-full transition " + (i < step ? "bg-emerald-600" : i === step ? "bg-emerald-400" : "bg-muted-foreground/20 hover:bg-muted-foreground/40")} />
            ))}
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-5 pt-6 sm:px-8">
        {step === 0 && (
          <header className="mb-5">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              {steps.length} short steps
              {minutes ? <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {minutes} min</span> : null}
            </div>
            <h1 className="mt-1.5 font-display text-3xl font-black tracking-tighter sm:text-4xl">{m.title}</h1>
            {m.learned && <p className="mt-2 text-muted-foreground">{m.learned}</p>}
          </header>
        )}

        <section key={`${idx}-${step}`} className="animate-in fade-in slide-in-from-right-2 rounded-2xl border border-border bg-background p-5 shadow-sm duration-300 sm:p-8">
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-700">
            {cur.kind === "overview" ? <Presentation className="h-3.5 w-3.5" /> : cur.kind === "check" ? <ClipboardCheck className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
            Step {step + 1} of {steps.length} · {cur.title}
          </div>
          {cur.kind === "overview" && (
            <>
              <p className="text-sm text-muted-foreground">Flip through the key ideas, then tap Next below to start the lesson.</p>
              <LessonSlides slides={slides} lessonTitle={`Lesson ${idx + 1}`} />
            </>
          )}
          {cur.kind === "section" && (cur.text ? <LessonBody text={cur.text} /> : <p className="text-muted-foreground">This lesson's full text is being prepared.</p>)}
          {cur.kind === "check" && m.check?.options?.length ? (
            <LessonCheck certificationId={c.id} index={idx} q={m.check.q ?? ""} options={m.check.options} signedIn={!!user} />
          ) : null}
        </section>

        {atEnd && (
          <div className="mt-4 rounded-2xl border border-emerald-600/30 bg-emerald-50/60 p-5 text-sm">
            <div className="font-semibold">{idx < total - 1 ? "Ready for the next lesson?" : "You've reached the end of the course."}</div>
            <p className="mt-1 text-muted-foreground">{idx < total - 1 ? "Pass the lesson check to save your progress, then continue." : "Pass every lesson check to unlock the exam and earn your certificate."}</p>
          </div>
        )}
      </article>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur" aria-label="Lesson navigation">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3 sm:px-8">
          {step > 0 ? (
            <Button variant="outline" onClick={() => go(-1)}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
          ) : idx > 0 ? (
            <Button variant="outline" onClick={() => nav({ to: "/c/$slug/lesson/$n", params: { slug, n: String(idx) } })}><ArrowLeft className="mr-1 h-4 w-4" /> Lesson {idx}</Button>
          ) : <span />}
          <span className="hidden truncate text-xs text-muted-foreground sm:block">{!atEnd ? `Next: ${steps[step + 1]?.title ?? ""}` : ""}</span>
          {!atEnd ? (
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => go(1)}>Next <ArrowRight className="ml-1 h-4 w-4" /></Button>
          ) : (
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={nextLesson}>{idx < total - 1 ? "Next lesson" : "Finish: get certified"} <ArrowRight className="ml-1 h-4 w-4" /></Button>
          )}
        </div>
      </nav>
    </div>
  );
}

/** The lesson's knowledge check, graded on the server and saved to the learner's progress. */
function LessonCheck({ certificationId, index, q, options, signedIn }: { certificationId: string; index: number; q: string; options: string[]; signedIn: boolean }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [res, setRes] = useState<{ correct: boolean; explanation: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setChoice(null); setRes(null); }, [index]);
  async function check() {
    if (choice === null) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("grade_lesson_check", { _certification_id: certificationId, _module_index: index, _choice: choice });
    setBusy(false);
    if (error) return toast.error(error.message);
    setRes((Array.isArray(data) ? data[0] : data) as any);
  }
  return (
    <section className="rounded-xl border-2 border-emerald-600/30 p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-700">Lesson check</div>
      <div className="mt-2 font-semibold">{q}</div>
      <div className="mt-3 space-y-2">
        {options.map((o, j) => {
          const right = res && res.correct && choice === j;
          const wrong = res && !res.correct && choice === j;
          return (
            <button key={j} onClick={() => { setChoice(j); setRes(null); }}
              className={"w-full rounded-lg border px-3 py-2.5 text-left text-sm " + (right ? "border-emerald-600 bg-emerald-50" : wrong ? "border-red-400 bg-red-50" : choice === j ? "border-foreground/60" : "border-border hover:border-foreground/30")}>
              <span className="inline-flex gap-2">{right ? <Check className="h-4 w-4 text-emerald-700" /> : wrong ? <X className="h-4 w-4 text-red-600" /> : null}{o}</span>
            </button>
          );
        })}
      </div>
      {res && <p className={"mt-3 text-sm " + (res.correct ? "text-emerald-800" : "text-red-700")}>{res.correct ? `Correct. ${res.explanation ?? ""}` : "Not quite. Review the lesson and try again."}</p>}
      {signedIn ? (
        <Button className="mt-4" disabled={choice === null || busy} onClick={() => void check()}>{busy ? "Checking…" : "Check answer"}</Button>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground"><Link to="/auth" className="underline">Sign in</Link> to check your answer and save your progress.</p>
      )}
    </section>
  );
}
