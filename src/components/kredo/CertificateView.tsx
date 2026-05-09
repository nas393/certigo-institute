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
  // Always link the QR to the public verify page using the (formatted) serial.
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

  // Pick a signature variant deterministically from the serial so every cert
  // has a stable, unique unsigned scribble (no name embedded).
  const sigVariant = (() => {
    let h = 0; for (let i = 0; i < p.serial.length; i++) h = (h * 31 + p.serial.charCodeAt(i)) >>> 0;
    return h % 3;
  })();

  return (
    <div
      style={{ ...lock, containerType: "inline-size" } as React.CSSProperties}
      className={`relative aspect-[1.414/1] w-full overflow-hidden rounded-sm ${p.compact ? "" : "shadow-elegant"}`}
    >
      {/* === MODERN APPRECIATION-STYLE LAYOUT === */}
      {/* Bold outer frame */}
      <div className="pointer-events-none absolute inset-[1.4cqw] border-[0.5cqw] border-foreground" />

      {/* Corporate half-circle medallion on the right edge */}
      <svg
        aria-hidden
        viewBox="0 0 200 400"
        preserveAspectRatio="xMaxYMid meet"
        className="pointer-events-none absolute right-0 top-0 h-full w-[26cqw]"
        style={{ color: appPrimary }}
      >
        {/* nested concentric arcs anchored to the right edge */}
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <circle cx="200" cy="200" r="190" strokeWidth="1.4" opacity="0.45" />
          <circle cx="200" cy="200" r="160" strokeWidth="1" opacity="0.28" strokeDasharray="2 4" />
          <circle cx="200" cy="200" r="130" strokeWidth="1.2" opacity="0.55" />
          <circle cx="200" cy="200" r="100" strokeWidth="0.9" opacity="0.22" strokeDasharray="1 3" />
          <circle cx="200" cy="200" r="72" strokeWidth="1.1" opacity="0.5" />
          <circle cx="200" cy="200" r="40" strokeWidth="1.4" opacity="0.7" />
        </g>
        {/* tick marks along the outer arc */}
        <g stroke="currentColor" strokeWidth="1.2" opacity="0.55">
          {Array.from({ length: 22 }).map((_, i) => {
            const a = Math.PI / 2 + (i / 21) * Math.PI; // sweep from top to bottom on the left side of the right-anchored circle
            const x1 = 200 + Math.cos(a) * 196;
            const y1 = 200 + Math.sin(a) * 196;
            const x2 = 200 + Math.cos(a) * (i % 3 === 0 ? 178 : 186);
            const y2 = 200 + Math.sin(a) * (i % 3 === 0 ? 178 : 186);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </g>
        <circle cx="200" cy="200" r="6" fill="currentColor" />
      </svg>

      {/* Subtle corporate guilloché grid (very faint, full-bleed) */}
      <svg
        aria-hidden
        viewBox="0 0 800 560"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-[3cqw] h-[calc(100%-6cqw)] w-[calc(100%-6cqw)] opacity-[0.05] text-foreground"
      >
        <defs>
          <pattern id="cgrid" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M 14 0 L 0 0 0 14" fill="none" stroke="currentColor" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="800" height="560" fill="url(#cgrid)" />
      </svg>

      <div className="relative flex h-full flex-col px-[5.5cqw] py-[4cqw]">
        {/* Top row: Logo · Date + Ref + Verified */}
        <div className="flex items-start justify-between gap-[2cqw]">
          <div className="font-display font-black tracking-tighter leading-none text-[2.4cqw]">
            <span style={{ color: appPrimary }}>CERTI</span><span className="text-foreground">GO</span>
          </div>
          <div className="flex flex-col items-end gap-[0.5cqw]">
            <div className="font-sans text-foreground text-[1.15cqw]">
              {new Date(p.issuedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).replace(",", " |")}
            </div>
            <div className="font-mono tracking-[0.25em] text-muted-foreground text-[0.85cqw]">
              REF · {displaySerial}
            </div>
            <div className="inline-flex items-center gap-[0.5cqw] rounded-full border px-[0.9cqw] py-[0.2cqw] font-sans tracking-wide text-[0.85cqw]"
                 style={{ color: "#16a34a", borderColor: "rgba(22,163,74,0.4)", background: "rgba(22,163,74,0.08)" }}>
              <span className="relative inline-flex h-[0.7cqw] w-[0.7cqw]">
                <span className="absolute inset-0 rounded-full" style={{ background: "#16a34a" }} />
                <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "#16a34a", opacity: 0.4 }} />
              </span>
              On-chain Verified
            </div>
          </div>
        </div>

        {/* Masthead — left-aligned bold title */}
        <div className="mt-[2cqw]">
          <h1 className="font-display font-black uppercase leading-[0.95] tracking-[-0.02em] text-[7cqw] text-foreground">
            Certificate
          </h1>
          <div className="mt-[0.4cqw] flex items-baseline gap-[0.4cqw]">
            <h2 className="font-sans font-medium uppercase tracking-[0.18em] text-foreground/80 text-[2cqw]">
              Of Completion
            </h2>
            <span className="inline-block h-[0.9cqw] w-[0.9cqw] rounded-full" style={{ background: appPrimary }} />
          </div>
        </div>

        {/* Body */}
        <div className="mt-[2.2cqw] max-w-[68%]">
          <p className="font-sans text-foreground/80 text-[1.2cqw]">
            This certificate is proudly awarded to:
          </p>
          <h3 className="mt-[0.9cqw] font-display font-black leading-none tracking-tight text-foreground text-[3.6cqw]">
            {p.recipientName}
          </h3>
          <p className="mt-[1.4cqw] font-sans font-bold text-foreground text-[1.55cqw]">
            {p.courseTopic}
          </p>
          <p className="mt-[0.6cqw] font-sans text-foreground/70 text-[1cqw] leading-relaxed">
            For successfully completing all required modules and assessments. Cryptographically issued and independently verifiable on the Certigo ledger{p.score != null ? ` with a final score of ${p.score}%` : ""}.
          </p>
        </div>

        {/* Footer: Signature left · Stamp center · QR right */}
        <div className="mt-auto grid grid-cols-[1.2fr_1fr_1fr] items-end gap-[2cqw]">
          {/* Signature — single, authorized signatory */}
          <div className="flex flex-col items-start">
            <div className="font-sans text-foreground/70 text-[0.95cqw]">Authorized by:</div>
            <SignatureScribble variant={sigVariant} className="mt-[0.6cqw] h-[3.6cqw] w-[14cqw]" />
            <div className="mt-[0.2cqw] h-[0.08cqw] w-[14cqw] bg-foreground/80" />
            <div className="mt-[0.5cqw] font-sans font-bold text-foreground text-[1cqw]">
              Authorized Signatory
            </div>
            <div className="font-sans text-muted-foreground text-[0.85cqw]">
              Certigo Credentials
            </div>
          </div>

          {/* Stamp — circular badge inspired by reference (star + curved text) */}
          <div className="flex justify-center" aria-hidden>
            <svg viewBox="0 0 200 200" className="h-[10cqw] w-[10cqw] -rotate-[6deg]" style={{ color: appPrimary }}>
              <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <circle cx="100" cy="100" r="68" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 3" />
              <defs>
                <path id={`cstampTop-${p.serial}`} d="M 18,100 a 82,82 0 0 1 164,0" fill="none" />
                <path id={`cstampBot-${p.serial}`} d="M 22,100 a 78,78 0 0 0 156,0" fill="none" />
              </defs>
              <text fontFamily="ui-serif, Georgia, serif" fontStyle="italic" fontSize="14" letterSpacing="2" fill="currentColor">
                <textPath href={`#cstampTop-${p.serial}`} startOffset="50%" textAnchor="middle">Certigo · Verified Credential</textPath>
              </text>
              <text fontFamily="ui-serif, Georgia, serif" fontStyle="italic" fontSize="11" letterSpacing="3" fill="currentColor">
                <textPath href={`#cstampBot-${p.serial}`} startOffset="50%" textAnchor="middle">AUTHENTIC · ON-CHAIN</textPath>
              </text>
              {/* center 4-point star */}
              <path d="M100 70 L108 95 L132 100 L108 105 L100 130 L92 105 L68 100 L92 95 Z" fill="currentColor" />
            </svg>
          </div>

          {/* QR right */}
          <div className="flex flex-col items-end text-right">
            <div className="mb-[0.4cqw] font-mono uppercase tracking-[0.2em] text-muted-foreground text-[0.85cqw]">
              Scan to verify
            </div>
            {qr && (
              <a href={qrTarget} target="_blank" rel="noreferrer" className="block">
                <img src={qr} alt="Scan to verify" className="h-[8.5cqw] w-[8.5cqw] rounded-sm border border-foreground/20" />
              </a>
            )}
          </div>
        </div>

        {p.watermark && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rotate-[-20deg] font-display text-[10cqw] font-black text-foreground/[0.04]">
              CERTIGO FREE
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// === Inline SVG signature scribbles (no name embedded) ===
function SignatureScribble({ variant, className }: { variant: number; className?: string }) {
  const paths = [
    // Variant 0 — flowing loop
    "M5 38 C 25 5, 55 60, 80 25 S 140 50, 175 18 C 195 8, 215 32, 235 22",
    // Variant 1 — sharp executive scribble with crossbar
    "M8 34 C 30 10, 50 50, 78 22 C 100 5, 130 45, 160 20 C 185 5, 215 38, 240 18 M 50 42 L 230 42",
    // Variant 2 — compact looped initials
    "M10 40 C 25 18, 38 5, 55 25 C 70 42, 85 10, 100 28 C 120 50, 150 5, 180 30 C 205 50, 225 18, 245 28",
  ];
  return (
    <svg viewBox="0 0 250 50" className={className} preserveAspectRatio="xMinYMid meet" aria-hidden>
      <path
        d={paths[variant] ?? paths[0]}
        fill="none"
        stroke="oklch(0.16 0.01 270)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}
