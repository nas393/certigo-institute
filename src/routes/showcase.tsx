import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import {
  CertigoCertificate, type CertigoCertTheme,
  SignatureFlourish, ElectronicStamp,
  SIGNATURE_VARIANTS, STAMP_VARIANTS,
  type SignatureVariant, type StampVariant,
} from "@/components/certigo/CertificateThemes";

export const Route = createFileRoute("/showcase")({
  head: () => ({ meta: [
    { title: "Signature & Electronic Stamp Options — CERTIGO." },
    { name: "description", content: "Pick the official signature pair and electronic stamp for CERTIGO INSTITUTE certificates." },
  ] }),
  component: ShowcasePage,
});

const SAMPLE = {
  recipientName: "EMMA J. SULLIVAN",
  courseTitle: "Advanced Web App Architecture & Development",
  description: "An intensive program covering distributed systems, modern frontend architecture, edge runtimes, and end-to-end credential verification.",
  issueDate: new Date().toISOString(),
  certificateId: "CERT-WAA-1024",
  verifyUrl: "https://certigo.institute/verify/CERT-WAA-1024",
  scorePct: 96,
};

/**
 * 6 signature pair options × 3 electronic stamp options.
 * The base certificate theme is fixed to "sovereign" so you can compare
 * signatures and stamps fairly.
 */
const SIG_PAIRS: { id: string; pair: [SignatureVariant, SignatureVariant]; label: string; hint: string }[] = [
  { id: "A", pair: [0, 3], label: "Executive · Angular",   hint: "Bold cap + sharp angular CEO mark" },
  { id: "B", pair: [1, 5], label: "Copperplate · Minister", hint: "Flowing loops + elegant low descender" },
  { id: "C", pair: [2, 4], label: "Diplomat · Continuous",  hint: "Slanted ascender + single-stroke flow" },
  { id: "D", pair: [0, 1], label: "Executive · Copperplate", hint: "Reference-style bold + flowing loops" },
  { id: "E", pair: [3, 2], label: "Angular · Diplomat",     hint: "Sharp + slanted, classical pairing" },
  { id: "F", pair: [5, 4], label: "Minister · Continuous",  hint: "Soft elegant + relentless single line" },
];

const STAMP_LABELS: Record<StampVariant, { label: string; hint: string }> = {
  0: { label: "Rect e-Stamp",   hint: "Rectangular tilted rubber-stamp · serif lockup" },
  1: { label: "Round e-Seal",   hint: "Circular text-around-ring · ministerial" },
  2: { label: "Hex Token",      hint: "Hexagonal · web3 / on-chain feel" },
};

const BASE_THEME: CertigoCertTheme = "sovereign";

function ShowcasePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="micro-label">◆ Certigo Institute · Standard selection</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter md:text-5xl">
          Pick one option to standardize
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Ten paired options. Each option is a single certificate design plus a matching
          transcript design. No officer or director names — only the institute’s authority,
          a verified seal, and on-chain QR metadata. Tell us the option number you want
          and we’ll lock the entire platform to it.
        </p>

        <div className="mt-10 space-y-16">
          {PAIRED_OPTIONS.map((opt, i) => {
            const certMeta = findMeta(CERTIGO_CERT_THEMES, opt.cert);
            const trMeta = findMeta(CERTIGO_TRANSCRIPT_THEMES, opt.tr);
            const num = String(i + 1).padStart(2, "0");
            return (
              <section key={`${opt.cert}-${opt.tr}`}
                className="rounded-xl border border-border bg-muted/20 p-6 md:p-8">
                <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      OPTION {num}
                    </span>
                    <h2 className="font-display text-2xl font-black tracking-tight">
                      {certMeta.label}
                    </h2>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Cert · {certMeta.hint} &nbsp;|&nbsp; Transcript · {trMeta.hint}
                  </span>
                </header>
                <div className="grid gap-8 lg:grid-cols-[1.414fr_1fr]">
                  <div>
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Certificate · A4 landscape
                    </div>
                    <div className="rounded-md border border-border bg-background p-3">
                      <CertigoCertificate theme={opt.cert} {...SAMPLE} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Transcript · A4 portrait
                    </div>
                    <div className="rounded-md border border-border bg-background p-3">
                      <CertigoTranscript theme={opt.tr} {...TR_SAMPLE} />
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}