import { useEffect, useState } from "react";
import QRCode from "qrcode";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/600-italic.css";
import { CERT_LABELS, type MonoCertProps } from "@/components/certigo/MonochromeCertificate";

/**
 * Formal certificate (A4 landscape, laid out at 1123×794 and scaled).
 * Three designs (classic / verified / diploma); seal, director's signature mark,
 * QR + printed verify address. No accreditation claims and no personal name, by design.
 */
const NAVY = "#0B1B3A";
const EMERALD = "#0E9F6E";
const SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, serif';

export type CertDesign = "classic" | "verified" | "diploma";
export type FormalCertProps = Omit<MonoCertProps, "variant"> & { design?: CertDesign; passMark?: number };

const GOLD = "#9A7B4F";

export function FormalCertificate(p: FormalCertProps) {
  const design = p.design ?? "verified";
  const L = { ...CERT_LABELS.en, ...p.labels };
  const verifyUrl = p.verifyUrl ?? (typeof window !== "undefined" ? `${window.location.origin}/verify/${p.certificateId}` : `/verify/${p.certificateId}`);
  const ctx = { p, L, verifyUrl, verifyText: verifyUrl.replace(/^https?:\/\//, "") };
  return (
    <div dir={p.dir ?? "ltr"} className="relative overflow-hidden" style={{ width: 1123, height: 794, color: NAVY, background: design === "diploma" ? "#FBF8F1" : "#fff" }}>
      {design === "classic" && <Classic {...ctx} />}
      {design === "verified" && <Verified {...ctx} />}
      {design === "diploma" && <Diploma {...ctx} />}
    </div>
  );
}

type Ctx = { p: FormalCertProps; L: typeof CERT_LABELS.en; verifyUrl: string; verifyText: string };

function facts({ p, L }: Ctx, withPass: boolean): Array<[string, string]> {
  const f: Array<[string, string]> = [[L.assessment, L.exam]];
  if (withPass && p.passMark) f.push([L.passMark, `${p.passMark}%`]);
  if (p.moduleCount) f.push([L.modules, String(p.moduleCount)]);
  if (p.hours) f.push([L.hours, String(p.hours)]);
  f.push([L.issued, fmtDate(p.issueDate, p.locale)]);
  return f;
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={40} />
      <div className="text-left">
        <div className="font-display text-[22px] font-black leading-none tracking-tight" style={{ color: light ? "#fff" : NAVY }}>CERTIGO<span style={{ color: EMERALD }}>.</span></div>
        <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.22em]" style={{ color: light ? "#ffffffaa" : "#737373" }}>Certifications Office</div>
      </div>
    </div>
  );
}

function Recipient({ p, L }: Ctx, size = 58) {
  return (
    <>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-neutral-500">{L.certify}</div>
      <div className="mt-1" style={{ fontFamily: SERIF, fontSize: size, fontWeight: 600, fontStyle: "italic", lineHeight: 1.1 }}>{p.recipientName}</div>
    </>
  );
}

function Course({ p, L }: Ctx) {
  return (
    <>
      <div className="mt-4 text-[13.5px] text-neutral-600">{L.completed}</div>
      <div className="mt-1.5 font-display text-[27px] font-bold leading-snug tracking-tight">{p.courseTitle}</div>
      {p.description && <div className="mt-1 max-w-[720px] text-[12.5px] leading-snug text-neutral-500">{p.description}</div>}
    </>
  );
}

function FactBox({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="flex items-stretch divide-x divide-neutral-200 rounded-md border border-neutral-200 bg-white/80">
      {items.map(([k, v]) => (
        <div key={k} className="px-5 py-2">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{k}</div>
          <div className="mt-0.5 text-[12.5px] font-semibold">{v}</div>
        </div>
      ))}
    </div>
  );
}

function Skills({ p, L }: Ctx) {
  if (!p.skills?.length) return null;
  return (
    <div className="mt-2.5 text-[11.5px] text-neutral-500">
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{L.skills}: </span>
      {p.skills.slice(0, 6).join(" · ")}
    </div>
  );
}

function VerifyBlock({ p, L, verifyUrl, verifyText }: Ctx, qr = 74) {
  return (
    <div className="flex items-end gap-3 text-left">
      <div className="rounded-[3px] bg-white p-1 ring-1 ring-neutral-200" style={{ width: qr, height: qr }}>
        <QRImage url={verifyUrl} dataUrl={p.qrDataUrl} />
      </div>
      <div>
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{L.number}</div>
        <div className="font-mono text-[12.5px] font-bold tracking-[0.06em]">{p.certificateId}</div>
        <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{L.verify}</div>
        <div className="font-mono text-[10.5px] leading-snug">{verifyText.replace(/\/verify\/.*/, "")}<br />{verifyText.replace(/^[^/]*/, "")}</div>
      </div>
    </div>
  );
}

