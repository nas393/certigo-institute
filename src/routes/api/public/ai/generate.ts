import { createFileRoute } from "@tanstack/react-router";

interface Body { topic: string; level?: string; duration?: string; language?: string; }

export const Route = createFileRoute("/api/public/ai/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          console.error("[ai/generate] missing LOVABLE_API_KEY");
          return new Response(JSON.stringify({ error: "missing key" }), { status: 500 });
        }
        const body = (await request.json()) as Body;
        if (!body?.topic || body.topic.length > 200) return new Response(JSON.stringify({ error: "bad topic" }), { status: 400 });

        const sys = `You are an expert curriculum designer. Output strictly valid JSON, no prose.`;
        const prompt = `Build a focused micro-course on "${body.topic}". Level: ${body.level || "intermediate"}. Duration: ${body.duration || "30 min"}. Language: ${body.language || "en"}.
Return JSON shaped exactly:
{
  "title": "...",
  "summary": "1-2 sentence overview",
  "modules": [
    { "title": "...", "lessons": [ { "title": "...", "content": "200-400 words of clear teaching markdown with headings, bullets, and concrete examples" } ] }
  ],
  "quiz": [
    { "question": "...", "options": ["a","b","c","d"], "correctIndex": 0, "explanation": "..." }
  ]
}
Rules: 3 modules, 2 lessons each, 6-8 quiz questions, write in ${body.language || "en"}.`;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: sys },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        });
        if (!res.ok) {
          const txt = await res.text();
          console.error("[ai/generate] gateway error", res.status, txt.slice(0, 500));
          return new Response(JSON.stringify({ error: "AI error", detail: txt }), { status: 502 });
        }
        const data = await res.json() as any;
        const content = data?.choices?.[0]?.message?.content;
        let parsed: any;
        try { parsed = typeof content === "string" ? JSON.parse(content) : content; }
        catch (e) {
          console.error("[ai/generate] bad JSON", String(content).slice(0, 500));
          return new Response(JSON.stringify({ error: "bad JSON" }), { status: 502 });
        }
        return Response.json({ outline: parsed });
      },
    },
  },
});
