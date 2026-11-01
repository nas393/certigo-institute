import { createFileRoute } from "@tanstack/react-router";
import { LEGAL_EMAIL } from "@/lib/site-config";
import { ContactLine } from "@/components/ContactLine";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — CERTIGO." },
      { name: "description", content: "Terms governing the use of CERTIGO. credential infrastructure." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <article className="mx-auto max-w-3xl px-5 sm:px-8 py-20">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">Legal</div>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <Section title="1. Acceptance">By using CERTIGO. you agree to these terms. If you use CERTIGO. on behalf of an organisation, you represent you are authorised to bind that organisation.</Section>
        <Section title="2. Service">CERTIGO. provides infrastructure to issue, share and verify digital credentials. Availability targets are described in your order form or default to 99.9%.</Section>
        <Section title="3. Customer responsibilities">You are responsible for the accuracy of credential data you issue and for keeping credentials lawful in your jurisdiction.</Section>
        <Section title="4. Acceptable use">You may not issue credentials that are fraudulent, misleading, or that infringe third-party rights. We may suspend accounts that violate these rules.</Section>
        <Section title="5. Fees">Fees are set out in your subscription. Enterprise pricing is governed by a signed order form.</Section>
        <Section title="6. Liability">To the maximum extent permitted by law, our aggregate liability is limited to fees paid in the 12 months preceding the claim.</Section>
        <Section title="7. Term &amp; termination">Either party may terminate for material breach with 30 days' notice. Credential verification URLs remain available for the credential lifetime where commercially reasonable.</Section>
        <Section title="8. Governing law">These terms are governed by the laws applicable at the registered seat of CERTIGO. Institute.</Section>
        <Section title="9. Contact"><ContactLine email={LEGAL_EMAIL} /></Section>
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