import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { formatSerial } from "@/lib/cert";
import sigOfficer from "@/assets/sig-officer.png";
import sigDirector from "@/assets/sig-director.png";

export type CertTemplate =
  | "classic" | "double" | "ornate" | "minimal" | "deco"
  | "bordered" | "navy" | "emerald" | "stripe" | "embossed" | "signature";
export type CertOrientation = "landscape" | "portrait";
export type SignatureVariant = 0 | 1 | 2 | 3 | 4;
export const SIGNATURE_VARIANTS: { key: SignatureVariant; label: string }[] = [
  { key: 0, label: "Loop & Sweep" }, { key: 1, label: "Bold Cursive" },
  { key: 2, label: "Angular Flair" }, { key: 3, label: "Minimal Stroke" },
  { key: 4, label: "Double Loop" },
];
export const CERT_TEMPLATES: { key: CertTemplate; label: string; hint: string }[] = [
  { key: "signature", label: "Professional", hint: "CERTIGO Institute — official credential" },
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

  const ink = "#0a0a0a";
  const sub = "#2a2a2a";
  const mute = "#6b6b6b";
  const paper = "#f5f1e8";
  const accent = "#7a1f1f";

  return (
    <div
      style={{ containerType: "inline-size", aspectRatio: aspect, background: ink, color: ink } as React.CSSProperties}
      className={`relative w-full overflow-hidden ${p.compact ? "" : "shadow-2xl"}`}
    >
      {/* outer black frame */}
      <div className="absolute" style={{ inset: 0, background: ink }} />
      <div className="absolute" style={{ inset: cq(0.9), background: paper }} />

      <div className="relative h-full" style={{ padding: `${cq(2.4)} ${cq(3)}` }}>
        {/* === HEADER ROW: wordmark + seal + vertical credential ID === */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "start", gap: cq(1.5) }}>
          {/* wordmark + institute */}
          <div>
            <div style={{
              fontFamily: "'Archivo Black', 'Helvetica Neue', sans-serif",
              fontSize: cq(7.2),
              fontWeight: 900,
              letterSpacing: "-0.055em",
              lineHeight: 0.85,
              color: ink,
            }}>
              CERTIGO.
            </div>
            <div style={{
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              fontSize: cq(0.85),
              letterSpacing: "0.22em",
              color: sub,
              marginTop: cq(0.8),
              fontWeight: 700,
              lineHeight: 1.5,
            }}>
              CERTIGO INSTITUTE<br />
              PROFESSIONAL CERTIFICATION AUTHORITY
            </div>
          </div>

          {/* wax seal */}
          <div style={{ marginTop: cq(-0.6) }}>
            <WaxSeal style={{ width: cq(11), height: cq(11), display: "block" }} />
          </div>

          {/* vertical credential id */}
          <div style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: cq(0.6),
            paddingTop: cq(0.4),
          }}>
            <div style={{
              fontSize: cq(1.1),
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: ink,
            }}>
              {displaySerial}
            </div>
            <div style={{
              fontSize: cq(0.65),
              letterSpacing: "0.3em",
              color: mute,
              fontWeight: 700,
            }}>
              CREDENTIAL ID
            </div>
          </div>
        </div>

        {/* divider */}
        <div style={{ height: cq(0.1), background: ink, marginTop: cq(1.6), marginBottom: cq(2) }} />

        {/* === MAIN BODY: left text block + right competencies === */}
        <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: cq(2.4), alignItems: "start" }}>
          {/* LEFT */}
          <div>
            <div style={{
              fontFamily: "'Archivo Black', 'Helvetica Neue', sans-serif",
              fontSize: cq(2.4),
              fontWeight: 900,
              letterSpacing: "-0.025em",
              color: ink,
              textTransform: "uppercase",
              lineHeight: 1,
            }}>
              Professional Certification
            </div>
            <p style={{
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              fontSize: cq(0.95),
              color: sub,
              marginTop: cq(0.9),
              lineHeight: 1.5,
              maxWidth: "92%",
            }}>
              This certification verifies that the individual has successfully met the competency standards and assessment requirements established by the Certigo Professional Certification Board.
            </p>

            <div style={{
              fontFamily: "'Archivo Black', 'Helvetica Neue', sans-serif",
              fontSize: cq(4.6),
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: ink,
              textTransform: "uppercase",
              lineHeight: 0.95,
              marginTop: cq(2),
            }}>
              {p.recipientName}
            </div>
            <div style={{ height: cq(0.06), background: ink, marginTop: cq(0.6), marginBottom: cq(0.9), opacity: 0.85 }} />
            <div style={{
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              fontSize: cq(1.25),
              fontWeight: 700,
              color: ink,
              lineHeight: 1.25,
            }}>
              {p.courseTopic}
            </div>
            <div style={{
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              fontSize: cq(0.75),
              letterSpacing: "0.28em",
              color: mute,
              fontWeight: 700,
              marginTop: cq(0.4),
              textTransform: "uppercase",
            }}>
              Professional Level Credential{p.score != null ? ` · Score ${p.score}%` : ""}
            </div>
          </div>

          {/* RIGHT: competencies card */}
          <div style={{
            border: `${cq(0.08)} solid ${ink}`,
            background: "#fbf8f0",
            marginTop: cq(2.6),
          }}>
            <div style={{
              background: ink,
              color: paper,
              padding: `${cq(0.8)} ${cq(1.2)}`,
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              fontSize: cq(0.95),
              letterSpacing: "0.18em",
              fontWeight: 800,
            }}>
              VALIDATED COMPETENCIES
            </div>
            <div style={{ padding: `${cq(0.6)} ${cq(1.2)}` }}>
              {COMPETENCIES.map((c, i) => (
                <div key={c.label} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: cq(1),
                  padding: `${cq(0.7)} 0`,
                  borderBottom: i < COMPETENCIES.length - 1 ? `${cq(0.04)} dashed ${ink}55` : "none",
                }}>
                  <CompIcon name={c.icon} size={cq(1.6)} color={ink} />
                  <span style={{
                    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                    fontSize: cq(1),
                    color: ink,
                    fontWeight: 600,
                  }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === BOTTOM: QR + meta + signatures === */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "auto 1.1fr 1.4fr 1.1fr",
          gap: cq(1.8),
          alignItems: "end",
          marginTop: cq(2.4),
        }}>
          {/* QR + verify text */}
          <div style={{ display: "flex", gap: cq(1) }}>
            {qr && (
              <a href={qrTarget} target="_blank" rel="noreferrer" style={{ display: "block", flexShrink: 0 }}>
                <img src={qr} alt="Scan to verify" style={{ width: cq(7), height: cq(7), display: "block" }} />
              </a>
            )}
            <div style={{
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              fontSize: cq(0.75),
              color: sub,
              lineHeight: 1.5,
            }}>
              <div style={{ fontWeight: 800, letterSpacing: "0.18em", color: ink, marginBottom: cq(0.3) }}>
                VERIFY THIS CREDENTIAL
              </div>
              <div>Scan the QR code or visit</div>
              <div style={{ fontWeight: 800, color: ink }}>{verifyHost}</div>
              <div>to verify the authenticity</div>
              <div>of this credential.</div>
            </div>
          </div>

          {/* dates + id */}
          <div style={{ display: "flex", flexDirection: "column", gap: cq(0.9) }}>
            <MetaRow cq={cq} icon="calendar" label="ISSUE DATE" value={fmt(issued)} ink={ink} mute={mute} />
            <MetaRow cq={cq} icon="calendar-check" label="VALID UNTIL" value={fmt(expiry)} ink={ink} mute={mute} />
            <MetaRow cq={cq} icon="badge" label="CREDENTIAL ID" value={displaySerial} ink={ink} mute={mute} mono />
          </div>

          {/* signatures */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: cq(1.2), gridColumn: "span 2" }}>
            <SigBlock cq={cq} ink={ink} mute={mute} sigSrc={sigOfficer} title="CHIEF CERTIFICATION OFFICER" subtitle="Certigo Institute" />
            <SigBlock cq={cq} ink={ink} mute={mute} sigSrc={sigDirector} title="PROGRAM DIRECTOR" subtitle="Certigo Institute" />
          </div>
        </div>

        {/* === FOOTER === */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          marginTop: cq(2),
          paddingTop: cq(1.2),
          borderTop: `${cq(0.06)} solid ${ink}`,
          gap: cq(2),
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: cq(1.2) }}>
            <BoardEmblem size={cq(3)} color={ink} />
            <div style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", lineHeight: 1.4 }}>
              <div style={{ fontSize: cq(0.85), fontWeight: 800, letterSpacing: "0.16em", color: ink }}>
                ISSUED BY THE CERTIGO CERTIFICATION BOARD
              </div>
              <div style={{ fontSize: cq(0.75), color: sub, marginTop: cq(0.15) }}>
                Under the Digital Skills Competency Framework (DSCF™)
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
            <div style={{ fontSize: cq(0.78), color: sub, fontWeight: 600 }}>
              Building skills <span style={{ color: mute, margin: `0 ${cq(0.4)}` }}>|</span>
              Validating expertise <span style={{ color: mute, margin: `0 ${cq(0.4)}` }}>|</span>
              Advancing careers
            </div>
            <div style={{ fontSize: cq(0.85), fontWeight: 800, color: ink, marginTop: cq(0.2), letterSpacing: "0.04em" }}>
              {verifyHost}
            </div>
          </div>
        </div>

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

