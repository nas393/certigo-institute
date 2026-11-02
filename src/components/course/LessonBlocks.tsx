import { useState } from "react";
import { Check, Lightbulb, X } from "lucide-react";
import { LessonSlides, type Slide } from "@/components/course/LessonSlides";

/**
 * Renders a lesson body: paragraphs, "## " headings, "- " lists, and interactive blocks
 *   ::: terms | slides | diagram steps|matrix|pyramid|cycle | case | quiz | tip
 * (block syntax documented in content/HELPER_BRIEF.md).
 */
export function LessonBody({ text }: { text: string }) {
  const parts = parse(text);
  return (
    <div className="min-w-0 space-y-4 text-[15px] leading-relaxed text-foreground/90 [overflow-wrap:anywhere]">
      {parts.map((p, i) => <Part key={i} p={p} index={i} />)}
    </div>
  );
}

type PartT =
  | { kind: "h"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "block"; type: string; args: string[]; lines: string[] };

function parse(text: string): PartT[] {
  const out: PartT[] = [];
  const lines = text.replace(/\r/g, "").split("\n");
  let buf: string[] = [];
  const flush = () => {
    const ls = buf.map((l) => l.trim()).filter(Boolean);
    buf = [];
    if (!ls.length) return;
    if (ls[0].startsWith("## ")) { out.push({ kind: "h", text: ls[0].slice(3) }); ls.shift(); if (!ls.length) return; }
    if (ls.every((l) => l.startsWith("- "))) out.push({ kind: "ul", items: ls.map((l) => l.slice(2)) });
    else out.push({ kind: "p", text: ls.join(" ") });
  };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l.startsWith(":::") && l.length > 3) {
      flush();
      const [head, ...args] = l.slice(3).trim().split("|").map((s) => s.trim());
      const [type, sub] = head.split(/\s+/);
      const body: string[] = [];
      for (i++; i < lines.length && lines[i].trim() !== ":::"; i++) if (lines[i].trim()) body.push(lines[i].trim());
      out.push({ kind: "block", type: sub ? `${type}:${sub}` : type, args, lines: body });
    } else if (l === "") flush();
    else buf.push(lines[i]);
  }
  flush();
  return out;
}

const kv = (l: string) => { const k = l.indexOf(":"); return k > 0 ? [l.slice(0, k).trim(), l.slice(k + 1).trim()] : [l, ""]; };

function Part({ p, index }: { p: PartT; index: number }) {
  if (p.kind === "h") return <h3 className="pt-3 font-display text-lg font-extrabold tracking-tight">{p.text}</h3>;
  if (p.kind === "p") return <p>{p.text}</p>;
  if (p.kind === "ul") return <ul className="list-disc space-y-1.5 pl-5">{p.items.map((it, j) => <li key={j}>{it}</li>)}</ul>;
  const { type, args, lines } = p;
  if (type === "terms") return <Terms items={lines.map(kv)} />;
  if (type === "slides") return <LessonSlides lessonTitle="Walkthrough" slides={lines.filter((l) => l.startsWith("SLIDE ")).map(toSlide)} />;
  if (type.startsWith("diagram:")) return <Diagram kind={type.split(":")[1]} title={args[0] ?? ""} axes={[args[1], args[2]]} items={lines.map(kv)} />;
  if (type === "case") return <Choice title={args[0] ?? "Case"} lines={lines} isCase id={index} />;
  if (type === "quiz") return <Choice title="Quick check" lines={lines} id={index} />;
  if (type === "tip") return (
    <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-950">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <div><div className="font-semibold">{args[0] ?? "Tip"}</div><div className="mt-0.5">{lines.join(" ")}</div></div>
    </div>
  );
  return null;
}

function toSlide(l: string): Slide {
  const [t, pts = "", tk] = l.slice(6).split("|").map((s) => s.trim());
  return { title: t, points: pts.split(";").map((s) => s.trim()).filter(Boolean), takeaway: tk || undefined };
}

