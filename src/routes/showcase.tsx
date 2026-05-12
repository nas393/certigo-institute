import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import {
  CertigoCertificate, type CertigoCertTheme,
  SignatureFlourish, ElectronicStamp,
  SIGNATURE_VARIANTS, STAMP_VARIANTS,
  type SignatureVariant, type StampVariant,
} from "@/components/certigo/CertificateThemes";
import { CertigoTranscript } from "@/components/certigo/TranscriptThemes";
import {
  PAIR_DEFINITIONS, STAMP_NUMS, useCertigoStandard,
  type PairId, type StampNum,
} from "@/lib/certigo-standard";
import { Check } from "lucide-react";
import { toast } from "sonner";

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

const TRANSCRIPT_SAMPLE = {
  recipientName: SAMPLE.recipientName,
  programTitle: "Advanced Web App Architecture & Development",
  programCode: "WAA-2026-PRO",
  issueDate: SAMPLE.issueDate,
  transcriptId: "TR-WAA-1024",
  verifyUrl: SAMPLE.verifyUrl,
  cumulativeGpa: "3.96 / 4.00",
  modules: [
    { code: "WAA-101", title: "Modern Frontend Architecture", hours: 14, scorePct: 96, grade: "A" },
    { code: "WAA-201", title: "Edge Runtimes & Distributed Systems", hours: 18, scorePct: 94, grade: "A" },
    { code: "WAA-301", title: "Credential Verification & Cryptography", hours: 16, scorePct: 98, grade: "A+" },
    { code: "WAA-401", title: "Production Reliability & Observability", hours: 12, scorePct: 92, grade: "A-" },
  ],
};

/**
 * 6 signature pair options × 3 electronic stamp options.
 * The base certificate theme is fixed to "sovereign" so you can compare
 * signatures and stamps fairly.
 */
const SIG_PAIRS = (Object.keys(PAIR_DEFINITIONS) as PairId[]).map((id) => ({
  id, ...PAIR_DEFINITIONS[id],
}));

const STAMP_LABELS: Record<StampVariant, { label: string; hint: string }> = {
  0: { label: "Rect e-Stamp",   hint: "Rectangular tilted rubber-stamp · serif lockup" },
  1: { label: "Round e-Seal",   hint: "Circular text-around-ring · ministerial" },
  2: { label: "Hex Token",      hint: "Hexagonal · web3 / on-chain feel" },
};

const BASE_THEME: CertigoCertTheme = "sovereign";

function ShowcasePage() {
  const [standard, setStandard] = useCertigoStandard();
  const setActive = (pairId: PairId, stamp: StampNum) => {
    setStandard({ pairId, stamp });
    toast.success(`Locked Pair ${pairId} + Stamp #${stamp} as the CERTIGO standard`);
  };
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
          Use the matrix below to lock a Pair (A–F) × Stamp (#1–#3) combination as the
          single CERTIGO standard. It's saved on this device and applied automatically to every
          certificate, transcript, verify modal, and PDF export.
        </p>

        <div className="mt-6 rounded-lg border border-primary/40 bg-primary/5 px-4 py-3 text-sm">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Active standard
          </span>{" "}
          <strong>Pair {standard.pairId}</strong>{" "}
          <span className="text-muted-foreground">({PAIR_DEFINITIONS[standard.pairId].label})</span>{" "}
          + <strong>Stamp #{standard.stamp}</strong>
        </div>

        {/* SELECTOR MATRIX — Pair × Stamp */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-black tracking-tight">Lock the standard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Click any cell to set it as the active standard. Highlighted cell = currently locked.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  <th className="p-2">Pair</th>
                  {STAMP_NUMS.map((s) => (
                    <th key={s} className="p-2 text-center">Stamp #{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIG_PAIRS.map((opt) => (
                  <tr key={opt.id} className="border-t border-border">
                    <td className="p-2 align-top">
                      <div className="font-mono text-xs font-bold">PAIR {opt.id}</div>
                      <div className="text-xs text-muted-foreground">{opt.label}</div>
                    </td>
                    {STAMP_NUMS.map((s) => {
                      const isActive = standard.pairId === opt.id && standard.stamp === s;
                      return (
                        <td key={s} className="p-2">
                          <button
                            type="button"
                            onClick={() => setActive(opt.id, s)}
                            className={`w-full rounded-md border px-3 py-2 text-left text-xs transition ${
                              isActive
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border hover:border-primary/50 hover:bg-muted/40"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono">Pair {opt.id} · Stamp #{s}</span>
                              {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                            </div>
                            <div className="mt-1 text-[10px] text-muted-foreground">
                              {isActive ? "ACTIVE STANDARD" : "Set as standard"}
                            </div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

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
            Each option below previews one signature pair using your currently active stamp
            (Stamp #{standard.stamp}). Click "Lock as standard" to apply it everywhere.
          </p>

          <div className="mt-8 space-y-12">
            {SIG_PAIRS.map((opt, i) => {
              const num = String(i + 1).padStart(2, "0");
              const isActive = standard.pairId === opt.id;
              return (
                <section key={opt.id}
                  className={`rounded-xl border p-6 md:p-8 ${
                    isActive ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                  }`}>
                  <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        OPTION {num} · PAIR {opt.id}
                      </span>
                      <h3 className="font-display text-2xl font-black tracking-tight">
                        {opt.label}
                      </h3>
                      {isActive && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-primary-foreground">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Signatures V{opt.pair[0]} + V{opt.pair[1]} &nbsp;·&nbsp; {opt.hint}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActive(opt.id, standard.stamp)}
                        className="rounded-md border border-primary/50 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-primary hover:bg-primary/10"
                      >
                        Lock as standard
                      </button>
                    </div>
                  </header>
                  <div className="rounded-md border border-border bg-background p-3">
                    <CertigoCertificate
                      theme={BASE_THEME}
                      {...SAMPLE}
                      sigPair={opt.pair}
                      stampVariant={(standard.stamp - 1) as StampVariant}
                    />
                  </div>
                  <div className="mt-6 rounded-md border border-border bg-background p-3">
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Matching transcript (Ledger theme)
                    </div>
                    <CertigoTranscript
                      theme="ledger"
                      {...TRANSCRIPT_SAMPLE}
                      sigPair={opt.pair}
                      stampVariant={(standard.stamp - 1) as StampVariant}
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