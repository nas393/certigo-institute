import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, Award, BookOpen, Download, Sparkles, Lock, Share2 } from "lucide-react";
import { toast } from "sonner";
import { downloadCertificatePdf } from "@/lib/pdf";
import { PRESET_TOPICS } from "@/lib/topics";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Kredo" }, { name: "description", content: "Your courses and verified certificates." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [certs, setCerts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [showAll, setShowAll] = useState(false);
  const [category, setCategory] = useState<string>("All");

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [c, pr, ce, prof] = await Promise.all([
        supabase.from("courses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("course_progress").select("*").eq("user_id", user.id),
        supabase.from("certificates").select("*").eq("user_id", user.id).order("issued_at", { ascending: false }),
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      setCourses(c.data || []);
      const m: Record<string, any> = {}; (pr.data || []).forEach((p: any) => { m[p.course_id] = p; }); setProgress(m);
      setCerts(ce.data || []);
      setProfile(prof.data);
    })();
  }, [user]);

  const generate = async () => {
    if (!topic.trim() || !user) return;
    // Premium gate: free users limited to 3 courses
    if (!profile?.premium && courses.length >= 3) {
      toast.error("Free plan limit reached (3 courses). Upgrade or redeem an unlock code.");
      nav({ to: "/unlock" });
      return;
    }
    setGenerating(true);
    try {
      const r = await fetch("/api/public/ai/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level: "intermediate", duration: "30 min", language: "en" }),
      });
      if (!r.ok) throw new Error("generation failed");
      const { outline } = await r.json();
      const { data, error } = await supabase.from("courses").insert({
        user_id: user.id, topic, outline, level: "intermediate", duration: "30 min", language: "en",
      }).select().single();
      if (error) throw error;
      toast.success("Course ready!");
      nav({ to: "/course/$id", params: { id: data.id } });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !user) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  const inProgress = courses.filter((c) => !progress[c.id]?.completed);
  const completed = courses.filter((c) => progress[c.id]?.completed);
  const cats = ["All", ...Array.from(new Set(PRESET_TOPICS.map((t) => t.category)))];
  const visiblePresets = (category === "All" ? PRESET_TOPICS : PRESET_TOPICS.filter((t) => t.category === category)).slice(0, showAll ? 999 : 12);
  const profileHandle = profile?.display_name || user.id;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="micro-label">◆ Dashboard</div>
        <h1 className="mt-4 font-display text-4xl font-black tracking-tighter md:text-5xl">
          {profile?.display_name ? `Hi, ${profile.display_name}.` : "Welcome back."}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-muted-foreground">From knowledge to verified proof — instantly.</p>
          {profile?.premium ? (
            <span className="rounded-full bg-primary/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">◆ Pro</span>
          ) : (
            <Link to="/unlock" className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-primary/50 hover:text-primary">Upgrade</Link>
          )}
          <Link to="/u/$handle" params={{ handle: profileHandle }} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-primary/50 hover:text-primary">
            <Share2 className="h-3 w-3" /> Public profile
          </Link>
        </div>

        {/* Generator */}
        <Card className="mt-10 border-primary/30 bg-card p-6 shadow-elegant">
          <div className="micro-label">◆ Create</div>
          <h2 className="mt-2 font-display text-2xl font-black tracking-tight">Generate a new course</h2>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. SQL for analysts" className="h-12" />
            <Button onClick={generate} disabled={generating || !topic.trim()} className="h-12 px-6">
              {generating ? <><Loader2 className="me-2 h-4 w-4 animate-spin" /> Generating</> : <>Generate <ArrowRight className="ms-2 h-4 w-4" /></>}
            </Button>
          </div>
          {!profile?.premium && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <Lock className="me-1 inline h-3 w-3" /> Free plan: {Math.max(0, 3 - courses.length)} of 3 courses left
            </p>
          )}

          <div className="mt-6">
            <div className="flex items-center gap-2 micro-label"><Sparkles className="h-3 w-3" /> Or pick from 50 ready-made topics</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {cats.map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${category === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                  {c}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {visiblePresets.map((p) => (
                <button key={p.topic} onClick={() => setTopic(p.topic)}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:bg-primary/5">
                  {p.topic}
                </button>
              ))}
            </div>
            {!showAll && <button onClick={() => setShowAll(true)} className="mt-3 font-mono text-[10px] uppercase tracking-widest text-primary hover:underline">Show all 50 →</button>}
          </div>
        </Card>

        {/* Certificates */}
        <section className="mt-14">
          <div className="flex items-end justify-between">
            <div>
              <div className="micro-label">◆ Certificates</div>
              <h2 className="mt-2 font-display text-3xl font-black tracking-tighter">Your verified credentials</h2>
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{certs.length} earned</span>
          </div>
          {certs.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Complete a course to earn your first certificate.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {certs.map((c) => (
                <Card key={c.id} className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-primary"><Award /></div>
                    <div>
                      <div className="font-display font-bold tracking-tight">{c.course_topic}</div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{c.serial} · Score {c.score}%</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline"><Link to="/certificate/$id" params={{ id: c.id }}>Preview</Link></Button>
                    <Button size="sm" onClick={() => downloadCertificatePdf({
                      serial: c.serial, recipientName: c.recipient_name, courseTopic: c.course_topic,
                      score: c.score, issuedAt: c.issued_at, verifyUrl: `${window.location.origin}/verify/${c.id}`,
                      watermark: !profile?.premium,
                    })}><Download className="h-4 w-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* In progress */}
        <section className="mt-14">
          <div className="micro-label">◆ In progress</div>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tighter">Continue learning</h2>
          {inProgress.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No active courses.</p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgress.map((c) => (
                <Link key={c.id} to="/course/$id" params={{ id: c.id }} className="block">
                  <Card className="h-full p-6 transition-all hover:-translate-y-1 hover:shadow-elegant">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="mt-3 font-display text-lg font-black tracking-tight">{c.topic}</h3>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {progress[c.id]?.current_lesson != null ? `Lesson ${progress[c.id].current_lesson + 1}` : "Not started"}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Completed archive */}
        {completed.length > 0 && (
          <section className="mt-14">
            <div className="micro-label">◆ Archive</div>
            <h2 className="mt-2 font-display text-3xl font-black tracking-tighter">Completed courses</h2>
            <div className="mt-6 grid gap-3">
              {completed.map((c) => (
                <Link key={c.id} to="/course/$id" params={{ id: c.id }}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4 hover:border-primary/40">
                  <div className="font-medium">{c.topic}</div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">✓ {progress[c.id]?.exam_score}%</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
