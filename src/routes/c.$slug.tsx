import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, ShieldCheck, Loader2, Check } from "lucide-react";
import { SkillsMap, normalizeModules } from "@/components/course/SkillsMap";
import { LessonChecks } from "@/components/course/LessonChecks";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useCourseTranslation } from "@/lib/use-course-translation";
import { CheckoutPanel, useCheckoutInfo, money } from "@/components/checkout/Checkout";

export const Route = createFileRoute("/c/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — CERTIGO.` },
      { name: "description", content: "Learn the essentials free, then prove it with a verified CERTIGO. certificate exam." },
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
  const { t, lang } = useI18n();
  const { translation, loading: translating, error: translateError } = useCourseTranslation(slug);
  const { info, reload: reloadAccess } = useCheckoutInfo(c?.id);

  useEffect(() => {
    supabase.from("certifications").select("id, slug, title, issuer_name, category, summary, skills, question_count, pass_score, questions, created_at, created_by, modules, price_cents").eq("slug", slug).maybeSingle().then(({ data }) => setC(data));
  }, [slug]);

  useEffect(() => {
    if (!user || !c?.id) { setEnrolled(false); return; }
    supabase.from("enrollments").select("id").eq("user_id", user.id).eq("certification_id", c.id).maybeSingle()
      .then(({ data }) => setEnrolled(!!data));
  }, [user, c?.id]);

  const baseModules = useMemo(() => normalizeModules(c?.modules), [c]);
  const modules = useMemo(() => {
    if (!translation) return baseModules;
    return baseModules.map((m: any, i: number) => {
      const tm = translation.modules?.[i];
      if (!tm) return m;
      return {
        ...m,
        title: tm.title || m.title,
        subject: tm.subject || m.subject,
        learned: tm.learned || m.learned,
        check: m.check ? { ...m.check, q: tm.check?.q || m.check.q, options: (m.check.options ?? []).map((o: string, j: number) => tm.check?.options?.[j] || o) } : m.check,
      };
    });
  }, [baseModules, translation]);

  async function enroll() {
    if (!user) { nav({ to: "/auth" }); return; }
    setEnrolling(true);
    const { error } = await supabase.from("enrollments").insert({ user_id: user.id, certification_id: c.id });
    setEnrolling(false);
    if (error && !/duplicate|unique/i.test(error.message)) { toast.error(error.message); return; }
    setEnrolled(true);
    toast.success("Enrolled — this course is now in your learning portal.");
  }

  const lessonMinutes = baseModules.reduce((n: number, m: any) => n + (Number(m?.minutes) || 0), 0);
  if (!c) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link to="/catalog" className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground hover:text-foreground">{t("course.back")}</Link>
        </div>
        <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">◆ {c.category}</div>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tighter">{translation?.title ?? c.title}</h1>
        <p className="mt-3 text-base text-muted-foreground">{translation?.summary ?? c.summary}</p>
        {lang !== "en" && (
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            {translating ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            {translating ? t("course.translating") : translation ? t("course.translated") : translateError ?? null}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {((translation?.skills?.length ? translation.skills : c.skills) ?? []).map((s: string) => (
            <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs">{s}</span>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{t("course.price")}</div>
            <div className="mt-2 text-2xl font-black" data-testid="course-price">{info ? money(info.single_cents, info.currency) : formatPrice(c.price_cents)}</div>
            <div className="text-xs text-muted-foreground">lessons free · pay to certify</div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="mt-2 text-2xl font-black">{lessonMinutes ? `${Math.round(lessonMinutes / 5) * 5} min` : "—"}</div>
            <div className="text-xs text-muted-foreground">of lessons · {modules.length} modules</div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <div className="mt-2 text-2xl font-black">{c.question_count} Qs</div>
            <div className="text-xs text-muted-foreground">exam · {c.pass_score}% {t("course.toPass")}</div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="text-2xl font-black">QR</div>
            <div className="text-xs text-muted-foreground">{t("course.verifiable")}</div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {enrolled ? (
            <span className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-emerald-600/10 px-4 text-sm font-medium text-emerald-700">
              <Check className="h-4 w-4" /> {t("course.enrolled")}
            </span>
          ) : (
            <Button size="lg" variant="outline" disabled={enrolling} onClick={enroll}>
              {enrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {user ? "Start the free lessons" : t("course.enrollSignIn")}
            </Button>
          )}
          {info?.access.access && (
            <Button size="lg" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => nav({ to: "/exam/$slug", params: { slug } })}>
              {t("course.startExam")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {enrolled && (
            <Link to="/portal" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline">
              {t("course.openLearning")}
            </Link>
          )}
        </div>
        {info?.access.access && info.access.via === "pass" && info.access.until && (
          <p className="mt-2 text-xs text-muted-foreground">Your monthly pass is active until {new Date(info.access.until).toLocaleDateString()}.</p>
        )}
        {info && !info.access.access && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-extrabold tracking-tight">Get certified</h2>
            <p className="mt-1 text-sm text-muted-foreground">Read the lessons for free. When you're ready, unlock the exam: pass it and your verified certificate is issued instantly.</p>
            <div className="mt-4"><CheckoutPanel certificationId={c.id} info={info} onPaid={() => void reloadAccess()} /></div>
          </div>
        )}

        <SkillsMap modules={modules} fallback={(translation?.skills?.length ? translation.skills : c.skills) ?? []} />
        <LessonChecks certificationId={c.id} modules={modules} />
      </div>
    </div>
  );
}
