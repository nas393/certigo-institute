import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
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

const ROLES = [
  { id: "pm", key: "role.pm", slug: "product-management-foundations" },
  { id: "eng", key: "role.eng", slug: "cloud-fundamentals" },
  { id: "design", key: "role.design", slug: "ux-research-methods" },
  { id: "data", key: "role.data", slug: "prompt-engineering-essentials" },
];

function Home() {
  const nav = useNavigate();
  const { t } = useI18n();
  const [role, setRole] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<any>(null);

  useEffect(() => {
    if (!role) { setRecommended(null); return; }
    const slug = ROLES.find((r) => r.id === role)?.slug;
    if (!slug) return;
    supabase.from("certifications").select("slug,title,summary,skills,category").eq("slug", slug).maybeSingle()
      .then(({ data }) => setRecommended(data));
  }, [role]);

  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.14)_0%,rgba(16,185,129,0)_70%)]"
      />
      <Header />

      <section className="relative mx-auto max-w-5xl px-5 pt-16 pb-12 sm:px-8 sm:pt-24">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ {t("home.eyebrow")}</div>
        <h1 className="mt-4 font-display text-5xl font-black tracking-tighter sm:text-7xl">
          {t("home.h1a")}<br />{t("home.h1b")} <span className="text-emerald-600">{t("home.h1c")}</span>.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          {t("home.sub")}
        </p>

        <div className="mt-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">{t("home.what")}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={"rounded-full border px-4 py-2 text-sm font-medium transition " + (role === r.id ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-border hover:border-foreground/40")}
              >
                {t(r.key)}
              </button>
            ))}
          </div>
        </div>

        {recommended && (
          <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">
              <Sparkles className="h-3 w-3" /> {t("home.recommended")}
            </div>
            <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight">{recommended.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{recommended.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(recommended.skills ?? []).map((s: string) => (
                <span key={s} className="rounded-full bg-muted px-2.5 py-1 text-[11px]">{s}</span>
              ))}
            </div>
            <Button
              className="mt-5 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => nav({ to: "/c/$slug", params: { slug: recommended.slug } })}
            >
              {t("home.startNow")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="mt-6">
          <Link to="/catalog" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            {t("home.browse")}
          </Link>
        </div>
      </section>


      <section className="relative mx-auto max-w-5xl px-5 py-12 sm:px-8">
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

      <footer className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          CERTIGO<span className="text-emerald-600">.</span> · © {new Date().getFullYear()} · <Link to="/about" className="hover:text-foreground">How we assess</Link> · <Link to="/terms" className="hover:text-foreground">Terms</Link> · <Link to="/privacy" className="hover:text-foreground">Privacy</Link> · <Link to="/contact" className="hover:text-foreground">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
