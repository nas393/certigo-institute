/**
 * Full lesson texts, one JSON file per course slug (lessons are free and public).
 * Exam questions and answers are NOT here: they live only in the database.
 */
export interface LessonPack { slug: string; minutes: number[]; bodies: string[] }

const packs = import.meta.glob<{ default: LessonPack }>("./*.json");

export async function loadLessonPack(slug: string): Promise<LessonPack | null> {
  const load = packs[`./${slug}.json`];
  if (!load) return null;
  try { return (await load()).default; } catch { return null; }
}
