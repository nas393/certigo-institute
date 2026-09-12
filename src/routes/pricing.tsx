import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/money";
import { CheckCircle2, Building2, User, Sparkles, GraduationCap, Loader2 } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Credential Governance Plans — CERTIGO." },
      { name: "description", content: "Premium pricing for training providers, corporate HR teams, and individual professionals. USD pricing, global by default." },
      { property: "og:title", content: "Credential Governance Plans — CERTIGO." },
      { property: "og:description", content: "Enterprise-grade credential governance with transparent pricing." },
    ],
  }),
  component: PricingPage,
});

type Tier = {
  name: string;
  price: string;
  per?: string;
  desc?: string;
  feats: string[];
  cta: string;
  to: "/auth" | "/contact";
  highlight?: boolean;
};

// Pay-per-certificate pricing. Designed for two audiences:
// 1) Individual job seekers building a verified credential portfolio
// 2) HR, L&D and Academic teams issuing credentials in cohorts
const individualTiers: Tier[] = [
  { name: "Starter", price: "$0", desc: "Claim your verified profile — try a sample credential.",
    feats: ["1 sample credential", "Public verification page", "Shareable link & QR", "Lifetime access"],
    cta: "Create free profile", to: "/auth" },
  { name: "Career Pack", price: "$49", per: "one-time",
    desc: "5 verified certificates. Perfect for job seekers building a portfolio.",
    feats: [
      "5 verified certificates ($9.80 each)",
      "Premium certificate templates",
      "Public profile + custom URL",
      "LinkedIn-ready share kit",
      "Lifetime verification",
    ],
    cta: "Get Career Pack", to: "/auth", highlight: true },
  { name: "Pro Portfolio", price: "$89", per: "one-time",
    desc: "10 certificates + verified badge for serious career builders.",
    feats: [
      "10 verified certificates ($8.90 each)",
      "Verified Professional badge",
      "Featured in profile search",
      "Career analytics dashboard",
      "Priority support",
    ],
    cta: "Go Pro", to: "/auth" },
];

const teamTiers: Tier[] = [
  { name: "Team Starter", price: "$99", per: "one-time",
    desc: "12 credentials. Best for small HR or training pilots.",
    feats: [
      "12 verified credentials ($8.25 each)",
      "Team workspace (3 admins)",
      "Branded certificates",
      "Bulk issuance via CSV",
      "Verification pages",
    ],
    cta: "Start with Team", to: "/auth" },
  { name: "Team Growth", price: "$349", per: "one-time",
    desc: "50 credentials for HR, L&D and academic cohorts.",
    feats: [
      "50 verified credentials ($6.98 each)",
      "Team workspace (10 admins)",
      "Advanced branding & templates",
      "Cohort & program analytics",
      "Priority support",
    ],
    cta: "Choose Growth", to: "/auth", highlight: true },
  { name: "Team Scale", price: "$799", per: "one-time",
    desc: "150 credentials for academies and L&D departments at scale.",
    feats: [
      "150 verified credentials ($5.33 each)",
      "White-label certificates",
      "Custom verification domain",
      "API access & integrations",
      "Roles & permissions",
      "Dedicated onboarding",
    ],
    cta: "Choose Scale", to: "/auth" },
  { name: "Enterprise", price: "Custom",
    desc: "Unlimited issuance, SSO, DPA, SLA — for global rollouts.",
    feats: [
      "Volume pricing under $4 / credential",
      "SSO & SCIM",
      "HRIS / LMS integrations",
      "Procurement, DPA & regional residency",
      "Dedicated CSM",
    ],
    cta: "Contact sales", to: "/contact" },
];

