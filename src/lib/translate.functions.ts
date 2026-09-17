import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LANGS = ["fr", "es", "pt", "ar"] as const;

const Input = z.object({
  slug: z.string().min(1).max(120),
  lang: z.enum(LANGS),
});

const LANG_NAMES: Record<(typeof LANGS)[number], string> = {
  fr: "French",
  es: "Spanish",
  pt: "European Portuguese",
  ar: "Modern Standard Arabic",
};

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
 * Translate a course (title, summary, skills, lessons and exam questions) into the
 * requested language. Answer positions are preserved, so grading is unaffected.
 * Results are cached per (course, language) — the AI runs at most once per pair.
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

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return null;

    const modules = Array.isArray(course.modules) ? (course.modules as any[]) : [];
    const questions = Array.isArray(course.questions) ? (course.questions as any[]) : [];

    const source = {
      title: course.title,
      summary: course.summary ?? "",
      skills: Array.isArray(course.skills) ? course.skills : [],
      modules: modules.map((m) => ({
        title: str(m?.title),
        subject: str(m?.subject),
        learned: str(m?.learned),
        check: { q: str(m?.check?.q), options: list(m?.check?.options) },
      })),
      questions: questions.map((q) => ({ q: str(q?.q), options: list(q?.options) })),
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        reasoning_effort: "low",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              `You are a professional certification translator. Translate every human-readable string into ${LANG_NAMES[data.lang]}. ` +
              `Keep the exact same json structure, the same array lengths and the same order of options — the order encodes the correct answer. ` +
              `Do not translate brand names (CERTIGO, LinkedIn) or well-established English technical acronyms. Reply with json only.`,
          },
          { role: "user", content: JSON.stringify(source) },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Too many translation requests right now — try again in a moment.");
      if (res.status === 402 || res.status === 403) throw new Error("AI credits are exhausted, so this course cannot be translated yet.");
      throw new Error(`Translation failed (${res.status}). ${body.slice(0, 160)}`);
    }

    const payload = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = (payload.choices?.[0]?.message?.content ?? "").trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("The translation came back in an unexpected format.");
    }

    // Rebuild against the source so lengths and option order can never drift.
    const out: CourseTranslation = {
      title: str(parsed?.title) || source.title,
      summary: str(parsed?.summary) || source.summary,
      skills: source.skills.map((s: string, i: number) => str(parsed?.skills?.[i]) || s),
      modules: source.modules.map((m, i) => {
        const tm = parsed?.modules?.[i] ?? {};
        return {
          title: str(tm.title) || m.title,
          subject: str(tm.subject) || m.subject,
          learned: str(tm.learned) || m.learned,
          check: {
            q: str(tm?.check?.q) || m.check.q,
            options: m.check.options.map((o, j) => str(tm?.check?.options?.[j]) || o),
          },
        };
      }),
      questions: source.questions.map((q, i) => {
        const tq = parsed?.questions?.[i] ?? {};
        return {
          q: str(tq.q) || q.q,
          options: q.options.map((o, j) => str(tq?.options?.[j]) || o),
        };
      }),
    };

    await supabaseAdmin
      .from("course_translations")
      .upsert(
        { certification_id: course.id, lang: data.lang, payload: out as any },
        { onConflict: "certification_id,lang" },
      );

    return out;
  });
