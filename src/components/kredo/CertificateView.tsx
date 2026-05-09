import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { formatSerial } from "@/lib/cert";

export type CertTemplate =
  | "classic"
  | "executive"
  | "monogram"
  | "minimal"
  | "deco"
  | "bordered"
  | "ribbon"
  | "modern";

export type CertOrientation = "landscape" | "portrait";

export const CERT_TEMPLATES: { key: CertTemplate; label: string; hint: string }[] = [
  { key: "classic",   label: "Classic",    hint: "Traditional double border" },
  { key: "executive", label: "Executive",  hint: "Top accent bar + serif air" },
  { key: "monogram",  label: "Monogram",   hint: "Center K monogram watermark" },
  { key: "minimal",   label: "Minimal",    hint: "Single hairline frame" },
  { key: "deco",      label: "Art Deco",   hint: "Corner ornaments" },
  { key: "bordered",  label: "Bordered",   hint: "Bold solid frame" },
  { key: "ribbon",    label: "Ribbon",     hint: "Diagonal seal ribbon" },
  { key: "modern",    label: "Modern",     hint: "Asymmetric side stripe" },
];

interface Props {
  serial: string;
  recipientName: string;
  courseTopic: string;
  score?: number | null;
  issuedAt: string;
  verifyUrl: string;
  watermark?: boolean;
  compact?: boolean;
  template?: CertTemplate;
  orientation?: CertOrientation;
}

function getAppPrimary(): string {
  if (typeof window === "undefined") return "oklch(0.42 0.21 275)";
  const v = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
  return v || "oklch(0.42 0.21 275)";
}

