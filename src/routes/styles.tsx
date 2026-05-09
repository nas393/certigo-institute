import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import signatureImg from "@/assets/signature.png";

export const Route = createFileRoute("/styles")({
  head: () => ({ meta: [{ title: "Pick a Certificate Style — CERTIGO." }] }),
  component: StylesGallery,
});

const RECIPIENT = "Amara Okafor";
const COURSE = "Prompt Engineering Fundamentals";
const SERIAL = "KR-2026-A7K3-X9";
const DATE = "May 9, 2026";
const VERIFY = "https://certigo.app/verify/KR-2026-A7K3-X9";

function useQR(url: string) {
  const [qr, setQr] = useState("");
  useEffect(() => { QRCode.toDataURL(url, { margin: 0, width: 220 }).then(setQr); }, [url]);
  return qr;
}

function Frame({ title, n, children, bg = "#ffffff" }: { title: string; n: number; children: React.ReactNode; bg?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">Option {String(n).padStart(2, "0")}</div>
        <div className="font-display text-sm font-black tracking-tight">{title}</div>
      </div>
      <div
        className="relative overflow-hidden rounded shadow-2xl ring-1 ring-black/10"
        style={{ aspectRatio: "1.414 / 1", background: bg }}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------------- 01. SWISS GRID ---------------- */
function Style01() {
  const qr = useQR(VERIFY);
  return (
    <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 gap-0 p-[3%] font-sans text-neutral-900">
      <div className="col-span-12 row-span-1 flex items-center justify-between border-b border-neutral-900 pb-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em]">Certigo. / Certificate № {SERIAL}</div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em]">{DATE}</div>
      </div>
      <div className="col-span-7 row-span-6 flex flex-col justify-between pt-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">Awarded to</div>
          <div className="mt-2 text-[2.6cqw] font-black leading-none tracking-tighter" style={{ fontSize: "min(42px,5cqw)" }}>{RECIPIENT}</div>
          <div className="mt-6 max-w-[80%] text-[1.1cqw] leading-snug text-neutral-700" style={{ fontSize: "min(13px,1.4cqw)" }}>
            For the successful completion of <span className="font-bold text-neutral-900">{COURSE}</span> with a final assessment score of 94/100.
          </div>
        </div>
        <div className="flex items-end gap-8">
          <div>
            <img src={signatureImg} alt="" style={{ height: "min(38px,4cqw)", mixBlendMode: "multiply" }} />
            <div className="mt-1 border-t border-neutral-900 pt-1 font-mono text-[10px] uppercase tracking-[0.2em]">Director, Academic</div>
          </div>
        </div>
      </div>
      <div className="col-span-5 row-span-6 flex flex-col items-end justify-between pt-6">
        <div className="text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">01 / Discipline</div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em]">Engineering · AI</div>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">02 / Hours</div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em]">42 Contact Hours</div>
        </div>
        {qr && <img src={qr} alt="QR" style={{ width: "min(70px,8cqw)" }} className="opacity-90" />}
      </div>
      <div className="col-span-12 row-span-1 flex items-end justify-between border-t border-neutral-900 pt-2">
        <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-500">Verify at certigo.app/verify</div>
        <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-500">© CERTIGO.</div>
      </div>
    </div>
  );
}

