import { useEffect, useState } from "react";
import QRCode from "qrcode";
import sigImg from "@/assets/signature-director.png";

export interface TranscriptModule {
  code: string;
  title: string;
  hours: number;
  grade: string;       // e.g. "A", "A-", "Pass"
  scorePct?: number;
  /** Short subject/topic label (e.g. "Positioning theory"). */
  subject?: string;
  /** One-line summary of what was learned in this module. */
  learned?: string;
}

export interface MonoTranscriptProps {
  recipientName: string;
  programmeTitle: string;
  cohort?: string;
  certificateId: string;
  issueDate: string;
  verifyUrl?: string;
  modules: TranscriptModule[];
  finalGrade?: string;
  finalScorePct?: number;
  totalHours?: number;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      CERTIGO<span style={{ color: "#10B981" }}>.</span>
    </span>
  );
}

function VerifyQR({ url, size = 96 }: { url: string; size?: number }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let live = true;
    QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 0,
      color: { dark: "#0a0a0a", light: "#ffffff00" },
      width: size * 3,
    })
      .then((d) => { if (live) setSrc(d); })
      .catch(() => {});
    return () => { live = false; };
  }, [url, size]);
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="rounded-[2px] bg-white p-1 ring-1 ring-neutral-900/10" style={{ width: size, height: size }}>
        {src ? <img src={src} alt="" className="h-full w-full object-contain" /> : null}
      </div>
      <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.32em] text-neutral-700">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
        Verified · <Wordmark /> Registry
      </div>
    </div>
  );
}

