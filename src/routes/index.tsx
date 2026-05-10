import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, ShieldCheck, QrCode, Send, Wallet, Search, Building2, GraduationCap, User,
  Lock, Sparkles, Globe, Zap, CheckCircle2, ArrowUpRight, BadgeCheck, Activity,
  BookOpen, Briefcase, Users, Truck, LineChart, Scale, Wrench, Shield, Brain, Megaphone,
} from "lucide-react";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CERTIGO. — Skills you can trust. Credentials you can verify. Instantly." },
      { name: "description", content: "CERTIGO. is the global infrastructure for issuing, sharing and verifying digital credentials in seconds. Built for training providers, companies and global talent." },
      { property: "og:title", content: "CERTIGO. — Verifiable credentials infrastructure" },
      { property: "og:description", content: "Issue, share and verify tamper-proof digital credentials in seconds." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <SocialProof />
      <Problem />
      <HowItWorks />
      <ProductShowcase />
      <Audiences />
      <Pricing />
      <Security />
      <Courses />
      <UseCase />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ─────────────────────────── HERO ─────────────────────────── */
function Hero() {
  const nav = useNavigate();
  const [credId, setCredId] = useState("");
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 gradient-glow" style={{ background: "var(--gradient-glow)" }} />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Verifiable credentials infrastructure
            </div>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Skills you can trust.<br />
              Credentials you can <span className="gradient-text">verify. Instantly.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              CERTIGO. is the global infrastructure for issuing, sharing and verifying digital credentials in seconds.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="gradient-hero text-white border-0 hover:opacity-95 h-12 px-6 text-sm font-semibold shadow-glow"
                onClick={() => nav({ to: "/auth" })}
              >
                Start issuing certificates <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 text-sm font-semibold"
                onClick={() => nav({ to: "/verify" })}
              >
                Verify a credential
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Built for training providers, companies and global talent.
            </p>
          </div>

          {/* Live verify card */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 gradient-hero opacity-20 blur-3xl rounded-[40px]" />
            <div className="frame-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Live verification
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">certigo.institute/verify</span>
              </div>
              <div className="p-6 sm:p-8">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Credential ID
                </label>
                <div className="mt-2 flex gap-2">
                  <Input
                    value={credId}
                    onChange={(e) => setCredId(e.target.value)}
                    placeholder="KR-2026-XXXX-XX"
                    className="h-12 text-sm"
                  />
                  <Button
                    className="h-12 gradient-hero text-white border-0"
                    onClick={() => nav({ to: "/verify/$id", params: { id: credId || "demo" } })}
                  >
                    Verify now <Search className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-7 grid grid-cols-3 gap-3 text-center">
                  {[
                    { icon: ShieldCheck, label: "Tamper-proof" },
                    { icon: QrCode, label: "QR-verified" },
                    { icon: Globe, label: "Global" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="rounded-lg border border-border bg-surface p-3">
                      <Icon className="mx-auto h-4 w-4 text-[var(--primary)]" />
                      <div className="mt-1.5 text-[11px] font-medium text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg bg-surface-muted p-4">
                  <div className="flex items-center gap-2 text-xs">
                    <BadgeCheck className="h-4 w-4 text-[var(--accent)]" />
                    <span className="font-semibold">Demo result</span>
                    <span className="text-muted-foreground">— Maria Hernández · Advanced AI Workflows · ✓ Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── SOCIAL PROOF ─────────────────────────── */
function SocialProof() {
  const items = [
    "Early adopters onboarding worldwide",
    "First issuing partners live",
    "Verification requests growing weekly",
    "Built for global scalability",
  ];
  return (
    <section className="border-y border-border bg-surface py-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 text-xs font-medium text-muted-foreground sm:px-8">
        {items.map((it, i) => (
          <span key={it} className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent)]" />
            {it}
            {i < items.length - 1 && <span className="ml-2 hidden h-3 w-px bg-border sm:inline-block" />}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────── PROBLEM ─────────────────────────── */
function Problem() {
  const points = [
    { t: "Degrees take years", d: "Credentials lag behind the labour market by half a decade." },
    { t: "Skills evolve monthly", d: "What was advanced last year is baseline today." },
    { t: "CVs are unverifiable", d: "Self-reported claims slow every hiring decision." },
    { t: "Recruiters waste hours", d: "Manual reference checks scale poorly across borders." },
  ];
  return (
    <Section eyebrow="The trust gap" title="Hiring is broken. Credentials are outdated.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((p) => (
          <div key={p.t} className="rounded-xl border border-border bg-card p-6">
            <div className="font-display text-base font-bold">{p.t}</div>
            <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-2xl gradient-hero p-8 text-center text-white shadow-glow">
        <div className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          CERTIGO. fixes the trust gap.
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────── HOW IT WORKS ─────────────────────────── */
function HowItWorks() {
  const steps = [
    { icon: Send,       n: "01", t: "Issue",   d: "Create and send certificates in bulk in minutes." },
    { icon: Lock,       n: "02", t: "Secure",  d: "Each credential is encrypted and tamper-proof." },
    { icon: Wallet,     n: "03", t: "Share",   d: "Recipients receive a global credential wallet." },
    { icon: BadgeCheck, n: "04", t: "Verify",  d: "Employers verify instantly via link or QR." },
  ];
  return (
    <Section eyebrow="How it works" title="Four steps from skill to verified proof.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, ...s }) => (
          <div key={s.n} className="group relative rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-card">
            <div className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">{s.n}</div>
            <div className="mt-4 grid h-10 w-10 place-items-center rounded-lg gradient-hero text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-4 font-display text-lg font-bold">{s.t}</div>
            <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────────────── PRODUCT SHOWCASE ─────────────────────────── */
function ProductShowcase() {
  return (
    <Section eyebrow="Product" title="One platform. Three surfaces.">
      <div className="grid gap-6 lg:grid-cols-3">
        <ShowcaseCard
          chip="Issuer Dashboard"
          title="Bulk issuance, in minutes."
          desc="Upload a CSV, design once, issue thousands. Track every recipient and verification."
        >
          <DashboardMock />
        </ShowcaseCard>
        <ShowcaseCard
          chip="Credential Wallet"
          title="A global skills passport."
          desc="Recipients store credentials forever and share them with a single link or QR."
        >
          <WalletMock />
        </ShowcaseCard>
        <ShowcaseCard
          chip="Verification Page"
          title="Instant authenticity."
          desc="Employers see a verified badge, issuer details and tamper status — no logins."
        >
          <VerifyMock />
        </ShowcaseCard>
      </div>
    </Section>
  );
}

function ShowcaseCard({ chip, title, desc, children }: { chip: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="frame-card overflow-hidden">
      <div className="border-b border-border bg-surface px-5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--primary)]">{chip}</span>
      </div>
      <div className="p-5">
        <div className="font-display text-lg font-bold">{title}</div>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-border" />
        </div>
        <Activity className="h-3 w-3 text-muted-foreground" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { l: "Issued", v: "12,480" },
          { l: "Verified", v: "84,200" },
          { l: "Active", v: "1,940" },
        ].map((s) => (
          <div key={s.l} className="rounded bg-card p-2">
            <div className="text-[10px] text-muted-foreground">{s.l}</div>
            <div className="mt-1 font-display text-sm font-bold">{s.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {["Acme Bootcamp · 124 issued", "Northwind HR · 38 verified", "Globex Learning · 412 issued"].map((r) => (
          <div key={r} className="flex items-center justify-between rounded bg-card px-2 py-1.5 text-[11px]">
            <span>{r}</span><BadgeCheck className="h-3 w-3 text-[var(--accent)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function WalletMock() {
  return (
    <div className="space-y-2">
      {[
        { t: "Advanced AI Workflows", i: "Acme Bootcamp" },
        { t: "Cybersecurity Foundations", i: "Northwind Academy" },
      ].map((c) => (
        <div key={c.t} className="rounded-lg border border-border bg-surface p-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{c.i}</div>
              <div className="mt-1 font-display text-sm font-bold">{c.t}</div>
            </div>
            <div className="grid h-8 w-8 place-items-center rounded gradient-hero text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Issued 2026 · valid 2 yrs</span>
            <span className="inline-flex items-center gap-1 text-[var(--accent)]"><BadgeCheck className="h-3 w-3" /> Verified</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function VerifyMock() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full gradient-hero text-white shadow-glow">
        <BadgeCheck className="h-6 w-6" />
      </div>
      <div className="mt-3 font-display text-base font-bold">Verified credential</div>
      <div className="text-[11px] text-muted-foreground">KR-2026-A4FX-92</div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-left text-[11px]">
        <div className="rounded bg-card p-2">
          <div className="text-muted-foreground">Recipient</div>
          <div className="font-semibold">Maria Hernández</div>
        </div>
        <div className="rounded bg-card p-2">
          <div className="text-muted-foreground">Issuer</div>
          <div className="font-semibold">Acme Bootcamp</div>
        </div>
      </div>
      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2 py-1 text-[10px] font-semibold text-[var(--primary)]">
        <Lock className="h-3 w-3" /> Tamper-proof
      </div>
    </div>
  );
}

/* ─────────────────────────── AUDIENCES ─────────────────────────── */
function Audiences() {
  const cards = [
    { icon: GraduationCap, who: "For Training Providers", h: "Issue thousands of certificates in one click.",
      d: "Whitelabeled certificates, bulk issuance from CSV or API, full recipient analytics." },
    { icon: Building2, who: "For Companies",
      h: "Verify candidates instantly and reduce hiring risk.",
      d: "Bulk verification, ATS integration, anti-fraud checks, audit trail for every claim." },
    { icon: User, who: "For Learners",
      h: "Own a portable global skills passport.",
      d: "Lifetime credential wallet, one-link sharing, beautifully designed certificates." },
  ];
  return (
    <Section eyebrow="Built for" title="Three audiences. One source of truth." muted>
      <div className="grid gap-5 lg:grid-cols-3">
        {cards.map(({ icon: Icon, ...c }) => (
          <div key={c.who} className="rounded-xl border border-border bg-card p-7">
            <div className="grid h-10 w-10 place-items-center rounded-lg gradient-hero text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{c.who}</div>
            <div className="mt-2 font-display text-xl font-bold">{c.h}</div>
            <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────────────── PRICING ─────────────────────────── */
function Pricing() {
  const nav = useNavigate();
  const tiers = [
    { name: "Starter", price: "$29", per: "/month", desc: "For independent issuers getting started.",
      feats: ["Up to 100 certificates / mo", "Basic verification page", "Email support"], cta: "Start free trial", highlight: false },
    { name: "Growth", price: "$99", per: "/month", desc: "For growing training providers.",
      feats: ["Unlimited bulk issuance", "Analytics & branding", "Priority support", "API access"], cta: "Start free trial", highlight: true },
    { name: "Enterprise", price: "Custom", per: "", desc: "For HR teams and global academies.",
      feats: ["SSO & SCIM", "Dedicated infrastructure", "Compliance & DPA", "24/7 SLA"], cta: "Talk to sales", highlight: false },
  ];
  return (
    <Section eyebrow="Pricing" title="Simple, scalable pricing.">
      <div className="grid gap-5 lg:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative rounded-2xl border p-7 ${
              t.highlight
                ? "border-transparent bg-card shadow-glow ring-2 ring-[var(--primary)]"
                : "border-border bg-card"
            }`}
          >
            {t.highlight && (
              <span className="absolute -top-3 left-7 rounded-full gradient-hero px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                Most popular
              </span>
            )}
            <div className="font-display text-base font-bold">{t.name}</div>
            <div className="mt-1 text-sm text-muted-foreground">{t.desc}</div>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-4xl font-extrabold">{t.price}</span>
              <span className="text-sm text-muted-foreground">{t.per}</span>
            </div>
            <ul className="mt-6 space-y-2.5">
              {t.feats.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className={`mt-7 w-full ${t.highlight ? "gradient-hero text-white border-0" : ""}`}
              variant={t.highlight ? "default" : "outline"}
              onClick={() => nav({ to: t.name === "Enterprise" ? "/contact" : "/auth" })}
            >
              {t.cta}
            </Button>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────────────── SECURITY ─────────────────────────── */
function Security() {
  const items = [
    { icon: Lock, t: "Encrypted credentials", d: "Every credential signed and encrypted end-to-end." },
    { icon: ShieldCheck, t: "Tamper-proof verification", d: "Cryptographic checks reject any altered certificate." },
    { icon: User, t: "Privacy-first architecture", d: "Recipients control what is shared and with whom." },
    { icon: Globe, t: "Global compliance ready", d: "GDPR, SOC 2 controls and regional data residency." },
  ];
  return (
    <Section eyebrow="Security" title="Built for trust and compliance." muted>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, ...i }) => (
          <div key={i.t} className="rounded-xl border border-border bg-card p-6">
            <Icon className="h-5 w-5 text-[var(--primary)]" />
            <div className="mt-4 font-display text-base font-bold">{i.t}</div>
            <p className="mt-1 text-sm text-muted-foreground">{i.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────────────── USE CASE ─────────────────────────── */
function UseCase() {
  return (
    <Section eyebrow="Use case" title="From cohort to verified, in one afternoon.">
      <div className="grid gap-8 rounded-2xl border border-border bg-card p-8 lg:grid-cols-[1.2fr_1fr] lg:p-12">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Bootcamp · 500-learner cohort</div>
          <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            500 verified credentials issued before lunch.
          </h3>
          <p className="mt-3 text-muted-foreground">
            A coding academy migrated from PDFs to CERTIGO. Their team now issues an entire cohort in a single CSV upload — and recruiters verify each graduate in under three seconds.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {["CSV bulk issuance", "QR + link sharing", "ATS-ready verification"].map((c) => (
              <span key={c} className="rounded-full border border-border bg-surface px-3 py-1 font-medium text-muted-foreground">{c}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Stat big="500" label="certificates issued" />
          <Stat big="–90%" label="verification time" />
          <Stat big="3s" label="avg. verify latency" />
          <Stat big="100%" label="tamper detection" />
        </div>
      </div>
    </Section>
  );
}

function Stat({ big, label }: { big: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="font-display text-3xl font-extrabold gradient-text">{big}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

/* ─────────────────────────── FINAL CTA ─────────────────────────── */
function FinalCTA() {
  const nav = useNavigate();
  return (
    <section className="px-5 sm:px-8">
      <div className="mx-auto mt-20 max-w-7xl overflow-hidden rounded-3xl gradient-hero p-10 text-white shadow-glow sm:p-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">Get started</div>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Start issuing trusted credentials today.
            </h2>
            <p className="mt-4 max-w-xl text-white/85">
              Join the platform building the global infrastructure for verifiable skills.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button size="lg" className="h-12 bg-white text-[var(--primary)] hover:bg-white/90" onClick={() => nav({ to: "/auth" })}>
              Start free trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 border-white/40 bg-transparent text-white hover:bg-white/10" onClick={() => nav({ to: "/contact" })}>
              Book a demo <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── SECTION SHELL ─────────────────────────── */
function Section({
  eyebrow, title, children, muted = false,
}: { eyebrow: string; title: string; children: React.ReactNode; muted?: boolean }) {
  return (
    <section className={muted ? "bg-surface" : ""}>
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="mb-12 max-w-3xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">
            <Sparkles className="mr-1.5 inline h-3 w-3" /> {eyebrow}
          </div>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}
