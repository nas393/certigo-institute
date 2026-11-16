import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ArrowRight, Check, Clock } from "lucide-react";
import { PATHS } from "@/content/paths";

export const Route = createFileRoute("/paths")({
  head: () => ({
    meta: [
      { title: "Learning paths — CERTIGO." },
      { name: "description", content: "Career tracks of 5–6 CERTIGO courses, in order from foundation to advanced. Free lessons, a real exam per course." },
    ],
  }),
  component: Paths,
});

interface Course { id: string; slug: string; title: string; modules: any }
const minutes = (c?: Course) => (Array.isArray(c?.modules) ? c!.modules : []).reduce((n: number, m: any) => n + (Number(m?.minutes) || 0), 0);

function Paths() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Map<string, Course> | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    const slugs = [...new Set(PATHS.flatMap((p) => p.courses))];
    supabase.from("certifications").select("id, slug, title, modules").in("slug", slugs).eq("published", true)
      .then(({ data }) => setCourses(new Map(((data ?? []) as Course[]).map((c) => [c.slug, c]))));
  }, []);
  useEffect(() => {
    if (!user) { setDone(new Set()); return; }
    supabase.from("certificates").select("certification_id").eq("user_id", user.id)
      .then(({ data }) => setDone(new Set((data ?? []).map((r: { certification_id: string }) => r.certification_id))));
  }, [user]);

  // Only show courses that are live, so a path never links to a hidden course.
  const paths = useMemo(() => PATHS.map((p) => ({ ...p, list: p.courses.map((s) => courses?.get(s)).filter(Boolean) as Course[] })), [courses]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ Learning paths</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter sm:text-5xl">Build a career track.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">Each path is 5–6 courses in order, from foundation to advanced. Lessons are free; pass each exam to earn its certificate.</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {courses === null
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />)
            : paths.map((p) => {
                const passed = p.list.filter((c) => done.has(c.id)).length;
                const hours = Math.round(p.list.reduce((n, c) => n + minutes(c), 0) / 60);
                const next = p.list.find((c) => !done.has(c.id));
                return (
                  <section key={p.slug} id={p.slug} className="rounded-xl border border-border p-6">
                    <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{p.role}</div>
                    <h2 className="mt-1 font-display text-2xl font-black tracking-tight">{p.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{p.list.length} courses</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> ~{hours} h</span>
                      {user && <span className="font-semibold text-foreground">{passed}/{p.list.length} certified</span>}
                    </div>
                    {user && p.list.length > 0 && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                        <div className="h-full bg-emerald-600" style={{ width: `${(passed / p.list.length) * 100}%` }} />
                      </div>
                    )}
                    <ol className="mt-4 space-y-2">
                      {p.list.map((c, i) => (
                        <li key={c.slug}>
                          <Link to="/c/$slug" params={{ slug: c.slug }} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm hover:border-emerald-600">
                            <span className={"flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold " + (done.has(c.id) ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground")}>
                              {done.has(c.id) ? <Check className="h-3.5 w-3.5" /> : i + 1}
                            </span>
                            <span className="flex-1">{c.title}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </li>
                      ))}
                    </ol>
                    {next && (
                      <Link to="/c/$slug" params={{ slug: next.slug }} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline">
                        {passed ? "Continue" : "Start"} with {next.title} <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </section>
                );
              })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
