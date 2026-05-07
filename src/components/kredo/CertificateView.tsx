import { useEffect, useState } from "react";
import QRCode from "qrcode";
import logoUrl from "@/assets/kredo-logo.png";
import signatureUrl from "@/assets/kredo-signature.png";
import stampUrl from "@/assets/kredo-stamp.png";

interface Props {
  serial: string;
  recipientName: string;
  courseTopic: string;
  score?: number | null;
  issuedAt: string;
  verifyUrl: string;
  watermark?: boolean;
  compact?: boolean;
}

export function CertificateView(p: Props) {
  const [qr, setQr] = useState<string>("");
  useEffect(() => { QRCode.toDataURL(p.verifyUrl, { margin: 0, width: 240 }).then(setQr); }, [p.verifyUrl]);
  // Lock certificate to its canonical palette regardless of app theme.
  const lock = {
    "--background": "oklch(0.985 0.005 85)",
    "--foreground": "oklch(0.16 0.01 270)",
    "--muted-foreground": "oklch(0.45 0.01 270)",
    "--primary": "oklch(0.42 0.21 275)",
    "--font-display": 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    "--font-sans": 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    color: "oklch(0.16 0.01 270)",
    background: "oklch(0.99 0.005 85)",
  } as React.CSSProperties;
  return (
    <div
      style={lock}
      className={`relative aspect-[1.414/1] w-full overflow-hidden rounded-md border border-foreground/20 ${p.compact ? "" : "shadow-elegant"}`}
    >
      <div className="absolute inset-3 border border-foreground/30" />
      <div className="absolute inset-5 border border-foreground/10" />
      <div className={`relative flex h-full flex-col ${p.compact ? "p-[5%]" : "p-[6%]"}`}>
        <div className="flex items-start justify-between">
          <img src={logoUrl} alt="Kredo" className={p.compact ? "h-8 w-auto" : "h-11 w-auto"} />
          <div className="text-right">
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{p.serial}</div>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-foreground/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-foreground/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Verified ledger
            </div>
          </div>
        </div>
        <div className={`mx-auto text-center ${p.compact ? "mt-[3%]" : "mt-[5%]"}`}>
          <div className="micro-label">Certificate of Completion</div>
          <h2 className={`font-display font-black leading-none tracking-tighter ${p.compact ? "mt-3 text-[clamp(1.1rem,3.2vw,2rem)]" : "mt-6 text-[clamp(1.5rem,4.5vw,3.5rem)]"}`}>
            {p.recipientName}
          </h2>
          <div className={`mx-auto h-px w-20 bg-foreground/40 ${p.compact ? "mt-2" : "mt-3"}`} />
          <p className={`max-w-xl text-balance text-muted-foreground ${p.compact ? "mt-2 text-[clamp(0.65rem,1.1vw,0.85rem)]" : "mt-4 text-[clamp(0.8rem,1.4vw,1rem)]"}`}>
            For successfully completing <span className="text-foreground">"{p.courseTopic}"</span>
          </p>
          <p className={`font-mono uppercase tracking-widest text-muted-foreground ${p.compact ? "mt-1 text-[8px]" : "mt-1 text-[10px]"}`}>
            {p.score != null ? `Score ${p.score}%  ·  ` : ""}Issued {new Date(p.issuedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div className={`relative ${p.compact ? "w-32" : "w-48"}`}>
            <img
              src={signatureUrl}
              alt=""
              className={`absolute left-1/2 -translate-x-1/2 object-contain ${p.compact ? "-top-9 h-10 w-28" : "-top-[3.5rem] h-16 w-44"}`}
              style={{ filter: "brightness(0.4)" }}
            />
            <img
              src={stampUrl}
              alt=""
              className={`absolute rotate-[-12deg] opacity-80 mix-blend-multiply ${p.compact ? "-top-6 -right-4 h-12 w-12" : "-top-10 -right-6 h-20 w-20"}`}
            />
            <div className={`h-px bg-foreground/60 ${p.compact ? "w-32" : "w-44"}`} />
            <div className={`mt-1 font-display italic ${p.compact ? "text-[11px]" : ""}`}>Kredo Director</div>
            <div className={`font-mono uppercase tracking-widest text-muted-foreground ${p.compact ? "text-[7px]" : "text-[9px]"}`}>Verified by Kredo</div>
          </div>
          <div className="text-right">
            {qr && <img src={qr} alt="QR" className={`rounded-sm border border-foreground/10 ${p.compact ? "h-14 w-14" : "h-20 w-20"}`} />}
            <div className={`mt-1 font-mono uppercase tracking-widest text-muted-foreground ${p.compact ? "text-[7px]" : "text-[9px]"}`}>Scan to verify</div>
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
