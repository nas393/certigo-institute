import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Send, Lock, Wallet, BadgeCheck, Zap, Globe, Code2, BarChart3, Users } from "lucide-react";

export const Route = createFileRoute("/product")({
  head: () => ({
    meta: [
      { title: "Product — CERTIGO." },
      { name: "description", content: "Issue, share and verify tamper-proof credentials with the CERTIGO. platform." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const features = [
    { icon: Send, t: "Bulk issuance", d: "Upload a CSV or call our API to issue thousands of certificates in minutes." },
    { icon: Lock, t: "Tamper-proof", d: "Every credential is signed and cryptographically verifiable." },
    { icon: Wallet, t: "Credential wallet", d: "Recipients keep a lifetime, portable wallet of every credential they earn." },
    { icon: BadgeCheck, t: "Instant verification", d: "Anyone can verify in under three seconds — no login required." },
    { icon: BarChart3, t: "Issuer analytics", d: "Track issuance, verification and engagement across cohorts and regions." },
    { icon: Code2, t: "API & webhooks", d: "Embed CERTIGO. into your LMS, ATS or HRIS with our REST API." },
    { icon: Users, t: "Recipient experience", d: "Branded landing pages, share links and QR codes out of the box." },
    { icon: Globe, t: "Global from day one", d: "Multi-region delivery with sub-second verification anywhere on earth." },
  ];
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="relative">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-glow)" }} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-20 pb-12">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">Product</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            The credentialing platform <span className="gradient-text">built for scale.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Everything your team needs to issue, share and verify digital credentials — in one platform, with the reliability employers expect.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/auth"><Button size="lg" className="gradient-hero text-white border-0 h-12 px-6">Start free trial <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link to="/pricing"><Button size="lg" variant="outline" className="h-12 px-6">See pricing</Button></Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-5 px-5 pb-24 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {features.map(({ icon: Icon, ...f }) => (
            <div key={f.t} className="rounded-xl border border-border bg-card p-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg gradient-hero text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-display text-base font-bold">{f.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}