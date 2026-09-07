import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({ skill: z.string().min(2).max(120) });

const Generated = z.object({
  title: z.string().min(4).max(90),
  category: z.string().min(2).max(60),
  summary: z.string().min(20).max(320),
  skills: z.array(z.string().min(2).max(48)).min(4).max(8),
  questions: z
    .array(
      z.object({
        q: z.string().min(8),
        options: z.array(z.string().min(1)).length(4),
        answer_index: z.number().int().min(0).max(3),
      }),
    )
    .length(8),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const SYSTEM = `You design short professional certification exams for CERTIGO., a credential platform.
Given a skill, produce a certification with a crisp professional title (no quotes, no "CERTIGO" in it),
a category, a one-paragraph summary, 4-8 real-world skills covered, and exactly 8 multiple-choice
questions with 4 options each and the index of the single correct answer. Questions must be practical,
unambiguous, and answerable by an experienced practitioner. Reply with JSON only.`;

export const generateCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Skill: ${data.skill}\n\nReturn json with keys: title, category, summary, skills[], questions[{q, options[4], answer_index}] (exactly 8 questions).`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Too many requests right now — try again in a moment.");
      if (res.status === 402) throw new Error("AI credits are exhausted for this workspace.");
      throw new Error(`Course generation failed (${res.status}). ${body.slice(0, 200)}`);
    }

    const payload = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    let parsed: z.infer<typeof Generated>;
    try {
      parsed = Generated.parse(JSON.parse(cleaned));
    } catch {
      throw new Error("The generator returned an unexpected result. Try rephrasing the skill.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const base = slugify(parsed.title) || slugify(data.skill) || "custom-certification";
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

    const { error } = await supabaseAdmin.from("certifications").insert({
      slug,
      title: parsed.title,
      category: parsed.category,
      summary: parsed.summary,
      skills: parsed.skills,
      question_count: 8,
      pass_score: 70,
      questions: parsed.questions.map((q) => ({ q: q.q, options: q.options })),
      answer_keys: parsed.questions.map((q) => q.answer_index),
    });
    if (error) throw new Error(error.message);

    return { slug, title: parsed.title };
  });
