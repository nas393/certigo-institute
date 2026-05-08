import { useEffect, useState } from "react";
import QRCode from "qrcode";
import signatureUrl from "@/assets/kredo-signature.png";
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
  // Always link the QR to the public verify page using the (formatted) serial.
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

  return (
    <div
      style={lock}
      className={`relative aspect-[1.414/1] w-full overflow-hidden rounded-sm ${p.compact ? "" : "shadow-elegant"}`}
    >
      {/* Bold double-line frame (UC Regents inspired, no gold) */}
      <div className="absolute inset-2 border-[6px] border-foreground" />
      <div className="absolute inset-[18px] border border-foreground/70" />

      <div className={`relative flex h-full flex-col ${p.compact ? "p-[5.5%]" : "p-[6.5%]"}`}>
        {/* Header: Logo left · Ref right */}
        <div className="flex items-start justify-between">
          <div className={`font-display font-black tracking-tighter leading-none ${p.compact ? "text-[clamp(0.9rem,2.2vw,1.3rem)]" : "text-[clamp(1.1rem,2.6vw,1.7rem)]"}`}>
            <span style={{ color: appPrimary }}>CERTI</span><span className="text-foreground">GO</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`font-mono uppercase tracking-[0.25em] text-muted-foreground ${p.compact ? "text-[7px]" : "text-[9px]"}`}>
              Certificate Ref
            </div>
            <div className={`font-mono tracking-widest text-foreground ${p.compact ? "text-[8px]" : "text-[11px]"}`}>
              {displaySerial}
            </div>
            <div className={`inline-flex items-center gap-1.5 rounded-full border border-foreground/30 px-2 py-[2px] font-sans tracking-wide text-foreground/80 ${p.compact ? "text-[6px]" : "text-[8px]"}`}>
              <span className={`rounded-full ${p.compact ? "h-[4px] w-[4px]" : "h-1.5 w-1.5"}`} style={{ background: appPrimary }} />
              On-Chain Verified
            </div>
          </div>
        </div>

        {/* Masthead */}
        <div className={`text-center ${p.compact ? "mt-[3%]" : "mt-[4%]"}`}>
          <div className={`font-mono uppercase tracking-[0.4em] text-muted-foreground ${p.compact ? "text-[7px]" : "text-[10px]"}`}>
            Certigo · Verified Credentials
          </div>
          <h1 className={`mt-2 font-display font-black uppercase leading-none tracking-[0.08em] ${p.compact ? "text-[clamp(1rem,2.6vw,1.6rem)]" : "text-[clamp(1.4rem,3.4vw,2.4rem)]"}`}>
            Certificate of Completion
          </h1>
          <div className="mx-auto mt-2 flex items-center justify-center gap-2">
            <span className="h-px w-10 bg-foreground/40" />
            <span className="h-1.5 w-1.5 rotate-45 bg-foreground/60" />
            <span className="h-px w-10 bg-foreground/40" />
          </div>
        </div>

        {/* Body */}
        <div className={`mx-auto flex-1 text-center ${p.compact ? "mt-[3%]" : "mt-[3.5%]"}`}>
          <p className={`font-display italic text-muted-foreground ${p.compact ? "text-[clamp(0.6rem,1vw,0.75rem)]" : "text-[clamp(0.8rem,1.3vw,0.95rem)]"}`}>
            This is to certify that
          </p>
          <h2 className={`font-display font-black leading-none tracking-tight ${p.compact ? "mt-2 text-[clamp(1.1rem,3.2vw,2rem)]" : "mt-3 text-[clamp(1.6rem,4.5vw,3rem)]"}`}>
            {p.recipientName}
          </h2>
          <p className={`mx-auto font-display italic text-muted-foreground ${p.compact ? "mt-2 max-w-md text-[clamp(0.6rem,1vw,0.75rem)]" : "mt-3 max-w-2xl text-[clamp(0.78rem,1.25vw,0.92rem)]"}`}>
            has successfully completed all requirements for
          </p>
          <h3 className={`mx-auto max-w-2xl font-display font-bold leading-tight tracking-tight ${p.compact ? "mt-2 text-[clamp(0.95rem,2.2vw,1.3rem)]" : "mt-3 text-[clamp(1.2rem,2.7vw,1.8rem)]"}`}>
            {p.courseTopic}
          </h3>
          <p className={`mx-auto font-display italic text-muted-foreground ${p.compact ? "mt-2 max-w-md text-[clamp(0.55rem,0.95vw,0.7rem)]" : "mt-3 max-w-xl text-[clamp(0.72rem,1.15vw,0.85rem)]"}`}>
            Cryptographically issued and independently verifiable on the Certigo ledger.
          </p>
          <p className={`font-mono uppercase tracking-[0.25em] text-muted-foreground ${p.compact ? "mt-3 text-[7px]" : "mt-4 text-[9px]"}`}>
            {p.score != null ? `Final Score ${p.score}%  ·  ` : ""}Issued {new Date(p.issuedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Footer: Signature · Stamp · QR */}
        <div className="mt-auto flex items-end justify-between gap-4">
          {/* Signature */}
          <div className="flex flex-col items-start">
            <img
              src={signatureUrl}
              alt=""
              aria-hidden
              className={`object-contain object-left-bottom ${p.compact ? "h-12 w-36" : "h-20 w-56"}`}
              style={{ filter: "brightness(0.1) contrast(1.4)" }}
            />
            <div className={`mt-1 w-full border-t border-foreground/80 ${p.compact ? "max-w-[9rem]" : "max-w-[13rem]"}`} />
            <div className={`mt-1 font-mono uppercase tracking-[0.2em] text-muted-foreground ${p.compact ? "text-[6px]" : "text-[8px]"}`}>
              Authorized Signatory
            </div>
          </div>

          {/* Stamp — circular themed seal, solid (no gold) */}
          <div className={`relative ${p.compact ? "-translate-y-1" : "-translate-y-2"}`} aria-hidden>
            <svg viewBox="0 0 200 200" className={`${p.compact ? "h-20 w-20" : "h-28 w-28"} -rotate-[8deg]`} style={{ color: appPrimary }}>
              <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" strokeWidth="4" />
              <circle cx="100" cy="100" r="82" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="100" cy="100" r="58" fill="none" stroke="currentColor" strokeWidth="2" />
              <defs>
                <path id="stampTop" d="M 25,100 a 75,75 0 0 1 150,0" fill="none" />
                <path id="stampBot" d="M 30,100 a 70,70 0 0 0 140,0" fill="none" />
              </defs>
              <text fontFamily="ui-serif, Georgia, serif" fontWeight="700" fontSize="14" letterSpacing="4" fill="currentColor">
                <textPath href="#stampTop" startOffset="50%" textAnchor="middle">CERTIGO · VERIFIED</textPath>
              </text>
              <text fontFamily="ui-serif, Georgia, serif" fontWeight="700" fontSize="11" letterSpacing="3" fill="currentColor">
                <textPath href="#stampBot" startOffset="50%" textAnchor="middle">AUTHENTIC CREDENTIAL</textPath>
              </text>
              <text x="100" y="118" textAnchor="middle" fontSize="56" fontWeight="900" fill="currentColor" fontFamily="ui-serif, Georgia, serif">C</text>
              <g fill="currentColor">
                {Array.from({ length: 24 }).map((_, i) => (
                  <rect key={i} x="99.4" y="6" width="1.2" height="5" transform={`rotate(${i * 15} 100 100)`} />
                ))}
              </g>
            </svg>
          </div>

          {/* QR */}
          <div className="flex flex-col items-end text-right">
            <div className={`mb-1 font-mono uppercase tracking-[0.2em] text-muted-foreground ${p.compact ? "text-[6px]" : "text-[8px]"}`}>
              Scan to verify
            </div>
            {qr && (
              <a href={qrTarget} target="_blank" rel="noreferrer" className="block">
                <img src={qr} alt="Scan to verify" className={`rounded-sm border border-foreground/20 ${p.compact ? "h-16 w-16" : "h-24 w-24"}`} />
              </a>
            )}
          </div>
        </div>

        {p.watermark && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rotate-[-20deg] font-display text-[clamp(3rem,10vw,7rem)] font-black text-foreground/[0.04]">
              CERTIGO FREE
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
