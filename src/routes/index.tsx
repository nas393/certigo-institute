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
import { setPendingCertification } from "@/lib/certigo-pending";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { chapters as chapterStrings, catalog as catalogStrings } from "@/lib/i18n-chapters";

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
      <TrustStrip />
      <LiveDemo />
      <HowVerification />
      <WhoItsFor />
      <WhoBuilt />
      <EnterpriseSecurity />
      <Chapters />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ─────────────────────────── COLLAPSIBLE CHAPTERS ─────────────────────────── */
function Chapters() {
  const { lang, dir } = useI18n();
  const s = chapterStrings(lang);
  const chapters: { id: string; chapter: string; title: string; node: React.ReactNode }[] = [
    { id: "ch-1", chapter: s.chapter1, title: s.chapter1_title, node: <Problem /> },
    { id: "ch-2", chapter: s.chapter2, title: s.chapter2_title, node: <HowItWorks /> },
    { id: "ch-3", chapter: s.chapter3, title: s.chapter3_title, node: <ProductShowcase /> },
    { id: "ch-4", chapter: s.chapter4, title: s.chapter4_title, node: <Audiences /> },
    { id: "ch-5", chapter: s.chapter5, title: s.chapter5_title, node: <Pricing /> },
    { id: "ch-6", chapter: s.chapter6, title: s.chapter6_title, node: <Security /> },
    { id: "ch-7", chapter: s.chapter7, title: s.chapter7_title, node: <UseCase /> },
    { id: "ch-8", chapter: s.chapter8, title: s.chapter8_title, node: <Courses /> },
    { id: "ch-9", chapter: s.chapter9, title: s.chapter9_title, node: <CertificationCatalog /> },
  ];
  return (
    <section className="bg-background" dir={dir}>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
        <Accordion type="multiple" defaultValue={chapters.map((c) => c.id)} className="space-y-4">
          {chapters.map((c) => (
            <AccordionItem
              key={c.id}
              value={c.id}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <AccordionTrigger className="px-6 py-5 hover:no-underline sm:px-8">
                <div className="flex w-full items-center gap-4 text-left">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--primary)]">
                    {c.chapter}
                  </span>
                  <span className="hidden h-3 w-px bg-border sm:inline-block" />
                  <span className="font-display text-base font-extrabold tracking-tight sm:text-lg">
                    {c.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t border-border p-0">
                {c.node}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ─────────────────────────── CHAPTER IX — CERTIFICATION CATALOG ─────────────────────────── */
function CertificationCatalog() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { lang, dir } = useI18n();
  const cs = catalogStrings(lang);
  const certs = COURSES.map((c) => ({
    code: c.code,
    icon: c.icon,
    title: cs.cert[c.code] ?? c.title,
    subtitle: c.intro,
    duration: c.duration,
    level: c.level,
    outcomes: c.outcomes,
    modules: c.modules,
  }));
  const startCertification = (c: (typeof certs)[number]) => {
    const lvl = (c.level || "").toLowerCase();
    const level: "foundational" | "intermediate" | "advanced" =
      lvl.startsWith("found") ? "foundational"
        : lvl.startsWith("adv") ? "advanced"
          : "intermediate";
    setPendingCertification({
      code: c.code,
      topic: c.title,
      level,
      outline: c.modules.map((m) => m.t),
      competencies: c.outcomes,
    });
    // Send unauth users to /auth (which then bounces to /dashboard);
    // signed-in users skip auth and prefill the dashboard generator directly.
    nav({ to: user ? "/dashboard" : "/auth" });
  };
  return (
    <div dir={dir}>
    <Section eyebrow={cs.eyebrow} title={cs.title}>
      <p className="-mt-6 mb-10 max-w-2xl text-muted-foreground">
        {cs.subtitle}
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {certs.map((c) => {
          const Icon = c.icon;
          const topComps = (c.outcomes ?? []).slice(0, 3);
          return (
            <div
              key={c.code}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-lg gradient-hero text-white shadow-glow">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {c.code}
                </span>
              </div>
              <div className="mt-5 font-display text-base font-extrabold leading-snug">
                {c.title}
              </div>
              <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{c.subtitle}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {c.duration}
                </span>
                <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {c.level}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)]">
                  <BadgeCheck className="h-3 w-3" /> {cs.quizReady}
                </span>
              </div>
              {topComps.length > 0 && (
                <div className="mt-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--primary)]">
                    {cs.competencies}
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {topComps.map((o) => (
                      <li key={o} className="flex items-start gap-1.5 text-[11px] leading-snug text-foreground/80">
                        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[var(--accent)]" />
                        <span className="line-clamp-2">{o}</span>
                      </li>
                    ))}
                  </ul>
              </div>
              )}
              <div className="mt-auto pt-5">
                <Button
                  size="sm"
                  className="w-full gradient-hero text-white border-0 hover:opacity-95"
                  onClick={() => startCertification(c)}
                >
                  {cs.start} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
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
              Credential Governance Platform
            </div>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Credential infrastructure for the <span className="gradient-text">modern workforce.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Issue, manage and verify professional credentials with enterprise-grade governance and global verification.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="gradient-hero text-white border-0 hover:opacity-95 h-12 px-6 text-sm font-semibold shadow-glow"
                onClick={() => nav({ to: "/auth" })}
              >
                Start issuing credentials <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 text-sm font-semibold"
                onClick={() => nav({ to: "/u/$handle", params: { handle: "demo-professional" } })}
              >
                View live demo credential
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Used by training providers and corporate HR teams worldwide.
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

/* ─────────────────────────── TRUST STRIP ─────────────────────────── */
function TrustStrip() {
  const items = [
    { icon: Globe, t: "Instant global verification" },
    { icon: User, t: "Public credential profiles" },
    { icon: QrCode, t: "Secure credential IDs & QR validation" },
    { icon: Building2, t: "Built for training providers & HR teams" },
  ];
  return (
    <section className="border-y border-border bg-surface py-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 sm:grid-cols-4 sm:px-8">
        {items.map(({ icon: Icon, t }) => (
          <div key={t} className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-[var(--primary)]">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-xs font-medium text-foreground/85 sm:text-sm">{t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────── LIVE DEMO ─────────────────────────── */
const DEMO_CERTS = [
  { id: "CERT-DM-1024", title: "Digital Marketing Fundamentals", issued: "March 2026" },
  { id: "CERT-PM-2048", title: "Project Management Essentials", issued: "April 2026" },
  { id: "CERT-LC-4096", title: "Leadership & Communication", issued: "May 2026" },
];

function LiveDemo() {
  const nav = useNavigate();
  return (
    <Section eyebrow="Live demonstration" title="See how verification works.">
      <p className="-mt-6 mb-10 max-w-2xl text-muted-foreground">
        A real public learner profile, issued by CERTIGO Academy. Open any credential, verify it instantly,
        and experience exactly what employers see.
      </p>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border border-border bg-card p-7">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--primary)]">Public profile</div>
          <div className="mt-4 flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full gradient-hero font-display text-lg font-extrabold text-white">
              DP
            </div>
            <div>
              <div className="font-display text-lg font-extrabold">Demo Professional</div>
              <div className="text-xs text-muted-foreground">certigo.institute/u/demo-professional</div>
            </div>
          </div>
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--primary)]">
            <BadgeCheck className="h-3 w-3" /> Publicly verifiable identity
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-border bg-surface p-2">
              <div className="font-display text-base font-extrabold">3</div>
              <div className="text-[10px] text-muted-foreground">Credentials</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-2">
              <div className="font-display text-base font-extrabold">100%</div>
              <div className="text-[10px] text-muted-foreground">Verifiable</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-2">
              <div className="font-display text-base font-extrabold">Live</div>
              <div className="text-[10px] text-muted-foreground">Status</div>
            </div>
          </div>
          <Button
            className="mt-6 w-full gradient-hero text-white border-0"
            onClick={() => nav({ to: "/verify" })}
          >
            Open demo profile <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          {DEMO_CERTS.map((c) => (
            <div key={c.id} className="frame-card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Issued by CERTIGO Academy · {c.issued}
                  </div>
                  <div className="mt-2 font-display text-base font-extrabold sm:text-lg">{c.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Credential ID · {c.id}</div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2 py-1 text-[10px] font-semibold text-[var(--primary)]">
                  <ShieldCheck className="h-3 w-3" /> Publicly verifiable
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => nav({ to: "/verify/$id", params: { id: c.id } })}
                >
                  View certificate
                </Button>
                <Button
                  size="sm"
                  className="gradient-hero text-white border-0"
                  onClick={() => nav({ to: "/verify/$id", params: { id: c.id } })}
                >
                  Verify credential <Search className="ml-2 h-3.5 w-3.5" />
                </Button>
                <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[10px] font-mono text-muted-foreground">
                  <QrCode className="h-3 w-3" /> QR ready
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────── HOW VERIFICATION WORKS ─────────────────────────── */
function HowVerification() {
  const steps = [
    { n: "01", t: "Organization issues credential", d: "An accredited issuer creates the record from their dashboard or API." },
    { n: "02", t: "Unique credential ID generated", d: "Every credential gets a permanent, tamper-resistant identifier." },
    { n: "03", t: "Public verification page created", d: "A shareable page is published the moment the credential is issued." },
    { n: "04", t: "QR code linked to credential record", d: "Print or embed the QR — it always points to the live record." },
    { n: "05", t: "Anyone can verify instantly worldwide", d: "Recruiters and partners verify in under three seconds." },
  ];
  return (
    <Section eyebrow="Verification engine" title="Built for instant global verification." muted>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((s) => (
          <div key={s.n} className="rounded-xl border border-border bg-card p-5">
            <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--primary)]">{s.n}</div>
            <div className="mt-3 font-display text-sm font-extrabold leading-snug">{s.t}</div>
            <p className="mt-2 text-xs text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center font-display text-lg font-bold text-foreground/90 sm:text-xl">
        No PDFs. No emails. No manual verification.
      </p>
    </Section>
  );
}

/* ─────────────────────────── WHO IT'S FOR ─────────────────────────── */
function WhoItsFor() {
  const cards = [
    { icon: GraduationCap, who: "Training Providers", d: "Issue premium certificates and track alumni." },
    { icon: Building2, who: "Corporate HR Teams", d: "Recognize employee skills and internal training." },
    { icon: User, who: "Professionals", d: "Build a public, verifiable credential profile." },
  ];
  return (
    <Section eyebrow="Who it's for" title="One platform. Three audiences. One source of truth.">
      <div className="grid gap-5 lg:grid-cols-3">
        {cards.map(({ icon: Icon, who, d }) => (
          <div key={who} className="rounded-2xl border border-border bg-card p-7">
            <div className="grid h-10 w-10 place-items-center rounded-lg gradient-hero text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-5 font-display text-lg font-extrabold">{who}</div>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────────────── WHO BUILT CERTIGO ─────────────────────────── */
function WhoBuilt() {
  return (
    <Section eyebrow="Who built CERTIGO" title="Built by experienced corporate leaders." muted>
      <div className="grid gap-8 rounded-2xl border border-border bg-card p-8 lg:grid-cols-[1.3fr_1fr] lg:p-12">
        <div>
          <p className="text-base text-foreground/85 sm:text-lg">
            CERTIGO was created by senior professionals in Corporate HR, Talent Development and Marketing Strategy.
          </p>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            The founding team combines 20+ years of experience across multinational organizations and understands
            the real challenges of training credibility, workforce development and credential fraud.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { k: "20+ yrs", v: "Corporate HR" },
            { k: "Global", v: "Multinationals" },
            { k: "L&D", v: "Talent strategy" },
          ].map((x) => (
            <div key={x.v} className="rounded-xl border border-border bg-surface p-4 text-center">
              <div className="font-display text-base font-extrabold gradient-text">{x.k}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{x.v}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────── ENTERPRISE SECURITY ─────────────────────────── */
function EnterpriseSecurity() {
  const items = [
    { icon: Lock, t: "Permanent public credential URLs" },
    { icon: ShieldCheck, t: "Tamper-resistant credential records" },
    { icon: Scale, t: "GDPR-ready architecture" },
    { icon: Globe, t: "Cloud-hosted global infrastructure" },
  ];
  const live = [
    "Live platform demonstration",
    "Public demo credentials available",
    "Open verification engine active",
  ];
  return (
    <Section eyebrow="Enterprise trust" title="Enterprise-grade credential security.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, t }) => (
          <div key={t} className="rounded-xl border border-border bg-card p-6">
            <Icon className="h-5 w-5 text-[var(--primary)]" />
            <div className="mt-4 font-display text-sm font-extrabold leading-snug">{t}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {live.map((l) => (
          <div key={l} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs font-medium text-foreground/85">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            {l}
          </div>
        ))}
      </div>
    </Section>
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

/* ─────────────────────────── COURSES ─────────────────────────── */
type Course = {
  icon: React.ComponentType<{ className?: string }>;
  code: string;
  title: string;
  duration: string;
  level: string;
  intro: string;
  outcomes: string[];
  modules: { t: string; d: string }[];
};

const COURSES: Course[] = [
  {
    icon: Briefcase, code: "PM-101", title: "Project Management", duration: "12 weeks · 60h", level: "Intermediate",
    intro: "Plan, execute and close complex projects on time and on budget using Agile, Waterfall and hybrid frameworks.",
    outcomes: ["Build a project charter and WBS", "Run sprint and stage-gate cadences", "Manage budget, scope and risk", "Lead cross-functional delivery"],
    modules: [
      { t: "Foundations & lifecycles", d: "PMBOK 7, PRINCE2 essentials, hybrid delivery models." },
      { t: "Scope, schedule & cost", d: "WBS decomposition, critical path, earned-value management." },
      { t: "Risk & quality", d: "Probability/impact matrices, mitigation playbooks, ISO 9001 controls." },
      { t: "Agile & Scrum operations", d: "Backlog grooming, sprint planning, velocity & burn-down analytics." },
      { t: "Stakeholder & change management", d: "RACI, communication plans, ADKAR adoption." },
      { t: "Capstone", d: "Deliver a 6-week multi-team programme with measurable KPIs." },
    ],
  },
  {
    icon: Megaphone, code: "MK-110", title: "Marketing Foundations", duration: "10 weeks · 45h", level: "Foundational",
    intro: "Translate brand strategy into measurable demand across digital, content and lifecycle channels.",
    outcomes: ["Map a customer journey", "Run a full-funnel campaign", "Read GA4 and attribution models", "Brief creative and media partners"],
    modules: [
      { t: "Strategy & positioning", d: "JTBD, segmentation, value propositions, brand architecture." },
      { t: "SEO & content engines", d: "Topic clusters, technical SEO, editorial planning." },
      { t: "Performance media", d: "Meta, Google and LinkedIn auctions; bidding strategies and creative testing." },
      { t: "Lifecycle & CRM", d: "Email, push, in-product flows; segmentation in Braze/Customer.io." },
      { t: "Analytics & attribution", d: "GA4, MMM 101, incrementality testing." },
      { t: "Capstone", d: "Build and defend a 90-day GTM plan with budget and KPI tree." },
    ],
  },
  {
    icon: Users, code: "LD-200", title: "Leadership", duration: "8 weeks · 40h", level: "Advanced",
    intro: "Lead high-performing teams through ambiguity using evidence-based leadership models and modern coaching practices.",
    outcomes: ["Run effective 1:1s and feedback loops", "Set OKRs that ladder to strategy", "Coach for performance", "Lead through change and conflict"],
    modules: [
      { t: "Self-awareness & EQ", d: "Goleman's EQ, Hogan & DISC interpretation." },
      { t: "Operating cadence", d: "OKRs, weekly business reviews, decision logs." },
      { t: "Coaching & feedback", d: "GROW model, radical candor, situational leadership." },
      { t: "Conflict & negotiation", d: "Principled negotiation, mediation, difficult conversations." },
      { t: "Leading change", d: "Kotter's 8 steps, ADKAR, narrative-driven transformation." },
      { t: "Capstone", d: "180° feedback round and personal leadership manifesto." },
    ],
  },
  {
    icon: Truck, code: "SC-310", title: "Supply Chain & Logistics Management", duration: "12 weeks · 55h", level: "Intermediate",
    intro: "Design resilient, cost-efficient and sustainable supply chains across procurement, operations and distribution.",
    outcomes: ["Model end-to-end supply networks", "Run S&OP processes", "Apply Lean to logistics", "Mitigate geopolitical and ESG risk"],
    modules: [
      { t: "Network design", d: "Make-vs-buy, nearshoring, multi-echelon inventory." },
      { t: "Procurement & supplier risk", d: "Strategic sourcing, RFx, dual-sourcing playbooks." },
      { t: "Demand & inventory planning", d: "Forecasting (ARIMA, Croston), safety stock, S&OP." },
      { t: "Warehousing & distribution", d: "WMS/TMS, last-mile economics, omni-channel fulfilment." },
      { t: "Sustainability & compliance", d: "Scope 3 emissions, CBAM, modern slavery acts." },
      { t: "Capstone", d: "Resilience audit of a real-world supply network." },
    ],
  },
  {
    icon: Zap, code: "DT-410", title: "Digital Transformation Strategy", duration: "10 weeks · 50h", level: "Advanced",
    intro: "Lead enterprise transformations that pair customer-centric design with cloud, data and AI operating models.",
    outcomes: ["Build a transformation roadmap", "Quantify business cases", "Govern cloud & data programmes", "Embed AI responsibly"],
    modules: [
      { t: "Operating models", d: "Spotify, EDGE, product-led organisation design." },
      { t: "Cloud & platform strategy", d: "AWS/Azure/GCP fundamentals, FinOps, platform engineering." },
      { t: "Data & analytics maturity", d: "Lakehouse architecture, DAMA-DMBOK governance." },
      { t: "AI adoption", d: "Use-case discovery, MLOps, model risk management." },
      { t: "Change & adoption", d: "Adoption metrics, value-realisation tracking." },
      { t: "Capstone", d: "Board-ready transformation business case." },
    ],
  },
  {
    icon: User, code: "HR-220", title: "Human Resources & Talent Strategy", duration: "10 weeks · 45h", level: "Intermediate",
    intro: "Design talent systems that attract, grow and retain high-impact employees in modern hybrid organisations.",
    outcomes: ["Build a workforce plan", "Design competency frameworks", "Run inclusive hiring", "Measure HR with people analytics"],
    modules: [
      { t: "Workforce planning", d: "Skills taxonomies, build/buy/borrow models." },
      { t: "Talent acquisition", d: "Structured interviewing, scorecards, DEI in hiring." },
      { t: "Performance & rewards", d: "Calibration, pay bands, total rewards design." },
      { t: "Learning & development", d: "70-20-10, capability academies, skills passports." },
      { t: "People analytics", d: "Engagement, attrition modelling, ONA basics." },
      { t: "Capstone", d: "12-month people strategy with KPI dashboard." },
    ],
  },
  {
    icon: Shield, code: "RC-330", title: "Risk Management & Global Compliance", duration: "12 weeks · 55h", level: "Advanced",
    intro: "Build enterprise risk and compliance programmes aligned with ISO 31000, COSO and global regulatory regimes.",
    outcomes: ["Run an enterprise risk assessment", "Operate a compliance management system", "Manage regulatory change", "Report to audit committees"],
    modules: [
      { t: "Risk frameworks", d: "ISO 31000, COSO ERM, three lines model." },
      { t: "Compliance programmes", d: "Policies, training, monitoring, attestations." },
      { t: "Financial crime", d: "AML, KYC, sanctions, anti-bribery (UKBA, FCPA)." },
      { t: "Operational & third-party risk", d: "Vendor due diligence, business continuity, ORM." },
      { t: "Regulatory change", d: "Horizon scanning, impact analysis, control mapping." },
      { t: "Capstone", d: "Board-level risk &amp; compliance report for a regulated business." },
    ],
  },
  {
    icon: LineChart, code: "FN-240", title: "Financial Intelligence for Managers", duration: "8 weeks · 35h", level: "Intermediate",
    intro: "Read, interpret and use financial statements to make sharper operating and people decisions. Complements Leadership and HR tracks.",
    outcomes: ["Read P&L, balance sheet and cash flow", "Build budgets and forecasts", "Evaluate investment decisions", "Speak the language of the CFO"],
    modules: [
      { t: "Accounting essentials", d: "Accruals vs cash, IFRS vs GAAP basics." },
      { t: "Reading the three statements", d: "How operating decisions move each line." },
      { t: "Budgeting & forecasting", d: "Driver-based budgets, rolling forecasts, variance analysis." },
      { t: "Capital allocation", d: "NPV, IRR, payback, hurdle rates." },
      { t: "Working capital & cash", d: "DSO, DPO, inventory turns, cash conversion cycle." },
      { t: "Capstone", d: "Defend a business case to a simulated executive committee." },
    ],
  },
  {
    icon: Wrench, code: "OE-340", title: "Operational Excellence & Lean Six Sigma", duration: "14 weeks · 70h", level: "Advanced",
    intro: "Apply Lean and Six Sigma to remove waste, reduce variation and build a continuous-improvement culture (Green Belt level).",
    outcomes: ["Lead DMAIC projects", "Use SPC and process capability tools", "Run kaizen events", "Quantify financial impact"],
    modules: [
      { t: "Define & measure", d: "Project charters, SIPOC, MSA, baseline capability." },
      { t: "Analyse", d: "Hypothesis testing, regression, root-cause analysis." },
      { t: "Improve", d: "DOE, kaizen, poka-yoke, future-state value-stream maps." },
      { t: "Control", d: "SPC, control plans, sustaining gains." },
      { t: "Lean management system", d: "Daily management, leader standard work, gemba." },
      { t: "Capstone", d: "Deliver a Green-Belt project with audited savings." },
    ],
  },
  {
    icon: Brain, code: "CS-350", title: "Data Privacy & Cybersecurity Governance", duration: "10 weeks · 45h", level: "Advanced",
    intro: "Govern data privacy and cybersecurity programmes across NIST CSF, ISO 27001 and global privacy laws (GDPR, CCPA, LGPD).",
    outcomes: ["Run a privacy impact assessment", "Operate an ISMS aligned to ISO 27001", "Manage incident response", "Brief boards on cyber risk"],
    modules: [
      { t: "Privacy law landscape", d: "GDPR, UK GDPR, CCPA/CPRA, LGPD, sectoral US laws." },
      { t: "Privacy by design", d: "DPIA, ROPA, data minimisation, retention." },
      { t: "Security frameworks", d: "NIST CSF 2.0, ISO 27001:2022, CIS Controls v8." },
      { t: "Identity & access", d: "Zero trust, IAM, PAM, SSO/SCIM." },
      { t: "Incident response & resilience", d: "NIST 800-61, tabletop exercises, breach notification." },
      { t: "Capstone", d: "Build a 12-month privacy &amp; security governance roadmap." },
    ],
  },
];

function Courses() {
  const nav = useNavigate();
  return (
    <Section eyebrow="Common courses" title="Ten flagship credentials. Audit-grade syllabuses." muted>
      <p className="-mt-6 mb-10 max-w-2xl text-muted-foreground">
        Every CERTIGO. credential ships with a public, examinable syllabus. Expand any course to see modules, outcomes and assessment depth.
      </p>
      <div className="rounded-2xl border border-border bg-card p-2 sm:p-4">
        <Accordion type="single" collapsible className="divide-y divide-border">
          {COURSES.map((c) => {
            const Icon = c.icon;
            return (
              <AccordionItem key={c.code} value={c.code} className="border-b-0">
                <AccordionTrigger className="px-3 py-5 hover:no-underline sm:px-4">
                  <div className="flex w-full items-center gap-4 text-left">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg gradient-hero text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{c.code}</span>
                        <span className="hidden h-3 w-px bg-border sm:inline-block" />
                        <span className="text-[11px] font-medium text-muted-foreground">{c.duration} · {c.level}</span>
                      </div>
                      <div className="mt-1 font-display text-base font-bold sm:text-lg">{c.title}</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-6 sm:px-4">
                  <div className="ml-0 grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:ml-14">
                    <div>
                      <p className="text-sm text-muted-foreground">{c.intro}</p>
                      <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--primary)]">Learning outcomes</div>
                      <ul className="mt-3 space-y-2">
                        {c.outcomes.map((o) => (
                          <li key={o} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                            <span>{o}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--primary)]">Syllabus</div>
                      <ol className="mt-3 space-y-3">
                        {c.modules.map((m, i) => (
                          <li key={m.t} className="rounded-lg border border-border bg-surface p-4">
                            <div className="flex items-start gap-3">
                              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-foreground text-[11px] font-bold text-background">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <div>
                                <div className="font-display text-sm font-bold">{m.t}</div>
                                <p className="mt-1 text-sm text-muted-foreground">{m.d}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ol>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button size="sm" className="gradient-hero text-white border-0 hover:opacity-95" onClick={() => nav({ to: "/auth" })}>
                          <BookOpen className="mr-2 h-4 w-4" /> Enrol
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => nav({ to: "/verify" })}>
                          See sample credential
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </Section>
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
