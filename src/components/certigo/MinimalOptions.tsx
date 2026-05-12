import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { SignatureFlourish, ElectronicStamp, type SignatureVariant, type StampVariant } from "./CertificateThemes";

/* ============================================================
   MINIMAL WHITE CERTIFICATE & TRANSCRIPT — 5 + 5 options
   Inspired by the user's reference: white paper, light grid,
   ornate display title, centered handwritten ink, gold seal,
   two role-only signatures (no printed names).
   ============================================================ */

const INK = "#0a1226";
const INK_SOFT = "#3b4256";
const GOLD = "#b8902f";
const GOLD_HI = "#d8b454";
const PAPER = "#fdfcf8";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function useQR(url: string, dark = INK) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(url, { margin: 0, width: 320, color: { dark, light: "#ffffff" } }).then(setSrc);
  }, [url, dark]);
  return src;
}

/* ---------- shared atoms ---------- */

function GridBg({ color = INK, opacity = 0.06, size = 26 }: { color?: string; opacity?: number; size?: number }) {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity }} aria-hidden>
      <defs>
        <pattern id={`mg-${size}`} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          <path d={`M${size} 0 H0 V${size}`} fill="none" stroke={color} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#mg-${size})`} />
    </svg>
  );
}

/** Centered gold laurel seal — replaces wax. */
function LaurelSeal({ size = "8cqw", label = "VERIFIED", year = new Date().getFullYear() }: { size?: string; label?: string; year?: number }) {
  return (
    <div style={{ width: size, aspectRatio: "1/1", containerType: "inline-size", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="ls-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD_HI} />
            <stop offset="100%" stopColor={GOLD} />
          </linearGradient>
        </defs>
        {/* laurel left */}
        <g fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round">
          <path d="M60 100 C 40 60, 50 30, 80 20" />
          {[0,1,2,3,4,5].map((i) => (
            <ellipse key={`l${i}`} cx={48 + i*4} cy={90 - i*12} rx="6" ry="3" transform={`rotate(${-30 - i*5} ${48 + i*4} ${90 - i*12})`} fill={INK} />
          ))}
          <path d="M60 100 C 50 130, 60 160, 90 170" />
          {[0,1,2,3,4,5].map((i) => (
            <ellipse key={`l2${i}`} cx={48 + i*4} cy={110 + i*12} rx="6" ry="3" transform={`rotate(${30 + i*5} ${48 + i*4} ${110 + i*12})`} fill={INK} />
          ))}
          {/* laurel right */}
          <path d="M140 100 C 160 60, 150 30, 120 20" />
          {[0,1,2,3,4,5].map((i) => (
            <ellipse key={`r${i}`} cx={152 - i*4} cy={90 - i*12} rx="6" ry="3" transform={`rotate(${30 + i*5} ${152 - i*4} ${90 - i*12})`} fill={INK} />
          ))}
          <path d="M140 100 C 150 130, 140 160, 110 170" />
          {[0,1,2,3,4,5].map((i) => (
            <ellipse key={`r2${i}`} cx={152 - i*4} cy={110 + i*12} rx="6" ry="3" transform={`rotate(${-30 - i*5} ${152 - i*4} ${110 + i*12})`} fill={INK} />
          ))}
        </g>
        {/* central gold octagon */}
        <polygon points="100,40 140,55 155,95 140,135 100,150 60,135 45,95 60,55"
          fill="url(#ls-g)" stroke={INK} strokeWidth="1.5" />
        {/* tiny stars */}
        <g fill={INK}>
          <polygon points="80,68 82,73 87,73 83,76 85,81 80,78 75,81 77,76 73,73 78,73" />
          <polygon points="100,62 102,67 107,67 103,70 105,75 100,72 95,75 97,70 93,67 98,67" />
          <polygon points="120,68 122,73 127,73 123,76 125,81 120,78 115,81 117,76 113,73 118,73" />
        </g>
      </svg>
      <div style={{ position: "relative", textAlign: "center", color: INK, fontFamily: "'Inter', sans-serif", fontWeight: 900,
        fontSize: "1.1cqw", letterSpacing: "0.08em", lineHeight: 1, marginTop: "0.4cqw" }}>
        <div>{label}</div>
        <div style={{ fontSize: "0.9cqw", marginTop: 2 }}>{year}</div>
      </div>
    </div>
  );
}

/** Role-only signature pillar (no printed name). */
function Sig({ variant, role, refId }: { variant: SignatureVariant; role: string; refId: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0, width: "22cqw" }}>
      <div style={{ width: "100%", height: "5cqw", marginBottom: "-0.6cqw" }}>
        <SignatureFlourish variant={variant} color={INK} />
      </div>
      <div style={{ width: "100%", height: 1, background: INK, opacity: 0.7 }} />
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62cqw", letterSpacing: "0.32em",
        textTransform: "uppercase", fontWeight: 700, color: INK, marginTop: "0.55cqw" }}>{role}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.46cqw", letterSpacing: "0.22em",
        color: INK_SOFT, marginTop: "0.2cqw" }}>{refId}</div>
    </div>
  );
}

