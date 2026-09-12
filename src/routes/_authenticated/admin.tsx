import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/use-admin";
import { formatPrice } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Pencil, Trash2, Users, ChevronDown, ShieldAlert, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — CERTIGO." }] }),
  component: AdminPanel,
});

type Course = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  price_cents: number;
  pass_score: number;
  question_count: number;
  skills: string[] | null;
};

type Overview = { certification_id: string; learners: number; passers: number; certificates: number };
type Result = {
  user_id: string; display_name: string; attempts: number; best_score: number;
  passed: boolean; serial: string | null; issued_at: string | null; enrolled_at: string | null;
};

const blank = {
  slug: "", title: "", category: "", summary: "",
  price_dollars: "10", pass_score: "70", skills: "",
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function AdminPanel() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [overview, setOverview] = useState<Record<string, Overview>>({});
  const [editing, setEditing] = useState<Course | "new" | null>(null);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);
  const [openResults, setOpenResults] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, Result[]>>({});

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("certifications")
      .select("id, slug, title, category, summary, price_cents, pass_score, question_count, skills")
      .order("category")
      .order("title");
    setCourses((data ?? []) as Course[]);
    const { data: ov } = await supabase.rpc("admin_course_overview");
    const map: Record<string, Overview> = {};
    for (const row of (ov ?? []) as Overview[]) map[row.certification_id] = row;
    setOverview(map);
  }, []);

  useEffect(() => { if (isAdmin) void load(); }, [isAdmin, load]);

  function startEdit(c: Course) {
    setEditing(c);
    setForm({
      slug: c.slug, title: c.title, category: c.category, summary: c.summary,
      price_dollars: String((c.price_cents ?? 0) / 100),
      pass_score: String(c.pass_score ?? 70),
      skills: (c.skills ?? []).join(", "),
    });
  }

  async function save() {
    const title = form.title.trim();
    if (!title) { toast.error("Give the course a title."); return; }
    const slug = slugify(form.slug || title);
    const price_cents = Math.max(0, Math.round(Number(form.price_dollars || 0) * 100));
    const pass_score = Math.min(100, Math.max(1, Math.round(Number(form.pass_score || 70))));
    const payload = {
      slug, title,
      category: form.category.trim() || "General",
      summary: form.summary.trim() || title,
      price_cents, pass_score,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    };
    setSaving(true);
    const res = editing === "new"
      ? await supabase.from("certifications").insert({ ...payload, created_by: user?.id ?? null })
      : await supabase.from("certifications").update(payload).eq("id", (editing as Course).id);
    setSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(editing === "new" ? "Course created." : "Course updated.");
    setEditing(null);
    await load();
  }

  async function remove(c: Course) {
    if (!window.confirm(`Delete “${c.title}”? Learners keep certificates already issued.`)) return;
    const { error } = await supabase.from("certifications").delete().eq("id", c.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Course deleted.");
    await load();
  }

  async function toggleResults(c: Course) {
    if (openResults === c.id) { setOpenResults(null); return; }
    setOpenResults(c.id);
    if (results[c.id]) return;
    const { data, error } = await supabase.rpc("admin_course_results", { _certification_id: c.id });
    if (error) { toast.error(error.message); return; }
    setResults((r) => ({ ...r, [c.id]: (data ?? []) as Result[] }));
  }

  if (roleLoading) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-xl px-5 py-20 text-center sm:px-8">
          <ShieldAlert className="mx-auto h-6 w-6 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-black tracking-tight">Admins only</h1>
          <p className="mt-2 text-sm text-muted-foreground">This account does not hold admin access.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">◆ Administration</div>
            <h1 className="mt-3 font-display text-4xl font-black tracking-tighter">Courses & results</h1>
            <p className="mt-2 text-sm text-muted-foreground">Create, edit and delete courses. Open any course to see who enrolled, attempted and passed.</p>
          </div>
          <Button
            className="min-h-[44px] bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => { setEditing("new"); setForm({ ...blank }); }}
          >
            <Plus className="mr-2 h-4 w-4" /> New course
          </Button>
        </div>

        {editing && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="font-display text-lg font-extrabold">{editing === "new" ? "New course" : `Editing ${(editing as Course).title}`}</div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="a-title">Title</Label><Input id="a-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label htmlFor="a-slug">URL slug</Label><Input id="a-slug" placeholder="auto from title" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
              <div><Label htmlFor="a-cat">Category</Label><Input id="a-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label htmlFor="a-price">Price (USD)</Label><Input id="a-price" inputMode="decimal" value={form.price_dollars} onChange={(e) => setForm({ ...form, price_dollars: e.target.value })} /></div>
              <div><Label htmlFor="a-pass">Pass mark (%)</Label><Input id="a-pass" inputMode="numeric" value={form.pass_score} onChange={(e) => setForm({ ...form, pass_score: e.target.value })} /></div>
              <div><Label htmlFor="a-skills">Skills (comma separated)</Label><Input id="a-skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label htmlFor="a-sum">Summary</Label><Textarea id="a-sum" rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={save} disabled={saving} className="min-h-[44px] bg-emerald-600 text-white hover:bg-emerald-700">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save course
              </Button>
              <Button variant="outline" className="min-h-[44px]" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        )}

        {!courses ? (
          <div className="mt-10 grid place-items-center"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="mt-8 space-y-3">
            {courses.map((c) => {
              const ov = overview[c.id];
              const rows = results[c.id];
              return (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">◆ {c.category} · {formatPrice(c.price_cents)}</div>
                      <div className="mt-1 font-display text-xl font-extrabold tracking-tight">{c.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">/{c.slug} · {c.question_count} questions · pass {c.pass_score}%</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-muted px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]">
                        {ov?.learners ?? 0} enrolled · {ov?.passers ?? 0} passed · {ov?.certificates ?? 0} issued
                      </span>
                      <Button size="sm" variant="outline" onClick={() => void toggleResults(c)}>
                        <Users className="mr-1.5 h-3.5 w-3.5" /> Results <ChevronDown className={"ml-1 h-3 w-3 transition " + (openResults === c.id ? "rotate-180" : "")} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => startEdit(c)}><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => void remove(c)}><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete</Button>
                      <Link to="/c/$slug" params={{ slug: c.slug }} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                        View <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  {openResults === c.id && (
                    <div className="mt-4 overflow-x-auto rounded-xl border border-border">
                      {!rows ? (
                        <div className="p-6 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>
                      ) : rows.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">Nobody has enrolled in this course yet.</div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                              <th className="p-3">Learner</th><th className="p-3">Attempts</th><th className="p-3">Best score</th>
                              <th className="p-3">Outcome</th><th className="p-3">Credential</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((r) => (
                              <tr key={r.user_id} className="border-b border-border/60 last:border-0">
                                <td className="p-3 font-medium">{r.display_name}</td>
                                <td className="p-3">{r.attempts}</td>
                                <td className="p-3">{r.attempts > 0 ? `${r.best_score}%` : "—"}</td>
                                <td className="p-3">
                                  <span className={"rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] " + (r.passed ? "bg-emerald-600/10 text-emerald-700" : "bg-muted text-muted-foreground")}>
                                    {r.passed ? "passed" : r.attempts > 0 ? "not yet" : "enrolled"}
                                  </span>
                                </td>
                                <td className="p-3">
                                  {r.serial ? (
                                    <Link to="/verify/$id" params={{ id: r.serial }} className="font-mono text-xs text-emerald-700 hover:underline">{r.serial}</Link>
                                  ) : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
