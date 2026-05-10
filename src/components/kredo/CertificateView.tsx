import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { formatSerial } from "@/lib/cert";
import sigOfficer from "@/assets/sig-officer.png";
import sigDirector from "@/assets/sig-director.png";

export type CertTemplate =
  | "classic" | "double" | "ornate" | "minimal" | "deco"
  | "bordered" | "navy" | "emerald" | "stripe" | "embossed" | "signature"
  | "executive" | "technical" | "dark-glass";
export type CertOrientation = "landscape" | "portrait";
export type SignatureVariant = 0 | 1 | 2 | 3 | 4;
export const SIGNATURE_VARIANTS: { key: SignatureVariant; label: string }[] = [
  { key: 0, label: "Loop & Sweep" }, { key: 1, label: "Bold Cursive" },
  { key: 2, label: "Angular Flair" }, { key: 3, label: "Minimal Stroke" },
  { key: 4, label: "Double Loop" },
];
export const CERT_TEMPLATES: { key: CertTemplate; label: string; hint: string }[] = [
  { key: "signature", label: "Professional", hint: "CERTIGO Institute — official credential" },
  { key: "executive", label: "Executive", hint: "Classic serif · centered golden seal" },
  { key: "technical", label: "Technical", hint: "Blueprint grid · competency sidebar" },
  { key: "dark-glass", label: "Modern Dark", hint: "Dark mode · gold text · glassmorphism" },
  { key: "classic", label: "Classic", hint: "Thin black frame" },
  { key: "double", label: "Double", hint: "Inner + outer black border" },
  { key: "ornate", label: "Ornate", hint: "Gold double frame" },
  { key: "minimal", label: "Minimal", hint: "Single hairline grey" },
  { key: "deco", label: "Art Deco", hint: "Geometric corner brackets" },
  { key: "bordered", label: "Bordered", hint: "Bold solid frame" },
  { key: "navy", label: "Navy", hint: "Navy double border" },
  { key: "emerald", label: "Emerald", hint: "Forest green + star corners" },
  { key: "stripe", label: "Stripe", hint: "Left vertical accent stripe" },
  { key: "embossed", label: "Embossed", hint: "Inset shadow + thin frame" },
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

const COMPETENCIES: { label: string; icon: "brain" | "gear" | "bars" | "shield" }[] = [
  { label: "LLM Prompt Design", icon: "brain" },
  { label: "AI Workflow Automation", icon: "gear" },
  { label: "Prompt Optimization Techniques", icon: "bars" },
  { label: "Safety & Responsible AI Usage", icon: "shield" },
];

export function CertificateView(p: Props) {
  const [qr, setQr] = useState<string>("");
  const displaySerial = formatSerial(p.serial);
  const orientation: CertOrientation = p.orientation ?? "landscape";
  const isPortrait = orientation === "portrait";

  const issued = new Date(p.issuedAt);
  const expiry = new Date(issued); expiry.setFullYear(expiry.getFullYear() + 2);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const verifyHost = "certigo.institute";
  const qrTarget = (() => {
    try { const u = new URL(p.verifyUrl); return `${u.origin}/verify/${displaySerial}`; }
    catch { return `/verify/${displaySerial}`; }
  })();
  useEffect(() => { QRCode.toDataURL(qrTarget, { margin: 0, width: 320 }).then(setQr); }, [qrTarget]);

  const aspect = isPortrait ? "1/1.414" : "1.414/1";
  const s = isPortrait ? 1.35 : 1;
  const cq = (n: number) => `${(n * s).toFixed(2)}cqw`;

  // Themed palette variants
  const theme = p.template;
  if (theme === "executive") {
    return (
      <ExecutiveCert p={p} qr={qr} qrTarget={qrTarget} displaySerial={displaySerial}
        issued={issued} expiry={expiry} fmt={fmt} aspect={aspect} cq={cq} />
    );
  }
  if (theme === "technical") {
    return (
      <TechnicalCert p={p} qr={qr} qrTarget={qrTarget} displaySerial={displaySerial}
        issued={issued} expiry={expiry} fmt={fmt} aspect={aspect} cq={cq} />
    );
  }
  if (theme === "dark-glass") {
    return (
      <DarkGlassCert p={p} qr={qr} qrTarget={qrTarget} displaySerial={displaySerial}
        issued={issued} expiry={expiry} fmt={fmt} aspect={aspect} cq={cq} />
    );
  }

  const ink = "#0a0a0a";
  const sub = "#2a2a2a";
  const mute = "#6b6b6b";
  const paper = "#ffffff";
  const accent = "#7a1f1f";

  return (
    <div
      style={{ containerType: "inline-size", aspectRatio: aspect, background: ink, color: ink } as React.CSSProperties}
      className={`relative w-full overflow-hidden ${p.compact ? "" : "shadow-2xl"}`}
    >
      {/* V2 Museum frame: single thin outer + hairline inner */}
      <div className="absolute" style={{ inset: 0, background: paper }} />
      <div className="absolute" style={{ inset: cq(1.2), border: `${cq(0.18)} solid ${ink}` }} />
      <div className="absolute" style={{ inset: cq(1.8), border: `${cq(0.04)} solid ${ink}`, opacity: 0.55 }} />

      <div className="relative h-full" style={{ padding: `${cq(3.4)} ${cq(4.6)} ${cq(2.8)}`, display: "flex", flexDirection: "column", textAlign: "center", alignItems: "center" }}>
        {/* TOP: wordmark + tagline */}
        <div style={{
          fontFamily: "'Archivo Black', 'Helvetica Neue', sans-serif",
          fontSize: cq(5.4),
          fontWeight: 900,
          letterSpacing: "-0.05em",
          lineHeight: 0.9,
          color: ink,
        }}>
          CERTIGO<span style={{ color: accent }}>.</span>
        </div>
        <div style={{
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          fontSize: cq(0.7),
          letterSpacing: "0.34em",
          fontWeight: 700,
          color: mute,
          marginTop: cq(0.7),
        }}>
          GLOBAL STANDARDS <span style={{ color: accent, margin: `0 ${cq(0.45)}` }}>·</span> VERIFIED EXCELLENCE
        </div>

        {/* "This is to certify that" */}
        <div style={{
          fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
          fontSize: cq(1.6),
          fontStyle: "italic",
          fontWeight: 500,
          color: sub,
          marginTop: cq(2.4),
        }}>
          This is to certify that
        </div>

        {/* recipient */}
        <div style={{
          fontFamily: "'Archivo Black', 'Helvetica Neue', sans-serif",
          fontSize: cq(6.2),
          fontWeight: 900,
          letterSpacing: "-0.045em",
          color: ink,
          textTransform: "uppercase",
          lineHeight: 1,
          marginTop: cq(1.2),
        }}>
          {p.recipientName}
        </div>

        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: cq(1.4),
          color: sub,
          marginTop: cq(1.4),
        }}>
          has successfully completed
        </div>
        <div style={{
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          fontSize: cq(1.55),
          fontWeight: 800,
          color: ink,
          marginTop: cq(0.6),
          letterSpacing: "0.01em",
          textTransform: "uppercase",
        }}>
          {p.courseTopic}
        </div>
        {p.score != null && (
          <div style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: cq(0.65),
            letterSpacing: "0.28em",
            color: mute,
            fontWeight: 600,
            marginTop: cq(0.5),
          }}>
            PROFESSIONAL LEVEL · SCORE {p.score}%
          </div>
        )}

        {/* COMPETENCIES — 6 inline outlined chips */}
        <div style={{
          marginTop: cq(1.6),
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: cq(0.55),
          maxWidth: "92%",
        }}>
          {["PROMPT DESIGN","CONTEXT ENGINEERING","MODEL INTEGRATION","EVALUATION & TESTING","SAFETY & ETHICS","OPTIMIZATION"].map((label) => (
            <div key={label} style={{
              display: "inline-flex",
              alignItems: "center",
              border: `${cq(0.06)} solid ${ink}`,
              padding: `${cq(0.32)} ${cq(0.85)}`,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: cq(0.66),
              fontWeight: 600,
              color: ink,
              letterSpacing: "0.1em",
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* spacer */}
        <div style={{ flex: 1 }} />

        {/* BOTTOM ROW: signature | wax seal (centered) | signature */}
        <div style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "end",
          gap: cq(1.4),
          marginTop: cq(1),
        }}>
          <MinimalSig cq={cq} ink={ink} mute={mute} sigSrc={sigDirector} title="Director of Certification" />

          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: cq(0.2) }}>
            <WaxSeal style={{ width: cq(8.4), height: cq(8.4), display: "block" }} />
          </div>

          <MinimalSig cq={cq} ink={ink} mute={mute} sigSrc={sigOfficer} title="Chief Standards Officer" />
        </div>

        {/* BOTTOM META: corner-aligned issued / id, with QR floated bottom-right */}
        <div style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: cq(2.2),
          marginTop: cq(1.6),
          paddingRight: cq(7),
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: cq(0.62),
          letterSpacing: "0.16em",
          color: mute,
          fontWeight: 600,
        }}>
          <span>ISSUED {fmt(issued).toUpperCase()}</span>
          <span style={{ color: mute }}>VALID {fmt(expiry).toUpperCase()}</span>
          <span>ID {displaySerial}</span>
        </div>

        {/* QR — bottom-right corner, outside meta row */}
        {qr && (
          <a href={qrTarget} target="_blank" rel="noreferrer" style={{
            position: "absolute", right: cq(2.6), bottom: cq(2.6),
            display: "block",
          }}>
            <img src={qr} alt={`Verify on ${verifyHost}`} style={{ width: cq(4.6), height: cq(4.6), display: "block" }} />
          </a>
        )}

        {p.watermark && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div style={{
              transform: "rotate(-22deg)",
              fontFamily: "'Archivo Black', sans-serif",
              fontWeight: 900,
              color: "rgba(10,10,10,0.04)",
              fontSize: cq(11),
              letterSpacing: "-0.03em",
            }}>
              CERTIGO. FREE
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SmallMeta({ cq, ink, mute, label, value, mono, align }: {
  cq: (n: number) => string; ink: string; mute: string;
  label: string; value: string; mono?: boolean; align?: "left" | "right";
}) {
  return (
    <div style={{ textAlign: align ?? "left" }}>
      <div style={{
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        fontSize: cq(0.6),
        letterSpacing: "0.28em",
        fontWeight: 800,
        color: mute,
      }}>{label}</div>
      <div style={{
        fontFamily: mono ? "'JetBrains Mono', ui-monospace, monospace" : "'Inter', ui-sans-serif, system-ui, sans-serif",
        fontSize: cq(0.9),
        fontWeight: 700,
        color: ink,
        marginTop: cq(0.2),
        letterSpacing: mono ? "0.04em" : "-0.005em",
      }}>{value}</div>
    </div>
  );
}

function MinimalSig({ cq, ink, mute, sigSrc, title }: {
  cq: (n: number) => string; ink: string; mute: string;
  sigSrc: string; title: string;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <img src={sigSrc} alt="Authorized signature" style={{
        height: cq(3),
        maxWidth: "80%",
        objectFit: "contain",
        display: "block",
        margin: `0 auto ${cq(-0.2)}`,
        mixBlendMode: "multiply",
      }} />
      <div style={{ height: cq(0.04), background: ink, opacity: 0.7 }} />
      <div style={{
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: cq(0.6),
        fontWeight: 600,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: mute,
        marginTop: cq(0.45),
      }}>{title}</div>
    </div>
  );
}

function CompIcon({ name, size, color }: { name: "brain" | "gear" | "bars" | "shield"; size: string; color: string }) {
  const common = { width: size, height: size, fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "brain":
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <path d="M9 4.5a2.5 2.5 0 0 0-2.5 2.5v.5A2.5 2.5 0 0 0 4 10v1a2.5 2.5 0 0 0 1.5 2.3V14a2.5 2.5 0 0 0 2.5 2.5H9V4.5Z" />
          <path d="M15 4.5A2.5 2.5 0 0 1 17.5 7v.5A2.5 2.5 0 0 1 20 10v1a2.5 2.5 0 0 1-1.5 2.3V14a2.5 2.5 0 0 1-2.5 2.5H15V4.5Z" />
          <path d="M9 9h2M13 9h2M9 13h2M13 13h2" />
          <path d="M9 4.5C9 3.67 9.67 3 10.5 3S12 3.67 12 4.5M15 4.5C15 3.67 14.33 3 13.5 3S12 3.67 12 4.5" />
          <path d="M9 16.5v1A2.5 2.5 0 0 0 11.5 20h1a2.5 2.5 0 0 0 2.5-2.5v-1" />
        </svg>
      );
    case "gear":
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
        </svg>
      );
    case "bars":
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <path d="M3 21h18" />
          <rect x="5" y="13" width="3" height="6" />
          <rect x="11" y="9" width="3" height="10" />
          <rect x="17" y="5" width="3" height="14" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
  }
}

