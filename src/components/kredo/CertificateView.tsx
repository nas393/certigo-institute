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
      className={`relative w-full overflow-hidden rounded-none ${p.compact ? "" : "shadow-lg"}`}
    >
      {/* === SLEEK THIN BLACK FRAME WITH DROP SHADOW === */}
      <div className="pointer-events-none absolute" style={{ inset: cq(1), border: `${cq(0.35)} solid #000000`, boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }} />

      {/* INNER CANVAS — all content lives inside */}
      <div className="absolute overflow-hidden" style={{ inset: cq(1) }}>
        {/* Clean white background with subtle texture */}
        <div className="absolute inset-0" style={{ background: "#ffffff" }} />

        {/* === CONTENT === */}
        <div className="relative flex h-full flex-col" style={{ paddingLeft: cq(4), paddingRight: cq(4), paddingTop: cq(3), paddingBottom: cq(3) }}>
          {/* TOP LEFT: CERTIGO LOGO */}
          <div className="absolute top-0 left-0" style={{ padding: cq(2) }}>
            <div style={{ display: "flex", alignItems: "center", gap: cq(0.8) }}>
              <CertigoLogo style={{ width: cq(3.5), height: cq(3.5) }} />
              <div className="font-display font-bold text-foreground" style={{ fontSize: cq(1.8) }}>
                CERTIGO
              </div>
            </div>
          </div>

          {/* TOP RIGHT: REF CODE + VERIFIED SIGN */}
          <div className="absolute top-0 right-0" style={{ padding: cq(2), textAlign: "right" }}>
            <div className="font-mono text-foreground" style={{ fontSize: cq(0.95), fontWeight: 700, letterSpacing: "0.08em" }}>
              REF-CODE: {displaySerial}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: cq(0.5), marginTop: cq(0.6) }}>
              <VerifiedSeal style={{ width: cq(1.4), height: cq(1.4) }} />
              <span className="font-sans" style={{ fontSize: cq(0.85), fontWeight: 600, letterSpacing: "0.12em", color: "#16a34a" }}>
                VERIFIED · ON-CHAIN
              </span>
            </div>
          </div>

          {/* CENTER: MAIN CONTENT */}
          <div style={{ marginTop: cq(4.5) }}>
            {/* Main Title */}
            <h1
              className="text-foreground text-center"
              style={{
                fontSize: cq(5),
                lineHeight: 1.05,
                fontFamily: "'UnifrakturCook', 'Old English Text MT', 'Blackletter', serif",
                fontWeight: 700,
                marginBottom: cq(1.5),
                letterSpacing: "0.01em",
              }}
            >
              Certificate of Appreciation
            </h1>

            {/* Presentation text */}
            <p className="font-sans text-foreground/80 text-center" style={{ fontSize: cq(1.15), letterSpacing: "0.28em", marginBottom: cq(1), fontWeight: 500 }}>
              THIS CERTIFICATE IS PRESENTED TO
            </p>

            {/* Blank line for recipient name */}
            <div style={{ height: "2px", background: "#000000", margin: `${cq(1)} auto`, width: "60%", maxWidth: "400px" }} />

            {/* Recipient Name */}
            <p className="text-foreground text-center" style={{ fontSize: cq(3), marginTop: cq(1.2), marginBottom: cq(2.2), fontWeight: 600, fontStyle: "italic", fontFamily: "'Cormorant Garamond', ui-serif, Georgia, serif" }}>
              {p.recipientName}
            </p>

            {/* Fine Print Placeholder Text */}
            <div className="font-sans text-foreground/70 text-center" style={{ fontSize: cq(0.9), lineHeight: 1.6, maxWidth: "85%", margin: "0 auto", marginBottom: cq(2.5) }}>
              <p style={{ marginBottom: cq(1) }}>
                For successfully completing the training program "{p.courseTopic}" and demonstrating exceptional commitment to professional development and continuous learning. This credential certifies that the recipient has met all requirements and competency standards.
              </p>
              <p style={{ fontSize: cq(0.8), opacity: 0.8 }}>
                This certificate is issued in recognition of achievement and is valid as per the certification standards established by Certigo. Verification of this credential can be performed through the QR code provided.
                {p.score != null ? ` Final assessment score: ${p.score}%` : ""}
              </p>
            </div>
          </div>

          {/* FOOTER: SIGNATURE + SIGNATORY LINE + QR CODE */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: cq(2), marginTop: "auto", alignItems: "flex-end" }}>
            {/* Left: Signature + Signatory Line */}
            <div style={{ textAlign: "left" }}>
              <SignatureMonogram variant={sigVariant} style={{ height: cq(3), width: "100%", marginBottom: cq(0.3) }} />
              <div style={{ height: "1px", background: "#000000", marginBottom: cq(0.3) }} />
              <div className="font-sans font-bold text-foreground" style={{ fontSize: cq(0.95) }}>
                CERTIGO. AUTHORIZED SIGNATORY
              </div>
              <div className="font-sans text-foreground/60" style={{ fontSize: cq(0.8), marginTop: cq(0.2) }}>
                {new Date(p.issuedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>

            {/* Center: Corporate Seal (spacer) */}
            <div style={{ textAlign: "center" }} />

            {/* Right: QR Code */}
            <div style={{ textAlign: "right" }}>
              {qr && (
                <a href={qrTarget} target="_blank" rel="noreferrer" className="block" style={{ display: "inline-block" }}>
                  <img src={qr} alt="Scan to verify" className="border border-foreground/30" style={{ width: cq(7), height: cq(7) }} />
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

// === CERTIGO LOGO: Stylized Gold Shield with 'G' ===
function CertigoLogo({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 120" style={style} aria-hidden>
      {/* Gold Shield Shape */}
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFC700" />
          <stop offset="100%" stopColor="#DAA520" />
        </linearGradient>
      </defs>
      
      {/* Shield outline and fill */}
      <path
        d="M 50 10 L 25 30 L 25 60 Q 25 90 50 110 Q 75 90 75 60 L 75 30 Z"
        fill="url(#goldGradient)"
        stroke="#B8860B"
        strokeWidth="2"
      />
      
      {/* Shield highlight */}
      <path
        d="M 50 10 L 30 28 L 30 60 Q 30 85 50 102 Q 65 85 65 60 L 65 28 Z"
        fill="none"
        stroke="#FFED4E"
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Large 'G' in the center */}
      <text
        x="50"
        y="70"
        fontSize="48"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#1a1a1a"
        fontFamily="serif"
      >
        G
      </text>
    </svg>
  );
}

// === VERIFIED CHECKMARK ===
function VerifiedCheckmark({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={style} aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// === VERIFIED SEAL — green badge with checkmark ===
function VerifiedSeal({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={style} aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#16a34a" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="#15803d" strokeWidth="1" />
      <polyline points="7.5 12.5 10.5 15.5 16.5 8.5" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// === Big Signature Monogram + handwriting flourish strokes ===
function SignatureMonogram({ variant, style }: { variant: number; style?: React.CSSProperties }) {
  // flourish variants (lines that emanate from / wrap the monogram)
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
    <svg viewBox="0 0 250 60" preserveAspectRatio="xMinYMid meet" aria-hidden style={style}>
      <g fill="none" stroke="oklch(0.16 0.01 270)" strokeLinecap="round" strokeLinejoin="round">
        {/* Large hand-drawn N/Signature */}
        <path d="M14 50 C 12 38, 14 22, 16 10 L 18 10 L 56 44 L 58 44 C 56 32, 56 20, 58 8"
              strokeWidth="3.4" />
        {/* secondary thin overlay for ink weight */}
        <path d="M16 12 L 56 46" strokeWidth="1.2" opacity="0.55" />
        {/* tail flourish */}
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
