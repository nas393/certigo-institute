import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/saas/Footer";
import { VerificationPlayground } from "@/components/playground/VerificationPlayground";
import { useI18n } from "@/lib/i18n";
import { HomeProof } from "@/components/home/HomeProof";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CERTIGO. — Learn it. Pass it. Prove it." },
      { name: "description", content: "Learn the essentials free, pass a real exam, and get a certificate employers can verify in seconds." },
      { property: "og:title", content: "CERTIGO. — Verified credentials for professionals" },
      { property: "og:description", content: "Learn free, pass a real exam, share a certificate anyone can verify." },
    ],
  }),
  component: Home,
});

const FEATURED = ["people-management-fundamentals", "sales-and-key-account-management", "angola-taxation-and-payroll", "inventory-and-warehousing", "excel-and-data-for-business"];
type Row = { slug: string; title: string; category: string; modules: unknown };

function Home() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    supabase.from("certifications").select("slug,title,category,modules").then(({ data }) => setRows((data ?? []) as Row[]));
  }, []);
  const featured = FEATURED.map((s) => rows?.find((r) => r.slug === s)).filter(Boolean) as Row[];
  const areas = Object.entries((rows ?? []).reduce<Record<string, number>>((m, r) => ((m[r.category] = (m[r.category] ?? 0) + 1), m), {})).sort((x, y) => y[1] - x[1]);

  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.14)_0%,rgba(16,185,129,0)_70%)]"
      />
      <Header />

      <section className="relative mx-auto grid max-w-6xl gap-10 px-5 pt-12 pb-10 sm:px-8 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ {t("home.eyebrow")}</div>
          <h1 className="mt-4 font-display text-5xl font-black tracking-tighter sm:text-7xl">
            {t("home.h1a")}<br />{t("home.h1b")} <span className="text-emerald-600">{t("home.h1c")}</span>.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">{t("home.sub")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Link to="/catalog">{t("home.ctaBrowse")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline"><Link to="/about">{t("home.ctaHow")}</Link></Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-baseline justify-between gap-3">
            <div className="font-display text-lg font-extrabold">{t("home.popular")}</div>
            <Link to="/catalog" className="text-xs font-medium text-emerald-700 hover:underline">{t("home.allCourses")} →</Link>
          </div>
          <p className="text-xs text-muted-foreground">{t("home.popularSub")}</p>
          <ul className="mt-3 divide-y divide-border">
            {rows === null
              ? Array.from({ length: 4 }).map((_, i) => <li key={i} className="py-3"><div className="h-4 w-3/4 animate-pulse rounded bg-muted" /><div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted" /></li>)
              : featured.map((r) => (
                <li key={r.slug}>
                  <Link to="/c/$slug" params={{ slug: r.slug }} className="group flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold group-hover:text-emerald-700">{r.title}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{r.category} · {Array.isArray(r.modules) ? r.modules.length : 6} lessons</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-emerald-700" />
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>

      {areas.length > 0 && (
        <section className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">{t("home.areas")}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {areas.map(([cat, n]) => (
              <Link key={cat} to="/catalog" search={{ category: cat }} className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold transition hover:border-emerald-600 hover:text-emerald-700">
                {cat} <span className="text-muted-foreground">({n})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { n: "01", t: t("home.s1t"), d: t("home.s1d") },
            { n: "02", t: t("home.s2t"), d: t("home.s2d") },
            { n: "03", t: t("home.s3t"), d: t("home.s3d") },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-emerald-600/40 hover:shadow-card">
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ {s.n}</div>
              <div className="mt-3 font-display text-lg font-extrabold">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <HomeProof />

      <VerificationPlayground />

      <Footer />
    </div>
  );
}
