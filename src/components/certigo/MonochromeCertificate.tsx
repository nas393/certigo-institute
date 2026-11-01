import { useEffect, useState } from "react";
import QRCode from "qrcode";

export type MonoVariant = "01" | "02" | "03";

export interface MonoCertProps {
  variant: MonoVariant;
  recipientName: string;
  courseTitle: string;
  description?: string;
  issueDate: string;
  certificateId: string;
  verifyUrl?: string;
  scorePct?: number;
  /** Real-world professional skills applied by the graduate. Rendered as a chip strip. */
  skills?: string[];
  /** Pre-rendered QR image; used for PDF/print so nothing loads asynchronously. */
  qrDataUrl?: string;
  /** Wording for a translated copy; defaults to English. */
  labels?: Partial<CertLabels>;
  dir?: "ltr" | "rtl";
  locale?: string;
  /** Small line under the certificate, e.g. "Translated copy". */
  footnote?: string;
}

export interface CertLabels {
  certify: string; completed: string; skills: string; ref: string;
  issued: string; status: string; passed: string; office: string;
}

/** Certificate wording. English is the official record; other languages are translated copies. */
export const CERT_LABELS: Record<"en" | "fr" | "es" | "pt" | "ar", CertLabels & { note: string }> = {
  en: { certify: "This is to certify that", completed: "has successfully completed", skills: "Skills applied in the real professional world", ref: "Credential Ref", issued: "Issued", status: "Status", passed: "Passed", office: "CERTIGO Certification Office", note: "" },
  fr: { certify: "Nous certifions que", completed: "a suivi avec succès", skills: "Compétences appliquées dans le monde professionnel", ref: "Référence du certificat", issued: "Délivré le", status: "Statut", passed: "Réussi", office: "Bureau de certification CERTIGO", note: "Copie traduite — la version anglaise constitue le document officiel." },
  es: { certify: "Se certifica que", completed: "ha completado con éxito", skills: "Competencias aplicadas en el mundo profesional", ref: "Referencia de la credencial", issued: "Emitido el", status: "Estado", passed: "Aprobado", office: "Oficina de Certificación CERTIGO", note: "Copia traducida: la versión en inglés es el documento oficial." },
  pt: { certify: "Certifica-se que", completed: "concluiu com êxito", skills: "Competências aplicadas no mundo profissional", ref: "Referência da credencial", issued: "Emitido em", status: "Estado", passed: "Aprovado", office: "Gabinete de Certificação CERTIGO", note: "Cópia traduzida — a versão em inglês é o documento oficial." },
  ar: { certify: "نشهد بأن", completed: "قد أتمّ بنجاح", skills: "مهارات مطبّقة في العالم المهني", ref: "المرجع الرسمي للشهادة", issued: "تاريخ الإصدار", status: "الحالة", passed: "ناجح", office: "مكتب الشهادات في CERTIGO", note: "نسخة مترجمة — النسخة الإنجليزية هي الوثيقة الرسمية." },
};

export const MONO_OPTIONS: { key: MonoVariant; label: string; hint: string }[] = [
  { key: "01", label: "Helvetica Grid",  hint: "Swiss precision · all-caps mono · hairline rules" },
  { key: "02", label: "Editorial Serif", hint: "Didone display · centred · breathing negative space" },
  { key: "03", label: "Bauhaus Block",   hint: "Heavy display · left-aligned · industrial label rail" },
];

function fmtDate(iso: string, locale = "en-GB") {
  const d = new Date(iso);
  return d.toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });
}

/** Brand wordmark — always with terminal dot. */
function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      CERTIGO<span style={{ color: "#10B981" }}>.</span>
    </span>
  );
}

/** Tiny verified QR + signal block, sits beneath the credential ref. */
function VerifyQR({ url, size = 72, align = "left", dataUrl }: { url: string; size?: number; align?: "left" | "right" | "center"; dataUrl?: string }) {
  const [src, setSrc] = useState<string>(dataUrl ?? "");
  useEffect(() => {
    if (dataUrl) { setSrc(dataUrl); return; }
    let live = true;
    QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 0,
      color: { dark: "#0a0a0a", light: "#ffffff00" },
      width: size * 3,
    })
      .then((d) => { if (live) setSrc(d); })
      .catch(() => { /* noop */ });
    return () => { live = false; };
  }, [url, size, dataUrl]);
  const just = align === "right" ? "items-end text-right" : align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`flex flex-col gap-1.5 ${just}`}>
      <div
        className="rounded-[2px] bg-white p-1 ring-1 ring-neutral-900/10"
        style={{ width: size, height: size }}
      >
        {src ? (
          <img src={src} alt="" width={size - 8} height={size - 8} className="h-full w-full object-contain" />
        ) : null}
      </div>
      <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.32em] text-neutral-700">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
        Verified · <Wordmark /> Registry
      </div>
    </div>
  );
}

/** Issuing office block: no handwritten signature and no personal name, by design. */
function OfficeSeal({ label }: { label: string }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative h-20 w-20"><DigitalStamp /></div>
      <div className="mt-2 h-px w-64 bg-neutral-900/80" />
      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-700">{label}</div>
    </div>
  );
}