/* ---------- Public types ---------- */

export type MinimalCertVariant = "atelier" | "atrium" | "numen" | "vellum" | "codex";
export type MinimalTranscriptVariant = "ledger" | "register" | "dossier" | "compendium" | "rolls";

export const MINIMAL_CERT_OPTIONS: { key: MinimalCertVariant; label: string; hint: string }[] = [
  { key: "atelier",  label: "Atelier",  hint: "Blackletter title · light grid · top markers (reference)" },
  { key: "atrium",   label: "Atrium",   hint: "Serif italic title · double hairline border · airy" },
  { key: "numen",    label: "Numen",    hint: "Editorial sans · gold rule · micro grid" },
  { key: "vellum",   label: "Vellum",   hint: "Cream paper · ornate flourishes · classical" },
  { key: "codex",    label: "Codex",    hint: "Small-caps · monoline · modern minimal" },
];

export const MINIMAL_TRANSCRIPT_OPTIONS: { key: MinimalTranscriptVariant; label: string; hint: string }[] = [
  { key: "ledger",     label: "Ledger",     hint: "Heavy ruled rows · monospaced totals" },
  { key: "register",   label: "Register",   hint: "Banded rows · serif headers" },
  { key: "dossier",    label: "Dossier",    hint: "Two-column · sidebar metadata" },
  { key: "compendium", label: "Compendium", hint: "Editorial · pull-quote GPA" },
  { key: "rolls",      label: "Rolls",      hint: "Classical roll · numbered modules" },
];

export interface MinimalCertProps {
  variant: MinimalCertVariant;
  recipientName: string;
  courseTitle: string;
  description?: string;
  issueDate: string;
  certificateId: string;
  verifyUrl: string;
  scorePct?: number;
  sigPair?: [SignatureVariant, SignatureVariant];
  stampVariant?: StampVariant;
}

export interface MinimalTranscriptProps {
  variant: MinimalTranscriptVariant;
  recipientName: string;
  programTitle: string;
  programCode: string;
  issueDate: string;
  transcriptId: string;
  verifyUrl: string;
  cumulativeGpa: string;
  modules: { code: string; title: string; hours: number; scorePct: number; grade: string }[];
  sigPair?: [SignatureVariant, SignatureVariant];
  stampVariant?: StampVariant;
}

/* =============== CERTIFICATES =============== */

export function MinimalCertificate(p: MinimalCertProps) {
  switch (p.variant) {
    case "atrium":  return <AtriumCert  {...p} />;
    case "numen":   return <NumenCert   {...p} />;
    case "vellum":  return <VellumCert  {...p} />;
    case "codex":   return <CodexCert   {...p} />;
    case "atelier":
    default:        return <AtelierCert {...p} />;
  }
}

function CertShell({ children, bg = "#ffffff", border, grid }: { children: React.ReactNode; bg?: string; border?: string; grid?: React.ReactNode }) {
  return (
    <div style={{ aspectRatio: "1.414/1", containerType: "inline-size", background: bg, position: "relative",
      overflow: "hidden", color: INK, border: border ?? "1px solid rgba(10,18,38,0.12)" }}
      className="w-full shadow-2xl">
      {grid}
      {children}
    </div>
  );
}

function TopMarkers({ left, right, center }: { left: string; right: string; center: string }) {
  return (
    <div style={{ position: "absolute", top: "3cqw", left: "5cqw", right: "5cqw",
      display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", color: INK }}>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7cqw", letterSpacing: "0.16em" }}>{left}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.8cqw", fontFamily: "'Inter', sans-serif",
        fontSize: "0.7cqw", letterSpacing: "0.42em", fontWeight: 700, textTransform: "uppercase" }}>
        <span style={{ width: "3cqw", height: 1, background: INK, opacity: 0.55 }} />
        {center}
        <span style={{ width: "3cqw", height: 1, background: INK, opacity: 0.55 }} />
      </div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7cqw", letterSpacing: "0.16em", textAlign: "right" }}>{right}</div>
    </div>
  );
}

