import { useEffect, useState } from "react";
import QRCode from "qrcode";

export type CertigoCertTheme =
  | "sovereign"   // deep navy + gold foil crest + circuit traces
  | "obsidian"    // charcoal + gold filigree, minimal grid
  | "quantum"     // navy with hex/circuit pattern, modern UI
  | "imperial"    // warm charcoal + double gold border, formal serif
  | "meridian"    // split: navy circuit rail | white content
  | "monolith"    // pure black + gold edge rails, centered
  | "aurora"      // navy + sweeping gold gradient halo
  | "parchment"   // ivory/cream + classical navy + gold border
  | "cipher"      // navy + binary / data background
  | "regalia";    // burgundy + gold heraldic

export const CERTIGO_CERT_THEMES: { key: CertigoCertTheme; label: string; hint: string }[] = [
  { key: "sovereign", label: "Sovereign",  hint: "Deep navy · gold crest · circuit halo" },
  { key: "obsidian",  label: "Obsidian",   hint: "Charcoal · gold filigree · grid" },
  { key: "quantum",   label: "Quantum",    hint: "Navy · hex circuitry · webapp UI" },
  { key: "imperial",  label: "Imperial",   hint: "Charcoal · double gold frame · serif" },
  { key: "meridian",  label: "Meridian",   hint: "Split rail · navy + circuitry · white" },
  { key: "monolith",  label: "Monolith",   hint: "Pure black · gold edge rails" },
  { key: "aurora",    label: "Aurora",     hint: "Navy · sweeping gold halo" },
  { key: "parchment", label: "Parchment",  hint: "Ivory · classical navy + gold" },
  { key: "cipher",    label: "Cipher",     hint: "Navy · binary data pattern" },
  { key: "regalia",   label: "Regalia",    hint: "Burgundy · heraldic gold" },
];

export interface CertigoCertProps {
  theme: CertigoCertTheme;
  recipientName: string;
  courseTitle: string;
  description?: string;
  issueDate: string;     // ISO
  certificateId: string; // e.g. CERT-WAA-1024
  verifyUrl: string;
  scorePct?: number;
}

/* ---------- shared atoms ---------- */

const NAVY = "#0b1a3a";
const NAVY_DEEP = "#060f24";
const CHAR = "#15171c";
const CHAR_DEEP = "#0a0b0f";
const GOLD = "#c9a24a";
const GOLD_HI = "#f1d68a";
const GOLD_LO = "#8a6a23";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function useQR(target: string, size = 320) {
  const [src, setSrc] = useState("");
  useEffect(() => { QRCode.toDataURL(target, { margin: 0, width: size, color: { dark: "#0b1a3a", light: "#ffffff" } }).then(setSrc); }, [target, size]);
  return src;
}

