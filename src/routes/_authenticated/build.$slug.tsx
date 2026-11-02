import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/kredo/Header";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getCourseForBuilder, saveCourse } from "@/lib/course-gen.functions";

export const Route = createFileRoute("/_authenticated/build/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Course builder · ${params.slug} — CERTIGO.` },
      { name: "description", content: "Edit your CERTIGO. course: lessons, skills and knowledge checks." },
    ],
  }),
  component: Builder,
});

type Draft = {
  title: string;
  category: string;
  summary: string;
  skills: string;
  modules: Array<{
    title: string;
    subject: string;
    learned: string;
    minutes: number;
    skills: string;
    q: string;
    options: string[];
    answer_index: number;
    explanation: string;
    introduction: string;
    objectives: string;
    sections: Array<{ heading: string; body: string; example: string }>;
    case_study: string;
    exercise: string;
    takeaways: string;
  }>;
};

const emptyModule = () => ({
  title: "",
  subject: "",
  learned: "",
  minutes: 12,
  skills: "",
  q: "",
  options: ["", "", "", ""],
  answer_index: 0,
  explanation: "",
  introduction: "",
  objectives: "",
  sections: [{ heading: "", body: "", example: "" }],
  case_study: "",
  exercise: "",
  takeaways: "",
});

function Builder() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const save = useServerFn(saveCourse);
  const load = useServerFn(getCourseForBuilder);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [owned, setOwned] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void load({ data: { slug } }).then((data) => {
      if (!active) return;
      const mods = Array.isArray(data.modules) ? (data.modules as any[]) : [];
      setDraft({
        title: data.title,
        category: data.category,
        summary: data.summary,
        skills: (data.skills ?? []).join(", "),
        modules: mods.length
          ? mods.map((m: any) => ({
              title: String(m.title ?? ""),
              subject: String(m.subject ?? ""),
              learned: String(m.learned ?? ""),
              minutes: Number(m.minutes) || 12,
              skills: Array.isArray(m.skills) ? m.skills.join(", ") : "",
              q: String(m.check?.q ?? ""),
              options: Array.isArray(m.check?.options)
                ? [0, 1, 2, 3].map((i) => String(m.check.options[i] ?? ""))
                : ["", "", "", ""],
              answer_index: Number(m.answer_index) || 0,
              explanation: String(m.explanation ?? ""),
              introduction: String(m.content?.introduction ?? ""),
              objectives: Array.isArray(m.content?.objectives) ? m.content.objectives.join("\\n") : "",
              sections: Array.isArray(m.content?.sections) && m.content.sections.length
                ? m.content.sections.map((x: any) => ({ heading: String(x.heading ?? ""), body: String(x.body ?? ""), example: String(x.example ?? "") }))
                : [{ heading: "", body: "", example: "" }],
              case_study: String(m.content?.case_study ?? ""),
              exercise: String(m.content?.exercise ?? ""),
              takeaways: Array.isArray(m.content?.takeaways) ? m.content.takeaways.join("\\n") : "",
            }))
          : [emptyModule()],
      });
    }).catch((err: any) => {
      if (!active && err) return;
      setOwned(false);
    });
    return () => { active = false; };
  }, [slug, user, load]);

  if (!owned) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8">
          <h1 className="font-display text-3xl font-black tracking-tighter">This course isn't yours to edit.</h1>
          <p className="mt-2 text-sm text-muted-foreground">You can only edit courses you generated yourself.</p>
          <Link to="/catalog" className="mt-6 inline-block text-sm font-medium text-emerald-700 underline">
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });
  const setModule = (i: number, patch: Partial<Draft["modules"][number]>) => {
    const modules = draft.modules.map((m, j) => (i === j ? { ...m, ...patch } : m));
    setDraft({ ...draft, modules });
  };

  async function submit() {
    if (!draft) return;
    setBusy(true);
    try {
      await save({
        data: {
          slug,
          title: draft.title.trim(),
          category: draft.category.trim(),
          summary: draft.summary.trim(),
          skills: draft.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 12),
          modules: draft.modules.map((m) => ({
            title: m.title.trim() || "Untitled lesson",
            subject: m.subject.trim(),
            learned: m.learned.trim(),
            minutes: Math.min(30, Math.max(5, Number(m.minutes) || 12)),
            skills: m.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 6),
            check: { q: m.q.trim(), options: m.options.map((o) => o.trim()).filter(Boolean) },
            answer_index: Math.min(3, Math.max(0, Number(m.answer_index) || 0)),
            explanation: m.explanation.trim(),
            content: {
              introduction: m.introduction.trim(),
              objectives: m.objectives.split("\\n").map((x) => x.trim()).filter(Boolean).slice(0, 6),
              sections: m.sections.map((x) => ({ heading: x.heading.trim(), body: x.body.trim(), example: x.example.trim() })).filter((x) => x.heading || x.body || x.example),
              case_study: m.case_study.trim(),
              exercise: m.exercise.trim(),
              takeaways: m.takeaways.split("\\n").map((x) => x.trim()).filter(Boolean).slice(0, 6),
            },
          })),
        },
      });
      toast.success("Course saved.");
      nav({ to: "/c/$slug", params: { slug } });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not save the course.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">◆ Course builder</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter">Edit your course</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Rewrite anything the generator produced — lessons, the skills each one maps to, and the knowledge check
          learners answer at the end of it.
        </p>

        <div className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6">
          <Field label="Title">
            <Input value={draft.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Category">
            <Input value={draft.category} onChange={(e) => set({ category: e.target.value })} />
          </Field>
          <Field label="Summary">
            <Textarea rows={3} value={draft.summary} onChange={(e) => set({ summary: e.target.value })} />
          </Field>
          <Field label="Course skills (comma separated)">
            <Input value={draft.skills} onChange={(e) => set({ skills: e.target.value })} />
          </Field>
        </div>

        <div className="mt-8 space-y-5">
          {draft.modules.map((m, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Lesson {String(i + 1).padStart(2, "0")}
                </div>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, modules: draft.modules.filter((_, j) => j !== i) })}
                  className="text-muted-foreground transition hover:text-red-600"
                  aria-label="Remove lesson"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <Field label="Lesson title">
                  <Input value={m.title} onChange={(e) => setModule(i, { title: e.target.value })} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                  <Field label="Subject">
                    <Input value={m.subject} onChange={(e) => setModule(i, { subject: e.target.value })} />
                  </Field>
                  <Field label="Minutes">
                    <Input
                      type="number"
                      value={m.minutes}
                      onChange={(e) => setModule(i, { minutes: Number(e.target.value) })}
                    />
                  </Field>
                </div>
                <Field label="What the learner walks away with">
                  <Textarea rows={2} value={m.learned} onChange={(e) => setModule(i, { learned: e.target.value })} />
                </Field>
                <Field label="Job-relevant skills for this lesson (comma separated)">
                  <Input value={m.skills} onChange={(e) => setModule(i, { skills: e.target.value })} />
                </Field>\n\n                <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-700">Lesson content</div>
                  <Field label="Introduction">
                    <Textarea rows={4} value={m.introduction} onChange={(e) => setModule(i, { introduction: e.target.value })} placeholder="Set context and explain why this topic matters at work." />
                  </Field>
                  <Field label="Learning objectives (one per line)">
                    <Textarea rows={3} value={m.objectives} onChange={(e) => setModule(i, { objectives: e.target.value })} placeholder="Identify…\nApply…\nEvaluate…" />
                  </Field>
                  <div className="space-y-3">
                    <div className="text-xs font-semibold">Teaching sections</div>
                    {m.sections.map((section, j) => (
                      <div key={j} className="space-y-2 rounded-lg border border-border p-3">
                        <Field label={`Section ${j + 1} heading`}>
                          <Input value={section.heading} onChange={(e) => setModule(i, { sections: m.sections.map((x, k) => k === j ? { ...x, heading: e.target.value } : x) })} />
                        </Field>
                        <Field label="Core explanation">
                          <Textarea rows={4} value={section.body} onChange={(e) => setModule(i, { sections: m.sections.map((x, k) => k === j ? { ...x, body: e.target.value } : x) })} />
                        </Field>
                        <Field label="Professional example">
                          <Textarea rows={2} value={section.example} onChange={(e) => setModule(i, { sections: m.sections.map((x, k) => k === j ? { ...x, example: e.target.value } : x) })} />
                        </Field>
                        <Button type="button" variant="ghost" size="sm" disabled={m.sections.length <= 1} onClick={() => setModule(i, { sections: m.sections.filter((_, k) => k !== j) })}>Remove section</Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" disabled={m.sections.length >= 6} onClick={() => setModule(i, { sections: [...m.sections, { heading: "", body: "", example: "" }] })}><Plus className="mr-2 h-4 w-4" /> Add section</Button>
                  </div>
                  <Field label="Workplace case study">
                    <Textarea rows={4} value={m.case_study} onChange={(e) => setModule(i, { case_study: e.target.value })} />
                  </Field>
                  <Field label="Practical workplace exercise">
                    <Textarea rows={3} value={m.exercise} onChange={(e) => setModule(i, { exercise: e.target.value })} />
                  </Field>
                  <Field label="Key takeaways (one per line)">
                    <Textarea rows={3} value={m.takeaways} onChange={(e) => setModule(i, { takeaways: e.target.value })} />
                  </Field>
                </div>

                <div className="rounded-lg border border-dashed border-border p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-700">
                    ◆ Knowledge check
                  </div>
                  <div className="mt-3 space-y-3">
                    <Field label="Question">
                      <Input value={m.q} onChange={(e) => setModule(i, { q: e.target.value })} />
                    </Field>
                    {m.options.map((opt, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`answer-${i}`}
                          checked={m.answer_index === j}
                          onChange={() => setModule(i, { answer_index: j })}
                          aria-label={`Correct answer ${j + 1}`}
                        />
                        <Input
                          value={opt}
                          placeholder={`Option ${j + 1}`}
                          onChange={(e) => {
                            const options = m.options.map((o, k) => (k === j ? e.target.value : o));
                            setModule(i, { options });
                          }}
                        />
                      </div>
                    ))}
                    <Field label="Feedback shown after answering">
                      <Input value={m.explanation} onChange={(e) => setModule(i, { explanation: e.target.value })} />
                    </Field>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={draft.modules.length >= 8}
            onClick={() => setDraft({ ...draft, modules: [...draft.modules, emptyModule()] })}
          >
            <Plus className="mr-2 h-4 w-4" /> Add lesson
          </Button>
          <Button onClick={submit} disabled={busy} className="bg-emerald-600 text-white hover:bg-emerald-700">
            {busy ? "Saving…" : "Save course"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
