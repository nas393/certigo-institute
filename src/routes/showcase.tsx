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
        <div className="micro-label">◆ Certigo Institute · Signature & e-Stamp selection</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter md:text-5xl">
          Pick the official signatures & electronic stamp
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Two layers to choose from. First pick a <strong>signature pair</strong> (left = Office of the Registrar,
          right = Director of Credentialing) — no personal names, just authentic ink. Then pick an
          <strong> electronic stamp</strong> — a tamper-evident digital seal that replaces the old wax look.
          Tell us the pair letter (A–F) and stamp number (1–3) and we lock those across every certificate
          and transcript.
        </p>

        {/* SIGNATURE LIBRARY — 6 individual variants, then 6 paired options */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-black tracking-tight">Signature library</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            6 hand-drawn ink variants. Used in pairs (left + right) on every certificate.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {SIGNATURE_VARIANTS.map((v) => (
              <div key={v} className="rounded-lg border border-border bg-[#f8f5ee] p-5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                  Signature · V{v}
                </div>
                <div className="mt-3 h-20">
                  <SignatureFlourish variant={v} color="#0b1a4a" />
                </div>
                <div className="mt-2 h-px w-full bg-neutral-400/60" />
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-600">
                  Authorized · CERTIGO
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STAMP LIBRARY */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-black tracking-tight">Electronic stamp library</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            3 tamper-evident digital seals. No red wax. Each stamp encodes the certificate ID and issue date.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {STAMP_VARIANTS.map((s) => (
              <div key={s}
                style={{ containerType: "inline-size" }}
                className="rounded-lg border border-border bg-[#0a1226] p-8 text-center">
                <div className="font-mono text-[10px] uppercase tracking-widest text-amber-200/70">
                  Stamp #{s + 1} · {STAMP_LABELS[s].label}
                </div>
                <div className="mt-6 flex justify-center">
                  <ElectronicStamp variant={s} certificateId={SAMPLE.certificateId}
                    issueDate={SAMPLE.issueDate} size={14} />
                </div>
                <div className="mt-6 text-xs text-amber-100/60">{STAMP_LABELS[s].hint}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PAIRED PREVIEWS — 6 signature pairs × stamp #1 by default */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-black tracking-tight">Paired previews</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Each option below is a full certificate using one signature pair and Stamp #1.
            We can swap to Stamp #2 or #3 once you confirm.
          </p>

          <div className="mt-8 space-y-12">
            {SIG_PAIRS.map((opt, i) => {
              const num = String(i + 1).padStart(2, "0");
              return (
                <section key={opt.id}
                  className="rounded-xl border border-border bg-muted/20 p-6 md:p-8">
                  <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        OPTION {num} · PAIR {opt.id}
                      </span>
                      <h3 className="font-display text-2xl font-black tracking-tight">
                        {opt.label}
                      </h3>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Signatures V{opt.pair[0]} + V{opt.pair[1]} &nbsp;·&nbsp; {opt.hint}
                    </span>
                  </header>
                  <div className="rounded-md border border-border bg-background p-3">
                    <CertigoCertificate
                      theme={BASE_THEME}
                      {...SAMPLE}
                      sigPair={opt.pair}
                      stampVariant={0}
                    />
                  </div>
                </section>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}