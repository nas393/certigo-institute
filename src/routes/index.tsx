import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/kredo/Header";
import { CertificateView } from "@/components/kredo/CertificateView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ShieldCheck, QrCode, Globe, Building2, Sparkles, BadgeCheck, Mail, MapPin, MessageCircle, Lock, Zap, Users } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Certigo — From knowledge to verified proof, instantly" },
      { name: "description", content: "The fastest way to create credentials employers can verify instantly. Type a skill, learn, pass a quiz, get a QR-verified certificate." },
      { property: "og:title", content: "Certigo — Verified credentials in minutes" },
      { property: "og:description", content: "From knowledge to verified proof — instantly." },
    ],
  }),
  component: Home,
});

function Home() {
  const nav = useNavigate();
  const [topic, setTopic] = useState("");
  const { t } = useI18n();
  const start = () => nav({ to: "/auth", search: { topic } as any });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-paper" />
        <div className="absolute -top-40 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <div>
              <div className="micro-label">◆ {t("hero.label")}</div>
              <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter text-balance">
                {t("hero.title.a")} <span className="italic">{t("hero.title.b")}</span>
                <br />
                <span className="text-primary">{t("hero.title.c")}</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg text-muted-foreground text-balance">{t("hero.sub")}</p>
              <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
                <Button size="lg" className="h-12 px-6" onClick={start}>
                  {t("cta.generate")} <ArrowRight className="ms-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6" onClick={() => nav({ to: "/verify" })}>
                  {t("cta.viewdemo")}
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>{t("hero.bullet.cc")}</span><span>{t("hero.bullet.free")}</span><span>{t("hero.bullet.fast")}</span>
              </div>
            </div>
            {/* DEMO CERTIFICATE — premium framed presentation */}
            <div className="relative mx-auto w-full max-w-[560px]">
              {/* glow */}
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl" />
              {/* tilt + presentation card */}
              <div className="group relative">
                <div className="absolute -inset-2 -z-10 rounded-2xl bg-foreground/[0.04]" />
                <div className="rounded-xl border border-border bg-card p-3 shadow-elegant transition-transform duration-500 sm:p-4 lg:rotate-[-1.2deg] group-hover:lg:rotate-0">
                  <CertificateView
                    compact
                    serial="KR-2026-DEMO01"
                    recipientName="Amara Okafor"
                    courseTopic="Prompt Engineering Fundamentals"
                    score={94}
                    issuedAt={new Date().toISOString()}
                    verifyUrl={typeof window !== "undefined" ? `${window.location.origin}/verify/KR-2026-DEMO01` : "/verify/KR-2026-DEMO01"}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <QrCode className="h-3 w-3" />
                <span>{t("cta.scanorvisit")}</span>
                <a href="/verify/KR-2026-DEMO01" className="underline underline-offset-2 hover:text-primary">{t("cta.opendemo")}</a>
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
              { icon: QrCode, label: t("trust.qr") },
              { icon: ShieldCheck, label: t("trust.tamper") },
              { icon: Building2, label: t("trust.employers") },
              { icon: Globe, label: t("trust.global") },
            ].map(({ icon: I, label }) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium">
                <I className="h-3.5 w-3.5 text-primary" /> {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6 text-center md:text-end">
            {[["12,400+",t("trust.stat.certs")],["38",t("trust.stat.countries")],["84,000+",t("trust.stat.verifs")]].map(([n,l]) => (
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
        <div className="micro-label">◆ {t("how.label")}</div>
        <h2 className="mt-4 font-display text-4xl font-black tracking-tighter md:text-6xl">{t("how.title")}</h2>
        <div className="mt-14 grid gap-6 md:grid-cols-4">
          {[
            { n: "01", t: t("how.s1.t"), d: t("how.s1.d") },
            { n: "02", t: t("how.s2.t"), d: t("how.s2.d") },
            { n: "03", t: t("how.s3.t"), d: t("how.s3.d") },
            { n: "04", t: t("how.s4.t"), d: t("how.s4.d") },
          ].map((s) => (
            <div key={s.n} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="font-mono text-xs tracking-widest text-primary">{s.n}</div>
              <h3 className="mt-3 font-display text-xl font-black tracking-tight">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST CALLOUT (no second demo cert) */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="micro-label">◆ {t("trust2.label")}</div>
          <h2 className="mt-4 font-display text-4xl font-black tracking-tighter md:text-5xl">{t("trust2.title")}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">{t("trust2.body")}</p>
          <Button className="mt-8" onClick={() => nav({ to: "/verify" })}>{t("trust2.cta")} <ArrowRight className="ms-2 h-4 w-4" /></Button>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="micro-label">◆ {t("who.label")}</div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            { t: t("who.1.t"), d: t("who.1.d") },
            { t: t("who.2.t"), d: t("who.2.d") },
            { t: t("who.3.t"), d: t("who.3.d") },
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
          <div className="font-mono text-[10px] uppercase tracking-widest text-background/60">◆ {t("manifesto.label")}</div>
          <h2 className="mt-6 font-display text-4xl font-black leading-tight tracking-tighter md:text-6xl">
            {t("manifesto.title.a")} <span className="text-primary-foreground/60 italic">{t("manifesto.title.b")}</span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-background/70">{t("manifesto.body")}</p>
        </div>
      </section>

      {/* SHARING */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            [t("share.1.t"), t("share.1.d")],
            [t("share.2.t"), t("share.2.d")],
            [t("share.3.t"), t("share.3.d")],
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
          <div className="micro-label">◆ {t("pricing.label")}</div>
          <h2 className="mt-4 font-display text-4xl font-black tracking-tighter md:text-5xl">{t("pricing.title")}</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: t("pricing.starter.name"), price: t("pricing.starter.price"), desc: t("pricing.starter.desc"), features: ["AI course generation", "QR verification", "Watermarked PDF"] },
              { name: t("pricing.pro.name"), price: "$19", per: "/mo", highlight: true, desc: t("pricing.pro.desc"), features: ["Unlimited certificates", "No Certigo branding", "LinkedIn integration", "Priority AI"] },
              { name: t("pricing.business.name"), price: "$29", per: "/seat", desc: t("pricing.business.desc"), features: ["Bulk issuance", "Admin dashboard", "Custom branding", "SSO"] },
            ].map((p) => (
              <div key={p.name} className={`relative rounded-2xl border p-8 ${p.highlight ? "border-primary bg-background shadow-elegant" : "border-border bg-background"}`}>
                {p.highlight && <span className="absolute -top-3 start-6 rounded-full bg-primary px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary-foreground">{t("pricing.popular")}</span>}
                <h3 className="font-display text-2xl font-black tracking-tight">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-black tracking-tighter">{p.price}</span>
                  {p.per && <span className="text-sm text-muted-foreground">{p.per}</span>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {p.features.map((f) => <li key={f} className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary" /> {f}</li>)}
                </ul>
                <Button className="mt-8 w-full" variant={p.highlight ? "default" : "outline"} onClick={() => nav({ to: "/auth" })}>{t("pricing.cta")}</Button>
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

      {/* FAQ */}
      <section id="faq" className="border-t border-border bg-card scroll-mt-24">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <div className="micro-label">◆ {t("faq.label")}</div>
          <h2 className="mt-4 font-display text-4xl font-black tracking-tighter md:text-5xl">{t("faq.title")}</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">{t("faq.intro")}</p>
          <Accordion type="single" collapsible className="mt-10">
            {[
              {
                q: "How is a Certigo certificate verified?",
                a: "Every certificate has a unique serial and a QR code that links to a public ledger page on certigo.app/verify. Anyone — recruiter, employer, school — can scan and confirm authenticity in seconds. No login, no friction.",
              },
              {
                q: "Can a Certigo certificate be faked or edited?",
                a: "No. Certificate metadata (serial, recipient, course, score, issue date) is anchored to our verification ledger at issue time. The public verify page always returns the original record — any edited PDF will fail the QR check.",
              },
              {
                q: "Are these credentials accepted by employers?",
                a: "Certigo certificates are designed for skill-based hiring. They tell an employer exactly what was learned, the score earned, and provide a one-tap way to confirm it. They complement — not replace — formal degrees.",
              },
              {
                q: "What happens to my certificate if I cancel?",
                a: "It stays yours forever. Your public profile and every verify link continue to work. Pro features (custom branding, unlimited issuance) pause, but every credential already issued remains valid.",
              },
              {
                q: "Can I issue certificates to my own students or team?",
                a: "Yes. The Pro and Business plans support bulk issuance, custom branding, and an admin dashboard so coaches, schools, and HR teams can certify cohorts in one flow.",
              },
              {
                q: "Is my data private?",
                a: "We only store what's needed to issue and verify your credentials. Your account data is never sold. The public verify page only exposes what's printed on the certificate itself.",
              },
            ].map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-border">
                <AccordionTrigger className="text-left font-display text-lg font-bold tracking-tight">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-7xl px-6 py-24 scroll-mt-24">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <div className="micro-label">◆ {t("about.label")}</div>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tighter md:text-5xl">{t("about.title")}</h2>
            <p className="mt-6 text-muted-foreground">{t("about.body1")}</p>
            <p className="mt-4 text-muted-foreground">{t("about.body2")}</p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                ["12,400+", t("about.stat.issued")],
                ["84,000+", t("about.stat.verifs")],
                ["38", t("about.stat.countries")],
              ].map(([n, l]) => (
                <div key={l} className="rounded-xl border border-border bg-card p-4">
                  <div className="font-display text-2xl font-black tracking-tighter text-primary">{n}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Lock, t: t("value.1.t"), d: t("value.1.d") },
              { icon: Zap,  t: t("value.2.t"), d: t("value.2.d") },
              { icon: Globe,t: t("value.3.t"), d: t("value.3.d") },
              { icon: Users,t: t("value.4.t"), d: t("value.4.d") },
            ].map((v) => (
              <div key={v.t} className="rounded-2xl border border-border bg-card p-6">
                <v.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-display text-lg font-black tracking-tight">{v.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="border-t border-border bg-card scroll-mt-24">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <div className="micro-label">◆ {t("contact.label")}</div>
              <h2 className="mt-4 font-display text-4xl font-black tracking-tighter md:text-5xl">{t("contact.title")}</h2>
              <p className="mt-4 max-w-md text-muted-foreground">{t("contact.body")}</p>
              <div className="mt-8 space-y-4">
                <a href="mailto:hello@certigo.app" className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 hover:border-primary/60">
                  <Mail className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-display text-sm font-bold">{t("contact.sales")}</div>
                    <div className="text-sm text-muted-foreground">hello@certigo.app</div>
                  </div>
                </a>
                <a href="mailto:support@certigo.app" className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 hover:border-primary/60">
                  <MessageCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-display text-sm font-bold">{t("contact.support")}</div>
                    <div className="text-sm text-muted-foreground">support@certigo.app</div>
                  </div>
                </a>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-display text-sm font-bold">{t("contact.hq")}</div>
                    <div className="text-sm text-muted-foreground">{t("contact.hq.value")}</div>
                  </div>
                </div>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const data = new FormData(form);
                const subject = encodeURIComponent(`Certigo enquiry from ${data.get("name") || "website"}`);
                const body = encodeURIComponent(`${data.get("message") || ""}\n\n— ${data.get("name") || ""} (${data.get("email") || ""})`);
                window.location.href = `mailto:hello@certigo.app?subject=${subject}&body=${body}`;
              }}
              className="rounded-2xl border border-border bg-background p-6 shadow-card"
            >
              <h3 className="font-display text-xl font-black tracking-tight">{t("contact.form.title")}</h3>
              <div className="mt-5 grid gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("contact.form.name")}</label>
                  <Input name="name" required placeholder={t("contact.form.name.ph")} className="mt-2 h-11" />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("contact.form.email")}</label>
                  <Input type="email" name="email" required placeholder={t("contact.form.email.ph")} className="mt-2 h-11" />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("contact.form.message")}</label>
                  <textarea name="message" rows={4} required placeholder={t("contact.form.message.ph")} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <Button type="submit" size="lg" className="h-12">{t("contact.form.send")} <ArrowRight className="ms-2 h-4 w-4" /></Button>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("contact.form.reply")}</p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden border-t border-border">
        <div className="absolute inset-0 -z-10 gradient-paper" />
        <div className="mx-auto max-w-4xl px-6 py-28 text-center">
          <div className="micro-label">◆ {t("final.label")}</div>
          <h2 className="mt-6 font-display text-4xl font-black leading-tight tracking-tighter md:text-6xl text-balance">
            {t("final.title.a")} <span className="text-primary italic">{t("final.title.b")}</span>
          </h2>
          <p className="mt-6 text-muted-foreground">{t("final.body")}</p>
          <form
            onSubmit={(e) => { e.preventDefault(); start(); }}
            className="mx-auto mt-10 flex max-w-xl flex-col gap-2 sm:flex-row"
          >
            <Input
              value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder={t("final.placeholder")}
              className="h-12 flex-1 border-foreground/20 bg-background"
            />
            <Button type="submit" size="lg" className="h-12 px-6">{t("final.cta")} <ArrowRight className="ms-2 h-4 w-4" /></Button>
          </form>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("final.foot")}</p>
        </div>
        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 md:flex-row">
            <div className="font-display text-sm font-black tracking-tighter"><span className="text-primary">CERTI</span><span className="text-foreground">GO</span></div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">© {new Date().getFullYear()} Certigo · {t("footer.copy")}</div>
          </div>
        </footer>
      </section>
    </div>
  );
}
