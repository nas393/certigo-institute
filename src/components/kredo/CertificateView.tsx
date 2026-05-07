import { useEffect, useState } from "react";
import QRCode from "qrcode";
import signatureUrl from "@/assets/kredo-signature.png";
import stampUrl from "@/assets/kredo-stamp.png";

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
  const tpl: CertTemplate = p.template ?? (typeof window !== "undefined" ? (localStorage.getItem("kredo.certTemplate") as CertTemplate) || "classic" : "classic");
  useEffect(() => { QRCode.toDataURL(p.verifyUrl, { margin: 0, width: 240 }).then(setQr); }, [p.verifyUrl]);
  useEffect(() => { setAppPrimary(getAppPrimary()); }, []);

  const lock = {
    "--background": "oklch(0.985 0.005 85)",
    "--foreground": "oklch(0.16 0.01 270)",
    "--muted-foreground": "oklch(0.45 0.01 270)",
    "--primary": "oklch(0.42 0.21 275)",
    "--font-display": 'ui-serif, "Times New Roman", Georgia, serif',
    "--font-sans": 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    color: "oklch(0.16 0.01 270)",
    background: "oklch(0.99 0.005 85)",
  } as React.CSSProperties;

  // Wordmark logo: KREDO + themed dot
  const Wordmark = ({ size = "md" }: { size?: "sm" | "md" }) => (
    <span className={`font-display font-black tracking-tighter leading-none ${size === "sm" ? "text-base" : "text-2xl"}`}
          style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif' }}>
      KREDO<span style={{ color: appPrimary }}>.</span>
    </span>
  );

  // Frame variants
  const frame = (() => {
    switch (tpl) {
      case "executive":
        return (
          <>
            <div className="absolute inset-x-0 top-0 h-2" style={{ background: appPrimary }} />
            <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: appPrimary, opacity: 0.5 }} />
            <div className="absolute inset-3 border border-foreground/20" />
          </>
        );
      case "monogram":
        return (
          <>
            <div className="absolute inset-3 border border-foreground/30" />
            <div className="absolute inset-5 border border-foreground/10" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="font-display font-black text-foreground/[0.05]" style={{ fontSize: "min(60vw, 28rem)", lineHeight: 1, color: appPrimary, opacity: 0.06 }}>K</span>
            </div>
          </>
        );
      case "minimal":
        return (
          <>
            <div className="absolute inset-3 border-[3px] border-foreground/80" />
            <div className="absolute inset-[18px] border border-foreground/20" />
          </>
        );
      case "deco": {
        const corner = (cls: string) => (
          <svg className={`absolute h-10 w-10 ${cls}`} viewBox="0 0 40 40" fill="none">
            <path d="M2 18V2h16" stroke={appPrimary} strokeWidth="1.5" />
            <path d="M6 14V6h8" stroke="currentColor" strokeOpacity=".4" strokeWidth="1" />
          </svg>
        );
        return (
          <>
            <div className="absolute inset-4 border border-foreground/20" />
            {corner("top-2 left-2")}
            <div className="absolute top-2 right-2 rotate-90">{corner("")}</div>
            <div className="absolute bottom-2 right-2 rotate-180">{corner("")}</div>
            <div className="absolute bottom-2 left-2 -rotate-90">{corner("")}</div>
          </>
        );
      }
      case "bordered":
        return <div className="absolute inset-2 border-[3px]" style={{ borderColor: appPrimary }} />;
      case "ribbon":
        return (
          <>
            <div className="absolute inset-3 border border-foreground/30" />
            <div className="absolute -right-12 top-6 rotate-45 px-14 py-1 text-[10px] font-mono uppercase tracking-widest text-white shadow-md" style={{ background: appPrimary }}>
              Verified
            </div>
          </>
        );
      case "modern":
        return (
          <>
            <div className="absolute inset-y-0 left-0 w-3" style={{ background: appPrimary }} />
            <div className="absolute inset-3 border border-foreground/15" />
          </>
        );
      case "classic":
      default:
        return (
          <>
            <div className="absolute inset-3 border border-foreground/30" />
            <div className="absolute inset-5 border border-foreground/10" />
          </>
        );
    }
  })();

  const padL = tpl === "modern" ? (p.compact ? "pl-[7%]" : "pl-[8%]") : "";
  return (
    <div
      style={lock}
      className={`relative aspect-[1.414/1] w-full overflow-hidden rounded-md border border-foreground/20 ${p.compact ? "" : "shadow-elegant"}`}
    >
      {frame}
      {/* subtle tech micro-pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />
      <div className={`relative flex h-full flex-col ${p.compact ? "p-[5%]" : "p-[6%]"} ${padL}`}>
        <div className="flex items-start justify-between">
          <Wordmark size={p.compact ? "sm" : "md"} />
          <div className="text-right">
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{p.serial}</div>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-foreground/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-foreground/70">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: appPrimary }} /> Verified ledger
            </div>
          </div>
        </div>
        <div className={`mx-auto text-center ${p.compact ? "mt-[3%]" : "mt-[5%]"}`}>
          <div className="micro-label">Certificate of Completion</div>
          <h2 className={`font-display font-black leading-none tracking-tighter ${p.compact ? "mt-3 text-[clamp(1.1rem,3.2vw,2rem)]" : "mt-6 text-[clamp(1.5rem,4.5vw,3.5rem)]"}`}>
            {p.recipientName}
          </h2>
          <div className={`mx-auto h-px w-20 ${p.compact ? "mt-2" : "mt-3"}`} style={{ background: appPrimary, opacity: 0.6 }} />
          <p className={`max-w-xl text-balance text-muted-foreground ${p.compact ? "mt-2 text-[clamp(0.65rem,1.1vw,0.85rem)]" : "mt-4 text-[clamp(0.8rem,1.4vw,1rem)]"}`}>
            For successfully completing <span className="text-foreground">"{p.courseTopic}"</span>
          </p>
          <p className={`font-mono uppercase tracking-widest text-muted-foreground ${p.compact ? "mt-1 text-[7px]" : "mt-1 text-[8px]"}`}>
            {p.score != null ? `Score ${p.score}%  ·  ` : ""}Issued {new Date(p.issuedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-4">
          {/* signature + stamp horizontal block */}
          <div className="flex items-end gap-3">
            <div className={`relative ${p.compact ? "w-36" : "w-52"}`}>
              <img
                src={signatureUrl}
                alt=""
                className={`absolute left-2 object-contain ${p.compact ? "-top-8 h-10 w-24" : "-top-12 h-14 w-36"}`}
                style={{ filter: "brightness(0.3)" }}
              />
              <div className={`h-px bg-foreground/70 ${p.compact ? "w-36" : "w-52"}`} />
              <div className={`mt-1 font-mono uppercase tracking-[0.18em] text-foreground/80 ${p.compact ? "text-[8px]" : "text-[9px]"}`}>
                Authorized Signatory
              </div>
              <div className={`font-display tracking-tight text-foreground ${p.compact ? "text-[10px]" : "text-xs"}`}>
                KREDO<span style={{ color: appPrimary }}>.</span> Global Learning
              </div>
            </div>
            <img
              src={stampUrl}
              alt=""
              className={`rotate-[-10deg] opacity-80 mix-blend-multiply ${p.compact ? "h-12 w-12" : "h-20 w-20"}`}
            />
          </div>
          {/* QR + serial */}
          <div className="text-right">
            {qr && <img src={qr} alt="QR" className={`ml-auto rounded-sm border border-foreground/10 ${p.compact ? "h-14 w-14" : "h-20 w-20"}`} />}
            <div className={`mt-1 font-mono tracking-widest text-foreground/70 ${p.compact ? "text-[7px]" : "text-[9px]"}`}>{p.serial}</div>
            <div className={`font-mono uppercase tracking-widest text-muted-foreground ${p.compact ? "text-[6px]" : "text-[8px]"}`}>Scan to verify</div>
          </div>
        </div>
        {/* security footer strip */}
        <div className={`mt-2 flex items-center justify-center gap-2 border-t border-foreground/10 pt-1.5 font-mono uppercase tracking-[0.3em] text-muted-foreground/80 ${p.compact ? "text-[6px]" : "text-[8px]"}`}>
          <span className="inline-block h-1 w-1 rounded-full" style={{ background: appPrimary }} />
          On-chain Verified
          <span className="opacity-40">·</span>
          {p.serial}
          <span className="opacity-40">·</span>
          kredo.app/verify
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
