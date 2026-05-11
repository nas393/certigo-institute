import { useEffect, useState } from "react";
import QRCode from "qrcode";

export type CertigoTranscriptTheme =
  | "ledger"      // navy header, formal tabular grades (academic)
  | "dossier"     // monochrome paper, classified-file vibe
  | "telemetry"   // dark-mode console / data dashboard
  | "codex"       // minimal serif, editorial / law-firm
  | "audit"       // corporate report with progress bars
  | "monolith"    // pure black + gold rails
  | "aurora"      // navy + gold halo minimal
  | "parchment"   // ivory + classical navy
  | "cipher"      // navy + binary data background
  | "regalia";    // burgundy + heraldic gold

export const CERTIGO_TRANSCRIPT_THEMES: { key: CertigoTranscriptTheme; label: string; hint: string }[] = [
  { key: "ledger",    label: "Ledger",    hint: "Navy header · academic table" },
  { key: "dossier",   label: "Dossier",   hint: "Classified-file · monochrome" },
  { key: "telemetry", label: "Telemetry", hint: "Dark console · live metrics" },
  { key: "codex",     label: "Codex",     hint: "Editorial serif · minimal" },
  { key: "audit",     label: "Audit",     hint: "Corporate report · bars" },
  { key: "monolith",  label: "Monolith",  hint: "Pure black · gold rails" },
  { key: "aurora",    label: "Aurora",    hint: "Navy · gold halo · minimal" },
  { key: "parchment", label: "Parchment", hint: "Ivory · classical navy" },
  { key: "cipher",    label: "Cipher",    hint: "Navy · binary data" },
  { key: "regalia",   label: "Regalia",   hint: "Burgundy · heraldic gold" },
];

export interface TranscriptModule {
  code: string;       // "WAA-201"
  title: string;      // "Front-end Architecture"
  hours: number;      // 12
  scorePct: number;   // 96
  grade: string;      // "A"
}

export interface CertigoTranscriptProps {
  theme: CertigoTranscriptTheme;
  recipientName: string;
  programTitle: string;
  programCode: string;          // e.g. "WAA-2026-PRO"
  issueDate: string;            // ISO
  transcriptId: string;
  verifyUrl: string;
  modules: TranscriptModule[];
  cumulativeGpa?: string;       // "3.92 / 4.00"
  totalHours?: number;
}

const NAVY = "#0b1a3a";
const NAVY_DEEP = "#060f24";
const GOLD = "#c9a24a";
const GOLD_HI = "#f1d68a";
const GOLD_LO = "#8a6a23";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function useQR(t: string, size = 220) {
  const [s, setS] = useState("");
  useEffect(() => { QRCode.toDataURL(t, { margin: 0, width: size, color: { dark: NAVY, light: "#ffffff" } }).then(setS); }, [t, size]);
  return s;
}

export function CertigoTranscript(p: CertigoTranscriptProps) {
  switch (p.theme) {
    case "dossier":   return <DossierTr {...p} />;
    case "telemetry": return <TelemetryTr {...p} />;
    case "codex":     return <CodexTr {...p} />;
    case "audit":     return <AuditTr {...p} />;
    case "monolith":  return <MonolithTr {...p} />;
    case "aurora":    return <AuroraTr {...p} />;
    case "parchment": return <ParchmentTr {...p} />;
    case "cipher":    return <CipherTr {...p} />;
    case "regalia":   return <RegaliaTr {...p} />;
    case "ledger":
    default:          return <LedgerTr {...p} />;
  }
}

/* ---------- 1. LEDGER — navy header, academic transcript ---------- */

