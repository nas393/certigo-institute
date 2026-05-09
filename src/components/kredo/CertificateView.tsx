import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { formatSerial } from "@/lib/cert";

export type CertTemplate =
  | "classic"
  | "double"
  | "ornate"
  | "minimal"
  | "deco"
  | "bordered"
  | "navy"
  | "emerald"
  | "stripe"
  | "embossed";

export type CertOrientation = "landscape" | "portrait";

export type SignatureVariant = 0 | 1 | 2 | 3 | 4;
export const SIGNATURE_VARIANTS: { key: SignatureVariant; label: string }[] = [
  { key: 0, label: "Loop & Sweep" },
  { key: 1, label: "Bold Cursive" },
  { key: 2, label: "Angular Flair" },
  { key: 3, label: "Minimal Stroke" },
  { key: 4, label: "Double Loop" },
];

export const CERT_TEMPLATES: { key: CertTemplate; label: string; hint: string }[] = [
  { key: "classic",  label: "Classic",   hint: "Thin black frame" },
  { key: "double",   label: "Double",    hint: "Inner + outer black border" },
  { key: "ornate",   label: "Ornate",    hint: "Gold double frame" },
  { key: "minimal",  label: "Minimal",   hint: "Single hairline grey" },
  { key: "deco",     label: "Art Deco",  hint: "Geometric corner brackets" },
  { key: "bordered", label: "Bordered",  hint: "Bold solid frame" },
  { key: "navy",     label: "Navy",      hint: "Navy double border" },
  { key: "emerald",  label: "Emerald",   hint: "Forest green + star corners" },
  { key: "stripe",   label: "Stripe",    hint: "Left vertical accent stripe" },
  { key: "embossed", label: "Embossed",  hint: "Inset shadow + thin frame" },
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
  signatureVariant?: SignatureVariant;
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

  // signature variant: prop > localStorage > deterministic from serial
  const sigVariant: SignatureVariant = (() => {
    if (typeof p.signatureVariant === "number") return p.signatureVariant;
    if (typeof window !== "undefined") {
      const v = parseInt(localStorage.getItem("certigo.sigVariant") || "", 10);
      if (!Number.isNaN(v) && v >= 0 && v <= 4) return v as SignatureVariant;
    }
    let h = 0; for (let i = 0; i < p.serial.length; i++) h = (h * 31 + p.serial.charCodeAt(i)) >>> 0;
    return (h % 5) as SignatureVariant;
  })();

  // Aspect + scale tuning. cqw stays consistent across orientations because
  // container queries scale to width, so portrait gets smaller padding/text
  // multipliers proportionally.
  const aspect = isPortrait ? "1/1.414" : "1.414/1";
  // scale factor: portrait is narrower so we bump cqw a bit for legibility
  const s = isPortrait ? 1.35 : 1;
  const cq = (n: number) => `${(n * s).toFixed(2)}cqw`;

  const tpl: CertTemplate = p.template ?? "classic";
  // per-template chrome: frame color, accent color (for hairlines/title underline)
  const skin: Record<CertTemplate, { ink: string; accent: string; titleColor?: string }> = {
    classic:  { ink: "#000000", accent: "#000000" },
    double:   { ink: "#000000", accent: "#000000" },
    ornate:   { ink: "#b8860b", accent: "#b8860b", titleColor: "#1a1a1a" },
    minimal:  { ink: "#9ca3af", accent: "#000000" },
    deco:     { ink: "#000000", accent: "#000000" },
    bordered: { ink: "#000000", accent: "#000000" },
    navy:     { ink: "#0f2a55", accent: "#0f2a55", titleColor: "#0f2a55" },
    emerald:  { ink: "#065f46", accent: "#065f46", titleColor: "#065f46" },
    stripe:   { ink: "#000000", accent: "#dc2626" },
    embossed: { ink: "#0f172a", accent: "#0f172a" },
  };
  const sk = skin[tpl];

  return (
    <div
      style={{ ...lock, containerType: "inline-size", aspectRatio: aspect } as React.CSSProperties}
      className={`relative w-full overflow-hidden rounded-none ${p.compact ? "" : "shadow-lg"}`}
    >
      {/* === FRAME (varies by template) === */}
      <CertFrame template={tpl} cq={cq} ink={sk.ink} />

      {/* INNER CANVAS — all content lives inside */}
      <div className="absolute overflow-hidden" style={{ inset: cq(tpl === "stripe" ? 1 : 1) }}>
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
                color: sk.titleColor ?? undefined,
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

            {/* Center: Fake stamp seal */}
            <div style={{ textAlign: "center", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
              <CertigoStamp style={{ width: cq(8), height: cq(8) }} />
            </div>

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
// === Hand-drawn signature: 5 variants inspired by a flowing scribble + loop ===
function SignatureMonogram({ variant, style }: { variant: number; style?: React.CSSProperties }) {
  // each variant is an array of <path d, strokeWidth, opacity>
  type Stroke = { d: string; w: number; o?: number };
  const variants: Stroke[][] = [
    // 0 — Loop & Sweep (closest to the uploaded reference)
    [
      { d: "M30 70 C 38 30, 60 12, 78 30 C 92 44, 70 60, 60 50 C 52 42, 70 26, 88 36", w: 2.6 },
      { d: "M120 50 C 110 18, 200 10, 230 35 C 250 55, 215 80, 180 75 C 150 70, 130 55, 145 38 C 160 22, 200 30, 205 50", w: 2.6 },
      { d: "M10 58 C 80 50, 170 48, 250 42", w: 1.6, o: 0.9 },
      { d: "M70 78 C 90 88, 110 86, 130 80", w: 1.4, o: 0.7 },
    ],
    // 1 — Bold Cursive (heavier capital + tail)
    [
      { d: "M22 70 C 28 30, 44 14, 60 22 C 78 32, 60 56, 48 50 L 80 80", w: 3.2 },
      { d: "M90 40 C 130 18, 180 22, 210 40 C 230 54, 200 70, 170 60 C 150 54, 160 42, 180 44", w: 2.8 },
      { d: "M14 76 C 90 84, 180 82, 240 70", w: 1.8, o: 0.85 },
      { d: "M210 32 C 222 38, 226 48, 218 56", w: 1.4, o: 0.7 },
    ],
    // 2 — Angular Flair (sharp diagonals + small loop)
    [
      { d: "M20 78 L 40 18 L 70 78 L 88 22 L 108 70", w: 3 },
      { d: "M130 60 C 150 30, 200 30, 215 50 C 225 64, 200 72, 188 60", w: 2.4 },
      { d: "M0 86 L 240 78", w: 1.4, o: 0.7 },
      { d: "M80 30 L 230 28", w: 1, o: 0.55 },
    ],
    // 3 — Minimal Stroke (single flowing line, light)
    [
      { d: "M20 66 C 60 22, 110 22, 140 50 C 170 78, 220 50, 245 30", w: 2.2 },
      { d: "M14 72 C 90 70, 170 68, 240 60", w: 1.2, o: 0.6 },
    ],
    // 4 — Double Loop (two intertwined ovals)
    [
      { d: "M30 60 C 20 30, 70 12, 90 30 C 110 50, 70 68, 50 56 C 36 48, 60 30, 80 36", w: 2.6 },
      { d: "M120 60 C 110 28, 170 14, 195 32 C 220 52, 175 70, 150 58 C 130 48, 160 30, 185 36", w: 2.6 },
      { d: "M0 76 C 100 70, 180 70, 250 64", w: 1.6, o: 0.8 },
      { d: "M40 86 C 100 92, 170 90, 220 84", w: 1.2, o: 0.6 },
    ],
  ];
  const strokes = variants[variant] ?? variants[0];
  return (
    <svg viewBox="0 0 260 100" preserveAspectRatio="xMinYMid meet" aria-hidden style={style}>
      <g fill="none" stroke="oklch(0.16 0.01 270)" strokeLinecap="round" strokeLinejoin="round">
        {strokes.map((s, i) => (
          <path key={i} d={s.d} strokeWidth={s.w} opacity={s.o ?? 1} />
        ))}
      </g>
    </svg>
  );
}

// === Fake CERTIGO stamp seal (laurel + C + curved text + star) ===
function CertigoStamp({ style }: { style?: React.CSSProperties }) {
  const ink = "#0f2a55";
  return (
    <svg viewBox="0 0 220 220" style={{ ...style, opacity: 0.92 }} aria-hidden>
      <defs>
        <path id="topArc" d="M 35 110 A 75 75 0 0 1 185 110" fill="none" />
        <path id="bottomArc" d="M 35 110 A 75 75 0 0 0 185 110" fill="none" />
      </defs>
      {/* outer ring */}
      <circle cx="110" cy="110" r="100" fill="none" stroke={ink} strokeWidth="3" />
      <circle cx="110" cy="110" r="92" fill="none" stroke={ink} strokeWidth="1" />
      {/* inner ring */}
      <circle cx="110" cy="110" r="70" fill="none" stroke={ink} strokeWidth="2" />
      {/* top text */}
      <text fontFamily="serif" fontWeight="700" fontSize="16" letterSpacing="6" fill={ink}>
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">· CERTIGO ·</textPath>
      </text>
      {/* bottom text (use a path arc that reads correctly along bottom) */}
      <path id="botArc" d="M 30 110 A 80 80 0 0 0 190 110" fill="none" />
      <text fontFamily="serif" fontWeight="700" fontSize="12" letterSpacing="3.5" fill={ink}>
        <textPath href="#botArc" startOffset="50%" textAnchor="middle">VERIFIED · CREDENTIAL</textPath>
      </text>
      {/* laurel left */}
      <g stroke={ink} strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M70 70 C 60 90, 60 130, 78 150" />
        {[78, 92, 106, 120, 134].map((y, i) => (
          <path key={`ll${i}`} d={`M${70 - (i % 2 === 0 ? 2 : 0)} ${y} q -10 -4 -14 -10`} />
        ))}
        {[80, 94, 108, 122, 136].map((y, i) => (
          <path key={`lr${i}`} d={`M${70 + (i % 2 === 0 ? 2 : 0)} ${y} q -2 6 4 12`} />
        ))}
      </g>
      {/* laurel right (mirrored) */}
      <g stroke={ink} strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M150 70 C 160 90, 160 130, 142 150" />
        {[78, 92, 106, 120, 134].map((y, i) => (
          <path key={`rl${i}`} d={`M${150 + (i % 2 === 0 ? 2 : 0)} ${y} q 10 -4 14 -10`} />
        ))}
        {[80, 94, 108, 122, 136].map((y, i) => (
          <path key={`rr${i}`} d={`M${150 - (i % 2 === 0 ? 2 : 0)} ${y} q 2 6 -4 12`} />
        ))}
      </g>
      {/* center C */}
      <text x="110" y="125" fontFamily="serif" fontWeight="900" fontSize="74" textAnchor="middle" fill={ink}>C</text>
      {/* star bottom */}
      <polygon points="110,158 113,166 121,166 115,171 117,179 110,174 103,179 105,171 99,166 107,166" fill={ink} />
      {/* distressed/stamp imperfection — subtle dashed ring */}
      <circle cx="110" cy="110" r="98" fill="none" stroke={ink} strokeWidth="0.8" strokeDasharray="2 4" opacity="0.45" />
    </svg>
  );
}
