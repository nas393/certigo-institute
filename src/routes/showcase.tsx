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

function ShowcasePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="micro-label">◆ Certigo Institute · Design System</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter md:text-5xl">
          Certificate & Transcript Themes
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Five certificate variants and five matching transcript variants. Each is a self-contained
          theme — pick any combination per recipient.
        </p>

        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-black tracking-tight">Certificates · 5 themes</h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">A4 landscape · 1.414 : 1</span>
          </div>
          <div className="mt-6 grid gap-10 lg:grid-cols-2">
            {CERTIGO_CERT_THEMES.map((t) => (
              <ThemeBlock key={t.key} label={t.label} hint={t.hint}>
                <CertigoCertificate theme={t.key as CertigoCertTheme} {...SAMPLE} />
              </ThemeBlock>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-black tracking-tight">Transcripts · 5 themes</h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">A4 portrait · 1 : 1.414</span>
          </div>
          <div className="mt-6 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {CERTIGO_TRANSCRIPT_THEMES.map((t) => (
              <ThemeBlock key={t.key} label={t.label} hint={t.hint}>
                <CertigoTranscript theme={t.key as CertigoTranscriptTheme} {...TR_SAMPLE} />
              </ThemeBlock>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ThemeBlock({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <div className="font-display text-lg font-black tracking-tight">{label}</div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{hint}</div>
      </div>
      <div className="rounded-md border border-border bg-muted/30 p-3">
        {children}
      </div>
    </div>
  );
}