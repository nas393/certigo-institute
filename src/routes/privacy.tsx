import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — CERTIGO." },
      { name: "description", content: "How CERTIGO. collects, processes and protects personal data across issuers, recipients and verifiers." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <article className="mx-auto max-w-3xl px-5 sm:px-8 py-20 prose-invert">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">Legal</div>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <Section title="1. Who we are">
          CERTIGO. (“we”, “us”) is a credentials infrastructure operated by CERTIGO. Institute. We act as a data processor for credentials issued through our platform and as a data controller for our own marketing and account data.
        </Section>
        <Section title="2. Data we process">
          Account data (name, email, organisation), credential data submitted by issuers, verification logs (timestamp, credential ID, IP), and standard product telemetry.
        </Section>
        <Section title="3. Lawful basis">
          Performance of contract (account &amp; credential operations), legitimate interest (security &amp; fraud prevention) and consent (marketing communications).
        </Section>
        <Section title="4. Sub-processors">
          A current list of sub-processors is available on request. We notify customers in advance of material changes.
        </Section>
        <Section title="5. Your rights">
          You may request access, rectification, erasure, portability or restriction of processing at any time by emailing privacy@certigo.institute.
        </Section>
        <Section title="6. Retention">
          Credential records are retained for the lifetime of the credential to enable verification. Account data is retained while your account is active and for 12 months thereafter.
        </Section>
        <Section title="7. International transfers">
          We rely on Standard Contractual Clauses for transfers outside the EEA / UK and offer EU data residency on request.
        </Section>
        <Section title="8. Contact">
          privacy@certigo.institute
        </Section>
      </article>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </section>
  );
}