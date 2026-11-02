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
  content: {
    introduction: string;
    objectives: string[];
    sections: Array<{ heading: string; body: string; example: string }>;
    case_study: string;
    exercise: string;
    takeaways: string[];
  };
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

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function lessonQualityIssues(module: CourseModule, index: number): string[] {
  const prefix = `Lesson ${index + 1}`;
  const issues: string[] = [];
  const content = module.content;
  if (wordCount(content.introduction) < 60) issues.push(`${prefix}: introduction is too short`);
  if (content.objectives.length < 3) issues.push(`${prefix}: needs at least 3 measurable objectives`);
  if (content.sections.length < 3) issues.push(`${prefix}: needs at least 3 teaching sections`);
  content.sections.forEach((section, sectionIndex) => {
    if (wordCount(section.body) < 55) issues.push(`${prefix}, section ${sectionIndex + 1}: explanation is too short`);
    if (wordCount(section.example) < 12) issues.push(`${prefix}, section ${sectionIndex + 1}: workplace example is too short`);
  });
  if (wordCount(content.case_study) < 45) issues.push(`${prefix}: case study needs more workplace detail`);
  if (wordCount(content.exercise) < 25) issues.push(`${prefix}: practical exercise needs clear steps and an output`);
  if (content.takeaways.length < 3) issues.push(`${prefix}: needs at least 3 actionable takeaways`);
  if (!module.check.q || module.check.options.length !== 4 || new Set(module.check.options.map((x) => x.toLowerCase())).size !== 4) {
    issues.push(`${prefix}: knowledge check must have a question and 4 distinct options`);
  }
  return issues;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const SYSTEM = `You are a senior instructional designer and subject-matter expert creating rigorous, job-relevant professional certifications for CERTIGO.

DESIGN THE COURSE
- Interpret the requested skill as a real occupational capability, not a broad encyclopedia topic.
- Define a coherent progression from foundational understanding to applied judgement and execution.
- Create 4-8 distinct lessons. Each lesson must teach a different capability; do not repeat the same advice under different titles.
- State the intended professional audience and practical work context in the course summary.
- Use clear international English. Explain technical terms on first use. Avoid motivational filler, vague claims, and generic statements.

LESSON QUALITY STANDARD — EVERY LESSON MUST INCLUDE
1. title: specific capability-led title.
2. subject: the precise concept or work process taught.
3. learned: 2-3 concrete sentences describing what the learner will know and be able to do.
4. minutes: realistic focused study time, normally 8-15.
5. skills: 2-4 observable job skills.
6. content:
   - introduction: 80-130 words. Explain the business/work relevance and connect to prior knowledge.
   - objectives: 3-5 measurable outcomes beginning with action verbs (e.g. calculate, diagnose, compare, apply, recommend).
   - sections: 3-5 substantial sections. Each body should be 90-150 words, explain one concept or method, and include a practical example of at least 25 words. Do not pad with repetition.
   - case_study: at least 70 words. Include a plausible workplace situation, relevant facts or constraints, a decision the learner must make, and the rationale for a strong response.
   - exercise: at least 40 words. Give a task with clear inputs, steps, and a tangible output the learner can produce at work.
   - takeaways: 3-5 concise, actionable points.
7. check: one applied question with exactly 4 plausible, distinct options, one defensible correct answer, answer_index (0-3), and an explanation that teaches why the answer is correct and why the tempting alternative is weaker.

ASSESSMENT DESIGN
- Final exam: exactly 8 questions, mapped across the course outcomes and lessons.
- Prefer realistic decisions, diagnosis, calculations, prioritisation, and application over trivia or definition recall.
- Distractors must be plausible and reflect common professional mistakes. Avoid joke answers, overlapping options, "all/none of the above", and clues from option length.
- Do not repeat a lesson knowledge-check question in the final exam.
- Never invent laws, standards, statistics, citations, or country-specific requirements. If the skill requires jurisdiction-specific or time-sensitive facts and no verified source material is provided, clearly qualify the content and teach the general principle instead.
- Use realistic examples with explicit assumptions. Do not present invented scenarios or illustrative figures as real facts.
- Be precise, practical, internally consistent, and suitable for adult professionals. Do not claim the credential guarantees employment, legal compliance, or a specific business result.

OUTPUT
Return valid JSON only. Follow the requested field names and content structure exactly. Do not include markdown fences or commentary.`;

export const generateCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Skill: ${data.skill}\n\nReturn json with keys: title, category, summary, skills[], modules[{title, subject, learned, minutes, skills[], content:{introduction, objectives[], sections:[{heading,body,example}], case_study, exercise, takeaways[]}, check:{q, options[4], answer_index, explanation}}], questions[{q, options[4], answer_index}].`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Too many requests right now — try again in a moment.");
      if (res.status === 402) throw new Error("AI credits are exhausted — top up to keep generating courses.");
      if (res.status === 401 || res.status === 403) throw new Error("AI access was refused. Please try again later.");
      throw new Error(`Course generation failed (${res.status}). ${body.slice(0, 200)}`);
    }

    const payload = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = payload.choices?.[0]?.message?.content ?? "";
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
        content: {
          introduction: str(m.content?.introduction).slice(0, 3000),
          objectives: strList(m.content?.objectives, 6).map((x) => x.slice(0, 240)),
          sections: (Array.isArray(m.content?.sections) ? m.content.sections : []).slice(0, 6).map((section: any) => ({
            heading: str(section?.heading).slice(0, 140),
            body: str(section?.body).slice(0, 2400),
            example: str(section?.example).slice(0, 1000),
          })).filter((section: any) => section.heading || section.body),
          case_study: str(m.content?.case_study).slice(0, 2400),
          exercise: str(m.content?.exercise).slice(0, 1600),
          takeaways: strList(m.content?.takeaways, 6).map((x) => x.slice(0, 240)),
        },
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

    const lessonIssues = modules.flatMap((module, index) => lessonQualityIssues(module, index));
    if (modules.length < 4 || lessonIssues.length > 0) {
      console.error("[course-gen] lesson quality gate failed", lessonIssues.slice(0, 30));
      throw new Error(
        modules.length < 4
          ? "The generator returned fewer than 4 usable lessons. Please try generating again."
          : "The generated lessons did not meet the content-quality standard. Please generate again; no incomplete course was published.",
      );
    }

    const questions = (Array.isArray(loose.questions) ? loose.questions : [])
      .map(toQuestion)
      .filter(Boolean) as Array<{ q: string; options: string[]; answer_index: number }>;

    const exam = questions.slice(0, 8);
    const weakExamItems = exam.filter((q) =>
      q.options.length !== 4 || new Set(q.options.map((option) => option.toLowerCase())).size !== 4,
    );
    if (exam.length !== 8 || weakExamItems.length > 0) {
      console.error("[course-gen] final exam quality gate failed", {
        questionCount: exam.length,
        weakItems: weakExamItems.length,
      });
      throw new Error("The generator must produce 8 exam questions, each with 4 distinct options. Please generate again.");
    }

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
      const { error: keyInsertError } = await supabaseAdmin.from("module_keys").insert(
        keys.map((k) => ({ certification_id: inserted.id, ...k })),
      );
      if (keyInsertError) {
        await supabaseAdmin.from("certifications").delete().eq("id", inserted.id);
        throw new Error("Could not securely save lesson assessment keys. The generated course was rolled back.");
      }
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
        content: z.object({
          introduction: z.string().max(3000),
          objectives: z.array(z.string().max(240)).max(6),
          sections: z.array(z.object({
            heading: z.string().max(140),
            body: z.string().max(2400),
            example: z.string().max(1000),
          })).max(6),
          case_study: z.string().max(2400),
          exercise: z.string().max(1600),
          takeaways: z.array(z.string().max(240)).max(6),
        }),
        check: z.object({ q: z.string().min(10).max(400), options: z.array(z.string().min(1).max(200)).length(4) }),
        answer_index: z.number().int().min(0).max(3),
        explanation: z.string().max(400),
      }),
    )
    .min(4)
    .max(8),
}).superRefine((data, ctx) => {
  data.modules.forEach((module, index) => {
    const path = ["modules", index, "content"] as (string | number)[];
    if (wordCount(module.content.introduction) < 60) {
      ctx.addIssue({ code: "custom", path: [...path, "introduction"], message: "Write an introduction of at least 60 words." });
    }
    if (module.content.objectives.length < 3) {
      ctx.addIssue({ code: "custom", path: [...path, "objectives"], message: "Add at least 3 measurable learning objectives." });
    }
    if (module.content.sections.length < 3 || module.content.sections.some((section) => wordCount(section.body) < 55 || wordCount(section.example) < 12)) {
      ctx.addIssue({ code: "custom", path: [...path, "sections"], message: "Add at least 3 substantial teaching sections with practical examples." });
    }
    if (wordCount(module.content.case_study) < 45) {
      ctx.addIssue({ code: "custom", path: [...path, "case_study"], message: "Add a realistic workplace case study." });
    }
    if (wordCount(module.content.exercise) < 25) {
      ctx.addIssue({ code: "custom", path: [...path, "exercise"], message: "Add a practical exercise with clear steps and an output." });
    }
    if (module.content.takeaways.length < 3) {
      ctx.addIssue({ code: "custom", path: [...path, "takeaways"], message: "Add at least 3 actionable takeaways." });
    }
    if (new Set(module.check.options.map((option) => option.toLowerCase())).size !== 4) {
      ctx.addIssue({ code: "custom", path: ["modules", index, "check", "options"], message: "Knowledge-check options must be distinct." });
    }
  });
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
          content: m.content,
          check: m.check,
        })) as any,
      })
      .eq("id", cert.id);
    if (error) throw new Error(error.message);

    const { error: deleteKeysError } = await supabaseAdmin.from("module_keys").delete().eq("certification_id", cert.id);
    if (deleteKeysError) throw new Error("Course content was updated, but lesson keys could not be refreshed. Contact support before learners attempt the checks.");
    const keys = data.modules
      .map((m, i) => ({
        certification_id: cert.id,
        module_index: i,
        answer_index: m.answer_index,
        explanation: m.explanation,
      }))
      .filter((_, i) => (data.modules[i]?.check.options.length ?? 0) >= 2);
    if (keys.length) {
      const { error: insertKeysError } = await supabaseAdmin.from("module_keys").insert(keys);
      if (insertKeysError) throw new Error("Course content was saved, but lesson answer keys could not be saved. Do not publish this course until corrected.");
    }

    return { ok: true };
  });


const BuilderInput = z.object({ slug: z.string().min(1).max(100) });

/** Returns private lesson answer keys only to the course creator. */
export const getCourseForBuilder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => BuilderInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cert, error } = await supabaseAdmin
      .from("certifications")
      .select("id, slug, title, category, summary, skills, modules, created_by")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!cert) throw new Error("Course not found.");
    if (cert.created_by !== context.userId) throw new Error("You can only edit courses you created.");

    const { data: keys, error: keyError } = await supabaseAdmin
      .from("module_keys")
      .select("module_index, answer_index, explanation")
      .eq("certification_id", cert.id);
    if (keyError) throw new Error(keyError.message);

    return {
      title: cert.title,
      category: cert.category,
      summary: cert.summary,
      skills: cert.skills ?? [],
      modules: (Array.isArray(cert.modules) ? cert.modules : []).map((raw: any, index: number) => {
        const key = (keys ?? []).find((item: any) => item.module_index === index);
        return {
          ...raw,
          answer_index: key?.answer_index ?? 0,
          explanation: key?.explanation ?? "",
        };
      }),
    };
  });
