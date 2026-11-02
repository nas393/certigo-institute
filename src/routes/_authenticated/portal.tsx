import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { courseProgress, usePortalCourses } from "@/lib/portal";
import { ArrowRight, BookOpen, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({ meta: [{ title: "My learning — CERTIGO." }] }),
  component: Portal,
});

function Portal() {
  const { user } = useAuth();
  const { courses, reload } = usePortalCourses(user?.id);

  async function unenroll(id: string) {
    const { error } = await supabase.from("enrollments").delete().eq("certification_id", id).eq("user_id", user!.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Removed from your learning.");
    await reload();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">◆ Learner portal</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter">My learning</h1>
        <p className="mt-2 text-sm text-muted-foreground">Every course you enrolled in, your lesson checks, your exam results and the credential they earned.</p>

        {!courses ? (
          <div className="mt-10 grid place-items-center"><Loader2 className="animate-spin" /></div>
        ) : courses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center">
            <BookOpen className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">You are not enrolled in any course yet.</p>
            <Link to="/catalog" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline">
              Browse the catalog <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {courses.map((c) => {
              const pct = courseProgress(c);
              return (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">◆ {c.category} · {formatPrice(c.price_cents)}</div>
                      <Link to="/c/$slug" params={{ slug: c.slug }} className="mt-1 block font-display text-xl font-extrabold tracking-tight hover:underline">{c.title}</Link>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {c.lessonsDone}/{c.lessons} lesson checks passed · {c.attempts} exam {c.attempts === 1 ? "attempt" : "attempts"}
                        {c.attempts > 0 ? ` · best ${c.bestScore}%` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-3xl font-black tracking-tighter">{pct}%</div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">complete</div>
                    </div>
                  </div>

                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }} />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link to="/learn/$slug/$lesson" params={{ slug: c.slug, lesson: String(c.nextLesson) }}>
                      <Button variant="outline" size="sm" className="min-h-[40px]">Continue lessons</Button>
                    </Link>
                    {c.passed && c.serial ? (
                      <Link to="/issued/$serial" params={{ serial: c.serial }}>
                        <Button size="sm" className="min-h-[40px] bg-emerald-600 text-white hover:bg-emerald-700">
                          <ShieldCheck className="mr-1.5 h-4 w-4" /> View credential
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/exam/$slug" params={{ slug: c.slug }}>
                        <Button size="sm" className="min-h-[40px] bg-emerald-600 text-white hover:bg-emerald-700">
                          {c.attempts > 0 ? "Retake the exam" : "Take the exam"} <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <button onClick={() => void unenroll(c.id)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
