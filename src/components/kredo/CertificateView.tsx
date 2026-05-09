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
      {/* === HYBRID PREMIUM (D): bold outer frame + thin inner ornamental border === */}
      {/* Outer thick black frame */}
      <div className="pointer-events-none absolute inset-[1.5cqw] border-[0.55cqw] border-foreground" />
      {/* Inner hairline ornamental border */}
      <div className="pointer-events-none absolute inset-[3.2cqw] border-[0.12cqw] border-foreground/80" />
      {/* Corner ornament dots (4) */}
      {[
        "top-[2.6cqw] left-[2.6cqw]",
        "top-[2.6cqw] right-[2.6cqw]",
        "bottom-[2.6cqw] left-[2.6cqw]",
        "bottom-[2.6cqw] right-[2.6cqw]",
      ].map((c) => (
        <span key={c} className={`pointer-events-none absolute ${c} h-[0.9cqw] w-[0.9cqw] rotate-45 bg-foreground`} />
      ))}

      <div className="relative flex h-full flex-col px-[5cqw] py-[3.4cqw]">
        {/* Header: Logo left · Ref + verified badge right */}
        <div className="flex items-start justify-between gap-[2cqw]">
          <div className="font-display font-black tracking-tighter leading-none text-[2.8cqw]">
            <span style={{ color: appPrimary }}>CERTI</span><span className="text-foreground">GO</span>
          </div>
          <div className="flex flex-col items-end gap-[0.3cqw]">
            <div className="font-mono uppercase tracking-[0.25em] text-muted-foreground text-[0.95cqw]">
              Certificate Ref
            </div>
            <div className="font-mono tracking-widest text-foreground text-[1.2cqw]">
              {displaySerial}
            </div>
            <div className="inline-flex items-center gap-[0.5cqw] rounded-full border border-foreground/30 px-[0.9cqw] py-[0.2cqw] font-sans tracking-wide text-foreground/80 text-[0.9cqw]">
              <svg viewBox="0 0 24 24" className="h-[1.1cqw] w-[1.1cqw]" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: appPrimary }}>
                <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Verified Credential
            </div>
          </div>
        </div>

        {/* Masthead — split title with side bars (Classic Ornate touch) */}
        <div className="text-center mt-[2.4cqw]">
          <div className="mx-auto flex items-center justify-center gap-[1.2cqw]">
            <span className="h-[0.15cqw] w-[4cqw] bg-foreground" />
            <h1 className="font-display font-black uppercase leading-none tracking-[0.06em] text-[5cqw]">
              Certificate
            </h1>
            <span className="h-[0.15cqw] w-[4cqw] bg-foreground" />
          </div>
          <div className="mt-[0.9cqw] flex items-center justify-center gap-[0.8cqw]">
            <span className="h-[0.8cqw] w-[0.8cqw] rotate-45 border border-foreground" />
            <div className="font-mono uppercase tracking-[0.45em] text-foreground text-[1.3cqw]">
              Of Completion
            </div>
            <span className="h-[0.8cqw] w-[0.8cqw] rotate-45 border border-foreground" />
          </div>
        </div>

        {/* Body */}
        <div className="mx-auto flex-1 text-center mt-[2.2cqw]">
          <p className="font-display italic text-muted-foreground text-[1.3cqw]">
            This is to certify that
          </p>
          <h2 className="mt-[1cqw] font-display font-black leading-none tracking-tight text-[4.2cqw]">
            {p.recipientName}
          </h2>
          <div className="mx-auto mt-[1cqw] h-[0.1cqw] w-[55%] bg-foreground/70" />
          <p className="mx-auto mt-[1.2cqw] max-w-[78%] font-display italic text-muted-foreground text-[1.3cqw]">
            has successfully completed all requirements for
          </p>
          <h3 className="mx-auto mt-[0.8cqw] max-w-[80%] font-display font-bold leading-tight tracking-tight text-[2.4cqw]">
            {p.courseTopic}
          </h3>
          <p className="mx-auto mt-[1.2cqw] max-w-[72%] font-display italic text-muted-foreground text-[1.15cqw]">
            Cryptographically issued and independently verifiable on the Certigo ledger.
          </p>
          <p className="mt-[1.2cqw] font-mono uppercase tracking-[0.28em] text-muted-foreground text-[1cqw]">
            {p.score != null ? `Final Score ${p.score}%  ·  ` : ""}Issued {new Date(p.issuedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Footer: Signature · Stamp · QR — uniform alignment baseline */}
        <div className="mt-auto grid grid-cols-3 items-end gap-[2cqw]">
          {/* Signature (no name) */}
          <div className="flex flex-col items-start">
            <SignatureScribble variant={sigVariant} className="h-[4cqw] w-[16cqw]" />
            <div className="mt-[0.3cqw] h-[0.1cqw] w-[16cqw] bg-foreground/80" />
            <div className="mt-[0.5cqw] font-mono uppercase tracking-[0.2em] text-muted-foreground text-[0.9cqw]">
              Authorized Signatory
            </div>
          </div>

          {/* Stamp — circular themed seal */}
          <div className="flex justify-center" aria-hidden>
            <svg viewBox="0 0 200 200" className="h-[10.5cqw] w-[10.5cqw] -rotate-[8deg]" style={{ color: appPrimary }}>
              <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" strokeWidth="4" />
              <circle cx="100" cy="100" r="82" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="100" cy="100" r="58" fill="none" stroke="currentColor" strokeWidth="2" />
              <defs>
                <path id={`stampTop-${p.serial}`} d="M 25,100 a 75,75 0 0 1 150,0" fill="none" />
                <path id={`stampBot-${p.serial}`} d="M 30,100 a 70,70 0 0 0 140,0" fill="none" />
              </defs>
              <text fontFamily="ui-serif, Georgia, serif" fontWeight="700" fontSize="14" letterSpacing="4" fill="currentColor">
                <textPath href={`#stampTop-${p.serial}`} startOffset="50%" textAnchor="middle">CERTIGO · VERIFIED</textPath>
              </text>
              <text fontFamily="ui-serif, Georgia, serif" fontWeight="700" fontSize="11" letterSpacing="3" fill="currentColor">
                <textPath href={`#stampBot-${p.serial}`} startOffset="50%" textAnchor="middle">AUTHENTIC CREDENTIAL</textPath>
              </text>
              <text x="100" y="118" textAnchor="middle" fontSize="56" fontWeight="900" fill="currentColor" fontFamily="ui-serif, Georgia, serif">C</text>
              <g fill="currentColor">
                {Array.from({ length: 24 }).map((_, i) => (
                  <rect key={i} x="99.4" y="6" width="1.2" height="5" transform={`rotate(${i * 15} 100 100)`} />
                ))}
              </g>
            </svg>
          </div>

          {/* QR */}
          <div className="flex flex-col items-end text-right">
            <div className="mb-[0.4cqw] font-mono uppercase tracking-[0.2em] text-muted-foreground text-[0.9cqw]">
              Scan to verify
            </div>
            {qr && (
              <a href={qrTarget} target="_blank" rel="noreferrer" className="block">
                <img src={qr} alt="Scan to verify" className="h-[9cqw] w-[9cqw] rounded-sm border border-foreground/20" />
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
