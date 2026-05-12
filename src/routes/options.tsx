import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import { MonochromeCertificate, MONO_OPTIONS } from "@/components/certigo/MonochromeCertificate";
import { MonochromeTranscript } from "@/components/certigo/MonochromeTranscript";

export const Route = createFileRoute("/options")({
  head: () => ({ meta: [{ title: "Certificate Options — CERTIGO." }] }),
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
  programmeTitle: SAMPLE.courseTitle,
  cohort: "MMXXVI · Spring",
  certificateId: SAMPLE.certificateId,
  issueDate: SAMPLE.issueDate,
  verifyUrl: SAMPLE.verifyUrl,
  finalGrade: "A",
  finalScorePct: 96,
  modules: [
    { code: "WAA-101", title: "Foundations of Modern Web Architecture", hours: 18, scorePct: 98, grade: "A" },
    { code: "WAA-102", title: "Edge Runtimes & Distributed Systems", hours: 22, scorePct: 95, grade: "A" },
    { code: "WAA-201", title: "Frontend Composition & Component Design", hours: 16, scorePct: 94, grade: "A" },
    { code: "WAA-202", title: "Server Functions, Caching & Data Loading", hours: 20, scorePct: 97, grade: "A" },
    { code: "WAA-301", title: "Identity, Auth & Verifiable Credentials", hours: 14, scorePct: 96, grade: "A" },
    { code: "WAA-302", title: "Observability, Performance & Cost", hours: 12, scorePct: 93, grade: "A-" },
    { code: "WAA-401", title: "Capstone · Production Credential Platform", hours: 24, scorePct: 97, grade: "A" },
  ],
};

function OptionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          ◆ Certigo Institute · pick one
        </div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter md:text-5xl">
          Three monochrome certificates
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Pure white paper, single centred ink signature (role only — no printed name).
          Pick one and I’ll lock it as the standard across the app and PDF export.
        </p>

        <div className="mt-12 space-y-14">
          {MONO_OPTIONS.map((opt, i) => (
            <section key={opt.key} className="rounded-xl border border-border bg-muted/20 p-6 md:p-8">
              <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                    Option {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-2xl font-black tracking-tight">{opt.label}</h2>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {opt.hint}
                </span>
              </header>
              <div className="rounded-md border border-border bg-background p-3">
                <MonochromeCertificate variant={opt.key} {...SAMPLE} />
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-xl border border-primary/40 bg-primary/5 p-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Next step</div>
          <p className="mt-2 text-sm">
            Tell me <strong>“Option 01”</strong>, <strong>02</strong>, or <strong>03</strong> and I’ll
            wire it as the official CERTIGO certificate everywhere.
          </p>
        </div>

        <section className="mt-16 rounded-xl border border-border bg-muted/20 p-6 md:p-8">
          <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                Transcript · A4
              </span>
              <h2 className="font-display text-2xl font-black tracking-tight">Official Academic Transcript</h2>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Same monochrome system · full A4 portrait
            </span>
          </header>
          <div className="mx-auto max-w-3xl rounded-md border border-border bg-background p-3">
            <MonochromeTranscript {...TRANSCRIPT_SAMPLE} />
          </div>
        </section>
      </div>
    </div>
  );
}
