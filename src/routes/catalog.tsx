import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Clock, Search, ShieldCheck, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/money";

type CatalogSearch = { category?: string; q?: string; sort?: "az" | "short" };

export const Route = createFileRoute("/catalog")({
  validateSearch: (s: Record<string, unknown>): CatalogSearch => ({
    category: typeof s.category === "string" && s.category ? s.category : undefined,
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    sort: s.sort === "short" ? "short" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Courses — CERTIGO." },
      { name: "description", content: "Browse CERTIGO courses by category. Free lessons, a real exam and a certificate anyone can verify." },
    ],
  }),
  component: Catalog,
});

interface Row {
  slug: string; title: string; category: string; summary: string; skills: string[] | null;
  question_count: number; pass_score: number; modules: any; price_cents: number;
}

const minutesOf = (r: Row) => (Array.isArray(r.modules) ? r.modules : []).reduce((n: number, m: any) => n + (Number(m?.minutes) || 0), 0);

function Catalog() {
  const { t } = useI18n();
  const nav = useNavigate({ from: "/catalog" });
  const { category, q = "", sort } = Route.useSearch();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [query, setQuery] = useState(q);

  useEffect(() => {
    supabase.from("certifications")
      .select("slug, title, category, summary, skills, question_count, pass_score, modules, price_cents")
      .order("title")
      .then(({ data }) => setRows((data ?? []) as Row[]));
  }, []);

  // Keep the search box and the URL in sync (debounced), so filtered views can be shared.
  useEffect(() => { setQuery(q); }, [q]);
  useEffect(() => {
    const h = setTimeout(() => {
      if (query !== q) nav({ search: (s: CatalogSearch) => ({ ...s, q: query || undefined }), replace: true });
    }, 250);
    return () => clearTimeout(h);
  }, [query]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    (rows ?? []).forEach((r) => counts.set(r.category, (counts.get(r.category) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = (rows ?? []).filter((r) => !category || r.category === category);
    if (needle) {
      list = list.filter((r) =>
        [r.title, r.summary, r.category, ...(r.skills ?? [])].some((v) => String(v ?? "").toLowerCase().includes(needle)));
    }
    if (sort === "short") list = [...list].sort((a, b) => minutesOf(a) - minutesOf(b));
    return list;
  }, [rows, category, q, sort]);

  const setCategory = (c?: string) => nav({ search: (s: CatalogSearch) => ({ ...s, category: c }) });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ {t("catalog.eyebrow")}</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter sm:text-5xl">{t("catalog.h1")}</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">Lessons are free. Take the exam when you're ready and get a certificate anyone can verify.</p>

        {/* Search + sort */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search courses</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, skills or topics"
              className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Sort
            <select
              value={sort ?? "az"}
              onChange={(e) => nav({ search: (s: CatalogSearch) => ({ ...s, sort: e.target.value === "short" ? "short" : undefined }) })}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value="az">A to Z</option>
              <option value="short">Shortest first</option>
            </select>
          </label>
        </div>

        {/* Category filter */}
        <nav aria-label="Filter by category" className="-mx-5 mt-4 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <div className="flex gap-2 pb-1 sm:flex-wrap">
            <button
              onClick={() => setCategory(undefined)} aria-pressed={!category}
              className={"shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition " + (!category ? "border-emerald-600 bg-emerald-600 text-white" : "border-border text-muted-foreground hover:text-foreground")}
            >
              All <span className="opacity-70">({rows?.length ?? 0})</span>
            </button>
            {categories.map(([c, n]) => (
              <button
                key={c} onClick={() => setCategory(c === category ? undefined : c)} aria-pressed={c === category}
                className={"shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition " + (c === category ? "border-emerald-600 bg-emerald-600 text-white" : "border-border text-muted-foreground hover:text-foreground")}
              >
                {c} <span className="opacity-70">({n})</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground" aria-live="polite">
          <span>{rows ? `${shown.length} course${shown.length === 1 ? "" : "s"}` : "Loading courses…"}{category ? ` in ${category}` : ""}{q ? ` matching "${q}"` : ""}</span>
          {(category || q) && (
            <button className="inline-flex items-center gap-1 underline-offset-4 hover:underline" onClick={() => { setQuery(""); nav({ search: {} }); }}>
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>

        {rows === null ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center">
            <p className="font-semibold">No courses match these filters.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try another category or a shorter search.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((r) => {
              const mins = minutesOf(r);
              const mods = Array.isArray(r.modules) ? r.modules.length : 0;
              return (
                <Link
                  key={r.slug} to="/c/$slug" params={{ slug: r.slug }}
                  className="group flex flex-col rounded-xl border border-border bg-card p-4 sm:p-5 transition hover:-translate-y-0.5 hover:border-emerald-600/40 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-700">{r.category}</div>
                  <h2 className="mt-2 font-display text-lg font-extrabold leading-snug tracking-tight">{r.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.summary}</p>
                  <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
                    {(r.skills ?? []).slice(0, 3).map((s) => (
                      <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{s}</span>
                    ))}
                  </div>
                  <div className="mt-auto pt-3 sm:pt-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      {mods > 0 && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden /> {mods} lessons{mins ? ` · ${Math.round(mins / 5) * 5} min` : ""}</span>}
                      <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" aria-hidden /> {r.question_count} Qs · {r.pass_score}% to pass</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between sm:mt-3">
                      <span className="text-sm font-bold">{formatPrice(r.price_cents)} <span className="font-normal text-muted-foreground">certificate</span></span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                        View course <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
