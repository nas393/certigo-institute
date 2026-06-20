import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { formatReference } from "@/lib/cert";

interface Props {
  serial: string;
  recipientName: string;
  certTitle: string;
  issuerName?: string;
  issuedAt: string;
  verifyUrl: string;
}

export function DigitalBadge(p: Props) {
  const [qr, setQr] = useState("");
  useEffect(() => {
    QRCode.toDataURL(p.verifyUrl, { margin: 0, width: 240, color: { dark: "#0B1B3A", light: "#ffffff" } })
      .then(setQr).catch(() => {});
  }, [p.verifyUrl]);

  const issued = new Date(p.issuedAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-lg ring-1 ring-neutral-900/5">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">◆ Verified credential</div>
          <div className="mt-1 font-display text-base font-extrabold tracking-tight">
            CERTIGO<span className="text-emerald-600">.</span>
          </div>
        </div>
        {qr && <img src={qr} alt="" width={64} height={64} className="rounded-md ring-1 ring-neutral-200" />}
      </div>
      <div className="mt-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-500">Awarded to</div>
        <div className="mt-1 font-display text-2xl font-black leading-tight tracking-tight">{p.recipientName}</div>
      </div>
      <div className="mt-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-500">Certification</div>
        <div className="mt-1 font-display text-lg font-bold tracking-tight">{p.certTitle}</div>
        <div className="text-xs text-neutral-500">{p.issuerName ?? "CERTIGO."} · Issued {issued}</div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-500">
        <span>{formatReference(p.serial)}</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Secured
        </span>
      </div>
    </div>
  );
}