/** Gold crest with laurel + monogram. Pure SVG, scales with parent. */
function GoldCrest({ size = "100%", mono = "C" }: { size?: string; mono?: string }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden>
      <defs>
        <linearGradient id="cg-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD_HI} />
          <stop offset="55%" stopColor={GOLD} />
          <stop offset="100%" stopColor={GOLD_LO} />
        </linearGradient>
        <radialGradient id="cg-shine" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fff8e0" stopOpacity="0.65" />
          <stop offset="60%" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* outer ring */}
      <circle cx="100" cy="100" r="62" fill="none" stroke="url(#cg-gold)" strokeWidth="2.4" />
      <circle cx="100" cy="100" r="56" fill="none" stroke="url(#cg-gold)" strokeWidth="0.7" opacity="0.7" />
      {/* shield */}
      <path d="M100 50 L138 64 V100 C138 124 122 140 100 150 C78 140 62 124 62 100 V64 Z"
        fill="url(#cg-gold)" stroke={GOLD_LO} strokeWidth="0.8" />
      <path d="M100 50 L138 64 V100 C138 124 122 140 100 150 C78 140 62 124 62 100 V64 Z"
        fill="url(#cg-shine)" />
      {/* monogram */}
      <text x="100" y="113" textAnchor="middle" fontFamily="'Cormorant Garamond', 'Times New Roman', serif"
        fontSize="56" fontWeight="700" fill={NAVY_DEEP}>{mono}</text>
      {/* laurels */}
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(100,100) scale(${s},1)`} stroke="url(#cg-gold)" strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path d="M-66 6 C -84 28, -84 56, -68 78" />
          {[10, 26, 42, 58].map((y, i) => (
            <path key={i} d={`M${-72 + (i % 2)} ${y - 10} q -8 -2 -12 -10`} />
          ))}
        </g>
      ))}
      {/* CERTIGO INSTITUTE banner ribbon */}
      <path d="M40 158 L100 172 L160 158 L150 168 L100 182 L50 168 Z" fill={GOLD} stroke={GOLD_LO} strokeWidth="0.6" />
      <text x="100" y="171" textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight="800"
        fontSize="7" letterSpacing="0.32em" fill={NAVY_DEEP}>CERTIGO INSTITUTE</text>
    </svg>
  );
}

/** Background circuitry pattern in gold-on-navy. */
function CircuitryBg({ color = GOLD, opacity = 0.18 }: { color?: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity }} aria-hidden>
      <defs>
        <pattern id="cg-circuit" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth="0.6">
            <path d="M0 60 H40 V20 H80 V80 H120" />
            <path d="M60 0 V40 H100 V120" />
            <circle cx="40" cy="60" r="2.2" fill={color} />
            <circle cx="80" cy="20" r="2.2" fill={color} />
            <circle cx="80" cy="80" r="2.2" fill={color} />
            <circle cx="100" cy="40" r="2.2" fill={color} />
            <rect x="34" y="100" width="14" height="6" />
          </g>
        </pattern>
        <radialGradient id="cg-fade" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="1" />
        </radialGradient>
        <mask id="cg-fadem"><rect width="800" height="600" fill="url(#cg-fade)" /></mask>
      </defs>
      <rect width="800" height="600" fill="url(#cg-circuit)" mask="url(#cg-fadem)" />
    </svg>
  );
}

function HexBg({ color = GOLD, opacity = 0.14 }: { color?: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity }} aria-hidden>
      <defs>
        <pattern id="cg-hex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
          <path d="M14 0 L42 0 L56 24 L42 48 L14 48 L0 24 Z" fill="none" stroke={color} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#cg-hex)" />
    </svg>
  );
}

function GoldSeal({ size = 64, label = "OFFICIAL" }: { size?: number; label?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <defs>
        <radialGradient id="seal-g" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor={GOLD_HI} />
          <stop offset="60%" stopColor={GOLD} />
          <stop offset="100%" stopColor={GOLD_LO} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#seal-g)" stroke={GOLD_LO} strokeWidth="1" />
      <circle cx="50" cy="50" r="36" fill="none" stroke={NAVY_DEEP} strokeWidth="0.8" opacity="0.45" />
      <text x="50" y="44" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontSize="22"
        fontWeight="700" fill={NAVY_DEEP}>C</text>
      <text x="50" y="60" textAnchor="middle" fontFamily="'Inter', sans-serif" fontSize="6"
        fontWeight="800" letterSpacing="0.3em" fill={NAVY_DEEP}>{label}</text>
      <g stroke={NAVY_DEEP} strokeWidth="0.6" opacity="0.5">
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const x1 = 50 + Math.cos(a) * 38, y1 = 50 + Math.sin(a) * 38;
          const x2 = 50 + Math.cos(a) * 42, y2 = 50 + Math.sin(a) * 42;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
    </svg>
  );
}

/**
 * Realistic handwritten signature — anonymous, no personal name.
 * Multi-stroke cursive paths that read as authentic ink, not a generic squiggle.
 * Two distinct variants (0/1) so the two pillars don't look identical.
 */
function SignatureFlourish({ color = "#0a0a0a", variant = 0 }: { color?: string; variant?: 0 | 1 }) {
  // Variant 0 — flowing copperplate with a long underline tail
  const v0 = (
    <>
      {/* main body — looped cursive */}
      <path
        d="M6 44 C 14 30, 22 18, 30 24 C 36 28, 32 40, 38 42 C 46 44, 50 28, 58 26 C 66 24, 64 40, 72 42
           C 80 44, 86 28, 94 30 C 102 32, 100 44, 110 44 C 122 44, 128 26, 140 30
           C 152 34, 156 22, 168 26 C 178 30, 184 22, 194 26"
        fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* capital initial flourish */}
      <path d="M8 44 C 4 30, 12 14, 26 18 C 32 20, 30 30, 22 32"
        fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      {/* underline tail */}
      <path d="M14 56 C 60 50, 130 50, 196 54"
        fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
      {/* dot accent */}
      <circle cx="120" cy="20" r="1.2" fill={color} opacity="0.85" />
    </>
  );
  // Variant 1 — sharper executive signature with cross-stroke
  const v1 = (
    <>
      <path
        d="M4 46 C 16 26, 28 36, 36 30 C 44 24, 42 42, 52 42 C 62 42, 60 24, 72 28
           C 84 32, 80 44, 92 42 C 104 40, 100 24, 114 28 C 128 32, 124 46, 138 42
           C 152 38, 156 22, 170 26 C 184 30, 188 38, 200 32"
        fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* sweeping cross-bar (like a t-bar through the signature) */}
      <path d="M22 24 C 60 18, 130 18, 184 22"
        fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      {/* descender loop */}
      <path d="M150 42 C 156 54, 140 60, 130 54 C 124 50, 130 46, 138 48"
        fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </>
  );
  return (
    <svg viewBox="0 0 210 64" width="100%" height="100%" aria-hidden
      style={{ display: "block", filter: "drop-shadow(0 0.5px 0 rgba(0,0,0,0.25))" }}>
      {variant === 0 ? v0 : v1}
    </svg>
  );
}

function SignaturePillar({ ink, role, refId, variant, inkColor }: {
  ink: string; role: string; refId: string; variant: 0 | 1; inkColor?: string;
}) {
  // Default ink — deep navy/black for realism. Override per theme via inkColor.
  const sigColor = inkColor ?? "#0a1226";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
      <div style={{ width: "18cqw", height: "4.6cqw", marginBottom: "-0.6cqw" }}>
        <SignatureFlourish variant={variant} color={sigColor} />
      </div>
      <div style={{ width: "18cqw", height: 1, background: ink, opacity: 0.55 }} />
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62cqw",
        letterSpacing: "0.34em", textTransform: "uppercase", fontWeight: 700,
        color: ink, marginTop: "0.6cqw" }}>{role}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.46cqw",
        letterSpacing: "0.24em", color: ink, opacity: 0.55, marginTop: "0.25cqw" }}>{refId}</div>
    </div>
  );
}

function AuthorityBlock({ ink = "#fff", inkColor }: { ink?: string; muted?: number; inkColor?: string }) {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8cqw" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "end",
        columnGap: "3cqw", width: "100%", maxWidth: "66cqw" }}>
        <SignaturePillar ink={ink} inkColor={inkColor} role="Office of the Registrar"
          refId="REG · CERTIGO INSTITUTE" variant={0} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4cqw" }}>
          <GoldSeal size={56} label="VERIFIED" />
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontSize: "0.7cqw", letterSpacing: "0.22em", color: GOLD_HI, opacity: 0.9 }}>
            Veritas · Probatum · Aeternum
          </div>
        </div>
        <SignaturePillar ink={ink} inkColor={inkColor} role="Director of Credentialing"
          refId="DIR · CERTIGO INSTITUTE" variant={1} />
      </div>
      <div style={{
        fontFamily: "'Inter', sans-serif", fontSize: "0.52cqw",
        letterSpacing: "0.36em", textTransform: "uppercase", fontWeight: 700,
        color: ink, opacity: 0.72, marginTop: "0.2cqw",
      }}>Issued under the authority of <span style={{ color: GOLD_HI, letterSpacing: "0.22em" }}>CERTIGO INSTITUTE</span> · Official Verified Credential</div>
    </div>
  );
}

/* ---------- master switch ---------- */

export function CertigoCertificate(p: CertigoCertProps) {
  switch (p.theme) {
    case "obsidian": return <ObsidianCert {...p} />;
    case "quantum":  return <QuantumCert {...p} />;
    case "imperial": return <ImperialCert {...p} />;
    case "meridian": return <MeridianCert {...p} />;
    case "monolith": return <MonolithCert {...p} />;
    case "aurora":   return <AuroraCert {...p} />;
    case "parchment":return <ParchmentCert {...p} />;
    case "cipher":   return <CipherCert {...p} />;
    case "regalia":  return <RegaliaCert {...p} />;
    case "sovereign":
    default:         return <SovereignCert {...p} />;
  }
}

/* ---------- 1. SOVEREIGN — deep navy + gold crest + circuit halo ---------- */

function Frame({ children, bg, border = GOLD, inner = true }: { children: React.ReactNode; bg: string; border?: string; inner?: boolean }) {
  return (
    <div style={{ aspectRatio: "1.414/1", containerType: "inline-size", background: bg, position: "relative", overflow: "hidden", color: "#fff" }}
      className="w-full shadow-2xl">
      <div style={{ position: "absolute", inset: "1.6cqw", border: `2px solid ${border}` }} />
      {inner && <div style={{ position: "absolute", inset: "2.2cqw", border: `0.5px solid ${border}`, opacity: 0.55 }} />}
      {children}
    </div>
  );
}

function SovereignCert(p: CertigoCertProps) {
  const qr = useQR(p.verifyUrl);
  return (
    <Frame bg={`radial-gradient(120% 80% at 50% 0%, ${NAVY} 0%, ${NAVY_DEEP} 70%)`}>
      <CircuitryBg color={GOLD} opacity={0.16} />
      {/* gold corner brackets */}
      {[["tl","2.6cqw","2.6cqw"],["tr","2.6cqw","auto"],["bl","auto","2.6cqw"],["br","auto","auto"]].map(([k, t, l]) => (
        <div key={k} style={{ position: "absolute", top: t==="auto"?undefined:t, bottom: t==="auto"?"2.6cqw":undefined,
          left: l==="auto"?undefined:l, right: l==="auto"?"2.6cqw":undefined, width: "3.6cqw", height: "3.6cqw",
          borderTop: k==="tl"||k==="tr"?`1.5px solid ${GOLD}`:undefined,
          borderBottom: k==="bl"||k==="br"?`1.5px solid ${GOLD}`:undefined,
          borderLeft: k==="tl"||k==="bl"?`1.5px solid ${GOLD}`:undefined,
          borderRight: k==="tr"||k==="br"?`1.5px solid ${GOLD}`:undefined,
        }} />
      ))}

      <div style={{ position: "relative", height: "100%", padding: "4cqw 6cqw", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: "9cqw", height: "9cqw", marginTop: "-0.5cqw" }}>
          <GoldCrest />
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72cqw", letterSpacing: "0.42em",
          fontWeight: 700, color: GOLD, marginTop: "1cqw" }}>
          CERTIGO INSTITUTE · EST. MMXXVI
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3.6cqw", fontWeight: 600,
          letterSpacing: "0.04em", marginTop: "1.6cqw", color: "#fff" }}>
          Certificate <span style={{ color: GOLD, fontStyle: "italic" }}>of</span> Achievement
        </div>
        <div style={{ width: "14cqw", height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, marginTop: "1cqw" }} />

        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85cqw", letterSpacing: "0.3em",
          color: "#cfd6e8", marginTop: "1.8cqw", fontWeight: 500 }}>
          PRESENTED TO
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 700,
          fontSize: "5.2cqw", color: GOLD_HI, lineHeight: 1.05, marginTop: "0.6cqw",
          textShadow: `0 0 28px rgba(241,214,138,0.35)` }}>
          {p.recipientName}
        </div>

        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85cqw", letterSpacing: "0.3em",
          color: "#cfd6e8", marginTop: "1.6cqw", fontWeight: 500 }}>
          FOR THE SUCCESSFUL COMPLETION OF
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.7cqw", fontWeight: 800,
          letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "0.6cqw", color: "#fff" }}>
          {p.courseTitle}
        </div>
        {p.description && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8cqw", color: "#a9b3cc",
            maxWidth: "62%", lineHeight: 1.55, marginTop: "0.9cqw" }}>
            {p.description}
          </div>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr auto 1fr",
          alignItems: "end", gap: "2cqw" }}>
          <div />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8cqw" }}>
            <AuthorityBlock />
          </div>
          <div />
        </div>

        <div style={{ width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginTop: "1.6cqw", gap: "1cqw" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            {qr && <img src={qr} alt="Verify" style={{ width: "5cqw", height: "5cqw", background: "#fff", padding: "0.3cqw", borderRadius: 4 }} />}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.5cqw",
              letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase" }}>
              On-chain verified metadata
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6cqw", letterSpacing: "0.18em", color: "#cfd6e8", lineHeight: 1.7 }}>
            <div>ISSUED &nbsp; {fmtDate(p.issueDate).toUpperCase()}</div>
            <div>CERTIFICATE ID &nbsp; {p.certificateId}</div>
            {p.scorePct != null && <div style={{ color: GOLD }}>SCORE &nbsp; {p.scorePct}%</div>}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ---------- 2. OBSIDIAN — charcoal + gold filigree, minimal grid ---------- */

function ObsidianCert(p: CertigoCertProps) {
  const qr = useQR(p.verifyUrl);
  return (
    <div style={{ aspectRatio: "1.414/1", containerType: "inline-size", background: CHAR_DEEP,
      color: "#fff", position: "relative", overflow: "hidden" }} className="w-full shadow-2xl">
      {/* faint grid */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }} aria-hidden>
        <defs>
          <pattern id="ob-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0 H0 V32" fill="none" stroke={GOLD} strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ob-grid)" />
      </svg>

      {/* gold filigree corners */}
      {[0,1,2,3].map((i) => {
        const top = i < 2, left = i % 2 === 0;
        return (
          <svg key={i} viewBox="0 0 100 100" style={{ position: "absolute",
            top: top ? "1.6cqw" : undefined, bottom: !top ? "1.6cqw" : undefined,
            left: left ? "1.6cqw" : undefined, right: !left ? "1.6cqw" : undefined,
            width: "6cqw", height: "6cqw", transform: `scale(${left?1:-1}, ${top?1:-1})` }} aria-hidden>
            <g fill="none" stroke={GOLD} strokeWidth="0.8">
              <path d="M0 4 H80" /><path d="M4 0 V80" />
              <path d="M10 10 Q 30 14, 36 30 Q 38 44, 24 50" />
              <circle cx="38" cy="14" r="1.5" fill={GOLD} />
              <circle cx="14" cy="38" r="1.5" fill={GOLD} />
            </g>
          </svg>
        );
      })}

      <div style={{ position: "absolute", inset: "3cqw", border: `1px solid ${GOLD}`, opacity: 0.35 }} />

      <div style={{ position: "relative", height: "100%", padding: "5cqw 7cqw", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: "7cqw", height: "7cqw" }}>
          <GoldCrest />
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7cqw",
          letterSpacing: "0.5em", color: GOLD, marginTop: "0.8cqw", fontWeight: 600 }}>
          CERTIGO &nbsp; INSTITUTE
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3cqw",
          letterSpacing: "0.18em", marginTop: "2.4cqw", color: GOLD_HI, fontWeight: 500 }}>
          CERTIFICATE OF ACHIEVEMENT
        </div>

        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "1cqw", color: "#bfb289", marginTop: "2.8cqw" }}>
          This is to certify that
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
          fontSize: "5.4cqw", color: "#fff", marginTop: "0.8cqw", lineHeight: 1 }}>
          {p.recipientName}
        </div>
        <div style={{ width: "30%", height: 1, background: GOLD, opacity: 0.5, marginTop: "1cqw" }} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "1cqw", color: "#bfb289", marginTop: "1.4cqw" }}>
          has fulfilled all requirements of
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.6cqw", fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "0.6cqw" }}>
          {p.courseTitle}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr auto 1fr",
          alignItems: "end", gap: "2cqw" }}>
          <div />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8cqw" }}>
            <AuthorityBlock />
          </div>
          <div />
        </div>

        <div style={{ width: "100%", display: "flex", justifyContent: "space-between",
          marginTop: "1.6cqw", alignItems: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.7cqw" }}>
            {qr && <img src={qr} alt="Verify" style={{ width: "4.6cqw", height: "4.6cqw", background: "#fff", padding: "0.2cqw" }} />}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55cqw",
              letterSpacing: "0.18em", color: GOLD, lineHeight: 1.6 }}>
              ON-CHAIN VERIFIED<br />METADATA · v1
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6cqw", letterSpacing: "0.18em", color: "#bfb289", lineHeight: 1.7 }}>
            <div>ISSUED &nbsp; {fmtDate(p.issueDate).toUpperCase()}</div>
            <div>ID &nbsp; {p.certificateId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 3. QUANTUM — navy + hex/circuit, webapp UI ---------- */

function QuantumCert(p: CertigoCertProps) {
  const qr = useQR(p.verifyUrl);
  return (
    <div style={{ aspectRatio: "1.414/1", containerType: "inline-size",
      background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 60%, #112450 100%)`,
      color: "#fff", position: "relative", overflow: "hidden" }} className="w-full shadow-2xl">
      <HexBg color={GOLD} opacity={0.13} />
      <CircuitryBg color="#5b8cff" opacity={0.18} />
      {/* glow halo */}
      <div style={{ position: "absolute", inset: 0, background:
        `radial-gradient(50% 35% at 50% 25%, rgba(201,162,74,0.25) 0%, transparent 70%)` }} />

      <div style={{ position: "absolute", inset: "1.4cqw", border: `1.5px solid ${GOLD}`, borderRadius: "0.4cqw" }} />

      <div style={{ position: "relative", height: "100%", padding: "3.4cqw 5cqw", display: "flex", flexDirection: "column" }}>
        {/* TOP: webapp-style status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6cqw",
          letterSpacing: "0.24em", color: GOLD }}>
          <span>● CERTIGO.OS &nbsp;/&nbsp; CREDENTIAL.v1</span>
          <span>STATUS: VERIFIED · {p.certificateId}</span>
        </div>

        {/* center */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center" }}>
          <div style={{ width: "8cqw", height: "8cqw" }}><GoldCrest /></div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7cqw",
            letterSpacing: "0.45em", color: GOLD, marginTop: "0.8cqw", fontWeight: 700 }}>
            CERTIGO INSTITUTE
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3cqw",
            fontWeight: 600, marginTop: "1.6cqw", color: "#fff" }}>
            Certificate of Achievement
          </div>

          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65cqw",
            letterSpacing: "0.32em", color: "#9fb1d8", marginTop: "1.6cqw" }}>
            &lt;recipient/&gt;
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontWeight: 700, fontSize: "5cqw", color: GOLD_HI, marginTop: "0.4cqw", lineHeight: 1,
            textShadow: `0 0 22px rgba(241,214,138,0.45)` }}>
            {p.recipientName}
          </div>

          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65cqw",
            letterSpacing: "0.32em", color: "#9fb1d8", marginTop: "1.4cqw" }}>
            &lt;course/&gt;
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.55cqw", fontWeight: 800,
            letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "0.4cqw" }}>
            {p.courseTitle}
          </div>
        </div>

        {/* BOTTOM: 3-col HUD */}
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "2cqw",
          alignItems: "end", marginTop: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4cqw" }}>
            {qr && <img src={qr} alt="Verify" style={{ width: "5.4cqw", height: "5.4cqw", background: "#fff", padding: "0.2cqw", borderRadius: 4 }} />}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.5cqw",
              letterSpacing: "0.22em", color: GOLD }}>ON-CHAIN METADATA</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "2cqw", alignItems: "end" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6cqw" }}>
              <AuthorityBlock />
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6cqw", letterSpacing: "0.16em", color: "#9fb1d8", lineHeight: 1.7 }}>
            <div>ISSUED &nbsp; {fmtDate(p.issueDate).toUpperCase()}</div>
            <div>ID &nbsp; {p.certificateId}</div>
            {p.scorePct != null && <div style={{ color: GOLD }}>SCORE &nbsp; {p.scorePct}%</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 4. IMPERIAL — charcoal + double gold frame, formal serif ---------- */

function ImperialCert(p: CertigoCertProps) {
  const qr = useQR(p.verifyUrl);
  return (
    <div style={{ aspectRatio: "1.414/1", containerType: "inline-size",
      background: `linear-gradient(180deg, #1d1c1a 0%, ${CHAR_DEEP} 100%)`,
      color: "#f4ecd2", position: "relative", overflow: "hidden" }} className="w-full shadow-2xl">
      <CircuitryBg color={GOLD} opacity={0.07} />
      <div style={{ position: "absolute", inset: "1.4cqw", border: `2.5px solid ${GOLD}` }} />
      <div style={{ position: "absolute", inset: "2.2cqw", border: `0.6px solid ${GOLD}`, opacity: 0.6 }} />
      <div style={{ position: "absolute", inset: "2.7cqw", border: `0.6px solid ${GOLD}`, opacity: 0.35 }} />

      <div style={{ position: "relative", height: "100%", padding: "5cqw 7cqw",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: "10cqw", height: "10cqw" }}><GoldCrest /></div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3.4cqw",
          fontWeight: 700, letterSpacing: "0.12em", marginTop: "1.4cqw", color: GOLD_HI }}>
          CERTIFICATE
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "1.4cqw", marginTop: "0.2cqw", color: GOLD }}>
          of Achievement
        </div>

        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "1.05cqw", color: "#cdbb86", marginTop: "2cqw" }}>
          Awarded with distinction to
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
          fontSize: "5.6cqw", color: "#fff8e2", marginTop: "0.4cqw", lineHeight: 1 }}>
          {p.recipientName}
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "1.05cqw", color: "#cdbb86", marginTop: "1.2cqw" }}>
          in recognition of the successful completion of
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.5cqw", fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff", marginTop: "0.4cqw" }}>
          {p.courseTitle}
        </div>
        {p.description && (
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontSize: "0.95cqw", maxWidth: "62%", color: "#cdbb86", marginTop: "0.8cqw", lineHeight: 1.5 }}>
            {p.description}
          </div>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr auto 1fr",
          alignItems: "end", gap: "2cqw" }}>
          <div />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8cqw" }}>
            <AuthorityBlock ink="#f4ecd2" />
          </div>
          <div />
        </div>

        <div style={{ width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginTop: "1.4cqw" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.7cqw" }}>
            {qr && <img src={qr} alt="Verify" style={{ width: "4.4cqw", height: "4.4cqw", background: "#fff", padding: "0.2cqw" }} />}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55cqw",
              letterSpacing: "0.2em", color: GOLD }}>
              ON-CHAIN VERIFIED METADATA
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6cqw", letterSpacing: "0.18em", color: "#cdbb86", lineHeight: 1.7 }}>
            <div>ISSUED &nbsp; {fmtDate(p.issueDate).toUpperCase()}</div>
            <div>ID &nbsp; {p.certificateId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 5. MERIDIAN — split rail (navy circuitry) + white content ---------- */

function MeridianCert(p: CertigoCertProps) {
  const qr = useQR(p.verifyUrl);
  return (
    <div style={{ aspectRatio: "1.414/1", containerType: "inline-size",
      background: "#fbfaf6", color: NAVY_DEEP, position: "relative", overflow: "hidden",
      display: "grid", gridTemplateColumns: "32% 1fr" }} className="w-full shadow-2xl">
      {/* LEFT RAIL */}
      <div style={{ position: "relative", background:
        `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, color: "#fff", overflow: "hidden" }}>
        <CircuitryBg color={GOLD} opacity={0.22} />
        <div style={{ position: "relative", height: "100%", padding: "3.4cqw 2.4cqw",
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: "10cqw", height: "10cqw" }}><GoldCrest /></div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65cqw",
            letterSpacing: "0.4em", color: GOLD, marginTop: "0.8cqw", fontWeight: 700 }}>
            CERTIGO INSTITUTE
          </div>
          <div style={{ flex: 1 }} />
          {qr && <img src={qr} alt="Verify" style={{ width: "6.4cqw", height: "6.4cqw", background: "#fff", padding: "0.3cqw", borderRadius: 4 }} />}
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55cqw",
            letterSpacing: "0.22em", color: GOLD, marginTop: "0.6cqw", textAlign: "center" }}>
            ON-CHAIN<br />VERIFIED METADATA
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55cqw",
            letterSpacing: "0.18em", color: "#cfd6e8", marginTop: "1cqw" }}>
            ID {p.certificateId}
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div style={{ position: "relative", padding: "4cqw 4.8cqw", display: "flex", flexDirection: "column" }}>
        <div style={{ position: "absolute", inset: "1.6cqw 1.6cqw 1.6cqw 0", border: `1px solid ${GOLD}`, opacity: 0.5 }} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3.2cqw",
          fontWeight: 600, color: NAVY_DEEP, lineHeight: 1 }}>
          Certificate <span style={{ fontStyle: "italic", color: GOLD_LO }}>of</span> Achievement
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72cqw",
          letterSpacing: "0.36em", color: GOLD_LO, marginTop: "0.8cqw", fontWeight: 700 }}>
          AWARDED TO
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontWeight: 700, fontSize: "5cqw", color: NAVY_DEEP, marginTop: "0.6cqw", lineHeight: 1 }}>
          {p.recipientName}
        </div>
        <div style={{ width: "12cqw", height: 2, background: GOLD, marginTop: "1cqw" }} />

        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72cqw",
          letterSpacing: "0.36em", color: GOLD_LO, marginTop: "1.6cqw", fontWeight: 700 }}>
          FOR THE COMPLETION OF
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.55cqw", fontWeight: 800,
          letterSpacing: "0.06em", textTransform: "uppercase", color: NAVY_DEEP, marginTop: "0.4cqw" }}>
          {p.courseTitle}
        </div>
        {p.description && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78cqw",
            color: "#5b6478", maxWidth: "100%", lineHeight: 1.55, marginTop: "0.7cqw" }}>
            {p.description}
          </div>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr",
          alignItems: "end", gap: "1.6cqw" }}>
          <div />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6cqw" }}>
            <AuthorityBlock ink={NAVY_DEEP} />
          </div>
          <div />
        </div>
        <div style={{ marginTop: "1.2cqw", fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.6cqw", letterSpacing: "0.18em", color: "#5b6478" }}>
          ISSUED {fmtDate(p.issueDate).toUpperCase()} &nbsp;·&nbsp; ID {p.certificateId}
          {p.scorePct != null && <> &nbsp;·&nbsp; SCORE {p.scorePct}%</>}
        </div>
      </div>
    </div>
  );
}

/* ---------- 6. MONOLITH — pure black + gold edge rails ---------- */

function MonolithCert(p: CertigoCertProps) {
  const qr = useQR(p.verifyUrl);
  return (
    <div style={{ aspectRatio: "1.414/1", containerType: "inline-size", background: "#000",
      color: "#fff", position: "relative", overflow: "hidden" }} className="w-full shadow-2xl">
      {/* gold rails */}
      <div style={{ position: "absolute", top: "1.6cqw", left: 0, right: 0, height: "0.4cqw",
        background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
      <div style={{ position: "absolute", bottom: "1.6cqw", left: 0, right: 0, height: "0.4cqw",
        background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
      <div style={{ position: "absolute", top: "1.6cqw", bottom: "1.6cqw", left: "1.6cqw", width: "1px", background: GOLD, opacity: 0.6 }} />
      <div style={{ position: "absolute", top: "1.6cqw", bottom: "1.6cqw", right: "1.6cqw", width: "1px", background: GOLD, opacity: 0.6 }} />

      <div style={{ position: "relative", height: "100%", padding: "5cqw 7cqw",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: "8cqw", height: "8cqw" }}><GoldCrest /></div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7cqw",
          letterSpacing: "0.5em", color: GOLD, marginTop: "0.8cqw", fontWeight: 700 }}>
          CERTIGO &nbsp; INSTITUTE
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3.4cqw",
          fontWeight: 600, marginTop: "1.6cqw", letterSpacing: "0.04em" }}>
          Certificate <span style={{ fontStyle: "italic", color: GOLD }}>of</span> Achievement
        </div>
        <div style={{ width: "10cqw", height: 1, background: GOLD, marginTop: "1cqw" }} />
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8cqw",
          letterSpacing: "0.32em", color: "#bdbdbd", marginTop: "1.6cqw" }}>PRESENTED TO</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontWeight: 700, fontSize: "5.4cqw", color: GOLD_HI, marginTop: "0.4cqw", lineHeight: 1 }}>
          {p.recipientName}
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8cqw",
          letterSpacing: "0.32em", color: "#bdbdbd", marginTop: "1.6cqw" }}>FOR THE COMPLETION OF</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.6cqw", fontWeight: 800,
          letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "0.5cqw" }}>{p.courseTitle}</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8cqw" }}>
          <AuthorityBlock />
        </div>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginTop: "1.4cqw" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.7cqw" }}>
            {qr && <img src={qr} alt="Verify" style={{ width: "4.6cqw", height: "4.6cqw", background: "#fff", padding: "0.2cqw" }} />}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55cqw",
              letterSpacing: "0.2em", color: GOLD, lineHeight: 1.6 }}>ON-CHAIN VERIFIED<br />METADATA</div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6cqw", letterSpacing: "0.18em", color: "#bdbdbd", lineHeight: 1.7 }}>
            <div>ISSUED &nbsp; {fmtDate(p.issueDate).toUpperCase()}</div>
            <div>ID &nbsp; {p.certificateId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 7. AURORA — navy + sweeping gold halo ---------- */

function AuroraCert(p: CertigoCertProps) {
  const qr = useQR(p.verifyUrl);
  return (
    <div style={{ aspectRatio: "1.414/1", containerType: "inline-size",
      background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, #0d1d44 50%, ${NAVY_DEEP} 100%)`,
      color: "#fff", position: "relative", overflow: "hidden" }} className="w-full shadow-2xl">
      <div style={{ position: "absolute", inset: 0, background:
        `radial-gradient(80% 50% at 50% 0%, rgba(241,214,138,0.35) 0%, transparent 70%),
         radial-gradient(60% 40% at 100% 100%, rgba(91,140,255,0.25) 0%, transparent 70%)` }} />
      <div style={{ position: "absolute", inset: "1.6cqw", border: `1px solid ${GOLD}`, opacity: 0.55, borderRadius: "0.4cqw" }} />

      <div style={{ position: "relative", height: "100%", padding: "4cqw 6cqw",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: "8cqw", height: "8cqw" }}><GoldCrest /></div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7cqw",
          letterSpacing: "0.45em", color: GOLD_HI, marginTop: "1cqw", fontWeight: 700 }}>
          CERTIGO INSTITUTE · GLOBAL CREDENTIAL
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3.4cqw",
          fontWeight: 600, marginTop: "1.4cqw" }}>
          Certificate <span style={{ fontStyle: "italic", color: GOLD_HI }}>of</span> Achievement
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8cqw",
          letterSpacing: "0.32em", color: "#cfd6e8", marginTop: "1.4cqw" }}>AWARDED TO</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontWeight: 700, fontSize: "5.4cqw", color: "#fff",
          marginTop: "0.4cqw", textShadow: "0 0 30px rgba(241,214,138,0.55)" }}>{p.recipientName}</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8cqw",
          letterSpacing: "0.32em", color: "#cfd6e8", marginTop: "1.4cqw" }}>HAS COMPLETED</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.55cqw", fontWeight: 800,
          letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "0.4cqw" }}>{p.courseTitle}</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8cqw" }}>
          <AuthorityBlock />
        </div>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginTop: "1.4cqw" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.7cqw" }}>
            {qr && <img src={qr} alt="Verify" style={{ width: "4.6cqw", height: "4.6cqw", background: "#fff", padding: "0.2cqw", borderRadius: 4 }} />}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55cqw",
              letterSpacing: "0.2em", color: GOLD, lineHeight: 1.6 }}>ON-CHAIN VERIFIED</div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6cqw", letterSpacing: "0.18em", color: "#cfd6e8", lineHeight: 1.7 }}>
            <div>ISSUED &nbsp; {fmtDate(p.issueDate).toUpperCase()}</div>
            <div>ID &nbsp; {p.certificateId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 8. PARCHMENT — ivory + classical navy + gold ---------- */

function ParchmentCert(p: CertigoCertProps) {
  const qr = useQR(p.verifyUrl);
  return (
    <div style={{ aspectRatio: "1.414/1", containerType: "inline-size",
      background: "linear-gradient(180deg, #fbf7ec 0%, #f4ecd2 100%)",
      color: NAVY_DEEP, position: "relative", overflow: "hidden" }} className="w-full shadow-2xl">
      <div style={{ position: "absolute", inset: "1.4cqw", border: `2.5px solid ${GOLD}` }} />
      <div style={{ position: "absolute", inset: "2.2cqw", border: `0.6px solid ${GOLD_LO}`, opacity: 0.7 }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage:
        "radial-gradient(rgba(0,0,0,0.6) 1px, transparent 1px)", backgroundSize: "4px 4px" }} />

      <div style={{ position: "relative", height: "100%", padding: "5cqw 7cqw",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: "10cqw", height: "10cqw" }}><GoldCrest /></div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3.4cqw",
          fontWeight: 700, letterSpacing: "0.12em", marginTop: "1.4cqw", color: NAVY_DEEP }}>
          CERTIFICATE
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "1.4cqw", marginTop: "0.2cqw", color: GOLD_LO }}>of Achievement</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "1cqw", color: "#5a4f2c", marginTop: "1.6cqw" }}>This certifies that</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
          fontSize: "5.4cqw", marginTop: "0.4cqw", lineHeight: 1, color: NAVY_DEEP }}>{p.recipientName}</div>
        <div style={{ width: "30%", height: 1, background: GOLD_LO, opacity: 0.6, marginTop: "1cqw" }} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "1cqw", color: "#5a4f2c", marginTop: "1.4cqw" }}>has successfully completed</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.5cqw", fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "0.5cqw", color: NAVY_DEEP }}>{p.courseTitle}</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8cqw" }}>
          <AuthorityBlock ink={NAVY_DEEP} />
        </div>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginTop: "1.4cqw" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.7cqw" }}>
            {qr && <img src={qr} alt="Verify" style={{ width: "4.6cqw", height: "4.6cqw" }} />}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55cqw",
              letterSpacing: "0.2em", color: GOLD_LO, lineHeight: 1.6 }}>ON-CHAIN VERIFIED METADATA</div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6cqw", letterSpacing: "0.18em", color: "#5a4f2c", lineHeight: 1.7 }}>
            <div>ISSUED &nbsp; {fmtDate(p.issueDate).toUpperCase()}</div>
            <div>ID &nbsp; {p.certificateId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 9. CIPHER — navy + binary data pattern ---------- */

function CipherCert(p: CertigoCertProps) {
  const qr = useQR(p.verifyUrl);
  // pre-built "binary" rows
  const rows = Array.from({ length: 26 }, (_, r) =>
    Array.from({ length: 80 }, (_, c) => ((r * 7 + c * 13) % 5 === 0 ? "1" : "0")).join(" ")
  );
  return (
    <div style={{ aspectRatio: "1.414/1", containerType: "inline-size",
      background: NAVY_DEEP, color: "#fff", position: "relative", overflow: "hidden" }} className="w-full shadow-2xl">
      <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.13,
        fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55cqw", color: GOLD,
        whiteSpace: "pre", lineHeight: 1.4, padding: "2cqw" }}>
        {rows.join("\n")}
      </div>
      <div style={{ position: "absolute", inset: 0, background:
        `radial-gradient(70% 50% at 50% 40%, rgba(11,26,58,0) 0%, ${NAVY_DEEP} 80%)` }} />
      <div style={{ position: "absolute", inset: "1.6cqw", border: `1px solid ${GOLD}`, opacity: 0.55 }} />

      <div style={{ position: "relative", height: "100%", padding: "4cqw 6cqw",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65cqw",
          letterSpacing: "0.32em", color: GOLD }}>
          ● CERTIGO.CIPHER &nbsp;/&nbsp; CRED.SHA256
        </div>
        <div style={{ width: "8cqw", height: "8cqw", marginTop: "1cqw" }}><GoldCrest /></div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3.2cqw",
          fontWeight: 600, marginTop: "1.2cqw" }}>Certificate of Achievement</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65cqw",
          letterSpacing: "0.32em", color: "#9fb1d8", marginTop: "1.6cqw" }}>&lt;recipient/&gt;</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontWeight: 700, fontSize: "5cqw", color: GOLD_HI, marginTop: "0.3cqw", lineHeight: 1,
          textShadow: "0 0 24px rgba(241,214,138,0.4)" }}>{p.recipientName}</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65cqw",
          letterSpacing: "0.32em", color: "#9fb1d8", marginTop: "1.4cqw" }}>&lt;course/&gt;</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.55cqw", fontWeight: 800,
          letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "0.4cqw" }}>{p.courseTitle}</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8cqw" }}>
          <AuthorityBlock />
        </div>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginTop: "1.4cqw" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.7cqw" }}>
            {qr && <img src={qr} alt="Verify" style={{ width: "4.6cqw", height: "4.6cqw", background: "#fff", padding: "0.2cqw" }} />}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55cqw",
              letterSpacing: "0.2em", color: GOLD, lineHeight: 1.6 }}>SHA256 · ON-CHAIN<br />METADATA</div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6cqw", letterSpacing: "0.18em", color: "#9fb1d8", lineHeight: 1.7 }}>
            <div>ISSUED &nbsp; {fmtDate(p.issueDate).toUpperCase()}</div>
            <div>ID &nbsp; {p.certificateId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 10. REGALIA — burgundy + heraldic gold ---------- */

function RegaliaCert(p: CertigoCertProps) {
  const qr = useQR(p.verifyUrl);
  const BURG = "#3a0f17";
  const BURG_DEEP = "#220609";
  return (
    <div style={{ aspectRatio: "1.414/1", containerType: "inline-size",
      background: `radial-gradient(120% 80% at 50% 0%, ${BURG} 0%, ${BURG_DEEP} 75%)`,
      color: "#fff", position: "relative", overflow: "hidden" }} className="w-full shadow-2xl">
      <CircuitryBg color={GOLD} opacity={0.10} />
      <div style={{ position: "absolute", inset: "1.4cqw", border: `2.5px solid ${GOLD}` }} />
      <div style={{ position: "absolute", inset: "2.2cqw", border: `0.6px solid ${GOLD}`, opacity: 0.55 }} />

      <div style={{ position: "relative", height: "100%", padding: "5cqw 7cqw",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: "10cqw", height: "10cqw" }}><GoldCrest /></div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3.4cqw",
          fontWeight: 700, letterSpacing: "0.14em", marginTop: "1.4cqw", color: GOLD_HI }}>
          CERTIFICATE
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "1.4cqw", marginTop: "0.2cqw", color: GOLD }}>of High Achievement</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "1cqw", color: "#e6c89a", marginTop: "1.8cqw" }}>conferred upon</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
          fontSize: "5.6cqw", color: "#fff8e2", marginTop: "0.4cqw", lineHeight: 1 }}>{p.recipientName}</div>
        <div style={{ width: "26%", height: 1, background: GOLD, opacity: 0.6, marginTop: "1cqw" }} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "1cqw", color: "#e6c89a", marginTop: "1.4cqw" }}>in recognition of completing</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.55cqw", fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "0.5cqw" }}>{p.courseTitle}</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8cqw" }}>
          <AuthorityBlock />
        </div>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginTop: "1.4cqw" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.7cqw" }}>
            {qr && <img src={qr} alt="Verify" style={{ width: "4.6cqw", height: "4.6cqw", background: "#fff", padding: "0.2cqw" }} />}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55cqw",
              letterSpacing: "0.2em", color: GOLD, lineHeight: 1.6 }}>ON-CHAIN VERIFIED<br />METADATA</div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6cqw", letterSpacing: "0.18em", color: "#e6c89a", lineHeight: 1.7 }}>
            <div>ISSUED &nbsp; {fmtDate(p.issueDate).toUpperCase()}</div>
            <div>ID &nbsp; {p.certificateId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}