function BottomBar({ certificateId, verifyUrl, issueDate, stampVariant = 1 }: {
  certificateId: string; verifyUrl: string; issueDate: string; stampVariant?: StampVariant;
}) {
  const qr = useQR(verifyUrl);
  return (
    <div style={{ position: "absolute", left: "5cqw", right: "5cqw", bottom: "2.4cqw",
      display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "end", gap: "1.5cqw" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
        {qr && <img src={qr} alt="Verify" style={{ width: "4.4cqw", height: "4.4cqw" }} />}
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.46cqw",
          letterSpacing: "0.2em", color: INK_SOFT, textTransform: "uppercase" }}>
          On-chain verified
        </div>
      </div>
      <div style={{ transform: "scale(0.85)", transformOrigin: "center bottom" }}>
        <ElectronicStamp variant={stampVariant} certificateId={certificateId} issueDate={issueDate} color={GOLD} size={8} />
      </div>
      <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.55cqw", letterSpacing: "0.16em", color: INK, lineHeight: 1.7 }}>
        <div>ISSUED &nbsp; {fmt(issueDate).toUpperCase()}</div>
        <div>CERT ID &nbsp; {certificateId}</div>
      </div>
    </div>
  );
}

/* ---------- 1. ATELIER (closest to reference) ---------- */
function AtelierCert(p: MinimalCertProps) {
  const sig = p.sigPair ?? [0, 1];
  const year = new Date(p.issueDate).getFullYear();
  return (
    <CertShell border="6px solid #111" grid={<GridBg opacity={0.07} size={22} />}>
      <TopMarkers left={fmt(p.issueDate)} right={String(year)} center="Certigo Institute" />
      <div style={{ position: "absolute", inset: 0, padding: "10cqw 8cqw 12cqw", display: "flex",
        flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'UnifrakturCook', 'UnifrakturMaguntia', 'Cormorant Garamond', serif",
          fontWeight: 700, fontSize: "5.4cqw", letterSpacing: "0.01em", lineHeight: 1, color: INK, margin: 0 }}>
          Certificate of Achievement
        </h1>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "1cqw", letterSpacing: "0.42em",
          textTransform: "uppercase", fontWeight: 600, marginTop: "1.4cqw", color: INK_SOFT }}>
          This certificate is presented to
        </div>
        <div style={{ fontFamily: "'Allura', 'Great Vibes', 'Cormorant Garamond', cursive",
          fontStyle: "italic", fontSize: "5.6cqw", color: INK, marginTop: "0.4cqw", lineHeight: 1 }}>
          {p.recipientName}
        </div>
        <div style={{ width: "44cqw", height: 1, background: INK, opacity: 0.45, marginTop: "0.3cqw" }} />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85cqw", color: INK_SOFT,
          maxWidth: "70%", lineHeight: 1.7, marginTop: "1.6cqw" }}>
          For the successful completion of <strong style={{ color: INK }}>{p.courseTitle}</strong>
          {p.description ? `. ${p.description}` : ""}
          {p.scorePct != null ? ` Final assessment score: ${p.scorePct}%.` : ""}
        </p>
      </div>
      {/* Signatures + central seal */}
      <div style={{ position: "absolute", left: "8cqw", right: "8cqw", bottom: "8cqw",
        display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "end", gap: "2cqw" }}>
        <Sig variant={sig[0]} role="Office of the Registrar" refId="REG · CERTIGO" />
        <LaurelSeal size="9cqw" label="VERIFIED" year={year} />
        <Sig variant={sig[1]} role="Director of Credentialing" refId="DIR · CERTIGO" />
      </div>
      <BottomBar certificateId={p.certificateId} verifyUrl={p.verifyUrl} issueDate={p.issueDate} stampVariant={p.stampVariant} />
    </CertShell>
  );
}

/* ---------- 2. ATRIUM ---------- */
function AtriumCert(p: MinimalCertProps) {
  const sig = p.sigPair ?? [2, 3];
  return (
    <CertShell>
      <div style={{ position: "absolute", inset: "1.6cqw", border: `1px solid ${INK}`, opacity: 0.85 }} />
      <div style={{ position: "absolute", inset: "2.2cqw", border: `0.5px solid ${INK}`, opacity: 0.4 }} />
      <div style={{ position: "absolute", inset: 0, padding: "8cqw 10cqw 12cqw", display: "flex",
        flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78cqw", letterSpacing: "0.5em",
          fontWeight: 700, color: INK }}>CERTIGO INSTITUTE</div>
        <div style={{ width: "8cqw", height: 1, background: GOLD, marginTop: "0.6cqw" }} />
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 500,
          fontSize: "5.6cqw", lineHeight: 1, color: INK, margin: "1.4cqw 0 0" }}>
          Certificate of Achievement
        </h1>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85cqw", letterSpacing: "0.38em",
          textTransform: "uppercase", color: INK_SOFT, marginTop: "1.6cqw" }}>
          Awarded to
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 700,
          fontSize: "4.4cqw", marginTop: "0.4cqw", color: INK }}>{p.recipientName}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "1cqw", marginTop: "0.8cqw" }}>
          <span style={{ width: "10cqw", height: 1, background: INK, opacity: 0.4 }} />
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: GOLD, fontSize: "1.1cqw" }}>·</span>
          <span style={{ width: "10cqw", height: 1, background: INK, opacity: 0.4 }} />
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85cqw", color: INK_SOFT,
          maxWidth: "70%", lineHeight: 1.7, marginTop: "1.4cqw" }}>
          In recognition of the successful completion of{" "}
          <strong style={{ color: INK }}>{p.courseTitle}</strong>
          {p.description ? `. ${p.description}` : ""}
        </p>
      </div>
      <div style={{ position: "absolute", left: "10cqw", right: "10cqw", bottom: "9cqw",
        display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "end", gap: "2cqw" }}>
        <Sig variant={sig[0]} role="Office of the Registrar" refId="REG · CERTIGO" />
        <LaurelSeal size="7cqw" label="OFFICIAL" year={new Date(p.issueDate).getFullYear()} />
        <Sig variant={sig[1]} role="Director of Credentialing" refId="DIR · CERTIGO" />
      </div>
      <BottomBar certificateId={p.certificateId} verifyUrl={p.verifyUrl} issueDate={p.issueDate} stampVariant={p.stampVariant} />
    </CertShell>
  );
}

