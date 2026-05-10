import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck, KeyRound, Globe, FileCheck2, Server, Eye, GitBranch, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security & Trust — CERTIGO." },
      { name: "description", content: "How CERTIGO. protects credentials end-to-end: encryption, tamper-proof verification, GDPR/SOC 2 controls, and regional data residency." },
      { property: "og:title", content: "Security & Trust — CERTIGO." },
      { property: "og:description", content: "Encryption, tamper-proof verification, and global compliance controls behind every CERTIGO. credential." },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  const nav = useNavigate();
  const pillars = [
    { icon: Lock, t: "Encryption everywhere", d: "TLS 1.3 in transit. AES-256 at rest. Per-tenant key isolation with rotation policies." },
    { icon: ShieldCheck, t: "Tamper-proof verification", d: "Each credential carries a cryptographic signature; any byte change invalidates the proof." },
    { icon: KeyRound, t: "Zero-trust access", d: "SSO, SCIM provisioning and granular role-based access for every issuing team." },
    { icon: Globe, t: "Regional data residency", d: "EU and US regions available, with controls aligned to GDPR and UK GDPR." },
    { icon: FileCheck2, t: "SOC 2 controls", d: "Continuous monitoring, change management and audited access reviews." },
    { icon: Server, t: "Resilient infrastructure", d: "Multi-AZ deployments, automated backups and disaster-recovery runbooks." },
    { icon: Eye, t: "Privacy by design", d: "Recipients control what is shared; verifiers see only what they need." },
    { icon: GitBranch, t: "Auditable trail", d: "Every issuance, revocation and verification is logged and exportable." },
  ];
  const compliance = ["GDPR", "UK GDPR", "SOC 2 (in progress)", "ISO 27001 (roadmap)", "CCPA", "WCAG 2.1 AA"];
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-glow)" }} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-20 pb-12 sm:pt-28">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">Security &amp; Trust</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Built so credentials can be <span className="gradient-text">trusted at a glance.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            CERTIGO. is the verification backbone for global hiring. Security is not a feature — it is the product. Here is exactly how we protect your issuers, recipients and verifiers.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, ...p }) => (
            <div key={p.t} className="rounded-xl border border-border bg-card p-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg gradient-hero text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-display text-base font-bold">{p.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">Compliance</div>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Aligned with the standards your legal team already knows.
              </h2>
              <p className="mt-3 text-muted-foreground">
                We publish a Data Processing Agreement, sub-processor list and a security overview on request. Enterprise customers receive quarterly compliance updates.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {compliance.map((c) => (
                  <div key={c} className="rounded-lg border border-border bg-surface p-4 text-center">
                    <ShieldCheck className="mx-auto h-4 w-4 text-[var(--primary)]" />
                    <div className="mt-2 text-xs font-semibold">{c}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
        <div className="rounded-3xl gradient-hero p-10 text-white shadow-glow sm:p-14">
          <div className="grid items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">Talk to security</div>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-4xl">
                Need our DPA, sub-processors or a vendor questionnaire?
              </h2>
              <p className="mt-3 max-w-xl text-white/85">
                Our security team will respond within one business day with the documents your procurement process needs.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button size="lg" className="h-12 bg-white text-[var(--primary)] hover:bg-white/90" onClick={() => nav({ to: "/contact" })}>
                Request documentation <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 border-white/40 bg-transparent text-white hover:bg-white/10" onClick={() => nav({ to: "/verify" })}>
                Verify a credential
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}