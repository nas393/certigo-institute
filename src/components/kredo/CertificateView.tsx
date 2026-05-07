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

      {/* Themed circular seal watermark — scales with primary color */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className={`${p.compact ? "h-[55%]" : "h-[60%]"} opacity-[0.07]`} style={{ color: appPrimary }} aria-hidden>
          <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <text x="100" y="128" textAnchor="middle" fontSize="90" fontWeight="900" fill="currentColor" fontFamily="ui-serif, Georgia, serif">K</text>
          <g fill="currentColor">
            {Array.from({ length: 36 }).map((_, i) => (
              <rect key={i} x="99.4" y="2" width="1.2" height="6" transform={`rotate(${i * 10} 100 100)`} />
            ))}
          </g>
        </svg>
      </div>

      <div className={`relative flex h-full flex-col ${p.compact ? "p-[5.5%]" : "p-[6.5%]"}`}>
        {/* Header bar */}
        <div className="flex items-start justify-between">
          <div className={`font-mono uppercase tracking-[0.25em] text-muted-foreground ${p.compact ? "text-[7px]" : "text-[9px]"}`}>
            Ref · {displaySerial}
          </div>
          <div className={`inline-flex items-center gap-1.5 rounded-full border border-foreground/30 px-2 py-[2px] font-sans tracking-wide text-foreground/80 ${p.compact ? "text-[6px]" : "text-[8px]"}`}>
            <span className={`rounded-full ${p.compact ? "h-[4px] w-[4px]" : "h-1.5 w-1.5"}`} style={{ background: appPrimary }} />
            On-Chain Verified
          </div>
        </div>

        {/* Institutional masthead */}
        <div className={`text-center ${p.compact ? "mt-[2%]" : "mt-[2.5%]"}`}>
          <div className={`font-display font-black uppercase leading-none tracking-[0.2em] text-foreground ${p.compact ? "text-[clamp(0.9rem,2.4vw,1.4rem)]" : "text-[clamp(1.2rem,3vw,2rem)]"}`}>
            KREDO
          </div>
          <div className={`mx-auto mt-1 h-px w-24 ${p.compact ? "" : "w-32"}`} style={{ background: "currentColor", opacity: 0.5 }} />
          <div className={`mt-1 font-display italic text-muted-foreground ${p.compact ? "text-[8px]" : "text-[11px]"}`}>
            Global Learning
          </div>
        </div>

        {/* Body */}
        <div className={`mx-auto flex-1 text-center ${p.compact ? "mt-[3%]" : "mt-[4%]"}`}>
          <p className={`font-display italic text-muted-foreground ${p.compact ? "text-[clamp(0.6rem,1vw,0.75rem)]" : "text-[clamp(0.75rem,1.3vw,0.95rem)]"}`}>
            This is to certify that
          </p>
          <h2 className={`font-display font-black leading-none tracking-tight ${p.compact ? "mt-2 text-[clamp(1.1rem,3.2vw,2rem)]" : "mt-3 text-[clamp(1.6rem,4.5vw,3rem)]"}`}>
            {p.recipientName}
          </h2>
          <p className={`font-display italic text-muted-foreground ${p.compact ? "mt-2 text-[clamp(0.6rem,1vw,0.75rem)]" : "mt-3 text-[clamp(0.75rem,1.3vw,0.95rem)]"}`}>
            has successfully completed the course of study in
          </p>
          <h3 className={`mx-auto max-w-2xl font-display font-bold leading-tight tracking-tight ${p.compact ? "mt-1 text-[clamp(0.9rem,2vw,1.2rem)]" : "mt-2 text-[clamp(1.15rem,2.6vw,1.7rem)]"}`}>
            {p.courseTopic}
          </h3>
          <p className={`font-mono uppercase tracking-[0.25em] text-muted-foreground ${p.compact ? "mt-2 text-[7px]" : "mt-3 text-[9px]"}`}>
            {p.score != null ? `Score ${p.score}%  ·  ` : ""}Issued {new Date(p.issuedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Footer: Signature · QR */}
        <div className="mt-auto flex items-end justify-between gap-6">
          <div className="flex flex-col items-start">
            <img
              src={signatureUrl}
              alt=""
              aria-hidden
              className={`object-contain object-left-bottom ${p.compact ? "h-12 w-36" : "h-20 w-52"}`}
              style={{ filter: "brightness(0.15) contrast(1.3)" }}
            />
            <div className={`mt-1 w-full border-t border-foreground/80 ${p.compact ? "max-w-[9rem]" : "max-w-[13rem]"}`} />
            <div className={`mt-1 font-mono uppercase tracking-[0.2em] text-muted-foreground ${p.compact ? "text-[6px]" : "text-[8px]"}`}>
              Authorized Signatory
            </div>
          </div>

          <div className="flex flex-col items-end text-right">
            {qr && (
              <a href={qrTarget} target="_blank" rel="noreferrer" className="block">
                <img src={qr} alt="Scan to verify" className={`rounded-sm border border-foreground/20 ${p.compact ? "h-14 w-14" : "h-20 w-20"}`} />
              </a>
            )}
            <div className={`mt-1 font-mono tracking-widest text-foreground/80 ${p.compact ? "text-[7px]" : "text-[9px]"}`}>{displaySerial}</div>
            <div className={`font-mono uppercase tracking-widest text-muted-foreground ${p.compact ? "text-[6px]" : "text-[7px]"}`}>Scan to verify</div>
          </div>
        </div>

        {p.watermark && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rotate-[-20deg] font-display text-[clamp(3rem,10vw,7rem)] font-black text-foreground/[0.04]">
              KREDO FREE
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
