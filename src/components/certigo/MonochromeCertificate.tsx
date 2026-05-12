import sigImg from "@/assets/signature-director.png";

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
}

export const MONO_OPTIONS: { key: MonoVariant; label: string; hint: string }[] = [
  { key: "01", label: "Helvetica Grid",  hint: "Swiss precision · all-caps mono · hairline rules" },
  { key: "02", label: "Editorial Serif", hint: "Didone display · centred · breathing negative space" },
  { key: "03", label: "Bauhaus Block",   hint: "Heavy display · left-aligned · industrial label rail" },
];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

/** Single centered ink signature — no printed name, role only. */
function CenterSignature() {
  return (
    <div className="flex flex-col items-center">
      <img
        src={sigImg}
        alt=""
        className="h-16 w-auto select-none object-contain md:h-20"
        style={{ filter: "grayscale(1) contrast(1.15)", mixBlendMode: "multiply" }}
        draggable={false}
      />
      <div className="mt-2 h-px w-56 bg-neutral-900/80" />
      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-700">
        Director of Academic Affairs
      </div>
      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.28em] text-neutral-500">
        Certigo Institute
      </div>
    </div>
  );
}

function MetaRow({ id, date, score }: { id: string; date: string; score?: number }) {
  return (
    <div className="grid grid-cols-3 gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
      <div>
        <div className="text-[8px] tracking-[0.3em] text-neutral-400">Credential ID</div>
        <div className="mt-1 text-neutral-800">{id}</div>
      </div>
      <div className="text-center">
        <div className="text-[8px] tracking-[0.3em] text-neutral-400">Issued</div>
        <div className="mt-1 text-neutral-800">{fmtDate(date)}</div>
      </div>
      <div className="text-right">
        <div className="text-[8px] tracking-[0.3em] text-neutral-400">Score</div>
        <div className="mt-1 text-neutral-800">{score ? `${score}%` : "Pass"}</div>
      </div>
    </div>
  );
}

/* ───────────────────────── Variant 01 — Helvetica Grid ───────────────────────── */
function Variant01(p: MonoCertProps) {
  return (
    <div className="relative aspect-[1.414/1] w-full overflow-hidden bg-white text-neutral-900 ring-1 ring-neutral-200">
      {/* corner crops */}
      <div className="pointer-events-none absolute inset-5 border border-neutral-900/15" />
      <div className="pointer-events-none absolute left-5 top-5 h-3 w-3 border-l border-t border-neutral-900" />
      <div className="pointer-events-none absolute right-5 top-5 h-3 w-3 border-r border-t border-neutral-900" />
      <div className="pointer-events-none absolute left-5 bottom-5 h-3 w-3 border-l border-b border-neutral-900" />
      <div className="pointer-events-none absolute right-5 bottom-5 h-3 w-3 border-r border-b border-neutral-900" />

      <div className="relative flex h-full flex-col px-12 py-10 md:px-16 md:py-12">
        <header className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-500">
          <span>Certigo Institute</span>
          <span>Certificate · No. {p.certificateId}</span>
        </header>

        <div className="mt-12 font-mono text-[10px] uppercase tracking-[0.45em] text-neutral-500">
          This is to certify that
        </div>
        <h2 className="mt-3 font-display text-4xl font-black leading-tight tracking-tight md:text-5xl">
          {p.recipientName}
        </h2>

        <div className="mt-8 max-w-3xl font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-500">
          has successfully completed
        </div>
        <div className="mt-2 font-display text-xl font-bold tracking-tight md:text-2xl">
          {p.courseTitle}
        </div>
        {p.description && (
          <p className="mt-4 max-w-2xl text-[12px] leading-relaxed text-neutral-600">
            {p.description}
          </p>
        )}

        <div className="mt-auto pt-10">
          <div className="flex items-end justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-500">
              <div className="text-[8px] tracking-[0.4em] text-neutral-400">Verify</div>
              <div className="mt-1 text-neutral-800">certigo.institute/v/{p.certificateId}</div>
            </div>
            <CenterSignature />
            <div className="text-right font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-500">
              <div className="text-[8px] tracking-[0.4em] text-neutral-400">Issued</div>
              <div className="mt-1 text-neutral-800">{fmtDate(p.issueDate)}</div>
            </div>
          </div>
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
          Certigo Institute
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
          <CenterSignature />
          <div className="mt-8 border-t border-neutral-200 pt-4">
            <MetaRow id={p.certificateId} date={p.issueDate} score={p.scorePct} />
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
          Certigo · Institute · MMXXVI
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
            <MetaRow id={p.certificateId} date={p.issueDate} score={p.scorePct} />
          </div>
          <div className="col-span-7 flex justify-end">
            <CenterSignature />
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