/** Flip cards for key terms: tap to reveal the definition. */
function Terms({ items }: { items: string[][] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <div>
      <div className="mb-2 text-xs text-muted-foreground">Tap a card to see the definition.</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(([term, def], i) => (
          <button key={i} onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))} aria-expanded={!!open[i]}
            className={"min-h-[84px] rounded-xl border p-4 text-left transition " + (open[i] ? "border-emerald-600/40 bg-emerald-50" : "border-border bg-card hover:border-emerald-600/40")}>
            <div className="font-semibold">{term}</div>
            {open[i] ? <div className="mt-1 text-sm text-foreground/80">{def}</div> : <div className="mt-1 text-xs text-muted-foreground">Tap to reveal</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Case decision or quick quiz: pick an option, see feedback for that option. */
function Choice({ title, lines, isCase = false, id }: { title: string; lines: string[]; isCase?: boolean; id: number }) {
  const [picked, setPicked] = useState<number | null>(null);
  const story = lines.filter((l) => !/^[?*-]\s/.test(l));
  const question = lines.find((l) => l.startsWith("? "))?.slice(2) ?? "";
  const opts = lines.filter((l) => /^[*-]\s/.test(l)).map((l) => {
    const [text, fb = ""] = l.slice(2).split("||").map((s) => s.trim());
    return { text, fb, right: l.startsWith("*") };
  });
  return (
    <div className={"rounded-xl border p-5 " + (isCase ? "border-[#0B1B3A]/20 bg-[#0B1B3A]/[0.03]" : "border-dashed border-emerald-600/40")}>
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-700">{isCase ? `Case · ${title}` : title}</div>
      {story.length > 0 && <p className="mt-2 text-[14.5px]">{story.join(" ")}</p>}
      <div className="mt-3 font-semibold">{question}</div>
      <div className="mt-3 space-y-2" role="radiogroup" aria-label={question}>
        {opts.map((o, j) => {
          const chosen = picked === j;
          const show = picked !== null && (chosen || o.right);
          return (
            <div key={j}>
              <button role="radio" aria-checked={chosen} onClick={() => setPicked(j)} name={`c${id}`}
                className={"w-full rounded-lg border px-3 py-2.5 text-left text-sm transition " +
                  (show ? (o.right ? "border-emerald-600 bg-emerald-50" : "border-red-400 bg-red-50") : "border-border bg-background hover:border-foreground/30")}>
                <span className="inline-flex items-start gap-2">
                  {show ? (o.right ? <Check className="mt-0.5 h-4 w-4 text-emerald-700" /> : <X className="mt-0.5 h-4 w-4 text-red-600" />) : null}
                  {o.text}
                </span>
              </button>
              {show && o.fb && <div className={"mt-1 px-1 text-[13px] " + (o.right ? "text-emerald-800" : "text-red-700")}>{o.fb}</div>}
            </div>
          );
        })}
      </div>
      {picked !== null && <button className="mt-3 text-xs text-muted-foreground underline" onClick={() => setPicked(null)}>Try again</button>}
    </div>
  );
}

const NAVY = "#0B1B3A", EM = "#10B981";

/** Simple, readable diagrams drawn from text: steps, 2x2 matrix, pyramid, cycle. */
function Diagram({ kind, title, axes, items }: { kind: string; title: string; axes: (string | undefined)[]; items: string[][] }) {
  return (
    <figure className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <figcaption className="mb-3 font-semibold">{title}</figcaption>
      {kind === "steps" && (
        <ol className="grid gap-2 sm:grid-flow-col sm:auto-cols-fr">
          {items.map(([k, v], i) => (
            <li key={i} className="relative rounded-lg bg-[#0B1B3A] p-3 text-white">
              <div className="flex items-center gap-2"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-xs font-bold">{i + 1}</span><span className="font-semibold leading-tight">{k}</span></div>
              {v && <div className="mt-1.5 text-[12.5px] leading-snug text-white/80">{v}</div>}
            </li>
          ))}
        </ol>
      )}
      {kind === "matrix" && (
        <div className="flex gap-2">
          {axes[1] && <div className="flex items-center"><span className="text-[11px] text-muted-foreground [writing-mode:vertical-rl] rotate-180">{axes[1]}</span></div>}
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-2">
              {items.slice(0, 4).map(([k, v], i) => (
                <div key={i} className={"rounded-lg p-3 " + (i === 1 ? "bg-[#0B1B3A] text-white" : i === 2 ? "bg-muted" : "bg-emerald-50")}>
                  <div className="font-semibold leading-tight">{k}</div>
                  <div className={"mt-1 text-[12.5px] leading-snug " + (i === 1 ? "text-white/80" : "text-foreground/75")}>{v}</div>
                </div>
              ))}
            </div>
            {axes[0] && <div className="mt-1.5 text-center text-[11px] text-muted-foreground">{axes[0]}</div>}
          </div>
        </div>
      )}
      {kind === "pyramid" && (
        <div className="space-y-1.5">
          {items.map(([k, v], i) => {
            const w = 40 + (60 * i) / Math.max(1, items.length - 1);
            return (
              <div key={i} className="mx-auto rounded-md px-3 py-2 text-center text-white" style={{ width: `${w}%`, background: i === 0 ? EM : NAVY, opacity: 1 - i * 0.08 }}>
                <div className="text-sm font-semibold leading-tight">{k}</div>
                {v && <div className="text-[11.5px] leading-snug text-white/85">{v}</div>}
              </div>
            );
          })}
          <div className="text-center text-[11px] text-muted-foreground">Top = most effective</div>
        </div>
      )}
      {kind === "cycle" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map(([k, v], i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-border p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-emerald-600 text-sm font-bold text-emerald-700">{i + 1}</span>
              <div><div className="font-semibold leading-tight">{k} {i < items.length - 1 ? "→" : "↺"}</div><div className="mt-0.5 text-[12.5px] text-foreground/75">{v}</div></div>
            </div>
          ))}
        </div>
      )}
    </figure>
  );
}
