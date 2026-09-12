import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatReference } from "@/lib/cert";
import { courseProgress, usePortalCourses } from "@/lib/portal";
import { ArrowRight, Pencil, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CERTIGO." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [certs, setCerts] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ display_name: string | null; headline: string | null; linkedin_url: string | null } | null>(null);
  useEffect(() => {
    if (!user) return;
    supabase
      .from("certificates")
      .select("serial, issued_at, score, certifications(title, category)")
      .eq("user_id", user.id)
      .order("issued_at", { ascending: false })
      .then(({ data }) => setCerts(data ?? []));
    supabase
      .from("profiles")
      .select("display_name, headline, linkedin_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data ?? null));
  }, [user]);

  const certName =
    profile?.display_name ||
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "—";
  const avgScore = certs.length ? Math.round(certs.reduce((s, c) => s + (c.score ?? 0), 0) / certs.length) : 0;
  const { courses } = usePortalCourses(user?.id);
  const enrolled = courses ?? [];
  const overall = enrolled.length
    ? Math.round(enrolled.reduce((s, c) => s + courseProgress(c), 0) / enrolled.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ Your credentials</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter">Dashboard</h1>

        {/* Profile card — the name printed on every certificate */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-muted text-muted-foreground">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ Certificate name</div>
                  <div className="mt-1 font-display text-xl font-extrabold">{certName}</div>
                  <div className="text-xs text-muted-foreground">{profile?.headline || user?.email}</div>
                </div>
              </div>
              <Link
                to="/profile"
                className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:border-foreground/40"
              >
                <Pencil className="h-3 w-3" /> Edit
              </Link>
            </div>
            {!profile?.display_name && (
              <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
                Heads up — this name was pulled from your sign-in provider. <Link to="/profile" className="underline">Set your official name</Link> before issuing more certificates.
              </p>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ Stats</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="font-display text-2xl font-black">{certs.length}</div>
                <div className="text-xs text-muted-foreground">Earned</div>
              </div>
              <div>
                <div className="font-display text-2xl font-black">{avgScore}%</div>
                <div className="text-xs text-muted-foreground">Avg score</div>
              </div>
              <div>
                <div className="font-display text-2xl font-black">{enrolled.length}</div>
                <div className="text-xs text-muted-foreground">Enrolled</div>
              </div>
              <div>
                <div className="font-display text-2xl font-black">{overall}%</div>
                <div className="text-xs text-muted-foreground">Progress</div>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <Link to="/portal" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                My learning <ArrowRight className="h-3 w-3" />
              </Link>
              {user && (
                <Link to="/p/$id" params={{ id: user.id }} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                  My credential passport <ArrowRight className="h-3 w-3" />
                </Link>
              )}
              <Link to="/catalog" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                Browse catalog <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Courses in progress */}
        <div className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-extrabold">In progress</h2>
            <Link to="/portal" className="text-xs font-medium text-emerald-700 hover:underline">Open my learning →</Link>
          </div>
          {enrolled.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              You have not enrolled in a course yet. <Link to="/catalog" className="text-emerald-700 hover:underline">Pick one from the catalog</Link>.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {enrolled.slice(0, 4).map((c) => {
                const pct = courseProgress(c);
                return (
                  <Link key={c.id} to="/c/$slug" params={{ slug: c.slug }} className="rounded-xl border border-border bg-card p-5 transition hover:border-foreground/40">
                    <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ {c.category}</div>
                    <div className="mt-2 font-display text-base font-extrabold">{c.title}</div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {pct}% · {c.lessonsDone}/{c.lessons} lesson checks · {c.passed ? "exam passed" : "exam pending"}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <h2 className="mt-10 font-display text-lg font-extrabold">Certificates</h2>
        {certs.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">No certificates yet.</p>
            <Link to="/catalog" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
              Browse catalog <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {certs.map((c) => (
              <Link
                key={c.serial}
                to="/issued/$serial"
                params={{ serial: c.serial }}
                className="rounded-xl border border-border bg-card p-5 transition hover:border-foreground/40"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ {c.certifications?.category}</div>
                <div className="mt-2 font-display text-xl font-extrabold">{c.certifications?.title}</div>
                <div className="mt-2 font-mono text-[11px] text-muted-foreground">{formatReference(c.serial)}</div>
                <div className="mt-2 text-xs text-muted-foreground">Score {c.score}% · {new Date(c.issued_at).toLocaleDateString()}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}