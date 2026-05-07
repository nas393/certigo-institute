import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type AccentKey = "indigo" | "emerald" | "rose" | "amber" | "neonPink" | "neonCyan" | "neonLime";
export type BgKey = "paper" | "snow" | "midnight" | "graphite" | "cream";
export type FontKey = "system" | "serif" | "mono" | "grotesk";

export const ACCENTS: Record<AccentKey, { label: string; primary: string; glow: string; swatch: string }> = {
  indigo:   { label: "Indigo",    primary: "oklch(0.42 0.21 275)", glow: "oklch(0.58 0.22 290)", swatch: "#4f46e5" },
  emerald:  { label: "Emerald",   primary: "oklch(0.55 0.18 160)", glow: "oklch(0.68 0.18 160)", swatch: "#10b981" },
  rose:     { label: "Rose",      primary: "oklch(0.55 0.22 15)",  glow: "oklch(0.68 0.22 15)",  swatch: "#e11d48" },
  amber:    { label: "Amber",     primary: "oklch(0.65 0.17 65)",  glow: "oklch(0.78 0.17 75)",  swatch: "#d97706" },
  neonPink: { label: "Neon Pink", primary: "oklch(0.7 0.32 340)",  glow: "oklch(0.82 0.3 340)",  swatch: "#ff2bd6" },
  neonCyan: { label: "Neon Cyan", primary: "oklch(0.78 0.18 200)", glow: "oklch(0.88 0.18 200)", swatch: "#22d3ee" },
  neonLime: { label: "Neon Lime", primary: "oklch(0.85 0.25 130)", glow: "oklch(0.92 0.22 130)", swatch: "#a3ff00" },
};

export const BACKGROUNDS: Record<BgKey, { label: string; bg: string; fg: string; card: string; muted: string; border: string; swatch: string }> = {
  paper:    { label: "Paper",     bg: "oklch(0.985 0.005 85)", fg: "oklch(0.16 0.01 270)", card: "oklch(1 0 0)",          muted: "oklch(0.95 0.005 85)", border: "oklch(0.9 0.008 80)",  swatch: "#fafaf5" },
  snow:     { label: "Snow",      bg: "oklch(1 0 0)",          fg: "oklch(0.18 0.01 270)", card: "oklch(0.99 0 0)",       muted: "oklch(0.96 0 0)",       border: "oklch(0.91 0 0)",     swatch: "#ffffff" },
  cream:    { label: "Cream",     bg: "oklch(0.96 0.02 80)",   fg: "oklch(0.18 0.02 60)",  card: "oklch(0.99 0.01 80)",   muted: "oklch(0.93 0.02 80)",   border: "oklch(0.88 0.02 75)", swatch: "#f5ecd9" },
  graphite: { label: "Graphite",  bg: "oklch(0.22 0.01 270)",  fg: "oklch(0.97 0.005 85)", card: "oklch(0.26 0.012 270)", muted: "oklch(0.3 0.012 270)",  border: "oklch(1 0 0 / 12%)",  swatch: "#2a2a32" },
  midnight: { label: "Midnight",  bg: "oklch(0.12 0.02 270)",  fg: "oklch(0.98 0.005 85)", card: "oklch(0.16 0.025 270)", muted: "oklch(0.2 0.025 270)",  border: "oklch(1 0 0 / 12%)",  swatch: "#0b0b1a" },
};

export const FONTS: Record<FontKey, { label: string; sans: string; display: string }> = {
  system:  { label: "System",  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif', display: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif' },
  grotesk: { label: "Grotesk", sans: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',           display: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif' },
  serif:   { label: "Serif",   sans: 'ui-sans-serif, system-ui, sans-serif',                            display: '"Instrument Serif", "Times New Roman", Georgia, serif' },
  mono:    { label: "Mono",    sans: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace',     display: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace' },
};

interface ThemeState { accent: AccentKey; bg: BgKey; font: FontKey; }
interface ThemeCtx extends ThemeState { setAccent: (a: AccentKey) => void; setBg: (b: BgKey) => void; setFont: (f: FontKey) => void; reset: () => void; }

const DEFAULT: ThemeState = { accent: "indigo", bg: "paper", font: "system" };
const Ctx = createContext<ThemeCtx>({ ...DEFAULT, setAccent: () => {}, setBg: () => {}, setFont: () => {}, reset: () => {} });

function applyTheme(s: ThemeState) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const a = ACCENTS[s.accent];
  const b = BACKGROUNDS[s.bg];
  const f = FONTS[s.font];
  root.style.setProperty("--primary", a.primary);
  root.style.setProperty("--primary-glow", a.glow);
  root.style.setProperty("--ring", a.primary);
  root.style.setProperty("--background", b.bg);
  root.style.setProperty("--paper", b.bg);
  root.style.setProperty("--foreground", b.fg);
  root.style.setProperty("--ink", b.fg);
  root.style.setProperty("--card", b.card);
  root.style.setProperty("--card-foreground", b.fg);
  root.style.setProperty("--popover", b.card);
  root.style.setProperty("--popover-foreground", b.fg);
  root.style.setProperty("--secondary", b.muted);
  root.style.setProperty("--muted", b.muted);
  root.style.setProperty("--accent", b.muted);
  root.style.setProperty("--border", b.border);
  root.style.setProperty("--input", b.border);
  root.style.setProperty("--font-sans", f.sans);
  root.style.setProperty("--font-display", f.display);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(DEFAULT);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("kredo.theme");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ThemeState>;
        const next: ThemeState = {
          accent: (parsed.accent && parsed.accent in ACCENTS ? parsed.accent : DEFAULT.accent) as AccentKey,
          bg: (parsed.bg && parsed.bg in BACKGROUNDS ? parsed.bg : DEFAULT.bg) as BgKey,
          font: (parsed.font && parsed.font in FONTS ? parsed.font : DEFAULT.font) as FontKey,
        };
        setState(next);
        applyTheme(next);
      } else applyTheme(DEFAULT);
    } catch { applyTheme(DEFAULT); }
  }, []);
  const update = (patch: Partial<ThemeState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      applyTheme(next);
      try { localStorage.setItem("kredo.theme", JSON.stringify(next)); } catch {}
      return next;
    });
  };
  return (
    <Ctx.Provider
      value={{
        ...state,
        setAccent: (a) => update({ accent: a }),
        setBg: (b) => update({ bg: b }),
        setFont: (f) => update({ font: f }),
        reset: () => update(DEFAULT),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);