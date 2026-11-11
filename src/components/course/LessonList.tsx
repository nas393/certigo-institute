import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Clock, Presentation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { CourseModuleView } from "@/components/course/SkillsMap";
import { useLessonLabels } from "@/lib/lesson-i18n";

/** The course's lessons, each opening its own interactive lesson page, with the learner's progress. */
export function LessonList({ slug, certificationId, modules }: { slug: string; certificationId: string; modules: CourseModuleView[] }) {
  const { user } = useAuth();
  const L = useLessonLabels();
  const [done, setDone] = useState<Record<number, boolean>>({});
  useEffect(() => {
    if (!user) { setDone({}); return; }
    supabase.from("lesson_progress").select("module_index, correct").eq("user_id", user.id).eq("certification_id", certificationId)
      .then(({ data }) => setDone(Object.fromEntries((data ?? []).filter((r: any) => r.correct).map((r: any) => [r.module_index, true]))));
  }, [user, certificationId]);
  const count = Object.keys(done).length;
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">◆ {L.lessonsEyebrow}</div>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">{modules.length} {L.interactiveLessons}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{L.lessonsSub}</p>
        </div>
        {user && <div className="text-right text-xs text-muted-foreground"><div className="text-2xl font-black text-foreground">{count}/{modules.length}</div>{L.completed}</div>}
      </div>
      <ol className="mt-5 space-y-3">
        {modules.map((m, i) => (
          <li key={i}>
            <Link to="/c/$slug/lesson/$n" params={{ slug, n: String(i + 1) }}
              className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-emerald-600/40 hover:shadow-card">
              <span className={"grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold " + (done[i] ? "bg-emerald-600 text-white" : "bg-muted")}>
                {done[i] ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold leading-snug">{m.title}</div>
                {m.learned && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{m.learned}</p>}
                {(m.skills?.length ?? 0) > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.skills!.slice(0, 3).map((s) => <span key={s} className="rounded-full border border-emerald-600/20 bg-emerald-50/60 px-2 py-0.5 text-[10px] text-emerald-800">{s}</span>)}
                  </div>
                )}
                <div className="mt-1.5 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                  {m.minutes ? <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {m.minutes} min</span> : null}
                  {(m.slides?.length ?? 0) > 0 && <span className="inline-flex items-center gap-1"><Presentation className="h-3 w-3" /> {L.slides}</span>}
                </div>
              </div>
              <span className="mt-1 hidden items-center gap-1 text-sm font-medium text-emerald-700 sm:inline-flex">{done[i] ? L.review : L.start} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
