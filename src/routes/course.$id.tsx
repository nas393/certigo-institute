import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, Award, Download, RefreshCw, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { CertificateView } from "@/components/kredo/CertificateView";
import { generateSerial } from "@/lib/cert";
import { downloadCertificatePdf } from "@/lib/pdf";

export const Route = createFileRoute("/course/$id")({
  head: () => ({ meta: [{ title: "Course — Certogo" }, { name: "description", content: "Study, pass the quiz, earn a verified credential." }] }),
  component: CoursePage,
});

interface Outline {
  title: string; summary: string;
  modules: { title: string; lessons: { title: string; content: string }[] }[];
  quiz: { question: string; options: string[]; correctIndex: number; explanation: string }[];
}

function CoursePage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [cert, setCert] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [view, setView] = useState<"learn" | "quiz">("learn");
  const [lessonIdx, setLessonIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [grading, setGrading] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [c, p, ce, pr] = await Promise.all([
        supabase.from("courses").select("*").eq("id", id).maybeSingle(),
        supabase.from("course_progress").select("*").eq("user_id", user.id).eq("course_id", id).maybeSingle(),
        supabase.from("certificates").select("*").eq("user_id", user.id).eq("course_id", id).maybeSingle(),
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      setCourse(c.data); setProgress(p.data); setCert(ce.data); setProfile(pr.data);
      if (p.data?.current_lesson != null) setLessonIdx(p.data.current_lesson);
    })();
  }, [user, id]);

  const outline: Outline | null = course?.outline ?? null;
  const lessons = useMemo(() => outline?.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m.title }))) ?? [], [outline]);
  const totalLessons = lessons.length;

  const saveProgress = async (next: number) => {
    if (!user) return;
    await supabase.from("course_progress").upsert(
      { user_id: user.id, course_id: id, current_lesson: next, started_at: progress?.started_at ?? new Date().toISOString() },
      { onConflict: "user_id,course_id" }
    );
  };

  const onNextLesson = async () => {
    if (lessonIdx + 1 < totalLessons) {
      const next = lessonIdx + 1;
      setLessonIdx(next); await saveProgress(next);
    } else { setView("quiz"); }
  };

  const submitQuiz = async () => {
    if (!outline || !user) return;
    setGrading(true);
    const total = outline.quiz.length;
    const correct = outline.quiz.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    const score = Math.round((correct / total) * 100);
    const passed = score >= 70;
    await supabase.from("course_progress").upsert(
      { user_id: user.id, course_id: id, current_lesson: lessonIdx, exam_score: score, completed: passed, completed_at: passed ? new Date().toISOString() : null },
      { onConflict: "user_id,course_id" }
    );
    setProgress((p: any) => ({ ...(p || {}), exam_score: score, completed: passed }));
    if (passed) {
      await issueCert(score);
      toast.success(`Passed with ${score}%! Certificate issued.`);
    } else { toast.error(`Scored ${score}%. Need 70% to pass — try again.`); }
    setGrading(false);
  };

  const issueCert = async (score: number) => {
    if (!user || !course) return null;
    // already?
    const { data: existing } = await supabase.from("certificates").select("*").eq("user_id", user.id).eq("course_id", id).maybeSingle();
    if (existing) { setCert(existing); return existing; }
    const display = profile?.display_name || user.email?.split("@")[0] || "Student";
    const serial = generateSerial();
    const { data, error } = await supabase.from("certificates").insert({
      user_id: user.id, course_id: id, recipient_name: display, course_topic: course.topic, score, serial,
    }).select().single();
    if (error) { toast.error("Could not issue cert"); return null; }
    setCert(data); return data;
  };

  const regenerate = async () => {
    if (!progress?.completed && progress?.exam_score == null) { toast.error("Pass the quiz first."); return; }
    const score = progress?.exam_score ?? 70;
    const c = await issueCert(score);
    if (c) toast.success("Certificate is ready.");
  };

  const [copied, setCopied] = useState(false);
  const verifyUrl = cert ? `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${cert.id}` : "";
  const copyLink = () => { navigator.clipboard.writeText(verifyUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  if (loading || !user || !course || !outline) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  const completed = progress?.completed === true;
  const lesson = lessons[lessonIdx];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link to="/dashboard" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">← Back to dashboard</Link>
        <div className="mt-3 micro-label">◆ {course.level || "Course"} · {totalLessons} lessons</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter md:text-5xl">{outline.title || course.topic}</h1>
        <p className="mt-3 text-muted-foreground">{outline.summary}</p>

        {!completed && view === "learn" && (
          <Card className="mt-10 p-8">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Lesson {lessonIdx + 1} / {totalLessons} · {lesson.module}</div>
            <h2 className="mt-2 font-display text-3xl font-black tracking-tighter">{lesson.title}</h2>
            <div className="prose prose-neutral mt-6 max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed">{lesson.content}</div>
            <div className="mt-8 flex justify-between">
              <Button variant="outline" disabled={lessonIdx === 0} onClick={async () => { const n = lessonIdx - 1; setLessonIdx(n); await saveProgress(n); }}>Previous</Button>
              <Button onClick={onNextLesson}>{lessonIdx + 1 < totalLessons ? "Next lesson" : "Take final quiz"} <ArrowRight className="ms-2 h-4 w-4" /></Button>
            </div>
          </Card>
        )}

        {!completed && view === "quiz" && (
          <Card className="mt-10 p-8">
            <div className="micro-label">◆ Final quiz</div>
            <h2 className="mt-2 font-display text-3xl font-black tracking-tighter">Pass with 70%+</h2>
            <div className="mt-8 space-y-8">
              {outline.quiz.map((q, i) => (
                <div key={i}>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Q{i + 1}</div>
                  <h3 className="mt-1 font-display text-lg font-bold">{q.question}</h3>
                  <div className="mt-3 grid gap-2">
                    {q.options.map((opt, j) => (
                      <button key={j} onClick={() => setAnswers((a) => ({ ...a, [i]: j }))}
                        className={`rounded-md border px-4 py-3 text-start text-sm transition-colors ${answers[i] === j ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-8 w-full h-12" disabled={grading || Object.keys(answers).length < outline.quiz.length} onClick={submitQuiz}>
              {grading ? "Grading..." : "Submit quiz"}
            </Button>
          </Card>
        )}

        {/* Certificate Center */}
        {completed && (
          <section className="mt-12">
            <Card className="border-primary/30 p-8 shadow-elegant">
              <div className="flex items-center justify-between">
                <div>
                  <div className="micro-label">◆ Certificate Center</div>
                  <h2 className="mt-2 font-display text-3xl font-black tracking-tighter flex items-center gap-3">
                    <Award className="h-7 w-7 text-primary" /> You're certified.
                  </h2>
                  {cert && <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Serial {cert.serial} · Score {cert.score}%</p>}
                </div>
              </div>

              {cert ? (
                <>
                  <div className="mt-8">
                    <CertificateView serial={cert.serial} recipientName={cert.recipient_name} courseTopic={cert.course_topic}
                      score={cert.score} issuedAt={cert.issued_at} verifyUrl={verifyUrl} watermark={!profile?.premium} />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button asChild variant="outline"><Link to="/certificate/$id" params={{ id: cert.id }}>Preview full</Link></Button>
                    <Button onClick={() => downloadCertificatePdf({
                      serial: cert.serial, recipientName: cert.recipient_name, courseTopic: cert.course_topic,
                      score: cert.score, issuedAt: cert.issued_at, verifyUrl, watermark: !profile?.premium,
                    })}><Download className="me-2 h-4 w-4" /> Download PDF</Button>
                    <Button variant="outline" onClick={regenerate}><RefreshCw className="me-2 h-4 w-4" /> Regenerate</Button>
                    <Button variant="outline" onClick={copyLink}>
                      {copied ? <Check className="me-2 h-4 w-4" /> : <Copy className="me-2 h-4 w-4" />} Copy verify link
                    </Button>
                  </div>
                </>
              ) : (
                <Button className="mt-6" onClick={regenerate}><RefreshCw className="me-2 h-4 w-4" /> Generate certificate</Button>
              )}
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