function SignBlock({ L }: Ctx) {
  return (
    <div className="flex flex-col items-center">
      <Signature />
      <div className="h-px w-56" style={{ background: NAVY }} />
      <div className="mt-1.5 text-[12.5px] font-semibold">Director</div>
      <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-neutral-500">{L.office}</div>
    </div>
  );
}

/* Option A — Classic: security border, green rosette seal. */
function Classic(c: Ctx) {
  return (
    <>
      <SecurityBorder />
      <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-[0.05]"><LogoMark size={400} ghost /></div>
      <div className="absolute flex flex-col items-center text-center" style={{ inset: "64px 90px 62px" }}>
        <Brand />
        <div className="mt-6 uppercase" style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, letterSpacing: "0.14em", lineHeight: 1 }}>Certificate of Achievement</div>
        <Ornament />
        <div className="mt-4" />{Recipient(c)}
        <div className="mx-auto mt-1 h-px w-[520px]" style={{ background: `${NAVY}40` }} />
        <Course {...c} />
        <div className="mt-5"><FactBox items={facts(c, false)} /></div>
        <Skills {...c} />
        <div className="mt-auto grid w-full grid-cols-3 items-end">
          {VerifyBlock(c)}
          <div className="flex justify-center"><Seal /></div>
          <SignBlock {...c} />
        </div>
        {c.p.footnote && <div className="mt-2 text-[10.5px] text-neutral-500">{c.p.footnote}</div>}
      </div>
    </>
  );
}

/* Option B — Verified: corporate double rule, assessment record with pass mark, verification panel + authenticity statement. */
function Verified(c: Ctx) {
  const { p, L } = c;
  return (
    <>
      <div className="absolute" style={{ inset: 22, border: `1.5px solid ${NAVY}` }} />
      <div className="absolute" style={{ inset: 28, border: `0.6px solid ${NAVY}55` }} />
      <div className="absolute left-[28px] right-[28px] top-[28px] h-[6px]" style={{ background: EMERALD }} />
      <div className="absolute flex flex-col" style={{ inset: "62px 80px 56px" }}>
        <div className="flex items-start justify-between">
          <Brand />
          <EmbossSeal />
        </div>
        <div className="-mt-6 uppercase" style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 600, letterSpacing: "0.12em", lineHeight: 1 }}>Certificate of Achievement</div>
        <div className="mt-6" />{Recipient(c, 54)}
        <Course {...c} />
        <div className="mt-5 grid grid-cols-[1fr_auto] items-start gap-8">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">{L.record}</div>
            <div className="mt-2 flex"><FactBox items={facts(c, true)} /></div>
            <div className="mt-2.5 flex items-center gap-2 text-[12.5px]">
              <span className="rounded-sm px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white" style={{ background: EMERALD }}>{L.passed}</span>
              <span className="text-neutral-500">{L.skills}: {p.skills?.slice(0, 6).join(" · ")}</span>
            </div>
          </div>
        </div>
        <div className="mt-auto grid grid-cols-[1.25fr_1fr] items-end gap-10">
          <div className="rounded-md border border-neutral-200 bg-neutral-50/70 p-3.5">
            {VerifyBlock(c, 84)}
            <div className="mt-2.5 max-w-[470px] text-[10.5px] leading-snug text-neutral-500">
              {L.validity}
            </div>
          </div>
          <div className="flex items-end justify-end">
            <SignBlock {...c} />
          </div>
        </div>
        {p.footnote && <div className="mt-2 text-center text-[10.5px] text-neutral-500">{p.footnote}</div>}
      </div>
    </>
  );
}

/* Option C — Diploma: ivory paper, navy side band, gold seal. */
function Diploma(c: Ctx) {
  const { p } = c;
  return (
    <>
      <div className="absolute inset-y-0 left-0 flex w-[150px] flex-col items-center justify-between py-12" style={{ background: NAVY }}>
        <LogoMark size={64} />
        <div className="font-mono text-[11px] uppercase tracking-[0.5em] text-white/70" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>CERTIGO · Certifications Office</div>
        <div className="h-10 w-px bg-white/30" />
      </div>
      <div className="absolute" style={{ left: 174, right: 24, top: 24, bottom: 24, border: `1px solid ${GOLD}` }} />
      <div className="absolute" style={{ left: 180, right: 30, top: 30, bottom: 30, border: `0.5px solid ${GOLD}88` }} />
      <div className="absolute flex flex-col items-center text-center" style={{ left: 200, right: 60, top: 64, bottom: 58 }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: GOLD }}>CERTIGO Certifications Office</div>
        <div className="mt-4 uppercase" style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 600, letterSpacing: "0.12em", lineHeight: 1 }}>Certificate</div>
        <div className="mt-1 italic" style={{ fontFamily: SERIF, fontSize: 24, color: GOLD }}>of Achievement</div>
        <div className="mt-6" />{Recipient(c, 60)}
        <div className="mx-auto mt-1 h-px w-[460px]" style={{ background: GOLD }} />
        <Course {...c} />
        <div className="mt-5"><FactBox items={facts(c, true)} /></div>
        <Skills {...c} />
        <div className="mt-auto grid w-full grid-cols-3 items-end">
          {VerifyBlock(c, 70)}
          <div className="flex justify-center"><GoldSeal /></div>
          <SignBlock {...c} />
        </div>
        {p.footnote && <div className="mt-2 text-[10.5px] text-neutral-500">{p.footnote}</div>}
      </div>
    </>
  );
}

