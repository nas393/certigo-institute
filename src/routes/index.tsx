import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { VerificationPlayground } from "@/components/playground/VerificationPlayground";
import { CourseGenerator } from "@/components/course/CourseGenerator";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CERTIGO. — Your next credential, issued in 10 minutes" },
      { name: "description", content: "Earn a verified professional credential in ten minutes. One quiz, one share-ready certificate, one click to LinkedIn." },
      { property: "og:title", content: "CERTIGO. — Verified credentials for professionals" },
      { property: "og:description", content: "Earn a verified credential in ten minutes. Share it to LinkedIn in one click." },
    ],
  }),
  component: Home,
});

const ROLES = [
  { id: "pm", label: "Product Manager", slug: "product-management-foundations" },
  { id: "eng", label: "Engineer", slug: "cloud-fundamentals" },
  { id: "design", label: "Designer", slug: "ux-research-methods" },
  { id: "data", label: "Data / AI", slug: "prompt-engineering-essentials" },
];

function Home() {
  const nav = useNavigate();
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
    <div className="min-h-screen bg-background">
      <Header />

      <section className="mx-auto max-w-5xl px-5 pt-16 pb-12 sm:px-8 sm:pt-24">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ For professionals</div>
        <h1 className="mt-4 font-display text-5xl font-black tracking-tighter sm:text-7xl">
          Your next credential,<br />issued in <span className="text-emerald-600">10 minutes</span>.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          One short quiz. One QR-verified certificate. One click to LinkedIn. No bulk, no admin, no waiting.
        </p>

        <div className="mt-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">What do you do?</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={"rounded-full border px-4 py-2 text-sm font-medium transition " + (role === r.id ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-border hover:border-foreground/40")}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {recommended && (
          <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">
              <Sparkles className="h-3 w-3" /> Recommended for you
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
              Start in 10 minutes <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="mt-6">
          <Link to="/catalog" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            or browse the full catalog →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { n: "01", t: "Pick a certification", d: "Six career-relevant tracks. Each one is short and to the point." },
            { n: "02", t: "Pass one quiz", d: "Eight questions. Pass at 70%. Your answers are stored." },
            { n: "03", t: "Share to LinkedIn", d: "Add to Profile button is pre-filled with your verified credential metadata." },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-border bg-card p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ {s.n}</div>
              <div className="mt-3 font-display text-lg font-extrabold">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <VerificationPlayground />

      <footer className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          CERTIGO<span className="text-emerald-600">.</span> · © {new Date().getFullYear()} · <Link to="/terms" className="hover:text-foreground">Terms</Link> · <Link to="/privacy" className="hover:text-foreground">Privacy</Link> · <Link to="/contact" className="hover:text-foreground">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
