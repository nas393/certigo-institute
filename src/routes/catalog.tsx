import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import { CourseGenerator } from "@/components/course/CourseGenerator";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Catalog — CERTIGO." },
      { name: "description", content: "Browse CERTIGO. certifications: short, focused, and verifiable." },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("certifications").select("id, slug, title, issuer_name, category, summary, skills, question_count, pass_score, questions, created_at, created_by, modules, price_cents").order("title").then(({ data }) => setRows(data ?? []));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ Catalog</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter sm:text-5xl">Pick a certification.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Each track is one short quiz away from a verified credential you can share to LinkedIn.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <Link
              key={r.slug}
              to="/c/$slug"
              params={{ slug: r.slug }}
              className="group rounded-xl border border-border bg-card p-5 transition hover:border-foreground/40"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ {r.category}</div>
              <div className="mt-2 font-display text-xl font-extrabold tracking-tight">{r.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{r.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(r.skills ?? []).slice(0, 4).map((s: string) => (
                  <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{s}</span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-700">
                Start <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
      <CourseGenerator />
    </div>
  );
}