/* ---------- 3. NUMEN ---------- */
function NumenCert(p: MinimalCertProps) {
  const sig = p.sigPair ?? [3, 4];
  return (
    <CertShell grid={<GridBg opacity={0.05} size={18} />}>
      <div style={{ position: "absolute", top: "3cqw", left: "5cqw", right: "5cqw", display: "flex",
        justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6cqw",
          letterSpacing: "0.24em", color: INK_SOFT }}>{p.certificateId}</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7cqw",
          letterSpacing: "0.5em", fontWeight: 800, color: INK }}>CERTIGO · INSTITUTE</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6cqw",
          letterSpacing: "0.24em", color: INK_SOFT }}>{fmt(p.issueDate)}</div>
      </div>
      <div style={{ position: "absolute", top: "5cqw", left: "5cqw", right: "5cqw", height: 1, background: GOLD, opacity: 0.7 }} />
      <div style={{ position: "absolute", inset: 0, padding: "10cqw 8cqw 14cqw", display: "flex",
        flexDirection: "column", alignItems: "flex-start", textAlign: "left" }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85cqw", letterSpacing: "0.42em",
          textTransform: "uppercase", color: GOLD, fontWeight: 800 }}>Achievement</div>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: "5cqw", lineHeight: 0.95,
          letterSpacing: "-0.02em", color: INK, margin: "0.6cqw 0 0", textTransform: "uppercase" }}>
          Certificate of<br />Achievement
        </h1>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85cqw", letterSpacing: "0.32em",
          textTransform: "uppercase", color: INK_SOFT, marginTop: "1.8cqw" }}>Awarded to</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 700,
          fontSize: "4.6cqw", marginTop: "0.2cqw", color: INK, lineHeight: 1 }}>{p.recipientName}</div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85cqw", color: INK_SOFT,
          maxWidth: "70%", lineHeight: 1.7, marginTop: "1.2cqw" }}>
          For the successful completion of <strong style={{ color: INK }}>{p.courseTitle}</strong>
          {p.description ? `. ${p.description}` : ""}
        </p>
      </div>
      <div style={{ position: "absolute", top: "12cqw", right: "8cqw" }}>
        <LaurelSeal size="8cqw" label="VERIFIED" year={new Date(p.issueDate).getFullYear()} />
      </div>
      <div style={{ position: "absolute", left: "8cqw", right: "8cqw", bottom: "8cqw",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4cqw" }}>
        <Sig variant={sig[0]} role="Office of the Registrar" refId="REG · CERTIGO" />
        <Sig variant={sig[1]} role="Director of Credentialing" refId="DIR · CERTIGO" />
      </div>
      <BottomBar certificateId={p.certificateId} verifyUrl={p.verifyUrl} issueDate={p.issueDate} stampVariant={p.stampVariant} />
    </CertShell>
  );
}

