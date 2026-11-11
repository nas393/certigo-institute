/**
 * Full lesson texts, one JSON file per course slug (lessons are free and public).
 * Exam questions and answers are NOT here: they live only in the database.
 */
import type { Slide } from "@/components/course/LessonSlides";

export interface LessonPack { slug: string; minutes: number[]; bodies: string[]; slides?: Slide[][] }

const packs = import.meta.glob<{ default: LessonPack }>(["./*.json", "./pt/*.json"]);

/** Loads the lesson pack in the requested language, falling back to English. */
export async function loadLessonPack(slug: string, lang = "en"): Promise<LessonPack | null> {
  const load = (lang === "pt" && packs[`./pt/${slug}.json`]) || packs[`./${slug}.json`];
  if (!load) return null;
  try { return (await load()).default; } catch { return null; }
}

export const hasLessonPack = (slug: string, lang: string) => lang === "en" || !!packs[`./${lang}/${slug}.json`];
