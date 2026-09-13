import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({ skill: z.string().min(2).max(120) });

/** Deliberately permissive: the model's shape is coerced, never rejected. */
const Loose = z
  .object({
    title: z.string().optional(),
    category: z.string().optional(),
    summary: z.string().optional(),
    skills: z.array(z.any()).optional(),
    modules: z.array(z.any()).optional(),
    questions: z.array(z.any()).optional(),
  })
  .passthrough();

export type CourseModule = {
  title: string;
  subject: string;
  learned: string;
  minutes: number;
  skills: string[];
  check: { q: string; options: string[] };
};

function str(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  return fallback;
}

function strList(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x : typeof x === "object" && x ? str((x as any).name ?? (x as any).skill ?? (x as any).title) : ""))
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, max);
}

function toQuestion(raw: any): { q: string; options: string[]; answer_index: number } | null {
  if (!raw || typeof raw !== "object") return null;
  const q = str(raw.q ?? raw.question ?? raw.prompt);
  let options = strList(raw.options ?? raw.choices ?? raw.answers, 6);
  if (!q || options.length < 2) return null;
  let idx = raw.answer_index ?? raw.answerIndex ?? raw.correct_index ?? raw.correct;
  if (typeof idx === "string") {
    const letter = idx.trim().toUpperCase();
    if (/^[A-F]$/.test(letter)) idx = letter.charCodeAt(0) - 65;
    else {
      const found = options.findIndex((o) => o.toLowerCase() === letter.toLowerCase());
      idx = found >= 0 ? found : Number(letter);
    }
  }
  let answer = Number.isFinite(Number(idx)) ? Number(idx) : 0;
  if (answer < 0 || answer >= options.length) answer = 0;
  // normalise to exactly 4 options where possible, keeping the correct one
  if (options.length > 4) {
    const correct = options[answer]!;
    const others = options.filter((_, i) => i !== answer).slice(0, 3);
    options = [correct, ...others];
    answer = 0;
  }
  return { q: q.slice(0, 400), options: options.map((o) => o.slice(0, 200)), answer_index: answer };
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const SYSTEM = `You design short professional certifications for CERTIGO., a credential platform.
Given a skill, produce:
- title: a crisp professional certification title (no quotes, no "CERTIGO")
- category: one short category
- summary: one paragraph
- skills: 4-8 real-world professional skills covered
- modules: 4-8 lessons. Each has title, subject, learned (2-3 sentences on what the learner walks away with),
  minutes (10-15), skills (2-4 job-relevant skills this specific lesson maps to), and check:
  a single knowledge-check question with q, options (exactly 4) and answer_index (0-3) plus a short
  explanation of why that answer is right.
- questions: exactly 8 final-exam multiple-choice questions with q, options (4) and answer_index (0-3).
Questions must be practical and unambiguous. Reply with JSON only.`;

export const generateCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }) => {
    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured.");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 8192,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: `Skill: ${data.skill}\n\nReturn json with keys: title, category, summary, skills[], modules[{title, subject, learned, minutes, skills[], check:{q, options[4], answer_index, explanation}}], questions[{q, options[4], answer_index}].`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Too many requests right now — try again in a moment.");
      if (res.status === 401) throw new Error("The AI key is invalid — update ANTHROPIC_API_KEY.");
      if (res.status === 402 || res.status === 403) throw new Error("The AI account has no available credit or permission.");
      throw new Error(`Course generation failed (${res.status}). ${body.slice(0, 200)}`);
    }

    const payload = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const raw = payload.content?.find((b) => b.type === "text")?.text ?? "";
    const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    let loose: z.infer<typeof Loose>;
    try {
      loose = Loose.parse(JSON.parse(cleaned));
    } catch (err) {
      console.error("[course-gen] unparseable payload", cleaned.slice(0, 800));
      throw new Error("The generator returned an unexpected result. Try rephrasing the skill.");
    }

    const title = (str(loose.title) || `${data.skill} Professional Certification`).slice(0, 120);
    const category = (str(loose.category) || "Professional Skills").slice(0, 60);
    const summary =
      (str(loose.summary) || `A short, practical certification covering ${data.skill} for working professionals.`).slice(0, 600);
    const skills = strList(loose.skills, 12);

    const modulesRaw = Array.isArray(loose.modules) ? loose.modules.slice(0, 8) : [];
    const modules: CourseModule[] = [];
    const keys: Array<{ module_index: number; answer_index: number; explanation: string }> = [];
    modulesRaw.forEach((m: any, i: number) => {
      if (!m || typeof m !== "object") return;
      const check = toQuestion(m.check ?? m.knowledge_check ?? m.quiz);
      const mTitle = str(m.title ?? m.name) || `Module ${i + 1}`;
      const minutes = Math.min(20, Math.max(5, Number(m.minutes) || 12));
      const mod: CourseModule = {
        title: mTitle.slice(0, 120),
        subject: (str(m.subject) || mTitle).slice(0, 140),
        learned: (str(m.learned ?? m.outcome ?? m.description) || `Applied practice in ${mTitle.toLowerCase()}.`).slice(0, 600),
        minutes,
        skills: strList(m.skills, 4),
        check: check ? { q: check.q, options: check.options } : { q: "", options: [] },
      };
      modules.push(mod);
      if (check) {
        keys.push({
          module_index: modules.length - 1,
          answer_index: check.answer_index,
          explanation: str(m.check?.explanation ?? m.explanation).slice(0, 400),
        });
      }
    });

    const questions = (Array.isArray(loose.questions) ? loose.questions : [])
      .map(toQuestion)
      .filter(Boolean) as Array<{ q: string; options: string[]; answer_index: number }>;

    if (questions.length < 4) {
      console.error("[course-gen] too few usable questions", JSON.stringify(loose).slice(0, 800));
      throw new Error("The generator could not write a full exam. Try rephrasing the skill.");
    }
    const exam = questions.slice(0, 8);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const base = slugify(title) || slugify(data.skill) || "custom-certification";
    let slug = base;
    for (let i = 0; i < 6; i++) {
      const { data: existing } = await supabaseAdmin
        .from("certifications")
        .select("slug")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("certifications")
      .insert({
        slug,
        title,
        category,
        summary,
        skills,
        modules: modules as any,
        question_count: exam.length,
        pass_score: 70,
        questions: exam.map((q) => ({ q: q.q, options: q.options })),
        answer_keys: exam.map((q) => q.answer_index),
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    if (keys.length && inserted?.id) {
      await supabaseAdmin.from("module_keys").insert(
        keys.map((k) => ({ certification_id: inserted.id, ...k })),
      );
    }

    return { slug, title };
  });

const SaveInput = z.object({
  slug: z.string().min(1),
  title: z.string().min(3).max(120),
  category: z.string().min(2).max(60),
  summary: z.string().min(10).max(600),
  skills: z.array(z.string().min(1).max(60)).max(12),
  modules: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        subject: z.string().max(140),
        learned: z.string().max(600),
        minutes: z.number().int().min(5).max(30),
        skills: z.array(z.string().min(1).max(60)).max(6),
        check: z.object({ q: z.string().max(400), options: z.array(z.string().max(200)).max(4) }),
        answer_index: z.number().int().min(0).max(3),
        explanation: z.string().max(400),
      }),
    )
    .max(8),
});

export const saveCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => SaveInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: cert, error: findErr } = await supabaseAdmin
      .from("certifications")
      .select("id, created_by")
      .eq("slug", data.slug)
      .maybeSingle();
    if (findErr) throw new Error(findErr.message);
    if (!cert) throw new Error("Course not found.");
    if (cert.created_by !== context.userId) throw new Error("You can only edit courses you created.");

    const { error } = await supabaseAdmin
      .from("certifications")
      .update({
        title: data.title,
        category: data.category,
        summary: data.summary,
        skills: data.skills,
        modules: data.modules.map((m) => ({
          title: m.title,
          subject: m.subject,
          learned: m.learned,
          minutes: m.minutes,
          skills: m.skills,
          check: m.check,
        })) as any,
      })
      .eq("id", cert.id);
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("module_keys").delete().eq("certification_id", cert.id);
    const keys = data.modules
      .map((m, i) => ({
        certification_id: cert.id,
        module_index: i,
        answer_index: m.answer_index,
        explanation: m.explanation,
      }))
      .filter((_, i) => (data.modules[i]?.check.options.length ?? 0) >= 2);
    if (keys.length) await supabaseAdmin.from("module_keys").insert(keys);

    return { ok: true };
  });
