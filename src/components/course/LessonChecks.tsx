import { LessonSlides } from "@/components/course/LessonSlides";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";
import type { CourseModuleView } from "./SkillsMap";

type Feedback = { correct: boolean; correctIndex: number; explanation: string };

export function LessonChecks({
  certificationId,
  modules,
}: {
  certificationId: string;
  modules: CourseModuleView[];
}) {
  const { user } = useAuth();
  const [choice, setChoice] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState<Record<number, Feedback>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [done, setDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!user) return;
    supabase
      .from("lesson_progress")
      .select("module_index, correct")
      .eq("certification_id", certificationId)
      .eq("user_id", user.id)
      .then(({ data }) => {
        const map: Record<number, boolean> = {};
        (data ?? []).forEach((r: any) => {
          if (r.correct) map[r.module_index] = true;
        });
        setDone(map);
      });
  }, [user, certificationId]);

  if (!modules.length) return null;

  const checkable = modules.filter((m) => (m.check?.options?.length ?? 0) >= 2).length;
  const passed = Object.values(done).filter(Boolean).length;
  const pct = checkable ? Math.round((passed / checkable) * 100) : 0;

  async function submit(i: number) {
    if (!user) return;
    const c = choice[i];
    if (c === undefined) return;
    setBusy(i);
    const { data, error } = await supabase.rpc("grade_lesson_check", {
      _certification_id: certificationId,
      _module_index: i,
      _choice: c,
    });
    setBusy(null);
    if (error) return;
    const row: any = Array.isArray(data) ? data[0] : data;
    if (!row) return;
    setFeedback((f) => ({
      ...f,
      [i]: { correct: !!row.correct, correctIndex: row.correct ? c : -1, explanation: row.explanation ?? "" },
    }));
    if (row.correct) setDone((d) => ({ ...d, [i]: true }));
  }

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ Lessons</div>
          <h2 className="mt-2 font-display text-2xl font-black tracking-tight">
            {modules.length} lessons · knowledge check after each
          </h2>
        </div>
        {checkable > 0 && (
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Your progress</div>
            <div className="text-2xl font-black">{pct}%</div>
          </div>
        )}
      </div>

      {checkable > 0 && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}

      <div className="mt-6 space-y-4">
        {modules.map((m, i) => {
          const fb = feedback[i];
          const hasCheck = (m.check?.options?.length ?? 0) >= 2;
          return (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    Lesson {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-1 font-display text-lg font-extrabold tracking-tight">{m.title}</div>
                  {m.learned && <p className="mt-1 text-sm text-muted-foreground">{m.learned}</p>}
                  {(m.slides?.length ?? 0) > 0 && <LessonSlides slides={m.slides!} lessonTitle={`Lesson ${i + 1}`} />}
                  {m.body && (
                    <details className="group mt-3">
                      <summary className="cursor-pointer select-none text-sm font-semibold text-emerald-700 hover:underline">
                        <span className="group-open:hidden">Read the full lesson</span><span className="hidden group-open:inline">Hide the lesson</span>
                      </summary>
                      <LessonBody text={m.body} />
                    </details>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {done[i] && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                      <Check className="h-3 w-3" /> Passed
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {m.minutes ? `${m.minutes}m` : "—"}
                  </span>
                </div>
              </div>

              {(m.skills?.length ?? 0) > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.skills!.map((s) => (
                    <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {hasCheck && (
                <div className="mt-4 rounded-lg border border-dashed border-border p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-700">
                    ◆ Knowledge check
                  </div>
                  <div className="mt-2 text-sm font-medium">{m.check!.q}</div>
                  <div className="mt-3 space-y-2">
                    {m.check!.options!.map((opt, j) => {
                      const isPicked = choice[i] === j;
                      const isAnswer = fb && fb.correctIndex === j;
                      return (
                        <button
                          key={j}
                          type="button"
                          onClick={() => setChoice((c) => ({ ...c, [i]: j }))}
                          className={
                            "block w-full rounded-md border px-3 py-2 text-left text-sm transition " +
                            (isAnswer
                              ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                              : isPicked && fb && !fb.correct
                                ? "border-red-500 bg-red-50 text-red-900"
                                : isPicked
                                  ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                                  : "border-border hover:border-foreground/40")
                          }
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {user ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      disabled={busy === i || choice[i] === undefined}
                      onClick={() => submit(i)}
                    >
                      {busy === i ? "Checking…" : fb ? "Check again" : "Check answer"}
                    </Button>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">
                      <Link to="/auth" className="font-medium text-emerald-700 underline">
                        Sign in
                      </Link>{" "}
                      to save your progress.
                    </p>
                  )}

                  {fb && (
                    <div
                      className={
                        "mt-3 flex items-start gap-2 rounded-md px-3 py-2 text-sm " +
                        (fb.correct ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900")
                      }
                    >
                      {fb.correct ? <Check className="mt-0.5 h-4 w-4" /> : <X className="mt-0.5 h-4 w-4" />}
                      <span>
                        <strong>{fb.correct ? "Correct." : "Not quite."}</strong>{" "}
                        {fb.explanation || (fb.correct ? "Nice work." : "Review the lesson and try again.")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Renders lesson text: blank-line paragraphs, "## " headings, "- " bullet lists. */
function LessonBody({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-foreground/90">
      {blocks.map((b, i) => {
        const lines = b.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines[0]?.startsWith("## ")) {
          return <h4 key={i} className="pt-2 font-display text-base font-extrabold tracking-tight">{lines[0].slice(3)}</h4>;
        }
        if (lines.every((l) => l.startsWith("- "))) {
          return <ul key={i} className="list-disc space-y-1 pl-5">{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>;
        }
        return <p key={i}>{lines.join(" ")}</p>;
      })}
    </div>
  );
}
