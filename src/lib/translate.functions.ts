import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LANGS = ["fr", "es", "pt", "ar"] as const;

const Input = z.object({
  slug: z.string().min(1).max(120),
  lang: z.enum(LANGS),
});

export interface CourseTranslation {
  title: string;
  summary: string;
  skills: string[];
  modules: Array<{ title: string; subject: string; learned: string; check: { q: string; options: string[] } }>;
  questions: Array<{ q: string; options: string[] }>;
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v.trim() : fallback;
}
function list(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean) : [];
}

/**
 * Free Google Translate endpoint (no key, no AI credits). Accepts a batch of
 * strings and returns one translation per input, in the same order.
 */
async function gtranslateBatch(texts: string[], target: string): Promise<string[]> {
  const params = new URLSearchParams({ client: "dict-chrome-ex", sl: "en", tl: target });
  for (const t of texts) params.append("q", t);
  const res = await fetch(`https://clients5.google.com/translate_a/t?${params.toString()}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`Translation service returned ${res.status}.`);
  const json = (await res.json()) as unknown;
  const arr = Array.isArray(json) ? (json as unknown[]) : [];
  const flat = arr.map((v) => (Array.isArray(v) ? str(v[0]) : str(v)));
  if (flat.length !== texts.length) throw new Error("Unexpected translation response.");
  return flat.map((v, i) => v || texts[i]);
}

/** Translate many strings in small batches; falls back to the source text on failure. */
async function translateAll(texts: string[], target: string): Promise<string[]> {
  const out = [...texts];
  const indexes = texts.map((t, i) => i).filter((i) => texts[i].trim().length > 0);

  // Group into batches that stay well inside URL length limits.
  const batches: number[][] = [];
  let current: number[] = [];
  let size = 0;
  for (const i of indexes) {
    const len = texts[i].length * 3 + 8;
    if (current.length >= 20 || size + len > 1600) {
      if (current.length) batches.push(current);
      current = [];
      size = 0;
    }
    current.push(i);
    size += len;
  }
  if (current.length) batches.push(current);

  let cursor = 0;
  const workers = Array.from({ length: 4 }, async () => {
    while (cursor < batches.length) {
      const batch = batches[cursor++];
      try {
        const res = await gtranslateBatch(batch.map((i) => texts[i]), target);
        batch.forEach((i, j) => { out[i] = res[j]; });
      } catch {
        // Retry one string at a time so a single bad phrase can't drop the batch.
        for (const i of batch) {
          try {
            const [one] = await gtranslateBatch([texts[i]], target);
            out[i] = one;
          } catch {
            out[i] = texts[i];
          }
        }
      }
    }
  });
  await Promise.all(workers);
  return out;
}

/**
 * Translate a course (title, summary, skills, lessons and exam questions) into the
 * requested language using the free Google Translate service — no AI credits used.
 * Answer positions are preserved, so grading is unaffected. Results are cached per
 * (course, language), so each pair is translated at most once.
 */
export const translateCourse = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }): Promise<CourseTranslation | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: course } = await supabaseAdmin
      .from("certifications")
      .select("id, title, summary, skills, modules, questions")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!course) return null;

    const { data: cached } = await supabaseAdmin
      .from("course_translations")
      .select("payload")
      .eq("certification_id", course.id)
      .eq("lang", data.lang)
      .maybeSingle();
    if (cached?.payload) return cached.payload as unknown as CourseTranslation;

    const modules = Array.isArray(course.modules) ? (course.modules as any[]) : [];
    const questions = Array.isArray(course.questions) ? (course.questions as any[]) : [];

    const source = {
      title: str(course.title),
      summary: str(course.summary),
      skills: Array.isArray(course.skills) ? (course.skills as string[]).map((s) => str(s)) : [],
      modules: modules.map((m) => ({
        title: str(m?.title),
        subject: str(m?.subject),
        learned: str(m?.learned),
        check: { q: str(m?.check?.q), options: list(m?.check?.options) },
      })),
      questions: questions.map((q) => ({ q: str(q?.q), options: list(q?.options) })),
    };

    // Flatten every string into one ordered list, translate, then rebuild in place so
    // array lengths and option order can never drift.
    const flat: string[] = [source.title, source.summary, ...source.skills];
    for (const m of source.modules) flat.push(m.title, m.subject, m.learned, m.check.q, ...m.check.options);
    for (const q of source.questions) flat.push(q.q, ...q.options);

    const translated = await translateAll(flat, data.lang);

    let k = 0;
    const next = () => translated[k++] ?? "";
    const out: CourseTranslation = {
      title: next() || source.title,
      summary: next() || source.summary,
      skills: source.skills.map((s) => next() || s),
      modules: source.modules.map((m) => ({
        title: next() || m.title,
        subject: next() || m.subject,
        learned: next() || m.learned,
        check: { q: next() || m.check.q, options: m.check.options.map((o) => next() || o) },
      })),
      questions: source.questions.map((q) => ({
        q: next() || q.q,
        options: q.options.map((o) => next() || o),
      })),
    };

    await supabaseAdmin
      .from("course_translations")
      .upsert(
        { certification_id: course.id, lang: data.lang, payload: out as any },
        { onConflict: "certification_id,lang" },
      );

    return out;
  });