function MetaIcon({ name, size, color }: { name: "calendar" | "calendar-check" | "badge"; size: string; color: string }) {
  const common = { width: size, height: size, fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="1.5" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );
    case "calendar-check":
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="1.5" />
          <path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4" />
        </svg>
      );
    case "badge":
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <circle cx="12" cy="9" r="5" />
          <path d="M8.5 13 7 21l5-3 5 3-1.5-8" />
          <path d="m10 9 1.5 1.5L14 8" />
        </svg>
      );
  }
}

function BoardEmblem({ size, color }: { size: string; color: string }) {
  return (
    <svg viewBox="0 0 60 60" style={{ width: size, height: size }} aria-hidden>
      <circle cx="30" cy="30" r="14" fill="none" stroke={color} strokeWidth="1.5" />
      <text x="30" y="36" textAnchor="middle" fontFamily="'Archivo Black', serif" fontWeight="900" fontSize="18" fill={color}>C</text>
      {/* laurel left */}
      <g stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M14 22 C 8 30, 8 38, 16 46" />
        {[26, 32, 38, 42].map((y, i) => <path key={`l${i}`} d={`M${12 + (i % 2)} ${y} q -4 -2 -6 -5`} />)}
      </g>
      <g stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M46 22 C 52 30, 52 38, 44 46" />
        {[26, 32, 38, 42].map((y, i) => <path key={`r${i}`} d={`M${48 - (i % 2)} ${y} q 4 -2 6 -5`} />)}
      </g>
    </svg>
  );
}