/* ---------- 4. VELLUM ---------- */
function VellumCert(p: MinimalCertProps) {
  const sig = p.sigPair ?? [1, 5];
  return (
    <CertShell bg={PAPER}>
      {/* ornate corner flourishes */}
      {([
        [0, "tl", "rotate(0)"],
        [1, "tr", "scale(-1,1)"],
        [2, "bl", "scale(1,-1)"],
        [3, "br", "scale(-1,-1)"],
      ] as const).map(([k, pos, t]) => (
        <svg key={k} viewBox="0 0 100 100" style={{
          position: "absolute", width: "10cqw", height: "10cqw",
          top: pos.startsWith("t") ? "2.4cqw" : undefined,
          bottom: pos.startsWith("b") ? "2.4cqw" : undefined,
          left: pos.endsWith("l") ? "2.4cqw" : undefined,
          right: pos.endsWith("r") ? "2.4cqw" : undefined,
          transform: t,
        }} aria-hidden>
          <g fill="none" stroke={GOLD} strokeWidth="1.2">
            <path d="M5 5 L 95 5" />
            <path d="M5 5 L 5 95" />
            <path d="M5 5 C 35 8, 50 25, 50 50" />
            <path d="M5 5 C 8 35, 25 50, 50 50" />
            <circle cx="50" cy="50" r="3" fill={GOLD} />
          </g>
        </svg>
      ))}
      <div style={{ position: "absolute", inset: "4cqw", border: `1px solid ${GOLD}`, opacity: 0.6 }} />
      <div style={{ position: "absolute", inset: 0, padding: "8cqw 10cqw 14cqw", display: "flex",
        flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7cqw", letterSpacing: "0.5em",
          fontWeight: 700, color: GOLD }}>CERTIGO INSTITUTE</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
          fontSize: "5cqw", lineHeight: 1, color: INK, margin: "1.4cqw 0 0", letterSpacing: "0.02em" }}>
          Certificate <span style={{ fontStyle: "italic", color: GOLD }}>of</span> Excellence
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8cqw", marginTop: "1cqw" }}>
          <span style={{ width: "6cqw", height: 1, background: GOLD }} />
          <span style={{ color: GOLD, fontSize: "1.4cqw" }}>❦</span>
          <span style={{ width: "6cqw", height: 1, background: GOLD }} />
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8cqw", letterSpacing: "0.36em",
          textTransform: "uppercase", color: INK_SOFT, marginTop: "1.4cqw" }}>This is to certify that</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 700,
          fontSize: "5cqw", marginTop: "0.4cqw", color: INK, lineHeight: 1 }}>{p.recipientName}</div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1cqw", color: INK,
          maxWidth: "70%", lineHeight: 1.6, marginTop: "1.2cqw", fontStyle: "italic" }}>
          has, with distinction, completed the program{" "}
          <strong style={{ fontStyle: "normal" }}>{p.courseTitle}</strong>
          {p.description ? `. ${p.description}` : ""}
        </p>
      </div>
      <div style={{ position: "absolute", left: "10cqw", right: "10cqw", bottom: "9cqw",
        display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "end", gap: "2cqw" }}>
        <Sig variant={sig[0]} role="Office of the Registrar" refId="REG · CERTIGO" />
        <LaurelSeal size="7cqw" label="EXCELLENCE" year={new Date(p.issueDate).getFullYear()} />
        <Sig variant={sig[1]} role="Director of Credentialing" refId="DIR · CERTIGO" />
      </div>
      <BottomBar certificateId={p.certificateId} verifyUrl={p.verifyUrl} issueDate={p.issueDate} stampVariant={p.stampVariant} />
    </CertShell>
  );
}

/* ---------- 5. CODEX ---------- */
function CodexCert(p: MinimalCertProps) {
  const sig = p.sigPair ?? [0, 4];
  return (
    <CertShell border="1px solid rgba(10,18,38,0.08)">
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "0.6cqw", background: INK }} />
      <div style={{ position: "absolute", inset: 0, padding: "9cqw 10cqw 14cqw", display: "flex",
        flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72cqw", letterSpacing: "0.6em",
          fontWeight: 800, color: INK }}>C · E · R · T · I · G · O</div>
        <div style={{ width: "3cqw", height: 2, background: GOLD, marginTop: "1.4cqw" }} />
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "2.6cqw",
          letterSpacing: "0.42em", textTransform: "uppercase", color: INK, margin: "1.4cqw 0 0" }}>
          Certificate of Achievement
        </h1>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8cqw", letterSpacing: "0.32em",
          textTransform: "uppercase", color: INK_SOFT, marginTop: "2.4cqw" }}>Presented to</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 700,
          fontSize: "5.4cqw", marginTop: "0.4cqw", color: INK, lineHeight: 1 }}>{p.recipientName}</div>
        <div style={{ width: "20cqw", height: 1, background: INK, opacity: 0.5, marginTop: "0.6cqw" }} />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85cqw", color: INK_SOFT,
          maxWidth: "60%", lineHeight: 1.7, marginTop: "1.4cqw" }}>
          For the successful completion of <strong style={{ color: INK }}>{p.courseTitle}</strong>
          {p.description ? `. ${p.description}` : ""}
        </p>
      </div>
      <div style={{ position: "absolute", left: "10cqw", right: "10cqw", bottom: "9cqw",
        display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "end", gap: "2cqw" }}>
        <Sig variant={sig[0]} role="Office of the Registrar" refId="REG · CERTIGO" />
        <LaurelSeal size="6.5cqw" label="VERIFIED" year={new Date(p.issueDate).getFullYear()} />
        <Sig variant={sig[1]} role="Director of Credentialing" refId="DIR · CERTIGO" />
      </div>
      <BottomBar certificateId={p.certificateId} verifyUrl={p.verifyUrl} issueDate={p.issueDate} stampVariant={p.stampVariant} />
    </CertShell>
  );
}