/** Circular emerald "CERTIGO. CERTIFIED" stamp — sits over the trailing S of AFFAIRS. */
function DigitalStamp() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 inline-flex h-20 w-20 -rotate-12 items-center justify-center rounded-full border-[2.5px] border-emerald-600/85 text-emerald-700"
      style={{ mixBlendMode: "multiply" }}
    >
      <svg viewBox="0 0 60 60" className="absolute inset-0 h-full w-full">
        <defs>
          <path id="stamp-arc" d="M30,30 m-22,0 a22,22 0 1,1 44,0 a22,22 0 1,1 -44,0" />
        </defs>
        <text fontSize="6.5" letterSpacing="2.4" fill="currentColor" fontFamily="ui-monospace,Menlo,monospace" fontWeight="700">
          <textPath href="#stamp-arc" startOffset="0">CERTIGO · CERTIFIED · </textPath>
        </text>
      </svg>
      <span className="font-mono text-[14px] font-black leading-none tracking-tighter">✓</span>
    </span>
  );
}

function MetaRow({ id, date, verifyUrl }: { id: string; date: string; score?: number; verifyUrl?: string }) {
  return (
    <div className="grid grid-cols-3 items-start gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
      <div>
        <div className="text-[8px] tracking-[0.3em] text-neutral-400">Credential ID</div>
        <div className="mt-1 text-neutral-800"><Wordmark /> {id}</div>
        {verifyUrl && (
          <div className="mt-2">
            <VerifyQR url={verifyUrl} size={64} align="left" />
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="text-[8px] tracking-[0.3em] text-neutral-400">Issued</div>
        <div className="mt-1 text-neutral-800">{fmtDate(date)}</div>
      </div>
      <div className="text-right">
        <div className="text-[8px] tracking-[0.3em] text-neutral-400">Status</div>
        <div className="mt-1 text-neutral-800">Passed</div>
      </div>
    </div>
  );
}

/* ───────────────────────── Variant 01 — Helvetica Grid ───────────────────────── */
function Variant01(p: MonoCertProps) {
  const L = { ...CERT_LABELS.en, ...p.labels };
  const verifyUrl = p.verifyUrl ?? (typeof window !== "undefined" ? `${window.location.origin}/verify/${p.certificateId}` : `/verify/${p.certificateId}`);
  return (
    <div dir={p.dir ?? "ltr"} className="relative aspect-[1.414/1] w-full overflow-hidden bg-white text-neutral-900 ring-2 ring-neutral-900">
      {/* corner crops */}
      <div className="pointer-events-none absolute inset-5 border border-neutral-900/15" />
      <div className="pointer-events-none absolute left-5 top-5 h-3 w-3 border-l border-t border-neutral-900" />
      <div className="pointer-events-none absolute right-5 top-5 h-3 w-3 border-r border-t border-neutral-900" />
      <div className="pointer-events-none absolute left-5 bottom-5 h-3 w-3 border-l border-b border-neutral-900" />
      <div className="pointer-events-none absolute right-5 bottom-5 h-3 w-3 border-r border-b border-neutral-900" />

      <div className="relative flex h-full flex-col px-16 py-12">
        <header className="flex items-start justify-between">
          <div className="font-display text-lg font-black tracking-tighter text-neutral-900">
            <Wordmark />
          </div>
          <div className="text-right">
            <div className="font-display text-sm font-black uppercase tracking-widest text-neutral-900">
              <Wordmark />
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.32em] text-neutral-500">
              No. {p.certificateId}
            </div>
          </div>
        </header>

        <div className="mt-12 font-mono text-[10px] uppercase tracking-[0.45em] text-neutral-500">
          {L.certify}
        </div>
        <h2 className="mt-3 font-display text-5xl font-black leading-tight tracking-tight">
          {p.recipientName}
        </h2>

        <div className="mt-8 max-w-3xl font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-500">
          {L.completed}
        </div>
        <div className="mt-2 font-display text-2xl font-bold tracking-tight">
          {p.courseTitle}
        </div>
        {p.description && (
          <p className="mt-4 max-w-2xl text-[12px] leading-relaxed text-neutral-600">
            {p.description}
          </p>
        )}

        {p.skills && p.skills.length > 0 && (
          <div className="mt-6 border-y border-neutral-900/10 py-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.34em] text-neutral-400">
              {L.skills}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.skills.slice(0, 8).map((s) => (
                <span
                  key={s}
                  className="rounded-sm bg-neutral-100 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-800"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-10">
          <div className="flex items-end justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-500">
              <div className="text-[8px] tracking-[0.4em] text-neutral-400">{L.ref}</div>
              <div className="mt-1 text-neutral-800"><Wordmark /> {p.certificateId}</div>
              <div className="mt-3">
                <VerifyQR url={verifyUrl} dataUrl={p.qrDataUrl} size={68} align="left" />
              </div>
            </div>
            <OfficeSeal label={L.office} />
            <div className="text-end font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-500">
              <div className="text-[8px] tracking-[0.4em] text-neutral-400">{L.issued}</div>
              <div className="mt-1 text-neutral-800">{fmtDate(p.issueDate, p.locale)}</div>
              <div className="mt-3 text-[8px] tracking-[0.4em] text-neutral-400">{L.status}</div>
              <div className="mt-1 font-bold text-emerald-700">{L.passed}</div>
            </div>
          </div>
          {p.footnote && <div className="mt-4 text-center text-[10px] text-neutral-500">{p.footnote}</div>}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Variant 02 — Editorial Serif ───────────────────────── */
function Variant02(p: MonoCertProps) {
  return (
    <div className="relative aspect-[1.414/1] w-full overflow-hidden bg-white text-neutral-900 ring-1 ring-neutral-200">
      <div className="relative flex h-full flex-col items-center px-12 py-12 text-center md:px-20">
        <div className="font-mono text-[10px] uppercase tracking-[0.5em] text-neutral-500">
          <Wordmark /> Institute
        </div>
        <div className="mt-2 h-px w-24 bg-neutral-900" />

        <h1 className="mt-10 font-serif text-4xl italic leading-none text-neutral-900 md:text-5xl">
          Certificate
        </h1>
        <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.4em] text-neutral-500">
          of Achievement
        </div>

        <div className="mt-10 font-mono text-[10px] uppercase tracking-[0.4em] text-neutral-500">
          Presented to
        </div>
        <h2 className="mt-3 font-serif text-5xl font-medium tracking-tight text-neutral-900 md:text-6xl">
          {p.recipientName}
        </h2>
        <div className="mt-3 h-px w-40 bg-neutral-900/40" />

        <p className="mt-6 max-w-xl text-[12px] leading-relaxed text-neutral-600">
          For the successful completion of <span className="italic text-neutral-900">{p.courseTitle}</span>
          {p.description ? `, ${p.description.toLowerCase()}` : ""}.
        </p>

        <div className="mt-auto w-full pt-10">
          <OfficeSeal label={CERT_LABELS.en.office} />
          <div className="mt-8 border-t border-neutral-200 pt-4">
            <MetaRow id={p.certificateId} date={p.issueDate} score={p.scorePct} verifyUrl={p.verifyUrl ?? (typeof window !== "undefined" ? `${window.location.origin}/verify/${p.certificateId}` : `/verify/${p.certificateId}`)} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Variant 03 — Bauhaus Block ───────────────────────── */
function Variant03(p: MonoCertProps) {
  return (
    <div className="relative aspect-[1.414/1] w-full overflow-hidden bg-white text-neutral-900 ring-1 ring-neutral-200">
      {/* left rail */}
      <div className="absolute inset-y-0 left-0 flex w-10 flex-col items-center justify-between bg-neutral-900 py-6 text-white md:w-12">
        <div
          className="font-mono text-[9px] uppercase tracking-[0.5em]"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          CERTIGO. · Institute · MMXXVI
        </div>
        <div
          className="font-mono text-[9px] uppercase tracking-[0.5em]"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {p.certificateId}
        </div>
      </div>

      <div className="relative flex h-full flex-col pl-16 pr-12 py-10 md:pl-20 md:pr-16 md:py-12">
        <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-500">
          <span>Certificate · 002</span>
          <span>Vol. I — {new Date(p.issueDate).getFullYear()}</span>
        </div>

        <div className="mt-8 grid grid-cols-12 items-end gap-6">
          <div className="col-span-7">
            <div className="font-display text-[7rem] font-black leading-[0.85] tracking-tighter text-neutral-900 md:text-[9rem]">
              CERT
            </div>
            <div className="-mt-2 font-mono text-[10px] uppercase tracking-[0.45em] text-neutral-500">
              of completion
            </div>
          </div>
          <div className="col-span-5 border-l border-neutral-900 pl-6">
            <div className="font-mono text-[9px] uppercase tracking-[0.4em] text-neutral-500">Awarded to</div>
            <div className="mt-2 font-display text-2xl font-black leading-tight tracking-tight md:text-3xl">
              {p.recipientName}
            </div>
            <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.4em] text-neutral-500">For</div>
            <div className="mt-1 font-display text-sm font-bold leading-snug">
              {p.courseTitle}
            </div>
          </div>
        </div>

        {p.description && (
          <p className="mt-6 max-w-2xl text-[12px] leading-relaxed text-neutral-600">
            {p.description}
          </p>
        )}

        <div className="mt-auto grid grid-cols-12 items-end gap-6 pt-8">
          <div className="col-span-5">
            <MetaRow id={p.certificateId} date={p.issueDate} score={p.scorePct} verifyUrl={p.verifyUrl ?? (typeof window !== "undefined" ? `${window.location.origin}/verify/${p.certificateId}` : `/verify/${p.certificateId}`)} />
          </div>
          <div className="col-span-7 flex justify-end">
            <OfficeSeal label={CERT_LABELS.en.office} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MonochromeCertificate(props: MonoCertProps) {
  if (props.variant === "01") return <Variant01 {...props} />;
  if (props.variant === "02") return <Variant02 {...props} />;
  return <Variant03 {...props} />;
}