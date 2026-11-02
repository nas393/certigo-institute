import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/kredo/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { loadLessonPack, type LessonPack } from "@/content/lessons";
import { LessonSlides } from "@/components/course/LessonSlides";
import { LessonBody } from "@/components/course/LessonBlocks";
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
  const [pack, setPack] = useState<LessonPack | null | undefined>(undefined);

  useEffect(() => {
    supabase.from("certifications").select("id, slug, title, modules").eq("slug", slug).maybeSingle().then(({ data }) => setC(data));
    void loadLessonPack(slug).then(setPack);
  }, [slug]);
  useEffect(() => { window.scrollTo(0, 0); }, [idx]);

  const modules = useMemo(() => normalizeModules(c?.modules), [c]);
  if (!c || pack === undefined) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;
  const m = modules[idx];
  const total = modules.length;
  if (!m) return <div className="min-h-screen bg-background"><Header /><p className="p-10 text-center text-muted-foreground">Lesson not found.</p></div>;
  const body = pack?.bodies[idx] ?? m.body ?? "";
  const slides = pack?.slides?.[idx] ?? [];
  const minutes = pack?.minutes[idx] ?? m.minutes;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="sticky top-16 z-30 h-1 bg-muted"><div className="h-1 bg-emerald-600 transition-all" style={{ width: `${((idx + 1) / total) * 100}%` }} /></div>
      <article className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <Link to="/c/$slug" params={{ slug }} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3" /> {c.title}</Link>
        <div className="mt-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-700">
          Lesson {idx + 1} of {total}
          {minutes ? <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" /> {minutes} min</span> : null}
        </div>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tighter sm:text-4xl">{m.title}</h1>
        {m.learned && <p className="mt-2 text-muted-foreground">{m.learned}</p>}

        {slides.length > 0 && (
          <section className="mt-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Lesson overview</div>
            <LessonSlides slides={slides} lessonTitle={`Lesson ${idx + 1}`} />
          </section>
        )}

        <section className="mt-8">
          {body ? <LessonBody text={body} /> : <p className="text-muted-foreground">This lesson's full text is being prepared.</p>}
        </section>

        {m.check?.options?.length ? (
          <LessonCheck certificationId={c.id} index={idx} q={m.check.q ?? ""} options={m.check.options} signedIn={!!user} />
        ) : null}

        <nav className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
          {idx > 0 ? (
            <Button variant="outline" onClick={() => nav({ to: "/c/$slug/lesson/$n", params: { slug, n: String(idx) } })}><ArrowLeft className="mr-1 h-4 w-4" /> Previous</Button>
          ) : <span />}
          {idx < total - 1 ? (
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => nav({ to: "/c/$slug/lesson/$n", params: { slug, n: String(idx + 2) } })}>Next lesson <ArrowRight className="ml-1 h-4 w-4" /></Button>
          ) : (
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => nav({ to: "/c/$slug", params: { slug } })}>Finish: get certified <ArrowRight className="ml-1 h-4 w-4" /></Button>
          )}
        </nav>
      </article>
    </div>
  );
}

/** The lesson's knowledge check, graded on the server and saved to the learner's progress. */
function LessonCheck({ certificationId, index, q, options, signedIn }: { certificationId: string; index: number; q: string; options: string[]; signedIn: boolean }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [res, setRes] = useState<{ correct: boolean; correct_index: number; explanation: string } | null>(null);
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
    <section className="mt-10 rounded-xl border-2 border-emerald-600/30 p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-700">Lesson check</div>
      <div className="mt-2 font-semibold">{q}</div>
      <div className="mt-3 space-y-2">
        {options.map((o, j) => {
          const right = res && res.correct_index === j;
          const wrong = res && !res.correct && choice === j;
          return (
            <button key={j} onClick={() => { setChoice(j); setRes(null); }}
              className={"w-full rounded-lg border px-3 py-2.5 text-left text-sm " + (right ? "border-emerald-600 bg-emerald-50" : wrong ? "border-red-400 bg-red-50" : choice === j ? "border-foreground/60" : "border-border hover:border-foreground/30")}>
              <span className="inline-flex gap-2">{right ? <Check className="h-4 w-4 text-emerald-700" /> : wrong ? <X className="h-4 w-4 text-red-600" /> : null}{o}</span>
            </button>
          );
        })}
      </div>
      {res?.explanation && <p className={"mt-3 text-sm " + (res.correct ? "text-emerald-800" : "text-red-700")}>{res.correct ? "Correct. " : "Not quite. "}{res.explanation}</p>}
      {signedIn ? (
        <Button className="mt-4" disabled={choice === null || busy} onClick={() => void check()}>{busy ? "Checking…" : "Check answer"}</Button>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground"><Link to="/auth" className="underline">Sign in</Link> to check your answer and save your progress.</p>
      )}
    </section>
  );
}
