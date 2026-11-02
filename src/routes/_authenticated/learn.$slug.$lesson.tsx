import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Lesson = {
  title?: string;
  subject?: string;
  learned?: string;
  minutes?: number;
  skills?: string[];
  content?: {
    introduction?: string;
    objectives?: string[];
    sections?: Array<{ heading?: string; body?: string; example?: string }>;
    case_study?: string;
    exercise?: string;
    takeaways?: string[];
  };
  check?: { q?: string; options?: string[] };
};

export const Route = createFileRoute("/_authenticated/learn/$slug/$lesson")({
  head: () => ({ meta: [{ title: "Learning lesson — CERTIGO." }] }),
  component: LessonReader,
});

function LessonReader() {
  const { slug, lesson: lessonParam } = Route.useParams();
  const lessonIndex = Math.max(0, Number.parseInt(lessonParam, 10) - 1 || 0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [choice, setChoice] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user) { navigate({ to: "/auth" }); return; }
      setLoading(true);
      const { data: cert, error } = await supabase
        .from("certifications")
        .select("id, slug, title, modules")
        .eq("slug", slug)
        .maybeSingle();
      if (error || !cert) {
        if (active) { toast.error("Course not found."); setLoading(false); }
        return;
      }
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("certification_id", cert.id)
        .maybeSingle();
      if (!enrollment) {
        if (active) { toast.error("Enroll in this course before starting lessons."); navigate({ to: "/c/$slug", params: { slug } }); }
        return;
      }
      if (active) { setCourse(cert); setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [slug, user, navigate]);

  const modules = useMemo(() => Array.isArray(course?.modules) ? course.modules as Lesson[] : [], [course]);
  const lesson = modules[lessonIndex];
  const total = modules.length;

  useEffect(() => {
    setChoice(null);
    setFeedback(null);
    setPassed(false);
    if (!course?.id || !user || !lesson) return;
    supabase.from("lesson_progress").select("correct").eq("certification_id", course.id).eq("user_id", user.id).eq("module_index", lessonIndex).maybeSingle()
      .then(({ data }) => setPassed(!!data?.correct));
  }, [course?.id, user, lessonIndex, lesson]);

  async function submitCheck() {
    if (!user || !course?.id || choice === null) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("grade_lesson_check", {
      _certification_id: course.id,
      _module_index: lessonIndex,
      _choice: choice,
    });
    setBusy(false);
    if (error) { toast.error("Your answer could not be checked. Please try again."); return; }
    const row: any = Array.isArray(data) ? data[0] : data;
    if (!row) { toast.error("No assessment result was returned."); return; }
    setFeedback({ correct: !!row.correct, explanation: row.explanation ?? "" });
    if (row.correct) setPassed(true);
  }

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!lesson || !course) return <div className="min-h-screen bg-background"><Header /><main className="mx-auto max-w-2xl px-5 py-16"><h1 className="text-2xl font-bold">Lesson unavailable</h1><Link className="mt-4 inline-block underline" to="/c/$slug" params={{ slug }}>Return to course</Link></main></div>;

  const content = lesson.content ?? {};
  const sections = content.sections ?? [];
  const prev = lessonIndex > 0 ? lessonIndex : null;
  const next = lessonIndex + 1 < total ? lessonIndex + 2 : null;

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-7 sm:px-8 sm:py-10">
        <Link to="/c/$slug" params={{ slug }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> {course.title}</Link>
        <div className="mt-7 flex items-center justify-between gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-700">Lesson {lessonIndex + 1} of {total}</span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {lesson.minutes ?? 10} min</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${total ? ((lessonIndex + 1) / total) * 100 : 0}%` }} /></div>
        <h1 className="mt-7 font-display text-3xl font-black tracking-tight sm:text-4xl">{lesson.title ?? "Lesson"}</h1>
        {lesson.subject && <p className="mt-2 text-sm font-medium text-emerald-700">{lesson.subject}</p>}
        {lesson.learned && <p className="mt-5 text-lg leading-8 text-muted-foreground">{lesson.learned}</p>}

        {content.introduction && <section className="mt-8"><h2 className="text-xl font-bold">Introduction</h2><p className="mt-3 whitespace-pre-line text-base leading-8">{content.introduction}</p></section>}
        {!!content.objectives?.length && <section className="mt-8 rounded-xl border border-border bg-card p-5"><h2 className="font-bold">By the end, you should be able to</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">{content.objectives.map((x, i) => <li key={i}>{x}</li>)}</ul></section>}
        {sections.map((section, i) => <section key={i} className="mt-8"><h2 className="text-xl font-bold">{section.heading ?? `Section ${i + 1}`}</h2>{section.body && <p className="mt-3 whitespace-pre-line text-base leading-8">{section.body}</p>}{section.example && <div className="mt-4 rounded-xl border-l-4 border-emerald-600 bg-muted/50 p-4"><div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Professional example</div><p className="mt-2 text-sm leading-7">{section.example}</p></div>}</section>)}
        {content.case_study && <section className="mt-8 rounded-xl border border-border p-5"><h2 className="font-bold">Workplace case study</h2><p className="mt-3 whitespace-pre-line text-sm leading-7">{content.case_study}</p></section>}
        {content.exercise && <section className="mt-8 rounded-xl border border-emerald-600/30 bg-emerald-600/5 p-5"><h2 className="font-bold">Practical exercise</h2><p className="mt-3 whitespace-pre-line text-sm leading-7">{content.exercise}</p></section>}
        {!!content.takeaways?.length && <section className="mt-8"><h2 className="text-xl font-bold">Key takeaways</h2><ul className="mt-3 space-y-3">{content.takeaways.map((x, i) => <li key={i} className="flex gap-3 text-sm leading-7"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{x}</li>)}</ul></section>}
        {!content.introduction && !sections.length && !content.case_study && !content.exercise && !content.takeaways?.length && <div className="mt-8 rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-emerald-700" /> Lesson overview</div><p className="mt-3 text-sm leading-7">This lesson introduces the core concepts and expected professional application. Review the learning outcome above, then complete the knowledge check below.</p></div>}

        {lesson.check?.q && (lesson.check.options?.length ?? 0) >= 2 && <section className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="font-mono text-xs uppercase tracking-widest text-emerald-700">Knowledge check</div><h2 className="mt-3 text-lg font-bold">{lesson.check.q}</h2><div className="mt-4 space-y-2">{lesson.check.options!.map((option, i) => <button key={i} type="button" onClick={() => { setChoice(i); setFeedback(null); }} className={`min-h-12 w-full rounded-lg border px-4 py-3 text-left text-sm transition ${choice === i ? "border-emerald-600 bg-emerald-600/10" : "border-border hover:border-foreground/40"}`}>{option}</button>)}</div><Button className="mt-4 min-h-11 bg-emerald-600 text-white hover:bg-emerald-700" disabled={choice === null || busy || passed} onClick={() => void submitCheck()}>{busy ? "Checking…" : passed ? "Lesson check passed" : "Submit answer"}</Button>{feedback && <p role="status" className={`mt-3 text-sm leading-6 ${feedback.correct ? "text-emerald-700" : "text-destructive"}`}>{feedback.correct ? "Correct. " : "Not quite. "}{feedback.explanation || (feedback.correct ? "Well done." : "Review the lesson and try again.")}</p>}</section>}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur"><div className="mx-auto flex max-w-3xl items-center justify-between gap-3"><div className="text-xs text-muted-foreground">{passed ? "Knowledge check completed" : "Complete the lesson check to reinforce learning"}</div><div className="flex gap-2">{prev && <Button variant="outline" onClick={() => navigate({ to: "/learn/$slug/$lesson", params: { slug, lesson: String(prev) } })}>Previous</Button>}{next ? <Button disabled={!passed} className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => navigate({ to: "/learn/$slug/$lesson", params: { slug, lesson: String(next) } })}>Next lesson <ArrowRight className="ml-2 h-4 w-4" /></Button> : <Button disabled={!passed} className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => navigate({ to: "/exam/$slug", params: { slug } })}>Final exam <ArrowRight className="ml-2 h-4 w-4" /></Button>}</div></div></nav>
    </div>
  );
}
