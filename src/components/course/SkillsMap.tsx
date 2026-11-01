export type CourseModuleView = {
  title: string;
  subject?: string;
  learned?: string;
  /** Full lesson text: paragraphs, "## " headings and "- " bullets. */
  body?: string;
  minutes?: number;
  skills?: string[];
  check?: { q?: string; options?: string[] };
};

export function normalizeModules(raw: unknown): CourseModuleView[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m) => m && typeof m === "object")
    .map((m: any) => ({
      title: String(m.title ?? "").trim() || "Module",
      subject: String(m.subject ?? "").trim(),
      learned: String(m.learned ?? "").trim(),
      body: typeof m.body === "string" ? m.body : "",
      minutes: Number(m.minutes) || 0,
      skills: Array.isArray(m.skills) ? m.skills.map((s: any) => String(s)).filter(Boolean) : [],
      check:
        m.check && Array.isArray(m.check.options)
          ? { q: String(m.check.q ?? ""), options: m.check.options.map((o: any) => String(o)) }
          : undefined,
    }));
}

/** Maps every lesson to the job-relevant skills it builds. */
export function SkillsMap({ modules, fallback = [] }: { modules: CourseModuleView[]; fallback?: string[] }) {
  const rows = modules.filter((m) => (m.skills?.length ?? 0) > 0);
  if (!rows.length && !fallback.length) return null;

  return (
    <section className="mt-10 rounded-xl border border-border bg-card p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">
        ◆ Skills covered
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        What each lesson teaches you to do.
      </p>

      {rows.length > 0 ? (
        <div className="mt-5 divide-y divide-border">
          {rows.map((m, i) => (
            <div key={i} className="grid gap-2 py-4 sm:grid-cols-[1fr_1.2fr] sm:gap-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Lesson {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-1 font-medium">{m.title}</div>
                {m.subject && <div className="text-xs text-muted-foreground">{m.subject}</div>}
              </div>
              <div className="flex flex-wrap items-start gap-1.5">
                {m.skills!.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-emerald-600/30 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {fallback.map((s) => (
            <span
              key={s}
              className="rounded-full border border-emerald-600/30 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
