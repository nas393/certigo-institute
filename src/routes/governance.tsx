import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";
import { ShieldCheck, Lock, FileCheck2, AlertTriangle, GitBranch, Database, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "Credential Governance Framework — CERTIGO." },
      { name: "description", content: "Issuance, verification, fraud prevention, data integrity and credential lifecycle policies that power the CERTIGO. trust layer." },
      { property: "og:title", content: "Credential Governance Framework — CERTIGO." },
      { property: "og:description", content: "The operating rules behind the CERTIGO. credential infrastructure." },
    ],
  }),
  component: Governance,
});

function Governance() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-glow)" }} />
        <div className="mx-auto max-w-5xl px-5 sm:px-8 pt-20 pb-12 sm:pt-28">
          <div className="micro-label">◆ Trust layer · Operating framework</div>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Credential Governance Framework
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            The system rules that govern how credentials are issued, verified, protected and retired across the CERTIGO. global registry.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 sm:px-8 pb-16 space-y-6">
        {SECTIONS.map((s) => (
          <article key={s.t} className="rounded-2xl border border-border bg-card p-7">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg gradient-hero text-white shadow-glow">
                <s.icon className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-extrabold">{s.t}</h2>
            </div>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {s.items.map((it) => (
                <li key={it} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground/85">
                  {it}
                </li>
              ))}
            </ul>
          </article>
        ))}

        <article className="rounded-2xl border border-border bg-card p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg gradient-hero text-white shadow-glow">
              <GitBranch className="h-5 w-5" />
            </span>
            <h2 className="font-display text-xl font-extrabold">Lifecycle of a credential</h2>
          </div>
          <ol className="mt-6 grid gap-3 sm:grid-cols-4">
            {["Issued", "Active", "Verified", "Archived"].map((step, i) => (
              <li key={step} className="rounded-xl border border-border bg-surface p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--primary)]">Stage {i + 1}</div>
                <div className="mt-2 font-display text-base font-extrabold">{step}</div>
              </li>
            ))}
          </ol>
        </article>

        <div className="flex flex-wrap gap-3 pt-4">
          <Link to="/verify" className="inline-flex items-center gap-2 rounded-full gradient-hero px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:opacity-95">
            Verify a credential <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/security" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold">
            Review security model
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}

const SECTIONS = [
  {
    t: "Issuance rules",
    icon: FileCheck2,
    items: [
      "Only verified issuer organizations can mint credentials",
      "Each credential gets a unique, namespaced serial",
      "Issuance events are signed and timestamped",
      "Recipient identity is bound at the moment of issuance",
    ],
  },
  {
    t: "Verification rules",
    icon: ShieldCheck,
    items: [
      "Public registry lookups by credential ID, serial or QR",
      "Verification responses include issuer, recipient, status",
      "Sub-second response from any region",
      "Tamper status surfaced on every response",
    ],
  },
  {
    t: "Fraud prevention logic",
    icon: AlertTriangle,
    items: [
      "Hash-anchored credential records",
      "Issuer namespace isolation prevents impersonation",
      "Suspicious issuance patterns flagged automatically",
      "Revocation propagates instantly to all verifiers",
    ],
  },
  {
    t: "Data integrity model",
    icon: Database,
    items: [
      "Append-only credential ledger",
      "Every mutation produces a new signed event",
      "Encryption at rest and in transit",
      "RLS-enforced access for all sensitive operations",
    ],
  },
  {
    t: "Access & key controls",
    icon: Lock,
    items: [
      "Issuer keys scoped per organization",
      "Role-based controls for admins, issuers and viewers",
      "Audit log of every administrative action",
      "Rotatable verification endpoints with no client secrets",
    ],
  },
] as const;