function fmtDate(iso: string, locale = "en-GB") {
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

function QRImage({ url, dataUrl }: { url: string; dataUrl?: string }) {
  const [src, setSrc] = useState(dataUrl ?? "");
  useEffect(() => {
    if (dataUrl) { setSrc(dataUrl); return; }
    let live = true;
    QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 0, width: 300, color: { dark: NAVY, light: "#ffffff00" } })
      .then((d) => { if (live) setSrc(d); }).catch(() => {});
    return () => { live = false; };
  }, [url, dataUrl]);
  return src ? <img src={src} alt="" className="h-full w-full object-contain" /> : null;
}

/** The CERTIGO "C ✓" mark, same as the site logo. */
function LogoMark({ size, ghost = false }: { size: number; ghost?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      {!ghost && <rect x="2" y="2" width="60" height="60" rx="14" fill={NAVY} />}
      <path d="M44 20a16 16 0 1 0 0 24" fill="none" stroke={ghost ? NAVY : "#fff"} strokeWidth="4.5" strokeLinecap="square" />
      <path d="M38 32.5l5 5 9.5-11" fill="none" stroke="#10B981" strokeWidth="4.5" strokeLinecap="square" />
    </svg>
  );
}

/** Fine interlaced-wave border, the kind used on printed security documents. */
function SecurityBorder() {
  const W = 1123, H = 794, m = 22, band = 20;
  const waves: string[] = [];
  const edge = (len: number, phase: number) => {
    let d = "";
    for (let x = 0; x <= len; x += 4) {
      const y = Math.sin((x / 18) + phase) * (band / 2 - 2);
      d += `${x === 0 ? "M" : "L"}${x},${y.toFixed(2)} `;
    }
    return d;
  };
  for (let i = 0; i < 6; i++) waves.push(edge(W - 2 * m, (i * Math.PI) / 3));
  const sideWaves: string[] = [];
  for (let i = 0; i < 6; i++) sideWaves.push(edge(H - 2 * m, (i * Math.PI) / 3));
  return (
    <svg className="pointer-events-none absolute inset-0" width={W} height={H} aria-hidden>
      <rect x={m - 6} y={m - 6} width={W - 2 * m + 12} height={H - 2 * m + 12} fill="none" stroke={NAVY} strokeWidth="1.4" />
      <rect x={m + band + 6} y={m + band + 6} width={W - 2 * (m + band + 6)} height={H - 2 * (m + band + 6)} fill="none" stroke={NAVY} strokeWidth="0.8" />
      <g stroke={EMERALD} strokeWidth="0.45" fill="none" opacity="0.75">
        {waves.map((d, i) => <path key={`t${i}`} d={d} transform={`translate(${m},${m + band / 2})`} />)}
        {waves.map((d, i) => <path key={`b${i}`} d={d} transform={`translate(${m},${H - m - band / 2})`} />)}
        {sideWaves.map((d, i) => <path key={`l${i}`} d={d} transform={`translate(${m + band / 2},${m}) rotate(90)`} />)}
        {sideWaves.map((d, i) => <path key={`r${i}`} d={d} transform={`translate(${W - m - band / 2},${m}) rotate(90)`} />)}
      </g>
      {[[m, m], [W - m, m], [m, H - m], [W - m, H - m]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <rect x={-9} y={-9} width={18} height={18} fill="#fff" stroke={NAVY} strokeWidth="1" transform="rotate(45)" />
          <circle r="3" fill={EMERALD} />
        </g>
      ))}
    </svg>
  );
}