/** A4 portrait transcript — same minimal monochrome theme as the certificate. */
export function MonochromeTranscript(p: MonoTranscriptProps) {
  const verifyUrl = p.verifyUrl ?? (typeof window !== "undefined" ? `${window.location.origin}/verify/${p.certificateId}` : `/verify/${p.certificateId}`);
  const totalHours =
    p.totalHours ?? p.modules.reduce((s, m) => s + (m.hours || 0), 0);

  return (
    <div className="relative aspect-[1/1.414] w-full overflow-hidden bg-white text-neutral-900 ring-1 ring-neutral-200">
      {/* corner crops */}
      <div className="pointer-events-none absolute inset-6 border border-neutral-900/10" />
      <div className="pointer-events-none absolute left-6 top-6 h-3 w-3 border-l border-t border-neutral-900" />
      <div className="pointer-events-none absolute right-6 top-6 h-3 w-3 border-r border-t border-neutral-900" />
      <div className="pointer-events-none absolute left-6 bottom-6 h-3 w-3 border-l border-b border-neutral-900" />
      <div className="pointer-events-none absolute right-6 bottom-6 h-3 w-3 border-r border-b border-neutral-900" />

      <div className="relative flex h-full flex-col px-12 py-12 md:px-16 md:py-14">
        {/* Masthead */}
        <header className="flex items-start justify-between border-b border-neutral-900 pb-5">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.45em] text-neutral-500">
              <Wordmark /> Institute · Registrar
            </div>
            <h1 className="mt-3 font-display text-3xl font-black tracking-tight md:text-4xl">
              Official Academic Transcript
            </h1>
          </div>
          <div className="text-right font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-500">
            <div className="text-[8px] tracking-[0.4em] text-neutral-400">Document</div>
            <div className="mt-1 text-neutral-800">Transcript · No. {p.certificateId}</div>
            <div className="mt-2 text-[8px] tracking-[0.4em] text-neutral-400">Issued</div>
            <div className="mt-1 text-neutral-800">{fmtDate(p.issueDate)}</div>
          </div>
        </header>

        {/* Recipient + programme */}
        <section className="mt-6 grid grid-cols-12 gap-6">
          <div className="col-span-7">
            <div className="font-mono text-[9px] uppercase tracking-[0.4em] text-neutral-500">Conferred upon</div>
            <div className="mt-1 font-display text-2xl font-black tracking-tight md:text-3xl">
              {p.recipientName}
            </div>
          </div>
          <div className="col-span-5">
            <div className="font-mono text-[9px] uppercase tracking-[0.4em] text-neutral-500">Programme</div>
            <div className="mt-1 font-display text-base font-bold leading-snug">{p.programmeTitle}</div>
            {p.cohort && (
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-500">
                Cohort · {p.cohort}
              </div>
            )}
          </div>
        </section>

        {/* Module ledger */}
        <section className="mt-7">
          <div className="grid grid-cols-12 border-b border-neutral-900 pb-2 font-mono text-[9px] uppercase tracking-[0.34em] text-neutral-500">
            <div className="col-span-2">Code</div>
            <div className="col-span-6">Module · subject of study</div>
            <div className="col-span-1 text-right">Hrs</div>
            <div className="col-span-2 text-right">Score</div>
            <div className="col-span-1 text-right">Grade</div>
          </div>
          <ul className="divide-y divide-neutral-200">
            {p.modules.map((m) => (
              <li
                key={m.code}
                className="grid grid-cols-12 items-baseline gap-y-1 py-3 font-mono text-[11px] tracking-tight text-neutral-800"
              >
                <div className="col-span-2 text-neutral-500">{m.code}</div>
                <div className="col-span-6 font-sans text-neutral-900">
                  <div className="text-[12px] font-semibold">{m.title}</div>
                  {m.subject && (
                    <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.28em] text-neutral-500">
                      Subject · {m.subject}
                    </div>
                  )}
                  {m.learned && (
                    <div className="mt-1 font-sans text-[10.5px] leading-snug text-neutral-600">
                      {m.learned}
                    </div>
                  )}
                </div>
                <div className="col-span-1 text-right tabular-nums">{m.hours}</div>
                <div className="col-span-2 text-right tabular-nums">
                  {typeof m.scorePct === "number" ? `${m.scorePct}%` : "—"}
                </div>
                <div className="col-span-1 text-right font-bold">{m.grade}</div>
              </li>
            ))}
          </ul>

          {/* Totals */}
          <div className="mt-2 grid grid-cols-12 border-t border-neutral-900 pt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-700">
            <div className="col-span-8 text-neutral-500">Cumulative result</div>
            <div className="col-span-1 text-right tabular-nums text-neutral-900">{totalHours}</div>
            <div className="col-span-2 text-right tabular-nums text-neutral-900">
              {typeof p.finalScorePct === "number" ? `${p.finalScorePct}%` : "—"}
            </div>
            <div className="col-span-1 text-right font-display text-base font-black text-neutral-900">
              {p.finalGrade ?? "—"}
            </div>
          </div>
        </section>

        {/* Verified metadata strip */}
        <section className="mt-6 grid grid-cols-12 gap-6 rounded-md border border-neutral-200 bg-neutral-50 p-4">
          <div className="col-span-3">
            <div className="font-mono text-[8px] uppercase tracking-[0.4em] text-neutral-400">Issuer</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-800">
              <Wordmark /> Institute
            </div>
          </div>
          <div className="col-span-3">
            <div className="font-mono text-[8px] uppercase tracking-[0.4em] text-neutral-400">Registrar</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-800">
              Office of Academic Affairs
            </div>
          </div>
          <div className="col-span-3">
            <div className="font-mono text-[8px] uppercase tracking-[0.4em] text-neutral-400">Standard</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-800">
              ISO 17024 aligned
            </div>
          </div>
          <div className="col-span-3">
            <div className="font-mono text-[8px] uppercase tracking-[0.4em] text-neutral-400">Status</div>
            <div className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-800">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" /> Verified · live
            </div>
          </div>
        </section>

        {/* Footer: signature + QR */}
        <footer className="mt-auto grid grid-cols-12 items-end gap-6 pt-10">
          <div className="col-span-5">
            <div className="font-mono text-[8px] uppercase tracking-[0.4em] text-neutral-400">Credential Ref</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-800"><Wordmark /> {p.certificateId}</div>
            <div className="mt-3 max-w-xs text-[10px] leading-relaxed text-neutral-500">
              This transcript is digitally signed and registered in the public CERTIGO. registry.
              Scan the code or visit the verify URL to confirm authenticity.
            </div>
          </div>
          <div className="col-span-4 flex flex-col items-center">
            <img
              src={sigImg}
              alt=""
              className="h-16 w-auto select-none object-contain md:h-20"
              style={{ mixBlendMode: "multiply" }}
              draggable={false}
            />
            <div className="mt-1 h-px w-56 bg-neutral-900/80" />
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-700">
              Director of Academic Affairs
            </div>
            <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.28em] text-neutral-500">
              <Wordmark /> Institute
            </div>
          </div>
          <div className="col-span-3 flex justify-end">
            <VerifyQR url={verifyUrl} size={88} />
          </div>
        </footer>
      </div>
    </div>
  );
}