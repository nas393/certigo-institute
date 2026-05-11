import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import {
  CertigoCertificate, CERTIGO_CERT_THEMES, type CertigoCertTheme,
} from "@/components/certigo/CertificateThemes";
import {
  CertigoTranscript, CERTIGO_TRANSCRIPT_THEMES, type CertigoTranscriptTheme, type TranscriptModule,
} from "@/components/certigo/TranscriptThemes";

export const Route = createFileRoute("/showcase")({
  head: () => ({ meta: [
    { title: "Certificate & Transcript Themes — CERTIGO." },
    { name: "description", content: "Pick from 5 premium certificate themes and 5 transcript themes." },
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

const MODULES: TranscriptModule[] = [
  { code: "WAA-101", title: "Foundations of Distributed Web Systems", hours: 14, scorePct: 94, grade: "A"  },
  { code: "WAA-202", title: "Front-end Architecture & Design Systems",  hours: 16, scorePct: 97, grade: "A+" },
  { code: "WAA-303", title: "Edge Runtimes & Serverless Patterns",      hours: 12, scorePct: 92, grade: "A-" },
  { code: "WAA-404", title: "Credential Verification & Cryptography",   hours: 10, scorePct: 95, grade: "A"  },
  { code: "WAA-505", title: "Performance, Observability & Security",    hours: 12, scorePct: 96, grade: "A"  },
  { code: "WAA-606", title: "Capstone — Production Credential Platform", hours: 18, scorePct: 98, grade: "A+" },
];

const TR_SAMPLE = {
  recipientName: "Emma J. Sullivan",
  programTitle: "Advanced Web App Architecture & Development",
  programCode: "WAA-2026-PRO",
  issueDate: new Date().toISOString(),
  transcriptId: "TR-WAA-1024",
  verifyUrl: "https://certigo.institute/verify/CERT-WAA-1024",
  modules: MODULES,
  cumulativeGpa: "3.95 / 4.00",
  totalHours: MODULES.reduce((a, m) => a + m.hours, 0),
};

/**
 * 10 paired options. Certificate theme + matching transcript theme paired
 * by index. Pick ONE option to standardize across CERTIGO.
 */
const PAIRED_OPTIONS: { cert: CertigoCertTheme; tr: CertigoTranscriptTheme }[] = [
  { cert: "sovereign", tr: "ledger"     },
  { cert: "obsidian",  tr: "dossier"    },
  { cert: "quantum",   tr: "telemetry"  },
  { cert: "imperial",  tr: "audit"      },
  { cert: "meridian",  tr: "codex"      },
  { cert: "monolith",  tr: "monolith"   },
  { cert: "aurora",    tr: "aurora"     },
  { cert: "parchment", tr: "parchment"  },
  { cert: "cipher",    tr: "cipher"     },
  { cert: "regalia",   tr: "regalia"    },
];

function findMeta<T extends { key: string; label: string; hint: string }>(arr: T[], key: string) {
  return arr.find((t) => t.key === key)!;
}

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