/* ---------------- 02. EDITORIAL SERIF (Vogue / NYT) ---------------- */
function Style02() {
  const qr = useQR(VERIFY);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between p-[5%] text-center" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#1a1a1a" }}>
      <div className="w-full">
        <div className="font-mono text-[10px] uppercase tracking-[0.5em] text-neutral-500">— Certigo. —</div>
        <div className="mt-3 italic" style={{ fontSize: "min(14px,1.5cqw)" }}>This is to certify that</div>
      </div>
      <div>
        <div style={{ fontSize: "min(58px,6.4cqw)", fontStyle: "italic", lineHeight: 1, letterSpacing: "-0.02em" }}>{RECIPIENT}</div>
        <div className="mt-6 italic" style={{ fontSize: "min(14px,1.5cqw)" }}>has fulfilled all requirements of the program</div>
        <div className="mt-2" style={{ fontSize: "min(22px,2.4cqw)", fontWeight: 700, letterSpacing: "0.02em", textTransform: "uppercase" }}>{COURSE}</div>
        <div className="mx-auto mt-4 h-px w-24 bg-neutral-900" />
        <div className="mt-3 italic text-neutral-700" style={{ fontSize: "min(12px,1.3cqw)" }}>conferred this {DATE}</div>
      </div>
      <div className="flex w-full items-end justify-between">
        <div className="text-left">
          <img src={signatureImg} alt="" style={{ height: "min(40px,4.4cqw)", mixBlendMode: "multiply" }} />
          <div className="mt-1 border-t border-neutral-900 pt-1 text-[10px] uppercase tracking-[0.25em]">Provost</div>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">№ {SERIAL}</div>
        <div className="text-right">
          {qr && <img src={qr} alt="QR" style={{ width: "min(64px,7cqw)" }} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 03. NAVY DIPLOMA (Ivy League) ---------------- */
function Style03() {
  const qr = useQR(VERIFY);
  const navy = "#0a1c44";
  return (
    <div className="absolute inset-0" style={{ background: navy, color: "#f4ecd8", padding: "2.5%" }}>
      <div className="absolute inset-[2.5%] border-2" style={{ borderColor: "#c9a84c" }} />
      <div className="absolute inset-[3.5%] border" style={{ borderColor: "#c9a84c", opacity: 0.4 }} />
      <div className="relative flex h-full flex-col items-center justify-between p-[4%] text-center" style={{ fontFamily: "Georgia, serif" }}>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.5em]" style={{ color: "#c9a84c" }}>Certigo. Academy</div>
          <div className="mt-2 italic" style={{ fontSize: "min(14px,1.5cqw)" }}>by the authority vested herein, hereby confers upon</div>
        </div>
        <div>
          <div style={{ fontSize: "min(56px,6cqw)", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>{RECIPIENT}</div>
          <div className="mx-auto mt-2 h-px w-32" style={{ background: "#c9a84c" }} />
          <div className="mt-4 italic" style={{ fontSize: "min(13px,1.4cqw)" }}>the distinction of completion in</div>
          <div className="mt-2" style={{ fontSize: "min(24px,2.6cqw)", fontStyle: "italic" }}>{COURSE}</div>
        </div>
        <div className="flex w-full items-end justify-between">
          <div className="text-left">
            <img src={signatureImg} alt="" style={{ height: "min(38px,4.2cqw)", filter: "invert(1) sepia(0.5) hue-rotate(15deg)" }} />
            <div className="mt-1 border-t pt-1 text-[10px] uppercase tracking-[0.25em]" style={{ borderColor: "#c9a84c" }}>Chancellor</div>
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "#c9a84c" }}>{DATE}<br/>№ {SERIAL}</div>
          <div className="text-right">
            {qr && <img src={qr} alt="QR" style={{ width: "min(60px,6.6cqw)", filter: "invert(1)" }} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 04. BRUTALIST MONO ---------------- */
function Style04() {
  const qr = useQR(VERIFY);
  return (
    <div className="absolute inset-0 bg-white p-[4%]" style={{ fontFamily: "'Courier New', monospace", color: "#000" }}>
      <div className="grid h-full grid-cols-12 gap-3">
        <div className="col-span-8 flex flex-col">
          <div className="text-[11px] uppercase">█ CERTIGO_CERT_v3.1</div>
          <div className="mt-1 text-[10px] text-neutral-500">--------------------------------</div>
          <div className="mt-6 text-[10px] uppercase">[ recipient ]</div>
          <div className="mt-1 font-bold uppercase" style={{ fontSize: "min(44px,5cqw)", letterSpacing: "-0.04em", lineHeight: 0.95 }}>{RECIPIENT}</div>
          <div className="mt-6 text-[10px] uppercase">[ achievement ]</div>
          <div className="mt-1 font-bold uppercase" style={{ fontSize: "min(20px,2.2cqw)" }}>{COURSE}</div>
          <div className="mt-auto pt-4">
            <div className="text-[10px] uppercase">[ signed ]</div>
            <img src={signatureImg} alt="" style={{ height: "min(34px,3.8cqw)", mixBlendMode: "multiply" }} />
            <div className="text-[10px] uppercase">director</div>
          </div>
        </div>
        <div className="col-span-4 flex flex-col items-end justify-between border-l-4 border-black pl-3">
          <div className="text-right text-[10px] uppercase leading-tight">
            ID:: {SERIAL}<br />
            DT:: {DATE}<br />
            SC:: 094/100<br />
            ST:: VERIFIED ✓
          </div>
          {qr && <img src={qr} alt="QR" style={{ width: "min(80px,9cqw)" }} />}
          <div className="text-right text-[9px] uppercase">scan → verify</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 05. ART DECO GOLD ---------------- */
function Style05() {
  const qr = useQR(VERIFY);
  const gold = "#b8893a";
  return (
    <div className="absolute inset-0 p-[3%]" style={{ background: "linear-gradient(180deg,#fdfaf2,#f5ecd6)" }}>
      <svg className="absolute inset-[3%]" width="100%" height="100%" viewBox="0 0 100 70" preserveAspectRatio="none">
        <rect x="0.5" y="0.5" width="99" height="69" fill="none" stroke={gold} strokeWidth="0.4" />
        <rect x="2" y="2" width="96" height="66" fill="none" stroke={gold} strokeWidth="0.15" />
        {[[0,0],[100,0],[0,70],[100,70]].map(([x,y],i)=>(
          <g key={i} transform={`translate(${x} ${y}) rotate(${i===0?0:i===1?90:i===2?-90:180})`}>
            <path d="M0,4 L4,0 M0,7 L7,0 M0,10 L10,0" stroke={gold} strokeWidth="0.3" fill="none" />
          </g>
        ))}
      </svg>
      <div className="relative flex h-full flex-col items-center justify-between p-[5%] text-center" style={{ fontFamily: "'Didot','Bodoni MT',Georgia,serif", color: "#3a2a14" }}>
        <div>
          <div className="text-[10px] uppercase" style={{ letterSpacing: "0.6em", color: gold }}>◆ Certigo. ◆</div>
          <div className="mt-3" style={{ fontSize: "min(18px,2cqw)", letterSpacing: "0.4em", textTransform: "uppercase" }}>Certificate of Merit</div>
        </div>
        <div>
          <div className="text-[11px] italic" style={{ color: gold }}>presented to</div>
          <div className="mt-2" style={{ fontSize: "min(54px,5.8cqw)", letterSpacing: "0.05em", lineHeight: 1 }}>{RECIPIENT}</div>
          <div className="mx-auto mt-4 flex items-center gap-2">
            <span className="h-px w-16" style={{ background: gold }} />
            <span style={{ color: gold, fontSize: 14 }}>◆</span>
            <span className="h-px w-16" style={{ background: gold }} />
          </div>
          <div className="mt-3 italic" style={{ fontSize: "min(15px,1.6cqw)" }}>{COURSE}</div>
        </div>
        <div className="flex w-full items-end justify-between">
          <div className="text-left">
            <img src={signatureImg} alt="" style={{ height: "min(34px,3.8cqw)", mixBlendMode: "multiply" }} />
            <div className="mt-1 border-t pt-1 text-[10px] uppercase tracking-[0.3em]" style={{ borderColor: gold, color: gold }}>Maître</div>
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: gold }}>{DATE}</div>
          {qr && <img src={qr} alt="QR" style={{ width: "min(58px,6.4cqw)", opacity: 0.85 }} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 06. MINIMAL DUTCH (whisper) ---------------- */
function Style06() {
  const qr = useQR(VERIFY);
  return (
    <div className="absolute inset-0 bg-[#fafaf7] p-[6%]" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", color: "#111" }}>
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-[0.4em] text-neutral-400">Certigo.</div>
          </div>
          <div className="text-right text-[9px] uppercase tracking-[0.3em] text-neutral-400">{SERIAL}<br />{DATE}</div>
        </div>
        <div className="my-auto">
          <div className="text-[10px] uppercase tracking-[0.4em] text-neutral-400">Certificate</div>
          <div className="mt-3" style={{ fontSize: "min(64px,7cqw)", fontWeight: 200, letterSpacing: "-0.03em", lineHeight: 1 }}>{RECIPIENT}</div>
          <div className="mt-6 max-w-[60%] text-[12px] leading-relaxed text-neutral-600" style={{ fontSize: "min(13px,1.4cqw)" }}>
            Has completed <span className="text-neutral-900">{COURSE}</span> with distinction.
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <img src={signatureImg} alt="" style={{ height: "min(30px,3.4cqw)", mixBlendMode: "multiply" }} />
            <div className="mt-1 text-[9px] uppercase tracking-[0.3em] text-neutral-500">Director</div>
          </div>
          {qr && <img src={qr} alt="QR" style={{ width: "min(48px,5.4cqw)", opacity: 0.8 }} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 07. EMERALD BOTANICAL ---------------- */
function Style07() {
  const qr = useQR(VERIFY);
  const green = "#1f4a3a";
  const cream = "#f6f1e3";
  return (
    <div className="absolute inset-0 p-[3%]" style={{ background: cream }}>
      <div className="absolute inset-[3%]" style={{ border: `3px solid ${green}` }} />
      <div className="absolute inset-[4%]" style={{ border: `1px solid ${green}`, opacity: 0.3 }} />
      <svg className="absolute left-[3%] top-[3%]" width="80" height="80" viewBox="0 0 40 40">
        <path d="M2 38 Q 10 20 20 22 Q 30 24 38 2" stroke={green} strokeWidth="0.6" fill="none"/>
        <circle cx="20" cy="22" r="1.2" fill={green}/>
        <ellipse cx="12" cy="26" rx="3" ry="1" fill={green} opacity="0.5"/>
        <ellipse cx="28" cy="18" rx="3" ry="1" fill={green} opacity="0.5"/>
      </svg>
      <svg className="absolute right-[3%] bottom-[3%]" width="80" height="80" viewBox="0 0 40 40" style={{ transform: "scaleX(-1) scaleY(-1)" }}>
        <path d="M2 38 Q 10 20 20 22 Q 30 24 38 2" stroke={green} strokeWidth="0.6" fill="none"/>
        <circle cx="20" cy="22" r="1.2" fill={green}/>
        <ellipse cx="12" cy="26" rx="3" ry="1" fill={green} opacity="0.5"/>
        <ellipse cx="28" cy="18" rx="3" ry="1" fill={green} opacity="0.5"/>
      </svg>
      <div className="relative flex h-full flex-col items-center justify-between p-[6%] text-center" style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", color: green }}>
        <div>
          <div className="text-[10px] uppercase" style={{ letterSpacing: "0.5em" }}>Certigo. Botanical Society</div>
          <div className="mt-3" style={{ fontSize: "min(20px,2.2cqw)", fontStyle: "italic" }}>presents this certificate to</div>
        </div>
        <div>
          <div style={{ fontSize: "min(60px,6.5cqw)", fontStyle: "italic", lineHeight: 1 }}>{RECIPIENT}</div>
          <div className="mt-4" style={{ fontSize: "min(15px,1.6cqw)" }}>in recognition of completing</div>
          <div className="mt-1" style={{ fontSize: "min(22px,2.4cqw)", fontWeight: 600 }}>{COURSE}</div>
        </div>
        <div className="flex w-full items-end justify-between">
          <div className="text-left">
            <img src={signatureImg} alt="" style={{ height: "min(34px,3.8cqw)", mixBlendMode: "multiply" }} />
            <div className="mt-1 border-t pt-1 text-[9px] uppercase tracking-[0.3em]" style={{ borderColor: green }}>Curator</div>
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em]">{DATE} · № {SERIAL.slice(-6)}</div>
          {qr && <img src={qr} alt="QR" style={{ width: "min(54px,6cqw)", opacity: 0.85 }} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 08. WIDE BANNER (cinematic) ---------------- */
function Style08() {
  const qr = useQR(VERIFY);
  return (
    <div className="absolute inset-0 bg-white">
      <div className="absolute inset-x-0 top-0 h-[22%]" style={{ background: "#0a1c44" }} />
      <div className="absolute inset-x-0 top-[22%] h-[3%]" style={{ background: "#c9a84c" }} />
      <div className="absolute inset-x-0 bottom-0 h-[10%]" style={{ background: "#0a1c44" }} />
      <div className="absolute inset-x-0 top-[5%] text-center text-white">
        <div className="font-mono text-[11px] uppercase tracking-[0.5em] opacity-70">— Certigo. —</div>
        <div className="mt-1 font-display font-black tracking-tight" style={{ fontSize: "min(28px,3.2cqw)", letterSpacing: "0.04em" }}>CERTIFICATE OF ACHIEVEMENT</div>
      </div>
      <div className="absolute inset-x-[6%] top-[32%] flex flex-col items-center text-center" style={{ color: "#0a1c44" }}>
        <div className="text-[11px] uppercase tracking-[0.4em] text-neutral-500">awarded to</div>
        <div className="mt-2 font-display font-black tracking-tighter" style={{ fontSize: "min(56px,6cqw)", lineHeight: 1 }}>{RECIPIENT}</div>
        <div className="mt-5 max-w-[80%] text-[13px] leading-snug text-neutral-700" style={{ fontSize: "min(13px,1.4cqw)" }}>
          for outstanding completion of the <strong>{COURSE}</strong> program with a final grade of 94%.
        </div>
      </div>
      <div className="absolute inset-x-[6%] bottom-[12%] flex items-end justify-between" style={{ color: "#0a1c44" }}>
        <div className="text-left">
          <img src={signatureImg} alt="" style={{ height: "min(34px,3.8cqw)", mixBlendMode: "multiply" }} />
          <div className="mt-1 border-t border-current pt-1 font-mono text-[10px] uppercase tracking-[0.25em]">Director</div>
        </div>
        <div className="text-center font-mono text-[10px] uppercase tracking-[0.3em]">{DATE}<br />№ {SERIAL}</div>
        {qr && <img src={qr} alt="QR" style={{ width: "min(56px,6.2cqw)" }} />}
      </div>
      <div className="absolute inset-x-0 bottom-[2%] text-center font-mono text-[9px] uppercase tracking-[0.4em] text-white/70">
        verify · certigo.app/verify
      </div>
    </div>
  );
}

/* ---------------- 09. BLUEPRINT TECH ---------------- */
function Style09() {
  const qr = useQR(VERIFY);
  const ink = "#0b3d6b";
  const grid = "#0b3d6b";
  return (
    <div className="absolute inset-0" style={{ background: "#eaf2fb", color: ink, fontFamily: "'JetBrains Mono','Courier New',monospace" }}>
      <svg className="absolute inset-0 h-full w-full opacity-25" preserveAspectRatio="none">
        <defs>
          <pattern id="grid09" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={grid} strokeWidth="0.4"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid09)"/>
      </svg>
      <div className="absolute inset-[3%] border-2" style={{ borderColor: ink }} />
      <div className="relative flex h-full flex-col p-[5%]">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em]">
          <div>SHEET 01 / 01 · CERTIGO. SPEC</div>
          <div>REV A · {DATE}</div>
        </div>
        <div className="my-auto">
          <div className="text-[10px] uppercase tracking-[0.3em]">// recipient</div>
          <div className="mt-1 font-bold" style={{ fontSize: "min(44px,4.8cqw)", letterSpacing: "-0.02em" }}>{RECIPIENT}</div>
          <div className="mt-5 text-[10px] uppercase tracking-[0.3em]">// completed</div>
          <div className="mt-1" style={{ fontSize: "min(20px,2.2cqw)", fontWeight: 700 }}>{COURSE}</div>
          <div className="mt-4 inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.25em]" style={{ borderColor: ink }}>
            score = 94 · status = verified
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <img src={signatureImg} alt="" style={{ height: "min(32px,3.6cqw)", mixBlendMode: "multiply" }} />
            <div className="mt-1 border-t pt-1 text-[10px] uppercase tracking-[0.25em]" style={{ borderColor: ink }}>Engineer in charge</div>
          </div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-right">
            DWG № {SERIAL}<br/>SCALE 1:1
          </div>
          {qr && <img src={qr} alt="QR" style={{ width: "min(56px,6.2cqw)" }} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 10. NOIR & RISOGRAPH ---------------- */
function Style10() {
  const qr = useQR(VERIFY);
  return (
    <div className="absolute inset-0" style={{ background: "#0d0d0d", color: "#f4f0e6", fontFamily: "'Inter',sans-serif" }}>
      <div className="absolute inset-[2.5%] border" style={{ borderColor: "#f4f0e6", opacity: 0.3 }} />
      <div
        className="absolute right-[8%] top-[18%] aspect-square rounded-full opacity-50 blur-2xl"
        style={{ width: "30%", background: "radial-gradient(circle,#ff5722,transparent 70%)" }}
      />
      <div className="relative flex h-full flex-col p-[5%]">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: "#ff5722" }}>● Certigo.</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">{SERIAL}</div>
        </div>
        <div className="my-auto max-w-[70%]">
          <div className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-60">issued to</div>
          <div className="mt-2" style={{ fontSize: "min(70px,7.5cqw)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95 }}>
            {RECIPIENT}<span style={{ color: "#ff5722" }}>.</span>
          </div>
          <div className="mt-6 max-w-[80%] text-[13px] leading-relaxed opacity-80" style={{ fontSize: "min(13px,1.4cqw)" }}>
            Completed <span className="font-bold" style={{ color: "#ff5722" }}>{COURSE}</span> with a final score of 94/100, on {DATE}.
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <img src={signatureImg} alt="" style={{ height: "min(34px,3.8cqw)", filter: "invert(1)" }} />
            <div className="mt-1 border-t pt-1 font-mono text-[10px] uppercase tracking-[0.25em] opacity-70" style={{ borderColor: "#f4f0e6" }}>Director</div>
          </div>
          {qr && <img src={qr} alt="QR" style={{ width: "min(60px,6.6cqw)", filter: "invert(1)", opacity: 0.85 }} />}
        </div>
      </div>
    </div>
  );
}

const STYLES: { n: number; title: string; bg?: string; render: () => React.ReactNode }[] = [
  { n: 1,  title: "Swiss Grid",         render: () => <Style01 /> },
  { n: 2,  title: "Editorial Serif",    render: () => <Style02 /> },
  { n: 3,  title: "Navy Diploma",       render: () => <Style03 />, bg: "#0a1c44" },
  { n: 4,  title: "Brutalist Mono",     render: () => <Style04 /> },
  { n: 5,  title: "Art Deco Gold",      render: () => <Style05 /> },
  { n: 6,  title: "Minimal Whisper",    render: () => <Style06 /> },
  { n: 7,  title: "Emerald Botanical",  render: () => <Style07 /> },
  { n: 8,  title: "Cinematic Banner",   render: () => <Style08 /> },
  { n: 9,  title: "Blueprint Tech",     render: () => <Style09 /> },
  { n: 10, title: "Noir Risograph",     render: () => <Style10 /> },
];

function StylesGallery() {
  return (
    <div className="min-h-screen bg-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-500">◆ Pick one</div>
          <h1 className="mt-1 font-display text-4xl font-black tracking-tighter">10 Certificate Styles</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Each option is a different design system — frame, typography, layout and mood. Reply with the number you want and I'll wire it in as the new CERTIGO. certificate (and update the landing page demo).
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {STYLES.map((s) => (
            <Frame key={s.n} n={s.n} title={s.title} bg={s.bg}>
              {s.render()}
            </Frame>
          ))}
        </div>
      </div>
    </div>
  );
}