/* =============== TRANSCRIPTS =============== */

export function MinimalTranscript(p: MinimalTranscriptProps) {
  switch (p.variant) {
    case "register":   return <RegisterTr   {...p} />;
    case "dossier":    return <DossierTr    {...p} />;
    case "compendium": return <CompendiumTr {...p} />;
    case "rolls":      return <RollsTr      {...p} />;
    case "ledger":
    default:           return <LedgerTr     {...p} />;
  }
}

function TrShell({ children, bg = "#ffffff", grid }: { children: React.ReactNode; bg?: string; grid?: React.ReactNode }) {
  return (
    <div style={{ aspectRatio: "1/1.414", containerType: "inline-size", background: bg, position: "relative",
      overflow: "hidden", color: INK, border: "1px solid rgba(10,18,38,0.12)" }}
      className="w-full shadow-2xl">
      {grid}
      {children}
    </div>
  );
}

function TrHeader({ programTitle, programCode, transcriptId, recipientName }: { programTitle: string; programCode: string; transcriptId: string; recipientName: string }) {
  return (
    <div style={{ padding: "5cqw 6cqw 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.4cqw", letterSpacing: "0.42em",
          fontWeight: 800, color: INK }}>CERTIGO INSTITUTE</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1cqw",
          letterSpacing: "0.18em", color: INK_SOFT }}>{transcriptId}</div>
      </div>
      <div style={{ height: 1, background: GOLD, marginTop: "1.4cqw", opacity: 0.8 }} />
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.2cqw", letterSpacing: "0.32em",
        textTransform: "uppercase", color: INK_SOFT, marginTop: "2.4cqw", fontWeight: 600 }}>Official Academic Transcript</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 700,
        fontSize: "5cqw", color: INK, margin: "0.4cqw 0 0", lineHeight: 1.05 }}>{recipientName}</h1>
      <div style={{ marginTop: "1.4cqw", fontFamily: "'Inter', sans-serif", fontSize: "1.2cqw", color: INK_SOFT, fontWeight: 600 }}>
        Program · <span style={{ color: INK }}>{programTitle}</span> &nbsp;·&nbsp;
        <span style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.16em" }}>{programCode}</span>
      </div>
    </div>
  );
}

function TrFooter(p: MinimalTranscriptProps) {
  const sig = p.sigPair ?? [0, 1];
  const qr = useQR(p.verifyUrl);
  return (
    <div style={{ position: "absolute", left: "6cqw", right: "6cqw", bottom: "5cqw" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "end", gap: "2cqw" }}>
        <Sig variant={sig[0]} role="Office of the Registrar" refId="REG · CERTIGO" />
        <LaurelSeal size="9cqw" label="OFFICIAL" year={new Date(p.issueDate).getFullYear()} />
        <Sig variant={sig[1]} role="Director of Credentialing" refId="DIR · CERTIGO" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "end", gap: "2cqw", marginTop: "3cqw" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
          {qr && <img src={qr} alt="Verify" style={{ width: "7cqw", height: "7cqw" }} />}
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7cqw",
            letterSpacing: "0.2em", color: INK_SOFT, textTransform: "uppercase" }}>On-chain verified</div>
        </div>
        <div style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          color: GOLD, fontSize: "1.1cqw", letterSpacing: "0.18em" }}>Veritas · Probatum · Aeternum</div>
        <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.85cqw", letterSpacing: "0.16em", color: INK, lineHeight: 1.7 }}>
          <div>ISSUED &nbsp; {fmt(p.issueDate).toUpperCase()}</div>
          <div>TRANSCRIPT ID &nbsp; {p.transcriptId}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 1. LEDGER ---------- */
