import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PortalCourse = {
  id: string;
  slug: string;
  title: string;
  category: string;
  price_cents: number;
  pass_score: number;
  lessons: number;
  lessonsDone: number;
  nextLesson: number;
  attempts: number;
  bestScore: number;
  passed: boolean;
  serial: string | null;
};

/** Percent complete: lessons checked off plus the exam as the final step. */
export function courseProgress(c: Pick<PortalCourse, "lessons" | "lessonsDone" | "passed">): number {
  const steps = c.lessons + 1;
  const done = Math.min(c.lessonsDone, c.lessons) + (c.passed ? 1 : 0);
  return Math.round((done / steps) * 100);
}

export function usePortalCourses(userId: string | undefined) {
  const [courses, setCourses] = useState<PortalCourse[] | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const [enr, prog, att, certs] = await Promise.all([
      supabase.from("enrollments").select("certification_id, created_at, certifications(id, slug, title, category, price_cents, pass_score, modules)").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("lesson_progress").select("certification_id, module_index, correct").eq("user_id", userId),
      supabase.from("attempts").select("certification_id, score, passed").eq("user_id", userId),
      supabase.from("certificates").select("certification_id, serial").eq("user_id", userId),
    ]);

    const rows = (enr.data ?? []).map((e: any) => {
      const cf = e.certifications ?? {};
      const lessons = Array.isArray(cf.modules) ? cf.modules.length : 0;
      const doneIndexes = new Set(
        (prog.data ?? []).filter((p: any) => p.certification_id === e.certification_id && p.correct).map((p: any) => p.module_index),
      );
      const done = doneIndexes.size;
      const nextLesson = Array.from({ length: lessons }, (_, i) => i).find((i) => !doneIndexes.has(i));
      const resumeLesson = nextLesson === undefined ? Math.max(1, lessons) : nextLesson + 1;
      const mine = (att.data ?? []).filter((a: any) => a.certification_id === e.certification_id);
      return {
        id: cf.id,
        slug: cf.slug,
        title: cf.title,
        category: cf.category,
        price_cents: cf.price_cents ?? 0,
        pass_score: cf.pass_score ?? 70,
        lessons,
        lessonsDone: done,
        nextLesson: resumeLesson,
        attempts: mine.length,
        bestScore: mine.reduce((m: number, a: any) => Math.max(m, a.score ?? 0), 0),
        passed: mine.some((a: any) => a.passed),
        serial: (certs.data ?? []).find((c: any) => c.certification_id === e.certification_id)?.serial ?? null,
      } as PortalCourse;
    }).filter((c) => !!c.id);

    setCourses(rows);
  }, [userId]);

  useEffect(() => { void load(); }, [load]);
  return { courses, reload: load };
}