function MetaRow({ cq, icon, label, value, ink, mute, mono }: {
  cq: (n: number) => string; icon: "calendar" | "calendar-check" | "badge";
  label: string; value: string; ink: string; mute: string; mono?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: cq(0.9) }}>
      <MetaIcon name={icon} size={cq(1.7)} color={ink} />
      <div style={{ flex: 1, borderBottom: `${cq(0.04)} dotted ${ink}55`, paddingBottom: cq(0.2) }}>
        <div style={{
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          fontSize: cq(0.65),
          letterSpacing: "0.24em",
          fontWeight: 800,
          color: mute,
        }}>{label}</div>
        <div style={{
          fontFamily: mono ? "'JetBrains Mono', ui-monospace, monospace" : "'Inter', ui-sans-serif, system-ui, sans-serif",
          fontSize: cq(0.95),
          fontWeight: 700,
          color: ink,
          marginTop: cq(0.05),
          letterSpacing: mono ? "0.04em" : "-0.005em",
        }}>{value}</div>
      </div>
    </div>
  );
}

function SigBlock({ cq, ink, mute, sigSrc, title, subtitle }: {
  cq: (n: number) => string; ink: string; mute: string;
  sigSrc: string; title: string; subtitle: string;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <img src={sigSrc} alt="Authorized signature" style={{
        height: cq(3.4),
        maxWidth: "85%",
        objectFit: "contain",
        display: "block",
        margin: `0 auto ${cq(-0.3)}`,
        mixBlendMode: "multiply",
      }} />
      <div style={{ height: cq(0.06), background: ink, opacity: 0.8 }} />
      <div style={{
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        fontSize: cq(0.78),
        fontWeight: 800,
        letterSpacing: "0.14em",
        color: ink,
        marginTop: cq(0.45),
      }}>{title}</div>
      <div style={{
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        fontSize: cq(0.72),
        color: mute,
        marginTop: cq(0.15),
        fontStyle: "italic",
      }}>{subtitle}</div>
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
