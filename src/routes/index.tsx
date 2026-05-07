import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/kredo/Header";
import { CertificateView } from "@/components/kredo/CertificateView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ShieldCheck, QrCode, Globe, Building2, Sparkles, BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kredo — From knowledge to verified proof, instantly" },
      { name: "description", content: "The fastest way to create credentials employers can verify instantly. Type a skill, learn, pass a quiz, get a QR-verified certificate." },
      { property: "og:title", content: "Kredo — Verified credentials in minutes" },
      { property: "og:description", content: "From knowledge to verified proof — instantly." },
    ],
  }),
  component: Home,
});

function Home() {
  const nav = useNavigate();
  const [topic, setTopic] = useState("");
  const start = () => nav({ to: "/auth", search: { topic } as any });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-paper" />
        <div className="absolute -top-40 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid gap-16 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <div>
              <div className="micro-label">◆ Credential Infrastructure</div>
              <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter text-balance">
                From knowledge to <span className="italic">verified proof.</span>
                <br />
                <span className="text-primary">Instantly.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg text-muted-foreground text-balance">
                Kredo is the fastest way to create credentials employers can verify instantly.
                Type a skill — get a full course, a quiz, and a QR-verified certificate that lives
                forever in your account.
              </p>
              <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
                <Button size="lg" className="h-12 px-6" onClick={start}>
                  Generate your first course & certificate <ArrowRight className="ms-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6" onClick={() => nav({ to: "/verify" })}>
                  View demo certificate
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>✓ No credit card</span><span>✓ 1 free certificate</span><span>✓ Setup in 60 seconds</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary/15 to-transparent blur-2xl" />
              <div className="rotate-[-1.5deg] transition-transform hover:rotate-0">
                <CertificateView
                  serial="KR-2026-DEMO01"
                  recipientName="Amara Okafor"
                  courseTopic="Prompt Engineering Fundamentals"
                  score={94}
                  issuedAt={new Date().toISOString()}
                  verifyUrl={typeof window !== "undefined" ? `${window.location.origin}/verify` : "/verify"}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-2 md:items-center">
          <div className="flex flex-wrap gap-2">
            {[
              { icon: QrCode, label: "QR-verified" },
              { icon: ShieldCheck, label: "Tamper-proof" },
              { icon: Building2, label: "Built for employers" },
              { icon: Globe, label: "Global-ready" },
            ].map(({ icon: I, label }) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium">
                <I className="h-3.5 w-3.5 text-primary" /> {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6 text-center md:text-end">
            {[["12,400+","Certificates"],["38","Countries"],["84,000+","Verifications"]].map(([n,l]) => (
              <div key={l}>
                <div className="font-display text-2xl font-black tracking-tighter">{n}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="micro-label">◆ How it works</div>
        <h2 className="mt-4 font-display text-4xl font-black tracking-tighter md:text-6xl">Four steps. One credential.</h2>
        <div className="mt-14 grid gap-6 md:grid-cols-4">
          {[
            { n: "01", t: "Enter a skill", d: "Type any topic — from React to negotiation." },
            { n: "02", t: "AI builds a course", d: "Modules, lessons, and a quiz, generated instantly." },
            { n: "03", t: "Learn & pass", d: "Study at your pace. Pass with 70%+." },
            { n: "04", t: "Get verified", d: "Download a QR-verified PDF. Share anywhere." },
          ].map((s) => (
            <div key={s.n} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="font-mono text-xs tracking-widest text-primary">{s.n}</div>
              <h3 className="mt-3 font-display text-xl font-black tracking-tight">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO CERT */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="micro-label">◆ Built to be trusted</div>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tighter md:text-5xl">Every certificate carries proof.</h2>
            <p className="mt-5 text-muted-foreground">
              Each Kredo certificate has a unique serial and a QR code linking to a public ledger page.
              Anyone — recruiters, schools, clients — can verify the credential in one scan, no login required.
            </p>
            <Button className="mt-8" onClick={() => nav({ to: "/verify" })}>Verify this certificate <ArrowRight className="ms-2 h-4 w-4" /></Button>
          </div>
          <div className="rotate-[1deg]">
            <CertificateView serial="KR-2026-LEDGR1" recipientName="Joaquín Mendes" courseTopic="Financial Modeling Essentials" score={88}
              issuedAt={new Date().toISOString()} verifyUrl="/verify" />
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="micro-label">◆ Who it's for</div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            { t: "Job seekers", d: "Prove what you know in industries that don't care about diplomas." },
            { t: "Coaches & creators", d: "Issue branded certificates to students with one click." },
            { t: "Companies & HR", d: "Onboard, train, and certify teams at scale." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-border p-8">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-display text-2xl font-black tracking-tight">{c.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-4xl px-6 py-28 text-center">
          <div className="font-mono text-[10px] uppercase tracking-widest text-background/60">◆ Why Kredo exists</div>
          <h2 className="mt-6 font-display text-4xl font-black leading-tight tracking-tighter md:text-6xl">
            Skills move faster than credentials. <span className="text-primary-foreground/60 italic">Until now.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-background/70">
            We believe proof of knowledge should be as fast as learning itself. Kredo is the fastest
            way to create credentials employers can verify instantly — open, portable, and yours forever.
          </p>
        </div>
      </section>

      {/* SHARING */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            ["Share to LinkedIn", "One click adds your verified credential to your profile."],
            ["Public profile", "Get a kredo.app/u/yourname page with every credential you've earned."],
            ["Shareable links", "Send a verify URL to recruiters. They scan, they trust."],
          ].map(([t, d]) => (
            <div key={t} className="border-l-2 border-primary ps-5">
              <h3 className="font-display text-xl font-black tracking-tight">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="micro-label">◆ Pricing</div>
          <h2 className="mt-4 font-display text-4xl font-black tracking-tighter md:text-5xl">Simple. Honest.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: "Starter", price: "Free", desc: "1 watermarked certificate", features: ["AI course generation", "QR verification", "Watermarked PDF"] },
              { name: "Pro", price: "$19", per: "/mo", highlight: true, desc: "Unlimited credentials", features: ["Unlimited certificates", "No Kredo branding", "LinkedIn integration", "Priority AI"] },
              { name: "Business", price: "$29", per: "/seat", desc: "Built for teams", features: ["Bulk issuance", "Admin dashboard", "Custom branding", "SSO"] },
            ].map((p) => (
              <div key={p.name} className={`relative rounded-2xl border p-8 ${p.highlight ? "border-primary bg-background shadow-elegant" : "border-border bg-background"}`}>
                {p.highlight && <span className="absolute -top-3 start-6 rounded-full bg-primary px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary-foreground">Most popular</span>}
                <h3 className="font-display text-2xl font-black tracking-tight">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-black tracking-tighter">{p.price}</span>
                  {p.per && <span className="text-sm text-muted-foreground">{p.per}</span>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {p.features.map((f) => <li key={f} className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary" /> {f}</li>)}
                </ul>
                <Button className="mt-8 w-full" variant={p.highlight ? "default" : "outline"} onClick={() => nav({ to: "/auth" })}>Get started</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { q: "I went from 'self-taught' to 'verified' in an afternoon. Got the interview a week later.", n: "Tunde A.", c: "Lagos" },
            { q: "We onboarded 40 contractors and certified them on our internal SOPs. Game changer.", n: "Wanjiku M.", c: "Nairobi" },
            { q: "My students love how clean the certificates look. They actually share them.", n: "Liam V.", c: "Cape Town" },
          ].map((t) => (
            <figure key={t.n} className="rounded-2xl border border-border bg-card p-8">
              <blockquote className="font-display text-lg leading-snug tracking-tight">"{t.q}"</blockquote>
              <figcaption className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">— {t.n} · {t.c}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden border-t border-border">
        <div className="absolute inset-0 -z-10 gradient-paper" />
        <div className="mx-auto max-w-4xl px-6 py-28 text-center">
          <div className="micro-label">◆ Start now</div>
          <h2 className="mt-6 font-display text-4xl font-black leading-tight tracking-tighter md:text-6xl text-balance">
            From knowledge to verified proof — <span className="text-primary italic">instantly.</span>
          </h2>
          <p className="mt-6 text-muted-foreground">Type a skill. We'll do the rest.</p>
          <form
            onSubmit={(e) => { e.preventDefault(); start(); }}
            className="mx-auto mt-10 flex max-w-xl flex-col gap-2 sm:flex-row"
          >
            <Input
              value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Customer success fundamentals"
              className="h-12 flex-1 border-foreground/20 bg-background"
            />
            <Button type="submit" size="lg" className="h-12 px-6">Generate <ArrowRight className="ms-2 h-4 w-4" /></Button>
          </form>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">No credit card · 1 free certificate</p>
        </div>
        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 md:flex-row">
            <div className="font-display text-sm font-black tracking-tighter">KREDO<span className="text-primary">.</span></div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">© {new Date().getFullYear()} Kredo · Verified credentials</div>
          </div>
        </footer>
      </section>
    </div>
  );
}