function TierCard({ t }: { t: Tier }) {
  return (
    <div className={`relative flex h-full flex-col rounded-2xl border p-7 ${t.highlight ? "border-transparent bg-card shadow-glow ring-2 ring-[var(--primary)]" : "border-border bg-card"}`}>
      {t.highlight && (
        <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full gradient-hero px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
          <Sparkles className="h-3 w-3" /> Most popular
        </span>
      )}
      <div className="font-display text-base font-extrabold">{t.name}</div>
      {t.desc && <div className="mt-1 text-xs text-muted-foreground">{t.desc}</div>}
      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-display text-3xl font-extrabold sm:text-4xl">{t.price}</span>
        {t.per && <span className="text-sm text-muted-foreground">{t.per}</span>}
      </div>
      <ul className="mt-6 space-y-2.5">
        {t.feats.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />{f}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-7">
        <Link to={t.to as any}>
          <Button className={`w-full ${t.highlight ? "gradient-hero text-white border-0" : ""}`} variant={t.highlight ? "default" : "outline"}>
            {t.cta}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function TierBlock({ icon: Icon, eyebrow, title, subtitle, tiers, cols }: {
  icon: typeof Building2; eyebrow: string; title: string; subtitle: string; tiers: Tier[]; cols: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg gradient-hero text-white">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">{eyebrow}</div>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className={`mt-8 grid gap-5 ${cols}`}>
        {tiers.map((t) => <TierCard key={t.name} t={t} />)}
      </div>
    </section>
  );
}

type CoursePrice = { slug: string; title: string; category: string; price_cents: number };

function CoursePriceList() {
  const [rows, setRows] = useState<CoursePrice[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase
      .from("certifications")
      .select("slug, title, category, price_cents")
      .order("category")
      .order("title")
      .then(({ data }) => setRows((data ?? []) as CoursePrice[]));
  }, []);

  const needle = q.trim().toLowerCase();
  const shown = (rows ?? []).filter(
    (r) => !needle || r.title.toLowerCase().includes(needle) || r.category.toLowerCase().includes(needle),
  );

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg gradient-hero text-white">
          <GraduationCap className="h-5 w-5" />
        </span>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">Course prices</div>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Every course and what it costs.</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            One price per credential — the exam, the certificate, the transcript and lifetime verification included.
          </p>
        </div>
      </div>

      <div className="mt-6 max-w-sm">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses or categories" />
      </div>

      {!rows ? (
        <div className="mt-8 grid place-items-center"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((r) => (
            <Link
              key={r.slug}
              to="/c/$slug"
              params={{ slug: r.slug }}
              className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">◆ {r.category}</div>
                <div className="mt-1 font-display text-base font-extrabold leading-snug">{r.title}</div>
              </div>
              <div className="shrink-0 font-display text-lg font-black tracking-tighter">{formatPrice(r.price_cents)}</div>
            </Link>
          ))}
          {shown.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
              No course matches “{q}”.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-20 pb-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">Pricing</div>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Pay per certificate. Verified for life.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Simple, transparent USD pricing. Buy credentials in packs — no subscription required.
          Recipients verify for free, forever.
        </p>
      </section>

      <TierBlock icon={User} eyebrow="For Individuals"
        title="Job seekers & professionals."
        subtitle="Build a verified credential portfolio recruiters can trust at a glance."
        tiers={individualTiers}
        cols="sm:grid-cols-2 lg:grid-cols-3" />

      <TierBlock icon={Building2} eyebrow="For Teams"
        title="HR, L&D and Academic teams."
        subtitle="Issue verifiable credentials to employees, learners and cohorts. Per-certificate pricing scales with you."
        tiers={teamTiers}
        cols="sm:grid-cols-2 lg:grid-cols-4" />

      <CoursePriceList />



      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
        <div className="rounded-3xl gradient-hero p-10 text-white shadow-glow sm:p-14">
          <div className="grid items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">Enterprise</div>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-4xl">
                Need a global rollout, custom DPA, or HRIS integration?
              </h2>
              <p className="mt-3 max-w-xl text-white/85">
                Our enterprise team builds tailored credential programs for multinationals, certification bodies and ministries.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link to="/contact">
                <Button size="lg" className="h-12 w-full bg-white text-[var(--primary)] hover:bg-white/90">
                  Contact sales
                </Button>
              </Link>
              <Link to="/"  hash="verify">
                <Button size="lg" variant="outline" className="h-12 w-full border-white/40 bg-transparent text-white hover:bg-white/10">
                  Verify a credential
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}