export function CertificateView(p: Props) {
  const [qr, setQr] = useState<string>("");
  const [appPrimary, setAppPrimary] = useState<string>("oklch(0.42 0.21 275)");
  const displaySerial = formatSerial(p.serial);
  const orientation: CertOrientation = p.orientation ?? "landscape";
  const isPortrait = orientation === "portrait";

  const qrTarget = (() => {
    try {
      const u = new URL(p.verifyUrl);
      return `${u.origin}/verify/${displaySerial}`;
    } catch {
      return `/verify/${displaySerial}`;
    }
  })();
  useEffect(() => { QRCode.toDataURL(qrTarget, { margin: 0, width: 240 }).then(setQr); }, [qrTarget]);
  useEffect(() => { setAppPrimary(getAppPrimary()); }, []);

  const lock = {
    "--background": "oklch(1 0 0)",
    "--foreground": "oklch(0.16 0.01 270)",
    "--muted-foreground": "oklch(0.45 0.01 270)",
    "--font-display": 'ui-serif, "Times New Roman", Georgia, serif',
    "--font-sans": 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    color: "oklch(0.16 0.01 270)",
    background: "#ffffff",
  } as React.CSSProperties;

  // deterministic signature variant per serial
  const sigVariant = (() => {
    let h = 0; for (let i = 0; i < p.serial.length; i++) h = (h * 31 + p.serial.charCodeAt(i)) >>> 0;
    return h % 3;
  })();

  // Aspect + scale tuning. cqw stays consistent across orientations because
  // container queries scale to width, so portrait gets smaller padding/text
  // multipliers proportionally.
  const aspect = isPortrait ? "1/1.414" : "1.414/1";
  // scale factor: portrait is narrower so we bump cqw a bit for legibility
  const s = isPortrait ? 1.35 : 1;
  const cq = (n: number) => `${(n * s).toFixed(2)}cqw`;

  return (
    <div
      style={{ ...lock, containerType: "inline-size", aspectRatio: aspect } as React.CSSProperties}
      className={`relative w-full overflow-hidden rounded-sm ${p.compact ? "" : "shadow-elegant"}`}
    >
      {/* === OUTER + INNER BORDER (everything else lives inside) === */}
      <div className="pointer-events-none absolute" style={{ inset: cq(1.4), border: `${cq(0.5)} solid currentColor`, color: "oklch(0.16 0.01 270)" }} />
      <div className="pointer-events-none absolute" style={{ inset: cq(2.4), border: `1px solid currentColor`, color: appPrimary, opacity: 0.45 }} />

      {/* INNER CANVAS — all decoration clipped to this rectangle */}
      <div className="absolute overflow-hidden" style={{ inset: cq(2.4) }}>
        {/* Guilloché grid (very subtle, full-bleed of inner) */}
        <svg
          aria-hidden viewBox="0 0 800 560" preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] text-foreground"
        >
          <defs>
            <pattern id={`cg-${p.serial}`} width="14" height="14" patternUnits="userSpaceOnUse">
              <path d="M 14 0 L 0 0 0 14" fill="none" stroke="currentColor" strokeWidth="0.4" />
              <circle cx="7" cy="7" r="0.6" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="800" height="560" fill={`url(#cg-${p.serial})`} />
        </svg>

        {/* Decorative key-pattern stripe (left side, inspired by reference) */}
        <svg
          aria-hidden viewBox="0 0 60 1000" preserveAspectRatio="none"
          className="pointer-events-none absolute left-0 top-0 h-full"
          style={{ width: cq(5.5), color: appPrimary }}
        >
          <defs>
            <pattern id={`key-${p.serial}`} width="60" height="80" patternUnits="userSpaceOnUse">
              {/* interlocking diamond / key motif */}
              <path d="M30 6 L54 30 L30 54 L6 30 Z" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <path d="M30 18 L42 30 L30 42 L18 30 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <line x1="30" y1="54" x2="30" y2="74" stroke="currentColor" strokeWidth="2.2" />
              <line x1="0"  y1="74" x2="60" y2="74" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
            </pattern>
          </defs>
          <rect width="60" height="1000" fill={`url(#key-${p.serial})`} opacity="0.85" />
        </svg>

        {/* Right edge thin echo of stripe */}
        <div className="pointer-events-none absolute right-0 top-0 h-full" style={{ width: cq(0.6), background: appPrimary, opacity: 0.6 }} />
        <div className="pointer-events-none absolute right-0 top-0 h-full" style={{ width: cq(1.6), borderLeft: `1px solid ${appPrimary}`, marginRight: cq(0.9), opacity: 0.4 }} />

        {/* === CONTENT === */}
        <div className="relative flex h-full flex-col" style={{ paddingLeft: cq(8.5), paddingRight: cq(4.5), paddingTop: cq(3.5), paddingBottom: cq(3.5) }}>
          {/* Top row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col" style={{ gap: cq(0.3) }}>
              <div className="font-mono uppercase text-muted-foreground tracking-[0.25em]" style={{ fontSize: cq(0.85) }}>
                REF · {displaySerial}
              </div>
              <div className="font-sans text-foreground/80" style={{ fontSize: cq(1) }}>
                {new Date(p.issuedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>
            <div className="flex flex-col items-end" style={{ gap: cq(0.4) }}>
              <div className="font-display font-black leading-none tracking-tighter" style={{ fontSize: cq(2.2) }}>
                <span style={{ color: appPrimary }}>CERTI</span><span className="text-foreground">GO</span>
              </div>
              <div className="font-sans text-muted-foreground" style={{ fontSize: cq(0.85) }}>
                Verified Credential Authority
              </div>
              <div
                className="inline-flex items-center rounded-full border"
                style={{
                  gap: cq(0.5), paddingInline: cq(0.9), paddingBlock: cq(0.2), fontSize: cq(0.85),
                  color: "#16a34a", borderColor: "rgba(22,163,74,0.45)", background: "rgba(22,163,74,0.08)",
                }}
              >
                <span className="relative inline-flex" style={{ width: cq(0.7), height: cq(0.7) }}>
                  <span className="absolute inset-0 rounded-full" style={{ background: "#16a34a" }} />
                  <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "#16a34a", opacity: 0.4 }} />
                </span>
                On-chain Verified
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="mt-[auto]" />
          <div style={{ marginTop: cq(2.4) }}>
            <h1 className="font-display italic font-black tracking-tight text-foreground" style={{ fontSize: cq(5.2), lineHeight: 1 }}>
              Certificate
            </h1>
            <h2 className="font-display italic font-black tracking-tight text-foreground" style={{ fontSize: cq(2.8), lineHeight: 1.05, marginTop: cq(0.2) }}>
              Of Completion
              <span className="inline-block rounded-full align-middle" style={{ background: appPrimary, width: cq(0.7), height: cq(0.7), marginLeft: cq(0.6) }} />
            </h2>
          </div>

          {/* Body */}
          <div style={{ marginTop: cq(2), maxWidth: "78%" }}>
            <p className="font-sans text-foreground/75" style={{ fontSize: cq(1.1) }}>
              This is to proudly certify that
            </p>
            <h3
              className="font-display italic text-foreground"
              style={{ fontSize: cq(3.4), lineHeight: 1.05, marginTop: cq(0.6), fontWeight: 700 }}
            >
              {p.recipientName}
            </h3>
            <p className="font-sans text-foreground/70" style={{ fontSize: cq(0.95), marginTop: cq(1.2), lineHeight: 1.55 }}>
              has successfully completed the program
              <span className="font-bold text-foreground"> “{p.courseTopic}”</span>,
              meeting all requirements and assessments. This credential is cryptographically issued and independently verifiable on the Certigo ledger
              {p.score != null ? ` with a final score of ${p.score}%` : ""}.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-auto grid items-end" style={{ gridTemplateColumns: "1.3fr 1fr 1fr", gap: cq(2), marginTop: cq(2.4) }}>
            {/* Signature with big N monogram */}
            <div className="flex flex-col items-start">
              <SignatureMonogram variant={sigVariant} className="block" style={{ height: cq(4.4), width: cq(16) }} />
              <div style={{ height: 1, width: cq(15), background: "currentColor", opacity: 0.85, marginTop: cq(0.3) }} />
              <div className="font-sans font-bold text-foreground" style={{ fontSize: cq(1), marginTop: cq(0.4) }}>
                N. — Authorized Signatory
              </div>
              <div className="font-sans text-muted-foreground" style={{ fontSize: cq(0.8) }}>
                Certigo Credentials Office
              </div>
            </div>

            {/* Corporate seal */}
            <div className="flex justify-center" aria-hidden>
              <CorporateSeal serial={p.serial} color={appPrimary} style={{ width: cq(11), height: cq(11) }} />
            </div>

            {/* QR */}
            <div className="flex flex-col items-end text-right">
              <div className="font-mono uppercase tracking-[0.2em] text-muted-foreground" style={{ marginBottom: cq(0.4), fontSize: cq(0.8) }}>
                Scan to verify
              </div>
              {qr && (
                <a href={qrTarget} target="_blank" rel="noreferrer" className="block">
                  <img src={qr} alt="Scan to verify" className="rounded-sm border border-foreground/20" style={{ width: cq(8.5), height: cq(8.5) }} />
                </a>
              )}
            </div>
          </div>

          {p.watermark && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rotate-[-20deg] font-display font-black text-foreground/[0.04]" style={{ fontSize: cq(10) }}>
                CERTIGO FREE
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// === Corporate seal: outer ring + guilloché rosette + curved text + star ===
function CorporateSeal({ serial, color, style }: { serial: string; color: string; style?: React.CSSProperties }) {
  const topId = `seal-top-${serial}`;
  const botId = `seal-bot-${serial}`;
  // generate guilloché rosette path
  const rosette: string[] = [];
  const lobes = 24;
  for (let i = 0; i < lobes; i++) {
    const a1 = (i / lobes) * Math.PI * 2;
    const a2 = ((i + 1) / lobes) * Math.PI * 2;
    const x1 = 100 + Math.cos(a1) * 40;
    const y1 = 100 + Math.sin(a1) * 40;
    const x2 = 100 + Math.cos(a2) * 40;
    const y2 = 100 + Math.sin(a2) * 40;
    const cx = 100 + Math.cos((a1 + a2) / 2) * 64;
    const cy = 100 + Math.sin((a1 + a2) / 2) * 64;
    rosette.push(`M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 200 200" style={{ color, ...style }} className="-rotate-[6deg]">
      {/* outer thick ring */}
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.8" />
      {/* curved text band */}
      <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <defs>
        <path id={topId} d="M 22,100 a 78,78 0 0 1 156,0" fill="none" />
        <path id={botId} d="M 26,100 a 74,74 0 0 0 148,0" fill="none" />
      </defs>
      <text fontFamily="ui-serif, Georgia, serif" fontStyle="italic" fontSize="13.5" letterSpacing="2.2" fill="currentColor">
        <textPath href={`#${topId}`} startOffset="50%" textAnchor="middle">CERTIGO · VERIFIED CREDENTIAL</textPath>
      </text>
      <text fontFamily="ui-serif, Georgia, serif" fontStyle="italic" fontSize="10" letterSpacing="3" fill="currentColor">
        <textPath href={`#${botId}`} startOffset="50%" textAnchor="middle">AUTHENTIC · ON-CHAIN · {serial.slice(-6).toUpperCase()}</textPath>
      </text>
      {/* inner ring */}
      <circle cx="100" cy="100" r="66" fill="none" stroke="currentColor" strokeWidth="1.6" />
      {/* guilloché rosette */}
      <g fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.55">
        {rosette.map((d, i) => <path key={i} d={d} />)}
      </g>
      <circle cx="100" cy="100" r="44" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" strokeDasharray="2 2" />
      {/* central star */}
      <path d="M100 60 L110 92 L142 92 L116 110 L126 142 L100 124 L74 142 L84 110 L58 92 L90 92 Z"
            fill="currentColor" opacity="0.92" />
    </svg>
  );
}

// === Big "N" monogram + handwriting flourish strokes ===
function SignatureMonogram({ variant, className, style }: { variant: number; className?: string; style?: React.CSSProperties }) {
  // flourish variants (lines that emanate from / wrap the N)
  const flourishes = [
    [
      "M70 36 C 95 14, 130 50, 165 24 C 192 6, 220 38, 244 18",
      "M58 44 C 110 50, 180 50, 240 42",
      "M180 22 C 198 28, 208 38, 200 46",
    ],
    [
      "M72 30 C 100 18, 132 42, 162 22 C 190 6, 222 36, 246 16",
      "M64 44 C 130 38, 190 44, 244 36",
      "M120 16 C 132 22, 138 30, 130 38",
    ],
    [
      "M74 34 C 96 20, 128 46, 160 24 C 188 6, 216 38, 240 22",
      "M58 46 C 100 42, 180 46, 246 40",
      "M210 18 C 222 26, 226 36, 218 44",
    ],
  ];
  const f = flourishes[variant] ?? flourishes[0];
  return (
    <svg viewBox="0 0 250 60" preserveAspectRatio="xMinYMid meet" aria-hidden className={className} style={style}>
      <g fill="none" stroke="oklch(0.16 0.01 270)" strokeLinecap="round" strokeLinejoin="round">
        {/* Large hand-drawn N */}
        <path d="M14 50 C 12 38, 14 22, 16 10 L 18 10 L 56 44 L 58 44 C 56 32, 56 20, 58 8"
              strokeWidth="3.4" />
        {/* secondary thin overlay on N for ink weight */}
        <path d="M16 12 L 56 46" strokeWidth="1.2" opacity="0.55" />
        {/* tail flourish under N */}
        <path d="M10 54 C 28 58, 50 58, 64 52" strokeWidth="1.6" opacity="0.85" />
        {/* main script flourish */}
        <path d={f[0]} strokeWidth="2.2" />
        {/* underline */}
        <path d={f[1]} strokeWidth="1.2" opacity="0.7" />
        {/* loop accent */}
        <path d={f[2]} strokeWidth="1.4" opacity="0.85" />
      </g>
    </svg>
  );
}
