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

/** Free Google Translate endpoint (no key, no AI credits). */
async function gtranslate(text: string, target: string): Promise<string> {
  if (!text.trim()) return text;
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=en&tl=" +
    encodeURIComponent(target) +
    "&q=" +
    encodeURIComponent(text);
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Translation service returned ${res.status}.`);
  const json = (await res.json()) as unknown;
  const chunks = Array.isArray(json) && Array.isArray((json as any[])[0]) ? ((json as any[])[0] as any[]) : [];
  const out = chunks.map((c) => (Array.isArray(c) ? str(c[0]) : "")).join("");
  return out.trim() || text;
}

/** Translate many strings with limited concurrency; falls back to the source on failure. */
async function translateAll(texts: string[], target: string): Promise<string[]> {
  const out = new Array<string>(texts.length);
  let cursor = 0;
  const workers = Array.from({ length: 6 }, async () => {
    while (cursor < texts.length) {
      const i = cursor++;
      try {
        out[i] = await gtranslate(texts[i], target);
      } catch {
        out[i] = texts[i];
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
