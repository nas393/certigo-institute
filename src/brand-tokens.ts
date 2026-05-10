/**
 * ════════════════════════════════════════════════════════════════════
 *  CERTIGO. — BRAND DESIGN TOKENS
 * ════════════════════════════════════════════════════════════════════
 *
 *  This file is the single source of truth for the CERTIGO. visual
 *  brand. Edit values here when rebranding — and mirror any color
 *  change inside `src/styles.css` (the CSS variables consumed by
 *  Tailwind / shadcn).
 *
 *  Palette direction: modern enterprise SaaS.
 *    - Deep indigo as the institutional primary
 *    - Electric violet → cyan as the signature gradient
 *    - Soft neutral surfaces for high-trust calm
 * ════════════════════════════════════════════════════════════════════
 */

export const brandColors = {
  // ── Brand ─────────────────────────────────────────────────────────
  primary:        "#3730A3", // deep indigo  — buttons, links, headings accents
  primaryHover:   "#312E81",
  primaryFg:      "#FFFFFF",

  secondary:      "#6366F1", // indigo-500   — secondary actions, badges
  accent:         "#06B6D4", // electric cyan — highlights, gradient stop
  accentAlt:      "#8B5CF6", // electric violet — gradient stop

  // ── Surfaces ──────────────────────────────────────────────────────
  background:     "#FFFFFF",
  surface:        "#F8FAFC", // soft gray section background
  surfaceMuted:   "#F1F5F9",
  surfaceInk:     "#0B1020", // dark hero / footer background

  // ── Text ──────────────────────────────────────────────────────────
  text:           "#0F172A", // slate-900
  textMuted:      "#475569", // slate-600
  textSubtle:     "#64748B", // slate-500
  textInverse:    "#F8FAFC",

  // ── Borders ───────────────────────────────────────────────────────
  border:         "#E2E8F0",
  borderStrong:   "#CBD5E1",

  // ── Status ────────────────────────────────────────────────────────
  success:        "#10B981",
  warning:        "#F59E0B",
  danger:         "#EF4444",
} as const;

export const brandGradients = {
  hero:     "linear-gradient(135deg, #3730A3 0%, #6366F1 45%, #06B6D4 100%)",
  signature:"linear-gradient(90deg, #8B5CF6 0%, #6366F1 50%, #06B6D4 100%)",
  surface:  "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
  ink:      "linear-gradient(180deg, #0B1020 0%, #111936 100%)",
  glow:     "radial-gradient(60% 60% at 50% 0%, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0) 70%)",
} as const;

export const brandFonts = {
  display: '"Inter", "Helvetica Neue", system-ui, sans-serif',
  body:    '"Inter", system-ui, -apple-system, sans-serif',
  mono:    '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
} as const;

export const brandRadii = {
  sm: "6px",
  md: "10px",
  lg: "16px",
  xl: "24px",
  pill: "9999px",
} as const;

export const brandShadows = {
  sm: "0 1px 2px rgba(15,23,42,0.06)",
  md: "0 8px 24px -8px rgba(15,23,42,0.12)",
  lg: "0 24px 60px -20px rgba(55,48,163,0.25)",
  glow: "0 20px 50px -20px rgba(99,102,241,0.45)",
} as const;

export const brand = {
  name: "CERTIGO.",
  tagline: "Verifiable credentials infrastructure",
  colors: brandColors,
  gradients: brandGradients,
  fonts: brandFonts,
  radii: brandRadii,
  shadows: brandShadows,
} as const;

export type BrandColor = keyof typeof brandColors;