function LedgerTr(p: CertigoTranscriptProps) {
  const qr = useQR(p.verifyUrl);
  return (
    <div style={{ aspectRatio: "1/1.414", containerType: "inline-size", background: "#fff",
      color: NAVY_DEEP, position: "relative", overflow: "hidden",
      fontFamily: "'Inter', sans-serif" }} className="w-full shadow-2xl">
      {/* navy header */}
      <div style={{ background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
        color: "#fff", padding: "4cqw 5cqw", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.4cqw",
              fontWeight: 700, color: GOLD_HI, letterSpacing: "0.04em" }}>Certigo Institute</div>
            <div style={{ fontSize: "0.75cqw", letterSpacing: "0.4em", color: "#cfd6e8",
              fontWeight: 600, marginTop: "0.4cqw" }}>OFFICIAL ACADEMIC TRANSCRIPT</div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.62cqw", letterSpacing: "0.16em", color: "#cfd6e8", lineHeight: 1.7 }}>
            <div>TRANSCRIPT ID</div>
            <div style={{ color: GOLD }}>{p.transcriptId}</div>
          </div>
        </div>
        <div style={{ height: 1, background: GOLD, opacity: 0.6, marginTop: "1.6cqw" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1cqw", marginTop: "1.4cqw" }}>
          <Field label="RECIPIENT" value={p.recipientName} />
          <Field label="PROGRAM" value={p.programTitle} />
          <Field label="PROGRAM CODE" value={p.programCode} mono />
        </div>
      </div>

      {/* table */}
      <div style={{ padding: "3cqw 5cqw" }}>
        <div style={{ fontSize: "0.7cqw", letterSpacing: "0.32em", color: GOLD_LO,
          fontWeight: 700, marginBottom: "1cqw" }}>COURSE RECORD</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95cqw" }}>
          <thead>
            <tr style={{ background: "#f4f1e8", color: NAVY_DEEP }}>
              <Th>Code</Th><Th>Course</Th><Th align="right">Hours</Th>
              <Th align="right">Score</Th><Th align="right">Grade</Th>
            </tr>
          </thead>
          <tbody>
            {p.modules.map((m, i) => (
              <tr key={m.code} style={{ background: i % 2 ? "#fafaf6" : "#fff",
                borderBottom: `1px solid #ece7d3` }}>
                <Td mono>{m.code}</Td>
                <Td>{m.title}</Td>
                <Td align="right" mono>{m.hours}</Td>
                <Td align="right" mono>{m.scorePct}%</Td>
                <Td align="right" mono style={{ color: GOLD_LO, fontWeight: 700 }}>{m.grade}</Td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: NAVY, color: "#fff" }}>
              <Td mono>TOTAL</Td><Td>—</Td>
              <Td align="right" mono>{p.totalHours ?? p.modules.reduce((a, m) => a + m.hours, 0)}</Td>
              <Td align="right" mono>—</Td>
              <Td align="right" mono style={{ color: GOLD_HI }}>{p.cumulativeGpa ?? "—"}</Td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* footer */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "3cqw 5cqw",
        borderTop: `1px solid #ece7d3`, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "flex", gap: "1cqw", alignItems: "center" }}>
          {qr && <img src={qr} alt="Verify" style={{ width: "5cqw", height: "5cqw" }} />}
          <div style={{ fontSize: "0.65cqw", letterSpacing: "0.2em", color: NAVY,
            fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
            ON-CHAIN VERIFIED<br />METADATA · v1
          </div>
        </div>
        <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.65cqw", letterSpacing: "0.18em", color: NAVY, lineHeight: 1.7 }}>
          <div>ISSUED {fmtDate(p.issueDate).toUpperCase()}</div>
          <div style={{ color: GOLD_LO }}>OFFICIAL · CERTIGO INSTITUTE</div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: "0.6cqw", letterSpacing: "0.3em", color: "#9fb1d8", fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: mono ? "'JetBrains Mono', monospace" : "'Cormorant Garamond', serif",
        fontSize: mono ? "1cqw" : "1.4cqw", color: "#fff", marginTop: "0.3cqw", fontWeight: mono ? 600 : 700,
        letterSpacing: mono ? "0.08em" : undefined }}>{value}</div>
    </div>
  );
}
function Th({ children, align }: { children: React.ReactNode; align?: "right" | "left" }) {
  return <th style={{ textAlign: align ?? "left", padding: "0.8cqw 0.6cqw",
    fontSize: "0.65cqw", letterSpacing: "0.24em", fontWeight: 700,
    borderBottom: `2px solid ${GOLD}` }}>{children}</th>;
}
function Td({ children, align, mono, style }: { children: React.ReactNode; align?: "right" | "left"; mono?: boolean; style?: React.CSSProperties }) {
  return <td style={{ textAlign: align ?? "left", padding: "0.7cqw 0.6cqw",
    fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
    letterSpacing: mono ? "0.04em" : undefined, ...style }}>{children}</td>;
}

/* ---------- 2. DOSSIER — classified file, mono ---------- */

function DossierTr(p: CertigoTranscriptProps) {
  const qr = useQR(p.verifyUrl);
  return (
    <div style={{ aspectRatio: "1/1.414", containerType: "inline-size", background: "#f6f1e4",
      color: "#1a1815", position: "relative", overflow: "hidden",
      fontFamily: "'JetBrains Mono', monospace" }} className="w-full shadow-2xl">
      {/* paper texture */}
      <div style={{ position: "absolute", inset: 0, backgroundImage:
        "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "3px 3px" }} />
      <div style={{ position: "absolute", inset: "1.6cqw", border: `1.5px solid #1a1815` }} />

      <div style={{ position: "relative", padding: "3cqw 4cqw" }}>
        {/* CLASSIFIED stamp */}
        <div style={{ position: "absolute", top: "3cqw", right: "4cqw", border: "2.5px solid #8a1f1f",
          color: "#8a1f1f", padding: "0.5cqw 1cqw", fontWeight: 800, fontSize: "0.95cqw",
          letterSpacing: "0.3em", transform: "rotate(8deg)" }}>VERIFIED</div>

        <div style={{ fontSize: "0.7cqw", letterSpacing: "0.42em", fontWeight: 700, color: "#5a4f2c" }}>
          CERTIGO INSTITUTE / DOSSIER
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.6cqw",
          fontWeight: 700, marginTop: "0.4cqw" }}>Academic Dossier</div>
        <div style={{ height: 2, background: "#1a1815", marginTop: "0.6cqw", width: "20cqw" }} />

        <div style={{ marginTop: "2cqw", display: "grid", gridTemplateColumns: "auto 1fr",
          rowGap: "0.8cqw", columnGap: "1.2cqw", fontSize: "0.85cqw" }}>
          <Lbl>SUBJECT NAME</Lbl><Val>{p.recipientName}</Val>
          <Lbl>PROGRAM</Lbl><Val>{p.programTitle}</Val>
          <Lbl>PROGRAM CODE</Lbl><Val>{p.programCode}</Val>
          <Lbl>DATE OF ISSUE</Lbl><Val>{fmtDate(p.issueDate).toUpperCase()}</Val>
          <Lbl>DOSSIER ID</Lbl><Val>{p.transcriptId}</Val>
        </div>

        <div style={{ marginTop: "2.4cqw", borderTop: "1px dashed #1a1815", paddingTop: "1.4cqw" }}>
          <div style={{ fontSize: "0.7cqw", letterSpacing: "0.32em", fontWeight: 700, color: "#5a4f2c" }}>
            COURSEWORK ASSESSED
          </div>
          <div style={{ marginTop: "1cqw" }}>
            {p.modules.map((m) => (
              <div key={m.code} style={{ display: "grid",
                gridTemplateColumns: "auto 1fr auto auto", gap: "1cqw", padding: "0.6cqw 0",
                borderBottom: "1px solid rgba(0,0,0,0.12)", alignItems: "baseline", fontSize: "0.85cqw" }}>
                <span style={{ color: "#5a4f2c" }}>{m.code}</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05cqw" }}>{m.title}</span>
                <span>{m.hours}h</span>
                <span style={{ fontWeight: 700 }}>{m.scorePct}% · {m.grade}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "1.6cqw", display: "flex", justifyContent: "space-between",
          alignItems: "center", borderTop: "2px solid #1a1815", paddingTop: "1cqw", fontSize: "0.85cqw" }}>
          <span>CUMULATIVE</span>
          <span style={{ fontWeight: 800 }}>{p.cumulativeGpa ?? "—"}</span>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "2.4cqw", left: "4cqw", right: "4cqw",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        {qr && <img src={qr} alt="Verify" style={{ width: "5cqw", height: "5cqw" }} />}
        <div style={{ fontSize: "0.6cqw", letterSpacing: "0.2em", textAlign: "right", color: "#5a4f2c", lineHeight: 1.7 }}>
          ON-CHAIN VERIFIED METADATA<br />CERTIGO INSTITUTE · OFFICIAL
        </div>
      </div>
    </div>
  );
}
function Lbl({ children }: { children: React.ReactNode }) { return <span style={{ color: "#5a4f2c", letterSpacing: "0.18em", fontSize: "0.65cqw", paddingTop: "0.2cqw" }}>{children}</span>; }
function Val({ children }: { children: React.ReactNode }) { return <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1cqw", fontWeight: 700 }}>{children}</span>; }

/* ---------- 3. TELEMETRY — dark console dashboard ---------- */

function TelemetryTr(p: CertigoTranscriptProps) {
  const qr = useQR(p.verifyUrl);
  const total = p.totalHours ?? p.modules.reduce((a, m) => a + m.hours, 0);
  const avg = Math.round(p.modules.reduce((a, m) => a + m.scorePct, 0) / Math.max(1, p.modules.length));
  return (
    <div style={{ aspectRatio: "1/1.414", containerType: "inline-size",
      background: `linear-gradient(180deg, #06070b 0%, #0b1020 100%)`, color: "#e8eaf2",
      position: "relative", overflow: "hidden",
      fontFamily: "'JetBrains Mono', monospace" }} className="w-full shadow-2xl">
      {/* grid bg */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }} aria-hidden>
        <defs><pattern id="tl-g" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0 H0 V24" fill="none" stroke="#5b8cff" strokeWidth="0.4" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#tl-g)" />
      </svg>

      <div style={{ position: "relative", padding: "3cqw 4cqw" }}>
        {/* header bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: "0.7cqw", letterSpacing: "0.24em", color: GOLD }}>
          <span>● CERTIGO.OS / TRANSCRIPT.v1</span>
          <span>STATUS: <span style={{ color: "#7dffb6" }}>VERIFIED</span></span>
        </div>

        <div style={{ marginTop: "1.6cqw", fontFamily: "'Cormorant Garamond', serif",
          fontSize: "2.6cqw", color: "#fff", fontWeight: 600 }}>
          {p.recipientName}
        </div>
        <div style={{ fontSize: "0.85cqw", color: "#9fb1d8", letterSpacing: "0.1em", marginTop: "0.2cqw" }}>
          {p.programTitle} · <span style={{ color: GOLD }}>{p.programCode}</span>
        </div>

        {/* metric cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1cqw", marginTop: "2cqw" }}>
          <Metric label="MODULES" value={String(p.modules.length)} />
          <Metric label="HOURS" value={String(total)} />
          <Metric label="AVG SCORE" value={`${avg}%`} accent />
        </div>

        {/* table */}
        <div style={{ marginTop: "2cqw", border: `1px solid rgba(201,162,74,0.4)` }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto auto",
            gap: "1cqw", padding: "0.7cqw 1cqw", background: "rgba(201,162,74,0.1)",
            fontSize: "0.6cqw", letterSpacing: "0.24em", color: GOLD, fontWeight: 700 }}>
            <span>CODE</span><span>MODULE</span><span>HRS</span><span>SCORE</span><span>GR</span>
          </div>
          {p.modules.map((m, i) => (
            <div key={m.code} style={{ display: "grid",
              gridTemplateColumns: "auto 1fr auto auto auto", gap: "1cqw", padding: "0.65cqw 1cqw",
              borderTop: i ? "1px solid rgba(255,255,255,0.06)" : undefined,
              fontSize: "0.78cqw", alignItems: "center" }}>
              <span style={{ color: "#9fb1d8" }}>{m.code}</span>
              <span style={{ color: "#fff" }}>{m.title}</span>
              <span>{m.hours}</span>
              <span style={{ color: "#7dffb6" }}>{m.scorePct}%</span>
              <span style={{ color: GOLD, fontWeight: 700 }}>{m.grade}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "2.4cqw", left: "4cqw", right: "4cqw",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8cqw" }}>
          {qr && <img src={qr} alt="Verify" style={{ width: "5cqw", height: "5cqw", background: "#fff", padding: "0.2cqw" }} />}
          <div style={{ fontSize: "0.55cqw", letterSpacing: "0.2em", color: GOLD, lineHeight: 1.7 }}>
            ON-CHAIN VERIFIED<br />METADATA HASH
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: "0.6cqw", letterSpacing: "0.18em",
          color: "#9fb1d8", lineHeight: 1.7 }}>
          <div>ISSUED {fmtDate(p.issueDate).toUpperCase()}</div>
          <div>ID {p.transcriptId}</div>
        </div>
      </div>
    </div>
  );
}
function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ border: `1px solid ${accent ? GOLD : "rgba(91,140,255,0.35)"}`,
      padding: "1cqw 1.2cqw", background: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontSize: "0.55cqw", letterSpacing: "0.3em", color: accent ? GOLD : "#9fb1d8", fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2cqw",
        color: accent ? GOLD_HI : "#fff", marginTop: "0.3cqw", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

/* ---------- 4. CODEX — minimal editorial serif ---------- */

function CodexTr(p: CertigoTranscriptProps) {
  const qr = useQR(p.verifyUrl);
  return (
    <div style={{ aspectRatio: "1/1.414", containerType: "inline-size", background: "#fbfaf6",
      color: "#1a1815", position: "relative", overflow: "hidden",
      fontFamily: "'Cormorant Garamond', serif" }} className="w-full shadow-2xl">
      <div style={{ padding: "5cqw 6cqw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: "0.7cqw", letterSpacing: "0.42em", fontWeight: 700,
            fontFamily: "'Inter', sans-serif", color: GOLD_LO }}>CERTIGO INSTITUTE</div>
          <div style={{ fontSize: "0.65cqw", letterSpacing: "0.2em",
            fontFamily: "'JetBrains Mono', monospace", color: "#7a6f4c" }}>{p.transcriptId}</div>
        </div>

        <div style={{ fontSize: "4cqw", fontWeight: 700, marginTop: "1.4cqw", lineHeight: 1 }}>
          Transcript <span style={{ fontStyle: "italic", color: GOLD_LO }}>of</span> Studies
        </div>
        <div style={{ height: 2, background: "#1a1815", width: "10cqw", marginTop: "1cqw" }} />

        <div style={{ marginTop: "2cqw", fontSize: "1.4cqw" }}>
          Awarded to <span style={{ fontStyle: "italic", fontWeight: 700 }}>{p.recipientName}</span>
        </div>
        <div style={{ fontSize: "1cqw", color: "#5a4f2c", marginTop: "0.4cqw",
          fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em" }}>
          for the program: <strong>{p.programTitle}</strong> ({p.programCode})
        </div>

        <div style={{ marginTop: "3cqw", borderTop: "1px solid #1a1815", paddingTop: "1.4cqw" }}>
          {p.modules.map((m, i) => (
            <div key={m.code} style={{ display: "grid",
              gridTemplateColumns: "auto 1fr auto auto", columnGap: "1.2cqw", padding: "0.9cqw 0",
              borderBottom: i === p.modules.length - 1 ? undefined : "1px solid rgba(0,0,0,0.1)",
              alignItems: "baseline" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7cqw",
                color: GOLD_LO, letterSpacing: "0.1em" }}>{m.code}</span>
              <span style={{ fontSize: "1.2cqw" }}>{m.title}</span>
              <span style={{ fontSize: "0.85cqw", color: "#5a4f2c",
                fontFamily: "'Inter', sans-serif" }}>{m.hours}h · {m.scorePct}%</span>
              <span style={{ fontSize: "1.4cqw", fontWeight: 700, color: GOLD_LO,
                width: "2.4cqw", textAlign: "right" }}>{m.grade}</span>
            </div>
          ))}
        </div>

        {p.cumulativeGpa && (
          <div style={{ marginTop: "2cqw", display: "flex", justifyContent: "space-between",
            alignItems: "baseline", borderTop: "2px solid #1a1815", paddingTop: "1.2cqw" }}>
            <span style={{ fontStyle: "italic", fontSize: "1.2cqw" }}>Cumulative</span>
            <span style={{ fontSize: "2cqw", fontWeight: 700 }}>{p.cumulativeGpa}</span>
          </div>
        )}
      </div>

      <div style={{ position: "absolute", bottom: "3cqw", left: "6cqw", right: "6cqw",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        fontFamily: "'Inter', sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1cqw" }}>
          {qr && <img src={qr} alt="Verify" style={{ width: "4.6cqw", height: "4.6cqw" }} />}
          <div style={{ fontSize: "0.6cqw", letterSpacing: "0.22em", color: "#7a6f4c",
            fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
            ON-CHAIN VERIFIED<br />METADATA · v1
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: "0.65cqw", letterSpacing: "0.2em",
          color: "#7a6f4c", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
          <div>ISSUED {fmtDate(p.issueDate).toUpperCase()}</div>
          <div>OFFICIAL · CERTIGO</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 5. AUDIT — corporate report w/ progress bars ---------- */

function AuditTr(p: CertigoTranscriptProps) {
  const qr = useQR(p.verifyUrl);
  const total = p.totalHours ?? p.modules.reduce((a, m) => a + m.hours, 0);
  const avg = Math.round(p.modules.reduce((a, m) => a + m.scorePct, 0) / Math.max(1, p.modules.length));
  return (
    <div style={{ aspectRatio: "1/1.414", containerType: "inline-size", background: "#fff",
      color: NAVY_DEEP, position: "relative", overflow: "hidden",
      fontFamily: "'Inter', sans-serif" }} className="w-full shadow-2xl">
      {/* gold side bar */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "1.6cqw",
        background: `linear-gradient(180deg, ${GOLD_HI}, ${GOLD}, ${GOLD_LO})` }} />

      <div style={{ padding: "3.4cqw 4cqw 3.4cqw 5cqw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "0.7cqw", letterSpacing: "0.4em", fontWeight: 700, color: GOLD_LO }}>
              CERTIGO INSTITUTE · AUDIT REPORT
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.8cqw",
              fontWeight: 700, marginTop: "0.4cqw", color: NAVY_DEEP }}>
              Performance Transcript
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6cqw", letterSpacing: "0.18em", color: NAVY, lineHeight: 1.7 }}>
            <div>{p.transcriptId}</div>
            <div style={{ color: GOLD_LO }}>{fmtDate(p.issueDate).toUpperCase()}</div>
          </div>
        </div>

        <div style={{ marginTop: "1.4cqw", display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1cqw" }}>
          <Card label="RECIPIENT" value={p.recipientName} />
          <Card label="PROGRAM" value={p.programTitle} small />
          <Card label="CUMULATIVE" value={p.cumulativeGpa ?? `${avg}%`} accent />
        </div>

        <div style={{ marginTop: "2.4cqw", fontSize: "0.7cqw", letterSpacing: "0.32em",
          fontWeight: 700, color: GOLD_LO }}>MODULE-LEVEL ASSESSMENT</div>

        <div style={{ marginTop: "1cqw", display: "flex", flexDirection: "column", gap: "0.9cqw" }}>
          {p.modules.map((m) => (
            <div key={m.code}>
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "baseline", fontSize: "0.85cqw" }}>
                <span><strong style={{ fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.7cqw", color: GOLD_LO, marginRight: "0.6cqw" }}>{m.code}</strong>{m.title}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700 }}>{m.scorePct}% · {m.grade}</span>
              </div>
              <div style={{ height: "0.4cqw", background: "#eef0f6", borderRadius: 999, marginTop: "0.4cqw", overflow: "hidden" }}>
                <div style={{ width: `${m.scorePct}%`, height: "100%",
                  background: `linear-gradient(90deg, ${NAVY}, ${GOLD})` }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "2cqw", display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.8cqw", fontSize: "0.75cqw" }}>
          <Stat label="Modules" value={String(p.modules.length)} />
          <Stat label="Total hours" value={String(total)} />
          <Stat label="Average" value={`${avg}%`} />
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "2.4cqw", left: "5cqw", right: "4cqw",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8cqw" }}>
          {qr && <img src={qr} alt="Verify" style={{ width: "4.8cqw", height: "4.8cqw" }} />}
          <div style={{ fontSize: "0.6cqw", letterSpacing: "0.2em", color: NAVY,
            fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
            ON-CHAIN VERIFIED<br />METADATA · v1
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: "0.65cqw", letterSpacing: "0.2em",
          color: NAVY, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
          OFFICIAL · CERTIGO INSTITUTE
        </div>
      </div>
    </div>
  );
}
function Card({ label, value, accent, small }: { label: string; value: string; accent?: boolean; small?: boolean }) {
  return (
    <div style={{ border: `1px solid ${accent ? GOLD : "#e5e7ef"}`,
      background: accent ? "#fffaf0" : "#fbfbfd", padding: "1cqw 1.2cqw" }}>
      <div style={{ fontSize: "0.55cqw", letterSpacing: "0.3em", color: accent ? GOLD_LO : "#7a8198", fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif",
        fontSize: small ? "1.2cqw" : "1.6cqw", fontWeight: 700,
        color: accent ? GOLD_LO : NAVY_DEEP, marginTop: "0.3cqw", lineHeight: 1.1 }}>{value}</div>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderTop: `2px solid ${NAVY}`, paddingTop: "0.5cqw" }}>
      <div style={{ fontSize: "0.55cqw", letterSpacing: "0.3em", color: "#7a8198", fontWeight: 700 }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.2cqw", fontWeight: 700, marginTop: "0.2cqw" }}>{value}</div>
    </div>
  );
}