function Ornament() {
  return (
    <svg width="220" height="14" viewBox="0 0 220 14" className="mt-3" aria-hidden>
      <line x1="0" y1="7" x2="92" y2="7" stroke={NAVY} strokeOpacity="0.35" />
      <line x1="128" y1="7" x2="220" y2="7" stroke={NAVY} strokeOpacity="0.35" />
      <rect x="104" y="1" width="12" height="12" transform="rotate(45 110 7)" fill="none" stroke={EMERALD} strokeWidth="1.2" />
      <circle cx="110" cy="7" r="2" fill={EMERALD} />
    </svg>
  );
}

function rosette(fill: string) {
  const pts: string[] = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2, r = i % 2 ? 46 : 50;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return <polygon points={pts.join(" ")} fill={fill} />;
}

/** Ring text that reads upright on both the top and bottom arcs. */
function RingText({ id, top, bottom, color, size = 5.8 }: { id: string; top: string; bottom: string; color: string; size?: number }) {
  return (
    <>
      <defs>
        <path id={`${id}-t`} d="M21,50 A29,29 0 0,1 79,50" />
        <path id={`${id}-b`} d="M13.5,50 A36.5,36.5 0 0,0 86.5,50" />
      </defs>
      <text fontSize={size} fill={color} fontFamily="ui-monospace,Menlo,monospace" fontWeight="700" letterSpacing="0.8" textAnchor="middle">
        <textPath href={`#${id}-t`} startOffset="50%">{top}</textPath>
      </text>
      <text fontSize={size} fill={color} fontFamily="ui-monospace,Menlo,monospace" fontWeight="700" letterSpacing="0.8" textAnchor="middle">
        <textPath href={`#${id}-b`} startOffset="50%">{bottom}</textPath>
      </text>
    </>
  );
}

/** Green rosette seal. */
function Seal() {
  return (
    <svg width="112" height="112" viewBox="0 0 100 100" aria-hidden>
      {rosette(EMERALD)}
      <circle cx="50" cy="50" r="42" fill="none" stroke="#fff" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="40" fill="#0B7F58" />
      <circle cx="50" cy="50" r="24" fill="none" stroke="#fff" strokeWidth="0.7" />
      <RingText id="gs" top="CERTIGO" bottom="CERTIFICATIONS OFFICE" color="#fff" />
      <path d="M41 50.5l6.5 6.5 13-14" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Blind-embossed look (grey relief), as on corporate certificates. */
function EmbossSeal() {
  return (
    <svg width="104" height="104" viewBox="0 0 100 100" aria-hidden>
      {rosette("#E8EAEE")}
      <circle cx="50" cy="50" r="40" fill="#F1F2F5" stroke="#D3D7DE" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="24" fill="none" stroke="#C9CED6" strokeWidth="0.7" />
      <RingText id="es" top="CERTIGO" bottom="CERTIFICATIONS OFFICE" color="#9AA3B2" />
      <path d="M41 50.5l6.5 6.5 13-14" fill="none" stroke="#9AA3B2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Gold foil-style seal with ribbon tails. */
function GoldSeal() {
  return (
    <svg width="120" height="140" viewBox="0 0 100 118" aria-hidden>
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D9BF86" /><stop offset="0.5" stopColor="#9A7B4F" /><stop offset="1" stopColor="#C7A86A" />
        </linearGradient>
      </defs>
      <path d="M34 78 L26 116 L38 108 L44 118 L50 82 Z" fill={NAVY} />
      <path d="M66 78 L74 116 L62 108 L56 118 L50 82 Z" fill={NAVY} />
      {rosette("url(#gold)")}
      <circle cx="50" cy="50" r="40" fill="url(#gold)" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="24" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.7" />
      <RingText id="gd" top="CERTIGO" bottom="CERTIFICATIONS OFFICE" color="#fff" />
      <path d="M41 50.5l6.5 6.5 13-14" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Director's signature mark (a flourish, not a person's name). */
export function Signature() {
  return (
    <svg width="200" height="64" viewBox="0 0 200 64" aria-hidden>
      <g fill="none" stroke={NAVY} strokeLinecap="round" strokeLinejoin="round">
        <path strokeWidth="2.2" d="M18 46 C 10 30, 22 8, 38 10 C 52 12, 44 38, 30 44 C 22 48, 26 34, 40 30 C 52 27, 58 34, 54 42 C 51 48, 60 46, 66 36 C 70 29, 74 30, 72 38 C 70 46, 80 44, 86 34 C 90 27, 95 28, 93 37 C 91 45, 101 43, 108 32" />
        <path strokeWidth="1.8" d="M108 32 C 114 22, 122 14, 126 20 C 130 27, 118 44, 124 44 C 130 44, 136 30, 142 30 C 148 30, 144 42, 152 40 C 160 38, 166 28, 172 26" />
        <path strokeWidth="1.4" d="M26 54 C 70 46, 130 42, 190 30" />
      </g>
    </svg>
  );
}