function WaxSeal({ style }: { style?: React.CSSProperties }) {
  const red = "#7a1f1f";
  const dark = "#4a0f0f";
  return (
    <svg viewBox="0 0 220 220" style={style} aria-hidden>
      <defs>
        <radialGradient id="wax" cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#b53a3a" />
          <stop offset="55%" stopColor={red} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
        <filter id="waxshadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="2" dy="4" result="off" />
          <feComponentTransfer><feFuncA type="linear" slope="0.4" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* irregular scalloped outer */}
      <path filter="url(#waxshadow)"
        d="M110 6 C 138 8, 165 18, 188 36 C 210 56, 218 90, 212 122 C 208 152, 188 182, 158 200 C 130 215, 96 218, 68 204 C 38 188, 16 158, 10 122 C 6 90, 18 56, 42 34 C 62 16, 88 6, 110 6 Z"
        fill="url(#wax)" stroke={dark} strokeWidth="1.4" />
      {/* inner rings */}
      <circle cx="110" cy="110" r="80" fill="none" stroke="#f1d9b6" strokeWidth="1.6" opacity="0.7" />
      <circle cx="110" cy="110" r="68" fill="none" stroke="#f1d9b6" strokeWidth="0.8" opacity="0.5" />
      {/* center C with period to echo wordmark */}
      <text x="108" y="138" fontFamily="'Archivo Black', serif" fontWeight="900" fontSize="98" textAnchor="middle" fill="#f1d9b6" opacity="0.9">C</text>
      <circle cx="158" cy="135" r="7" fill="#f1d9b6" opacity="0.9" />
      {/* highlight */}
      <ellipse cx="78" cy="58" rx="30" ry="14" fill="#fff" opacity="0.18" />
    </svg>
  );
}

