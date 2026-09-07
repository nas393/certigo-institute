import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { generateCourse } from "@/lib/course-gen.functions";

const IDEAS = [
  "Negotiation for procurement leads",
  "B2B demand generation",
  "Warehouse automation planning",
  "Prompt engineering for analysts",
  "Coaching underperforming teams",
];

export function CourseGenerator() {
  const nav = useNavigate();
  const { user } = useAuth();
  const run = useServerFn(generateCourse);
  const [skill, setSkill] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const value = skill.trim();
    if (value.length < 3) {
      toast.error("Tell us the skill you want certified.");
      return;
    }
    if (!user) {
      toast.message("Sign in first — it takes a few seconds.");
      nav({ to: "/auth" });
      return;
    }
    setBusy(true);
    try {
      const result = await run({ data: { skill: value } });
      toast.success(`Created: ${result.title}`);
      nav({ to: "/c/$slug", params: { slug: result.slug } });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not build that course. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-card sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl"
        />
        <div className="relative">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">
            <Wand2 className="h-3 w-3" /> Build your own
          </div>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tighter sm:text-4xl">
            Not in the catalog? Generate it.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Name a skill. We write the certification title, the syllabus skills and an eight-question exam for you —
            then you sit it and get the same verified certificate. Free while in preview.
          </p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Input
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="e.g. Supplier risk management"
              className="h-12 flex-1 text-base"
              disabled={busy}
            />
            <Button
              type="submit"
              disabled={busy}
              className="h-12 bg-emerald-600 px-6 text-white hover:bg-emerald-700"
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing your exam…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate certification
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {IDEAS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSkill(i)}
                disabled={busy}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:border-emerald-600 hover:text-emerald-700"
              >
                {i}
              </button>
            ))}
          </div>

          <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            ◆ Free for now · 8 questions · pass at 70%
          </div>
        </div>
      </div>
    </section>
  );
}
