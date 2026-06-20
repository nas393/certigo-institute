import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/c/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — CERTIGO.` },
      { name: "description", content: "Earn this CERTIGO. credential in 10 minutes." },
    ],
  }),
  component: CertDetail,
});

function CertDetail() {
  const { slug } = Route.useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [c, setC] = useState<any>(null);

  useEffect(() => {
    supabase.from("certifications").select("*").eq("slug", slug).maybeSingle().then(({ data }) => setC(data));
  }, [slug]);

  if (!c) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <Link to="/catalog" className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground hover:text-foreground">← catalog</Link>
        <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">◆ {c.category}</div>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tighter">{c.title}</h1>
        <p className="mt-3 text-base text-muted-foreground">{c.summary}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {(c.skills ?? []).map((s: string) => (
            <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs">{s}</span>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="mt-2 text-2xl font-black">~10 min</div>
            <div className="text-xs text-muted-foreground">{c.question_count} questions</div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <div className="mt-2 text-2xl font-black">{c.pass_score}%</div>
            <div className="text-xs text-muted-foreground">to pass</div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="text-2xl font-black">QR</div>
            <div className="text-xs text-muted-foreground">verifiable credential</div>
          </div>
        </div>

        <Button
          size="lg"
          className="mt-8 bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={() => {
            if (!user) nav({ to: "/auth" });
            else nav({ to: "/exam/$slug", params: { slug } });
          }}
        >
          {user ? "Start the exam" : "Sign in to start"} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}