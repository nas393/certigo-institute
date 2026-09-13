import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, ShieldCheck, Loader2, Pencil, Check } from "lucide-react";
import { SkillsMap, normalizeModules } from "@/components/course/SkillsMap";
import { LessonChecks } from "@/components/course/LessonChecks";
import { toast } from "sonner";

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
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    supabase.from("certifications").select("id, slug, title, issuer_name, category, summary, skills, question_count, pass_score, questions, created_at, created_by, modules, price_cents").eq("slug", slug).maybeSingle().then(({ data }) => setC(data));
  }, [slug]);

  useEffect(() => {
    if (!user || !c?.id) { setEnrolled(false); return; }
    supabase.from("enrollments").select("id").eq("user_id", user.id).eq("certification_id", c.id).maybeSingle()
      .then(({ data }) => setEnrolled(!!data));
  }, [user, c?.id]);

  const modules = useMemo(() => normalizeModules(c?.modules), [c]);
  const canEdit = !!user && !!c?.created_by && c.created_by === user.id;

  async function enroll() {
    if (!user) { nav({ to: "/auth" }); return; }
    setEnrolling(true);
    const { error } = await supabase.from("enrollments").insert({ user_id: user.id, certification_id: c.id });
    setEnrolling(false);
    if (error && !/duplicate|unique/i.test(error.message)) { toast.error(error.message); return; }
    setEnrolled(true);
    toast.success("Enrolled — this course is now in your learning portal.");
  }

  if (!c) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link to="/catalog" className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground hover:text-foreground">← catalog</Link>
          {canEdit && (
            <Link
              to="/build/$slug"
              params={{ slug }}
              className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium hover:border-emerald-600 hover:text-emerald-700"
            >
              <Pencil className="h-3 w-3" /> Edit course
            </Link>
          )}
        </div>
        <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">◆ {c.category}</div>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tighter">{c.title}</h1>
        <p className="mt-3 text-base text-muted-foreground">{c.summary}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {(c.skills ?? []).map((s: string) => (
            <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs">{s}</span>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Price</div>
            <div className="mt-2 text-2xl font-black" data-testid="course-price">{formatPrice(c.price_cents)}</div>
            <div className="text-xs text-muted-foreground">per credential</div>
          </div>
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

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {enrolled ? (
            <span className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-emerald-600/10 px-4 text-sm font-medium text-emerald-700">
              <Check className="h-4 w-4" /> Enrolled
            </span>
          ) : (
            <Button size="lg" variant="outline" disabled={enrolling} onClick={enroll}>
              {enrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {user ? "Enroll in this course" : "Sign in to enroll"}
            </Button>
          )}
          <Button
            size="lg"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => {
              if (!user) nav({ to: "/auth" });
              else nav({ to: "/exam/$slug", params: { slug } });
            }}
          >
            {user ? "Start the exam" : "Sign in to start"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {enrolled && (
            <Link to="/portal" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline">
              open my learning →
            </Link>
          )}
        </div>

        <SkillsMap modules={modules} fallback={c.skills ?? []} />
        <LessonChecks certificationId={c.id} modules={modules} />
      </div>
    </div>
  );
}
