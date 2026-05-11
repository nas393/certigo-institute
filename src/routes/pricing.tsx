import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, GraduationCap, Building2, User, Sparkles } from "lucide-react";

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

const trainingTiers: Tier[] = [
  { name: "Academy Essential", price: "$129", per: "/month", desc: "For independent academies and trainers.",
    feats: ["Up to 30 credentials/month", "Certificate studio", "Verification pages", "Learner profiles", "Analytics"], cta: "Start free trial", to: "/auth" },
  { name: "Academy Professional", price: "$349", per: "/month", desc: "For growing training providers.",
    feats: ["Up to 120 credentials/month", "Team workspace (5 users)", "Advanced analytics", "Priority support", "Advanced branding"], cta: "Start free trial", to: "/auth", highlight: true },
  { name: "Academy Signature", price: "$799", per: "/month", desc: "For established academies at scale.",
    feats: ["Up to 350 credentials/month", "White-label certificates", "Custom verification domain", "API access", "Roles & permissions", "Dedicated onboarding"], cta: "Start free trial", to: "/auth" },
  { name: "Enterprise", price: "Custom", desc: "Unlimited issuance, SSO, DPA, SLA.",
    feats: ["Unlimited credentials", "SSO & SCIM", "Procurement & DPA", "Dedicated CSM"], cta: "Contact sales", to: "/contact" },
];

const hrTiers: Tier[] = [
  { name: "Team Credentials", price: "$199", per: "/month", desc: "For HR teams getting started.",
    feats: ["Up to 50 employees / learners", "Internal training credentials", "Verification pages", "Manager analytics"], cta: "Start free trial", to: "/auth" },
  { name: "Business Credentials", price: "$499", per: "/month", desc: "For mid-market HR organizations.",
    feats: ["Up to 200 employees / learners", "Workforce analytics", "SSO ready", "Priority support"], cta: "Start free trial", to: "/auth", highlight: true },
  { name: "Enterprise Workforce", price: "Custom", desc: "Global rollouts and HRIS integrations.",
    feats: ["Unlimited employees", "HRIS / ATS integrations", "Regional data residency", "Dedicated CSM"], cta: "Contact sales", to: "/contact" },
];

const individualTiers: Tier[] = [
  { name: "Free Profile", price: "$0", per: "", desc: "Claim and share your credentials.",
    feats: ["Public credential profile", "Share via link or QR", "Lifetime access"], cta: "Create free profile", to: "/auth" },
  { name: "Verified Professional", price: "$8", per: "/month", desc: "Or $79/year — billed annually.",
    feats: ["Verified badge", "Portfolio page", "Custom profile URL", "Career analytics", "Featured in profile search"], cta: "Get verified", to: "/auth", highlight: true },
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
  icon: typeof GraduationCap; eyebrow: string; title: string; subtitle: string; tiers: Tier[]; cols: string;
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

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-20 pb-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">Pricing</div>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Credential Governance Plans.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Transparent USD pricing for organizations and professionals. Start small, scale globally — no credentials are
          ever locked behind a paywall for the recipient.
        </p>
      </section>

      <TierBlock icon={GraduationCap} eyebrow="Training Providers"
        title="For academies and certification bodies."
        subtitle="Issue premium, verifiable credentials and grow alumni networks."
        tiers={trainingTiers}
        cols="sm:grid-cols-2 lg:grid-cols-4" />

      <TierBlock icon={Building2} eyebrow="Corporate HR"
        title="For HR and L&D teams."
        subtitle="Recognize internal training and skills at the speed of your business."
        tiers={hrTiers}
        cols="sm:grid-cols-2 lg:grid-cols-3" />

      <TierBlock icon={User} eyebrow="Individuals"
        title="For professionals building a verified identity."
        subtitle="Own your credentials for life. Share with one link."
        tiers={individualTiers}
        cols="sm:grid-cols-2" />

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
              <Link to="/verify">
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