/* ─────────── THEMED VARIANTS ─────────── */
type ThemedProps = {
  p: Props;
  qr: string;
  qrTarget: string;
  displaySerial: string;
  issued: Date;
  expiry: Date;
  fmt: (d: Date) => string;
  aspect: string;
  cq: (n: number) => string;
};

function ExecutiveCert({ p, qr, qrTarget, displaySerial, issued, expiry, fmt, aspect, cq }: ThemedProps) {
  const ink = "#1a1a1a";
  const mute = "#7a7a7a";
  const gold = "#b08a36";
  return (
    <div
      style={{ containerType: "inline-size", aspectRatio: aspect, background: "#ffffff", color: ink } as React.CSSProperties}
      className={`relative w-full overflow-hidden ${p.compact ? "" : "shadow-2xl"}`}
    >
      <div className="absolute" style={{ inset: cq(1.4), border: `${cq(0.08)} solid ${gold}` }} />
      <div className="absolute" style={{ inset: cq(2.0), border: `${cq(0.04)} solid ${gold}`, opacity: 0.6 }} />
      <div className="relative h-full" style={{ padding: `${cq(5)} ${cq(6)}`, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', serif", fontSize: cq(1.1), letterSpacing: "0.5em", fontWeight: 700, color: gold, textTransform: "uppercase" }}>
          Certificate of Achievement
        </div>
        <div style={{ marginTop: cq(0.6), height: cq(0.06), width: cq(10), background: gold }} />
        <div style={{ marginTop: cq(2.4), fontFamily: "'Playfair Display', serif", fontSize: cq(1.4), fontStyle: "italic", color: mute }}>
          This certificate is proudly presented to
        </div>
        <div style={{ marginTop: cq(1.6), fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: cq(5.4), letterSpacing: "-0.01em", lineHeight: 1, color: ink }}>
          {p.recipientName}
        </div>
        <div style={{ marginTop: cq(2), fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: cq(1.3), color: mute, maxWidth: "70%" }}>
          for the successful completion of
        </div>
        <div style={{ marginTop: cq(0.7), fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: cq(1.9), color: ink }}>
          {p.courseTopic}
        </div>
        {p.score != null && (
          <div style={{ marginTop: cq(0.6), fontFamily: "'JetBrains Mono', monospace", fontSize: cq(0.7), letterSpacing: "0.3em", color: mute }}>
            FINAL SCORE · {p.score}%
          </div>
        )}
        <div style={{ flex: 1 }} />
        {/* Centered Golden Seal */}
        <div style={{ marginTop: cq(2) }}>
          <GoldenSeal size={cq(7.5)} />
        </div>
        <div style={{
          width: "100%", marginTop: cq(2), display: "flex", justifyContent: "space-between", alignItems: "end",
          fontFamily: "'JetBrains Mono', monospace", fontSize: cq(0.62), letterSpacing: "0.2em", color: mute,
        }}>
          <div style={{ textAlign: "left" }}>
            <div>ISSUED</div>
            <div style={{ marginTop: cq(0.2), color: ink, fontWeight: 700 }}>{fmt(issued).toUpperCase()}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div>CREDENTIAL ID</div>
            <div style={{ marginTop: cq(0.2), color: ink, fontWeight: 700 }}>{displaySerial}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div>VALID UNTIL</div>
            <div style={{ marginTop: cq(0.2), color: ink, fontWeight: 700 }}>{fmt(expiry).toUpperCase()}</div>
          </div>
        </div>
        {qr && (
          <a href={qrTarget} target="_blank" rel="noreferrer" style={{ position: "absolute", right: cq(2.4), bottom: cq(2.4) }}>
            <img src={qr} alt="Verify" style={{ width: cq(3.6), height: cq(3.6), display: "block" }} />
          </a>
        )}
      </div>
    </div>
  );
}

function TechnicalCert({ p, qr, qrTarget, displaySerial, issued, expiry, fmt, aspect, cq }: ThemedProps) {
  const ink = "#0c1e3a";
  const mute = "#5b7898";
  const accent = "#2563eb";
  const competencies = ["Domain Mastery", "Applied Methods", "Systems Design", "Risk & Governance", "Quantitative Reasoning", "Practitioner Capstone"];
  return (
    <div
      style={{
        containerType: "inline-size", aspectRatio: aspect,
        background: "#f8fafc", color: ink,
        backgroundImage: `linear-gradient(to right, rgba(37,99,235,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(37,99,235,0.08) 1px, transparent 1px)`,
        backgroundSize: `${cq(2)} ${cq(2)}`,
      } as React.CSSProperties}
      className={`relative w-full overflow-hidden ${p.compact ? "" : "shadow-2xl"}`}
    >
      <div className="absolute" style={{ inset: cq(1), border: `${cq(0.08)} solid ${ink}` }} />
      <div className="relative h-full" style={{ padding: cq(2.6), display: "grid", gridTemplateColumns: "1fr 30%", gap: cq(2) }}>
        {/* main */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: cq(0.7), letterSpacing: "0.3em", color: accent, fontWeight: 700 }}>
            CERTIGO. // TECHNICAL CREDENTIAL
          </div>
          <div style={{ marginTop: cq(0.8), fontFamily: "'Inter', sans-serif", fontSize: cq(0.85), letterSpacing: "0.2em", color: mute, fontWeight: 700 }}>
            ISSUED TO
          </div>
          <div style={{ marginTop: cq(0.4), fontFamily: "'Archivo Black', sans-serif", fontSize: cq(4), letterSpacing: "-0.02em", lineHeight: 1, color: ink }}>
            {p.recipientName}
          </div>
          <div style={{ marginTop: cq(1.6), fontFamily: "'Inter', sans-serif", fontSize: cq(0.75), letterSpacing: "0.2em", color: mute, fontWeight: 700 }}>
            CREDENTIAL
          </div>
          <div style={{ marginTop: cq(0.3), fontFamily: "'Inter', sans-serif", fontSize: cq(1.4), fontWeight: 800, color: ink }}>
            {p.courseTopic}
          </div>
          {p.score != null && (
            <div style={{ marginTop: cq(0.4), fontFamily: "'JetBrains Mono', monospace", fontSize: cq(0.65), letterSpacing: "0.2em", color: accent, fontWeight: 700 }}>
              ASSESSED PROFICIENCY · {p.score}%
            </div>
          )}
          <div style={{ flex: 1 }} />
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: cq(1),
            paddingTop: cq(1.2), borderTop: `${cq(0.04)} solid ${ink}`,
            fontFamily: "'JetBrains Mono', monospace", fontSize: cq(0.55), letterSpacing: "0.18em", color: mute,
          }}>
            <div><div>ISSUED</div><div style={{ marginTop: cq(0.2), color: ink, fontWeight: 700 }}>{fmt(issued).toUpperCase()}</div></div>
            <div><div>VALID</div><div style={{ marginTop: cq(0.2), color: ink, fontWeight: 700 }}>{fmt(expiry).toUpperCase()}</div></div>
            <div><div>SERIAL</div><div style={{ marginTop: cq(0.2), color: ink, fontWeight: 700 }}>{displaySerial}</div></div>
          </div>
        </div>
        {/* sidebar */}
        <div style={{
          background: "#ffffff", border: `${cq(0.06)} solid ${ink}`,
          padding: cq(1.4), display: "flex", flexDirection: "column",
        }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: cq(0.6), letterSpacing: "0.22em", color: accent, fontWeight: 700 }}>
            PASSED COMPETENCIES
          </div>
          <ul style={{ marginTop: cq(0.8), padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: cq(0.5) }}>
            {competencies.map((c) => (
              <li key={c} style={{ display: "flex", alignItems: "flex-start", gap: cq(0.4), fontFamily: "'Inter', sans-serif", fontSize: cq(0.7), color: ink, fontWeight: 600 }}>
                <span style={{ marginTop: cq(0.18), width: cq(0.45), height: cq(0.45), background: accent, display: "inline-block" }} />
                {c}
              </li>
            ))}
          </ul>
          <div style={{ flex: 1 }} />
          {qr && (
            <div style={{ marginTop: cq(1), display: "flex", flexDirection: "column", alignItems: "center" }}>
              <a href={qrTarget} target="_blank" rel="noreferrer">
                <img src={qr} alt="Verify" style={{ width: cq(4.6), height: cq(4.6), display: "block" }} />
              </a>
              <div style={{ marginTop: cq(0.4), fontFamily: "'JetBrains Mono', monospace", fontSize: cq(0.5), letterSpacing: "0.18em", color: mute, fontWeight: 700 }}>
                SCAN TO VERIFY
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DarkGlassCert({ p, qr, qrTarget, displaySerial, issued, expiry, fmt, aspect, cq }: ThemedProps) {
  const gold = "#d4af37";
  const goldSoft = "#f1d9b6";
  const text = "#f5f0e6";
  const muted = "rgba(245,240,230,0.55)";
  return (
    <div
      style={{
        containerType: "inline-size", aspectRatio: aspect,
        background: "radial-gradient(circle at 25% 15%, #1a1a2e 0%, #0a0a12 60%, #050509 100%)",
        color: text,
      } as React.CSSProperties}
      className={`relative w-full overflow-hidden ${p.compact ? "" : "shadow-2xl"}`}
    >
      {/* glass shimmer layers */}
      <div className="absolute" style={{ inset: 0, background: "radial-gradient(ellipse at top, rgba(212,175,55,0.18), transparent 60%)" }} />
      <div className="absolute" style={{ inset: cq(1.6), border: `${cq(0.06)} solid ${gold}`, opacity: 0.6 }} />
      <div className="absolute" style={{
        inset: cq(2.4),
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `${cq(0.04)} solid rgba(212,175,55,0.35)`,
        borderRadius: cq(0.4),
      }} />
      <div className="relative h-full" style={{ padding: `${cq(4.6)} ${cq(5)}`, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: cq(4.4), fontWeight: 900, letterSpacing: "-0.04em", color: text }}>
          CERTIGO<span style={{ color: gold }}>.</span>
        </div>
        <div style={{ marginTop: cq(0.5), fontFamily: "'JetBrains Mono', monospace", fontSize: cq(0.65), letterSpacing: "0.34em", color: gold, fontWeight: 700 }}>
          ELITE CREDENTIAL
        </div>
        <div style={{ marginTop: cq(2.4), fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: cq(1.3), color: muted }}>
          Awarded to
        </div>
        <div style={{ marginTop: cq(1), fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: cq(5.6), letterSpacing: "-0.01em", lineHeight: 1, color: gold, textShadow: `0 0 ${cq(1)} rgba(212,175,55,0.35)` }}>
          {p.recipientName}
        </div>
        <div style={{ marginTop: cq(1.8), fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: cq(1.2), color: muted }}>
          for mastery of
        </div>
        <div style={{ marginTop: cq(0.5), fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: cq(1.6), color: text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {p.courseTopic}
        </div>
        {p.score != null && (
          <div style={{ marginTop: cq(0.6), fontFamily: "'JetBrains Mono', monospace", fontSize: cq(0.7), letterSpacing: "0.3em", color: goldSoft }}>
            EXAM SCORE · {p.score}%
          </div>
        )}
        <div style={{ flex: 1 }} />
        <div style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "end",
          fontFamily: "'JetBrains Mono', monospace", fontSize: cq(0.6), letterSpacing: "0.22em", color: muted,
        }}>
          <div style={{ textAlign: "left" }}>
            <div>ISSUED</div>
            <div style={{ marginTop: cq(0.2), color: text, fontWeight: 700 }}>{fmt(issued).toUpperCase()}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div>ID</div>
            <div style={{ marginTop: cq(0.2), color: gold, fontWeight: 700 }}>{displaySerial}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div>VALID</div>
            <div style={{ marginTop: cq(0.2), color: text, fontWeight: 700 }}>{fmt(expiry).toUpperCase()}</div>
          </div>
        </div>
        {qr && (
          <a href={qrTarget} target="_blank" rel="noreferrer" style={{ position: "absolute", right: cq(3), bottom: cq(3) }}>
            <img src={qr} alt="Verify" style={{ width: cq(3.4), height: cq(3.4), display: "block", filter: "invert(1)" }} />
          </a>
        )}
      </div>
    </div>
  );
}

function GoldenSeal({ size }: { size: string }) {
  return (
    <svg viewBox="0 0 200 200" style={{ width: size, height: size }} aria-hidden>
      <defs>
        <radialGradient id="goldseal" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f7e2a7" />
          <stop offset="55%" stopColor="#c9a14e" />
          <stop offset="100%" stopColor="#7d6022" />
        </radialGradient>
      </defs>
      {/* rays */}
      <g fill="#c9a14e" opacity="0.65">
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * 360) / 24;
          return <rect key={i} x="98" y="6" width="4" height="22" transform={`rotate(${a} 100 100)`} />;
        })}
      </g>
      <circle cx="100" cy="100" r="68" fill="url(#goldseal)" stroke="#7d6022" strokeWidth="1.4" />
      <circle cx="100" cy="100" r="56" fill="none" stroke="#f1d9b6" strokeWidth="1" opacity="0.8" />
      <text x="100" y="118" textAnchor="middle" fontFamily="'Playfair Display', serif" fontWeight="900" fontSize="64" fill="#3a2a08">C</text>
      <text x="100" y="160" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="10" fill="#3a2a08" letterSpacing="3">CERTIGO.</text>
    </svg>
  );
}
