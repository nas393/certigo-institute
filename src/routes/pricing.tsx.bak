import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — CERTIGO." },
      { name: "description", content: "Simple, scalable pricing. Start free, scale to enterprise." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const tiers = [
    { name: "Starter", price: "$29", per: "/month", desc: "For independent issuers getting started.",
      feats: ["Up to 100 certificates / mo", "Basic verification page", "Email support"], cta: "Start free trial", to: "/auth", highlight: false },
    { name: "Growth", price: "$99", per: "/month", desc: "For growing training providers.",
      feats: ["Unlimited bulk issuance", "Analytics & branding", "Priority support", "API access"], cta: "Start free trial", to: "/auth", highlight: true },
    { name: "Enterprise", price: "Custom", per: "", desc: "For HR teams and global academies.",
      feats: ["SSO & SCIM", "Dedicated infrastructure", "Compliance & DPA", "24/7 SLA"], cta: "Talk to sales", to: "/contact", highlight: false },
  ];
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-20 pb-8">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">Pricing</div>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Simple, scalable pricing.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Pay only for what you use. Upgrade when you scale.</p>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`relative rounded-2xl border p-7 ${t.highlight ? "border-transparent bg-card shadow-glow ring-2 ring-[var(--primary)]" : "border-border bg-card"}`}>
              {t.highlight && (
                <span className="absolute -top-3 left-7 rounded-full gradient-hero px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">Most popular</span>
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
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />{f}
                  </li>
                ))}
              </ul>
              <Link to={t.to as any}>
                <Button className={`mt-7 w-full ${t.highlight ? "gradient-hero text-white border-0" : ""}`} variant={t.highlight ? "default" : "outline"}>
                  {t.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}