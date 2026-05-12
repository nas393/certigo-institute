import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import {
  MinimalCertificate, MinimalTranscript,
  MINIMAL_CERT_OPTIONS, MINIMAL_TRANSCRIPT_OPTIONS,
} from "@/components/certigo/MinimalOptions";

export const Route = createFileRoute("/options")({
  head: () => ({ meta: [
    { title: "Certificate & Transcript Options — CERTIGO." },
    { name: "description", content: "Pick the official CERTIGO INSTITUTE certificate and transcript design." },
  ] }),
  component: OptionsPage,
});

const SAMPLE = {
  recipientName: "Emma J. Sullivan",
  courseTitle: "Advanced Web App Architecture & Development",
  description:
    "An intensive program covering distributed systems, modern frontend architecture, edge runtimes, and end-to-end credential verification.",
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
    { code: "WAA-101", title: "Modern Frontend Architecture",            hours: 14, scorePct: 96, grade: "A"  },
    { code: "WAA-201", title: "Edge Runtimes & Distributed Systems",     hours: 18, scorePct: 94, grade: "A"  },
    { code: "WAA-301", title: "Credential Verification & Cryptography",  hours: 16, scorePct: 98, grade: "A+" },
    { code: "WAA-401", title: "Production Reliability & Observability",  hours: 12, scorePct: 92, grade: "A-" },
  ],
};

function OptionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="micro-label">◆ Certigo Institute · design selection</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter md:text-5xl">
          Pick one certificate · pick one transcript
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Five minimal-white certificate variants and five matching transcript variants —
          all based on the uploaded reference: white paper, gold seal, two role-only signatures
          (no printed names). Tell me which numbers to lock as the standard.
        </p>

        {/* CERTIFICATES */}
        <section className="mt-14">
          <h2 className="font-display text-2xl font-black tracking-tight">Certificates</h2>
          <div className="mt-8 space-y-12">
            {MINIMAL_CERT_OPTIONS.map((opt, i) => (
              <section key={opt.key} className="rounded-xl border border-border bg-muted/20 p-6 md:p-8">
                <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      Cert option {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-2xl font-black tracking-tight">{opt.label}</h3>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {opt.hint}
                  </span>
                </header>
                <div className="rounded-md border border-border bg-background p-3">
                  <MinimalCertificate variant={opt.key} {...SAMPLE} />
                </div>
              </section>
            ))}
          </div>
        </section>

        {/* TRANSCRIPTS */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-black tracking-tight">Transcripts</h2>
          <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2">
            {MINIMAL_TRANSCRIPT_OPTIONS.map((opt, i) => (
              <section key={opt.key} className="rounded-xl border border-border bg-muted/20 p-6">
                <header className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      Transcript option {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-xl font-black tracking-tight">{opt.label}</h3>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {opt.hint}
                  </span>
                </header>
                <div className="rounded-md border border-border bg-background p-3">
                  <MinimalTranscript variant={opt.key} {...TRANSCRIPT_SAMPLE} />
                </div>
              </section>
            ))}
          </div>
        </section>

        <div className="mt-16 rounded-xl border border-primary/40 bg-primary/5 p-6">
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Next step</div>
          <p className="mt-2 text-sm">
            Tell me your picks — e.g. <strong>“Cert 01 + Transcript 03”</strong> — and I’ll lock that
            as the single standardised CERTIGO design across the app and PDF export.
          </p>
        </div>
      </div>
    </div>
  );
}