function LedgerTr(p: MinimalTranscriptProps) {
  return (
    <TrShell>
      <TrHeader {...p} />
      <div style={{ padding: "3cqw 6cqw 0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Inter', sans-serif",
          fontSize: "1.05cqw", color: INK }}>
          <thead>
            <tr style={{ borderTop: `2px solid ${INK}`, borderBottom: `1px solid ${INK}` }}>
              <th style={{ textAlign: "left", padding: "0.8cqw 0", letterSpacing: "0.18em",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85cqw" }}>CODE</th>
              <th style={{ textAlign: "left", padding: "0.8cqw 0", letterSpacing: "0.16em",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85cqw" }}>MODULE</th>
              <th style={{ textAlign: "right", padding: "0.8cqw 0", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85cqw" }}>HRS</th>
              <th style={{ textAlign: "right", padding: "0.8cqw 0", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85cqw" }}>%</th>
              <th style={{ textAlign: "right", padding: "0.8cqw 0", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85cqw" }}>GRADE</th>
            </tr>
          </thead>
          <tbody>
            {p.modules.map((m) => (
              <tr key={m.code} style={{ borderBottom: "1px solid rgba(10,18,38,0.12)" }}>
                <td style={{ padding: "1cqw 0", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.95cqw" }}>{m.code}</td>
                <td style={{ padding: "1cqw 0" }}>{m.title}</td>
                <td style={{ padding: "1cqw 0", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{m.hours}</td>
                <td style={{ padding: "1cqw 0", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{m.scorePct}</td>
                <td style={{ padding: "1cqw 0", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: GOLD, fontWeight: 700 }}>{m.grade}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${INK}` }}>
              <td colSpan={4} style={{ padding: "1.2cqw 0", fontFamily: "'Inter', sans-serif",
                letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 800 }}>Cumulative GPA</td>
              <td style={{ padding: "1.2cqw 0", textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 800, color: GOLD }}>{p.cumulativeGpa}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <TrFooter {...p} />
    </TrShell>
  );
}

/* ---------- 2. REGISTER ---------- */
function RegisterTr(p: MinimalTranscriptProps) {
  return (
    <TrShell>
      <TrHeader {...p} />
      <div style={{ padding: "3cqw 6cqw 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto auto",
          fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2cqw" }}>
          <div style={{ gridColumn: "1 / -1", borderBottom: `2px solid ${INK}`, padding: "0.6cqw 0",
            display: "grid", gridTemplateColumns: "subgrid",
            fontFamily: "'Inter', sans-serif", fontSize: "0.85cqw", letterSpacing: "0.24em",
            textTransform: "uppercase", fontWeight: 800 }}>
            <div style={{ paddingRight: "1.5cqw" }}>Code</div>
            <div>Module</div>
            <div style={{ textAlign: "right", paddingLeft: "1.5cqw" }}>Hours</div>
            <div style={{ textAlign: "right", paddingLeft: "1.5cqw" }}>Score</div>
            <div style={{ textAlign: "right", paddingLeft: "1.5cqw" }}>Grade</div>
          </div>
          {p.modules.map((m, i) => (
            <div key={m.code} style={{
              gridColumn: "1 / -1", padding: "1.2cqw 0",
              background: i % 2 ? "rgba(10,18,38,0.04)" : "transparent",
              display: "grid", gridTemplateColumns: "subgrid",
            }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1cqw", paddingRight: "1.5cqw" }}>{m.code}</div>
              <div>{m.title}</div>
              <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "1cqw", paddingLeft: "1.5cqw" }}>{m.hours}</div>
              <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "1cqw", paddingLeft: "1.5cqw" }}>{m.scorePct}%</div>
              <div style={{ textAlign: "right", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontWeight: 700, color: GOLD, paddingLeft: "1.5cqw" }}>{m.grade}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "1.6cqw", borderTop: `2px solid ${INK}`, paddingTop: "1.2cqw",
          display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.32em",
            textTransform: "uppercase", fontWeight: 800, fontSize: "1cqw" }}>Cumulative GPA</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontSize: "2.4cqw", color: GOLD, fontWeight: 700 }}>{p.cumulativeGpa}</div>
        </div>
      </div>
      <TrFooter {...p} />
    </TrShell>
  );
}

/* ---------- 3. DOSSIER ---------- */
function DossierTr(p: MinimalTranscriptProps) {
  return (
    <TrShell>
      <TrHeader {...p} />
      <div style={{ padding: "3cqw 6cqw 0", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "3cqw" }}>
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.32em",
            textTransform: "uppercase", fontWeight: 800, fontSize: "0.95cqw", color: INK_SOFT, marginBottom: "1cqw" }}>
            Modules Completed
          </div>
          {p.modules.map((m) => (
            <div key={m.code} style={{ borderBottom: "1px solid rgba(10,18,38,0.12)", padding: "1cqw 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "1.4cqw" }}>{m.title}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                  fontWeight: 700, color: GOLD, fontSize: "1.5cqw" }}>{m.grade}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4cqw",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85cqw", color: INK_SOFT, letterSpacing: "0.12em" }}>
                <span>{m.code}</span>
                <span>{m.hours} HRS · {m.scorePct}%</span>
              </div>
            </div>
          ))}
        </div>
        <aside style={{ background: "rgba(10,18,38,0.04)", padding: "2cqw", border: `1px solid ${GOLD}` }}>
          <div style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.32em",
            textTransform: "uppercase", fontWeight: 800, fontSize: "0.85cqw", color: INK_SOFT }}>Cumulative GPA</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontWeight: 700, fontSize: "3.6cqw", color: INK, marginTop: "0.4cqw" }}>{p.cumulativeGpa}</div>
          <div style={{ height: 1, background: GOLD, margin: "1.4cqw 0" }} />
          <dl style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.95cqw", color: INK, lineHeight: 1.8 }}>
            <dt style={{ color: INK_SOFT, letterSpacing: "0.16em", textTransform: "uppercase", fontSize: "0.7cqw" }}>Modules</dt>
            <dd>{p.modules.length}</dd>
            <dt style={{ color: INK_SOFT, letterSpacing: "0.16em", textTransform: "uppercase", fontSize: "0.7cqw", marginTop: "0.6cqw" }}>Total hours</dt>
            <dd>{p.modules.reduce((s, m) => s + m.hours, 0)}</dd>
            <dt style={{ color: INK_SOFT, letterSpacing: "0.16em", textTransform: "uppercase", fontSize: "0.7cqw", marginTop: "0.6cqw" }}>Average score</dt>
            <dd>{Math.round(p.modules.reduce((s, m) => s + m.scorePct, 0) / Math.max(1, p.modules.length))}%</dd>
          </dl>
        </aside>
      </div>
      <TrFooter {...p} />
    </TrShell>
  );
}

/* ---------- 4. COMPENDIUM ---------- */
function CompendiumTr(p: MinimalTranscriptProps) {
  return (
    <TrShell bg={PAPER}>
      <TrHeader {...p} />
      <div style={{ padding: "3cqw 6cqw 0" }}>
        <blockquote style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: "2cqw",
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.6cqw",
          color: INK, lineHeight: 1.5, margin: 0 }}>
          “Awarded a cumulative grade-point average of <strong style={{ color: GOLD, fontStyle: "normal" }}>{p.cumulativeGpa}</strong>{" "}
          across {p.modules.length} graded modules in the {p.programTitle} program.”
        </blockquote>
        <div style={{ marginTop: "2.6cqw", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.4cqw 2.4cqw" }}>
          {p.modules.map((m) => (
            <div key={m.code}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85cqw",
                letterSpacing: "0.16em", color: INK_SOFT }}>{m.code} · {m.hours} HRS</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4cqw",
                color: INK, marginTop: "0.2cqw" }}>{m.title}</div>
              <div style={{ marginTop: "0.4cqw", display: "flex", justifyContent: "space-between",
                alignItems: "baseline" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.95cqw", color: INK }}>{m.scorePct}%</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                  fontWeight: 700, color: GOLD, fontSize: "1.6cqw" }}>{m.grade}</span>
              </div>
              <div style={{ marginTop: "0.4cqw", height: 2, background: "rgba(10,18,38,0.1)" }}>
                <div style={{ width: `${m.scorePct}%`, height: "100%", background: GOLD }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <TrFooter {...p} />
    </TrShell>
  );
}

/* ---------- 5. ROLLS ---------- */
function RollsTr(p: MinimalTranscriptProps) {
  return (
    <TrShell grid={<GridBg opacity={0.04} size={20} />}>
      <TrHeader {...p} />
      <div style={{ padding: "3cqw 6cqw 0" }}>
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {p.modules.map((m, i) => (
            <li key={m.code} style={{ display: "grid",
              gridTemplateColumns: "auto 1fr auto auto auto", alignItems: "baseline", gap: "1.4cqw",
              padding: "1.4cqw 0", borderBottom: "1px solid rgba(10,18,38,0.12)" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontSize: "2.4cqw", color: GOLD, width: "3cqw" }}>{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5cqw", color: INK }}>{m.title}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8cqw",
                  letterSpacing: "0.16em", color: INK_SOFT, marginTop: "0.2cqw" }}>{m.code}</div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.95cqw", color: INK }}>{m.hours} HRS</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.95cqw", color: INK }}>{m.scorePct}%</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                fontWeight: 700, color: GOLD, fontSize: "1.6cqw" }}>{m.grade}</div>
            </li>
          ))}
        </ol>
        <div style={{ marginTop: "1.6cqw", display: "flex", justifyContent: "space-between",
          alignItems: "baseline", borderTop: `2px solid ${INK}`, paddingTop: "1.2cqw" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.32em",
            textTransform: "uppercase", fontWeight: 800, fontSize: "1cqw" }}>Final standing</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontSize: "2.4cqw", color: GOLD, fontWeight: 700 }}>{p.cumulativeGpa}</div>
        </div>
      </div>
      <TrFooter {...p} />
    </TrShell>
  );
}