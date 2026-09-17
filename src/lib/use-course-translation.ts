import { useEffect, useState } from "react";
import { translateCourse, type CourseTranslation } from "@/lib/translate.functions";
import { useI18n } from "@/lib/i18n";

const memory = new Map<string, CourseTranslation>();

/**
 * Loads (and, the first time, generates) the translation of a course for the
 * currently selected language. English returns null — it is the source text.
 */
export function useCourseTranslation(slug?: string) {
  const { lang } = useI18n();
  const [translation, setTranslation] = useState<CourseTranslation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug || lang === "en") { setTranslation(null); setLoading(false); return; }
    const key = `${slug}:${lang}`;
    const hit = memory.get(key);
    if (hit) { setTranslation(hit); setLoading(false); return; }

    let alive = true;
    setLoading(true);
    setTranslation(null);
    translateCourse({ data: { slug, lang } })
      .then((res) => {
        if (!alive) return;
        if (res) { memory.set(key, res); setTranslation(res); }
      })
      .catch(() => { /* fall back to English silently */ })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [slug, lang]);

  return { translation, loading };
}
