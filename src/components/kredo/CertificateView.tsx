import { useEffect, useState } from "react";
import QRCode from "qrcode";

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
  return (
    <div className={`relative aspect-[1.414/1] w-full overflow-hidden rounded-md border border-foreground/20 bg-[oklch(0.99_0.005_85)] text-foreground ${p.compact ? "" : "shadow-elegant"}`}>
      <div className="absolute inset-3 border border-foreground/30" />
      <div className="absolute inset-5 border border-foreground/10" />
      <div className="relative flex h-full flex-col p-[6%]">
        <div className="flex items-start justify-between">
          <div className="font-display text-xl font-black tracking-tighter">KREDO<span className="text-primary">.</span></div>
          <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{p.serial}</div>
        </div>
        <div className="mx-auto mt-[5%] text-center">
          <div className="micro-label">◆ Certificate of Completion</div>
          <h2 className="mt-6 font-display text-[clamp(1.5rem,4.5vw,3.5rem)] font-black leading-none tracking-tighter">
            {p.recipientName}
          </h2>
          <div className="mx-auto mt-3 h-px w-24 bg-foreground/40" />
          <p className="mt-4 max-w-xl text-balance text-[clamp(0.8rem,1.4vw,1rem)] text-muted-foreground">
            For successfully completing <span className="text-foreground">"{p.courseTopic}"</span>
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {p.score != null ? `Score ${p.score}%  ·  ` : ""}Issued {new Date(p.issuedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="h-px w-40 bg-foreground/60" />
            <div className="mt-1 font-display italic">Kredo Director</div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Verified by Kredo</div>
          </div>
          <div className="text-right">
            {qr && <img src={qr} alt="QR" className="h-20 w-20 rounded-sm border border-foreground/10" />}
            <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Scan to verify</div>
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
