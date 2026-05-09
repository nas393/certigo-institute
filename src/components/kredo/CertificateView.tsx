import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { formatSerial } from "@/lib/cert";

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
  { key: "signature", label: "Framed Mono", hint: "Professional certification — black frame + wax seal" },
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

const COMPETENCIES = [
  "Prompt design & iteration",
  "Context engineering",
  "Evaluation & guardrails",
  "Tool & function calling",
  "Production-grade workflows",
];

export function CertificateView(p: Props) {
  const [qr, setQr] = useState<string>("");
  const displaySerial = formatSerial(p.serial);
  const orientation: CertOrientation = p.orientation ?? "landscape";
  const isPortrait = orientation === "portrait";

  const issued = new Date(p.issuedAt);
  const expiry = new Date(issued); expiry.setFullYear(expiry.getFullYear() + 2);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase();

  const verifyHost = "verify.certigo.org";
  const verifyShort = `${verifyHost}/${displaySerial}`;
  const qrTarget = (() => {
    try { const u = new URL(p.verifyUrl); return `${u.origin}/verify/${displaySerial}`; }
    catch { return `/verify/${displaySerial}`; }
  })();
  useEffect(() => { QRCode.toDataURL(qrTarget, { margin: 0, width: 280 }).then(setQr); }, [qrTarget]);

  const lock = {
    "--background": "oklch(1 0 0)",
    color: "#0a0a0a",
    background: "#fafaf7",
  } as React.CSSProperties;

  const aspect = isPortrait ? "1/1.414" : "1.414/1";
  const s = isPortrait ? 1.35 : 1;
  const cq = (n: number) => `${(n * s).toFixed(2)}cqw`;

  const ink = "#0a0a0a";
  const sub = "#3a3a3a";
  const mute = "#6b6b6b";
  const accent = "#7a1f1f"; // wax seal red

  return (
    <div
      style={{ ...lock, containerType: "inline-size", aspectRatio: aspect } as React.CSSProperties}
      className={`relative w-full overflow-hidden ${p.compact ? "" : "shadow-2xl"}`}
    >
      {/* === FRAMED MONO outer frame === */}
      <div className="pointer-events-none absolute" style={{ inset: 0, border: `${cq(1.4)} solid ${ink}` }} />
      <div className="pointer-events-none absolute" style={{ inset: cq(1.9), border: `${cq(0.08)} solid ${ink}`, opacity: 0.55 }} />

      {/* INNER CANVAS */}
      <div className="absolute" style={{ inset: cq(2.6) }}>
        {/* paper */}
        <div className="absolute inset-0" style={{ background: "#fafaf7" }} />
        {/* subtle grid texture */}
        <div className="pointer-events-none absolute inset-0" style={{
          backgroundImage: `linear-gradient(${ink}08 1px, transparent 1px), linear-gradient(90deg, ${ink}08 1px, transparent 1px)`,
          backgroundSize: `${cq(3)} ${cq(3)}`,
          opacity: 0.5,
        }} />

        <div className="relative flex h-full flex-col" style={{ padding: cq(2.4) }}>
          {/* === HEADER === */}
          <div style={{ borderBottom: `${cq(0.18)} solid ${ink}`, paddingBottom: cq(1.6) }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "start", gap: cq(2) }}>
              <div>
                <div style={{
                  fontFamily: "'Archivo Black', 'Helvetica Neue', sans-serif",
                  fontSize: cq(3.6),
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  color: ink,
                }}>
                  CERTIGO<span style={{ color: accent }}>.</span>
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontSize: cq(0.8),
                  letterSpacing: "0.22em",
                  color: sub,
                  marginTop: cq(0.5),
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}>
                  CERTIGO Institute · Professional Certification Authority
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  display: "inline-block",
                  border: `${cq(0.1)} solid ${ink}`,
                  padding: `${cq(0.4)} ${cq(0.9)}`,
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontSize: cq(0.7),
                  letterSpacing: "0.22em",
                  fontWeight: 700,
                  color: ink,
                  textTransform: "uppercase",
                }}>
                  Credential ID · {displaySerial}
                </div>
                <div style={{
                  marginTop: cq(0.5),
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontSize: cq(0.65),
                  letterSpacing: "0.2em",
                  color: mute,
                  textTransform: "uppercase",
                }}>
                  Class A · Tier II
                </div>
              </div>
            </div>
          </div>

          {/* === TITLE BLOCK === */}
          <div style={{ paddingTop: cq(2), paddingBottom: cq(1.4) }}>
            <p style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: cq(0.85),
              letterSpacing: "0.5em",
              color: sub,
              fontWeight: 600,
              textTransform: "uppercase",
            }}>
              ── Professional Certification ──
            </p>
            <h1 style={{
              fontFamily: "'Archivo Black', 'Helvetica Neue', sans-serif",
              fontSize: cq(4.4),
              fontWeight: 900,
              letterSpacing: "-0.035em",
              lineHeight: 0.95,
              color: ink,
              marginTop: cq(1),
              textTransform: "uppercase",
            }}>
              This is to certify that
            </h1>
          </div>

          {/* === RECIPIENT === */}
          <div style={{ borderTop: `${cq(0.04)} solid ${ink}55`, borderBottom: `${cq(0.04)} solid ${ink}55`, padding: `${cq(1.4)} 0`, marginBottom: cq(1.4) }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', ui-serif, Georgia, serif",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: cq(4.2),
              lineHeight: 1.05,
              color: ink,
              letterSpacing: "-0.01em",
            }}>
              {p.recipientName}
            </p>
            <p style={{
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: cq(1),
              color: sub,
              marginTop: cq(0.6),
              lineHeight: 1.5,
              maxWidth: "92%",
            }}>
              has successfully completed the requirements of the program below and is hereby recognized by the CERTIGO Institute as a credentialed professional, having demonstrated mastery of the validated competencies listed herein
              {p.score != null ? <> with a final assessment score of <strong style={{ color: ink }}>{p.score}%</strong></> : null}.
            </p>
          </div>

          {/* === COURSE NAME === */}
          <div style={{ marginBottom: cq(1.4) }}>
            <div style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: cq(0.7),
              letterSpacing: "0.3em",
              color: mute,
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: cq(0.4),
            }}>
              Program of Study
            </div>
            <div style={{
              fontFamily: "'Archivo Black', 'Helvetica Neue', sans-serif",
              fontSize: cq(2.1),
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: ink,
              lineHeight: 1.1,
              textTransform: "uppercase",
            }}>
              {p.courseTopic}
            </div>
          </div>

          {/* === DATA GRID: competencies | credential meta | QR === */}
          <div style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr auto",
            gap: cq(1.6),
            border: `${cq(0.1)} solid ${ink}`,
            padding: cq(1.2),
          }}>
            {/* competencies */}
            <div style={{ borderRight: `${cq(0.04)} solid ${ink}55`, paddingRight: cq(1.2) }}>
              <div style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: cq(0.65),
                letterSpacing: "0.28em",
                color: mute,
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: cq(0.6),
              }}>
                ◆ Validated Competencies
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {COMPETENCIES.map((c) => (
                  <li key={c} style={{
                    fontFamily: "ui-sans-serif, system-ui, sans-serif",
                    fontSize: cq(0.85),
                    color: ink,
                    lineHeight: 1.7,
                    display: "flex",
                    gap: cq(0.5),
                  }}>
                    <span style={{ color: accent, fontWeight: 900 }}>›</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* meta */}
            <div style={{ borderRight: `${cq(0.04)} solid ${ink}55`, paddingRight: cq(1.2), display: "flex", flexDirection: "column", gap: cq(0.8) }}>
              <DataRow cq={cq} label="Issue Date" value={fmt(issued)} ink={ink} mute={mute} />
              <DataRow cq={cq} label="Expiry Date" value={fmt(expiry)} ink={ink} mute={mute} />
              <DataRow cq={cq} label="Credential ID" value={displaySerial} ink={ink} mute={mute} />
              <DataRow cq={cq} label="Verify At" value={verifyShort} ink={ink} mute={mute} small />
              <DataRow cq={cq} label="Status" value="ACTIVE · VERIFIED" ink={ink} mute={mute} />
            </div>

            {/* QR */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: cq(0.5) }}>
              {qr && (
                <a href={qrTarget} target="_blank" rel="noreferrer" style={{
                  display: "inline-block", padding: cq(0.4), border: `${cq(0.1)} solid ${ink}`, background: "#fff",
                }}>
                  <img src={qr} alt="Scan to verify" style={{ width: cq(7.2), height: cq(7.2), display: "block" }} />
                </a>
              )}
              <div style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: cq(0.6),
                letterSpacing: "0.22em",
                color: mute,
                textTransform: "uppercase",
                textAlign: "center",
                fontWeight: 700,
              }}>
                Scan to verify
              </div>
            </div>
          </div>

          {/* === SIGNATURES + SEAL === */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: cq(2),
            alignItems: "end",
            marginTop: cq(1.6),
          }}>
            <SigBlock cq={cq} ink={ink} mute={mute} title="Chief Certification Officer" name="Dr. Helena Voss" />
            <WaxSeal style={{ width: cq(7), height: cq(7) }} />
            <SigBlock cq={cq} ink={ink} mute={mute} title="Program Director" name="Mateo Rivers" align="right" />
          </div>

          {/* === FOOTER STATEMENT === */}
          <div style={{
            marginTop: cq(1.4),
            paddingTop: cq(1),
            borderTop: `${cq(0.18)} solid ${ink}`,
            textAlign: "center",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: cq(0.7),
            letterSpacing: "0.18em",
            color: sub,
            fontWeight: 600,
            textTransform: "uppercase",
            lineHeight: 1.6,
          }}>
            Issued by the Certigo Certification Board under the Digital Skills Competency Framework (DSCF™)
          </div>

          {p.watermark && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div style={{
                transform: "rotate(-22deg)",
                fontFamily: "'Archivo Black', sans-serif",
                fontWeight: 900,
                color: "rgba(10,10,10,0.05)",
                fontSize: cq(11),
                letterSpacing: "-0.03em",
              }}>
                CERTIGO. FREE
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DataRow({ cq, label, value, ink, mute, small }: {
  cq: (n: number) => string; label: string; value: string; ink: string; mute: string; small?: boolean;
}) {
  return (
    <div>
      <div style={{
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: cq(0.6),
        letterSpacing: "0.26em",
        color: mute,
        textTransform: "uppercase",
        fontWeight: 700,
      }}>{label}</div>
      <div style={{
        fontFamily: small ? "'JetBrains Mono', ui-monospace, monospace" : "ui-sans-serif, system-ui, sans-serif",
        fontSize: small ? cq(0.78) : cq(0.95),
        color: ink,
        fontWeight: small ? 600 : 800,
        marginTop: cq(0.15),
        letterSpacing: small ? "0.05em" : "0",
        wordBreak: "break-all",
      }}>{value}</div>
    </div>
  );
}

function SigBlock({ cq, ink, mute, title, name, align = "left" }: {
  cq: (n: number) => string; ink: string; mute: string; title: string; name: string; align?: "left" | "right";
}) {
  return (
    <div style={{ textAlign: align }}>
      <div style={{
        fontFamily: "'Cormorant Garamond', ui-serif, Georgia, serif",
        fontStyle: "italic",
        fontSize: cq(2),
        color: ink,
        lineHeight: 1,
        marginBottom: cq(0.3),
      }}>
        {name.split(" ").map((w) => w[0]).join("")}
      </div>
      <div style={{ height: cq(0.08), background: ink, marginBottom: cq(0.4), opacity: 0.85 }} />
      <div style={{
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        fontSize: cq(0.85),
        fontWeight: 800,
        color: ink,
        letterSpacing: "-0.005em",
      }}>{name}</div>
      <div style={{
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: cq(0.62),
        letterSpacing: "0.22em",
        color: mute,
        textTransform: "uppercase",
        fontWeight: 700,
        marginTop: cq(0.2),
      }}>{title}</div>
    </div>
  );
}

function WaxSeal({ style }: { style?: React.CSSProperties }) {
  const red = "#7a1f1f";
  const dark = "#4a0f0f";
  return (
    <svg viewBox="0 0 220 220" style={style} aria-hidden>
      <defs>
        <radialGradient id="wax" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#a83232" />
          <stop offset="55%" stopColor={red} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
        <path id="wt" d="M 35 110 A 75 75 0 0 1 185 110" fill="none" />
        <path id="wb" d="M 30 110 A 80 80 0 0 0 190 110" fill="none" />
      </defs>
      {/* drips / irregular outer */}
      <path d="M110 8 C 150 10, 200 30, 210 80 C 220 130, 200 180, 160 205 C 120 220, 70 215, 40 185 C 10 150, 5 100, 25 60 C 45 25, 80 10, 110 8 Z"
        fill="url(#wax)" stroke={dark} strokeWidth="1.2" />
      {/* inner ring stamp */}
      <circle cx="110" cy="110" r="78" fill="none" stroke="#f5e6c8" strokeWidth="2" opacity="0.85" />
      <circle cx="110" cy="110" r="62" fill="none" stroke="#f5e6c8" strokeWidth="1" opacity="0.6" />
      {/* curved text */}
      <text fontFamily="serif" fontWeight="700" fontSize="13" letterSpacing="5" fill="#f5e6c8" opacity="0.95">
        <textPath href="#wt" startOffset="50%" textAnchor="middle">· CERTIGO INSTITUTE ·</textPath>
      </text>
      <text fontFamily="serif" fontWeight="700" fontSize="10" letterSpacing="3" fill="#f5e6c8" opacity="0.9">
        <textPath href="#wb" startOffset="50%" textAnchor="middle">DSCF · CERTIFIED · 2026</textPath>
      </text>
      {/* center monogram C */}
      <text x="110" y="128" fontFamily="serif" fontWeight="900" fontSize="64" textAnchor="middle" fill="#f5e6c8" opacity="0.95">C</text>
      {/* star */}
      <polygon points="110,158 113,166 121,166 115,171 117,179 110,174 103,179 105,171 99,166 107,166" fill="#f5e6c8" opacity="0.9" />
      {/* highlight */}
      <ellipse cx="80" cy="60" rx="28" ry="14" fill="#fff" opacity="0.18" />
    </svg>
  );
}
