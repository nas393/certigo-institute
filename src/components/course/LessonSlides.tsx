import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLessonLabels } from "@/lib/lesson-i18n";

export interface Slide { title: string; points: string[]; takeaway?: string }

/** A short slide deck that summarises a lesson. Arrow keys, swipe or buttons to move. */
export function LessonSlides({ slides, lessonTitle }: { slides: Slide[]; lessonTitle: string }) {
  const L = useLessonLabels();
  const [i, setI] = useState(0);
  const startX = useRef<number | null>(null);
  if (!slides.length) return null;
  const s = slides[i];
  const go = (d: number) => setI((n) => Math.min(slides.length - 1, Math.max(0, n + d)));

  return (
    <div
      role="region" aria-roledescription="slideshow" aria-label={`Slides: ${lessonTitle}`} tabIndex={0}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }}
      onPointerDown={(e) => { startX.current = e.clientX; }}
      onPointerUp={(e) => { if (startX.current !== null) { const dx = e.clientX - startX.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); } startX.current = null; }}
      className="mt-4 select-none rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
    >
      <div className="relative flex min-h-[260px] flex-col overflow-hidden rounded-xl bg-[#0B1B3A] p-6 text-white sm:aspect-[16/9] sm:min-h-0 sm:p-9">
        <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">{lessonTitle} · {i + 1}/{slides.length}</div>
        <h4 className="mt-3 font-display text-xl font-extrabold leading-tight tracking-tight sm:text-3xl" aria-live="polite">{s.title}</h4>
        <ul className="mt-4 space-y-2 text-[13.5px] leading-snug text-white/85 sm:text-base">
          {s.points.map((p, k) => (
            <li key={k} className="flex gap-2"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />{p}</li>
          ))}
        </ul>
        {s.takeaway && (
          <div className="mt-auto rounded-lg bg-white/10 px-3 py-2 text-[12.5px] font-medium text-emerald-200 sm:text-sm">{L.keyPoint}: {s.takeaway}</div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <button onClick={() => go(-1)} disabled={i === 0} aria-label="Previous slide"
          className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> {L.back}</button>
        <div className="flex gap-1.5" aria-hidden>
          {slides.map((_, k) => (
            <button key={k} onClick={() => setI(k)} tabIndex={-1} className={"h-1.5 rounded-full transition-all " + (k === i ? "w-5 bg-emerald-600" : "w-1.5 bg-muted-foreground/30")} />
          ))}
        </div>
        <button onClick={() => go(1)} disabled={i === slides.length - 1} aria-label="Next slide"
          className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm disabled:opacity-40">{L.next} <ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
