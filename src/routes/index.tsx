import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Header } from "@/components/kredo/Header";
import { CertificateView } from "@/components/kredo/CertificateView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ShieldCheck, QrCode, Globe, Building2, Sparkles, BadgeCheck, Mail, MapPin, MessageCircle, Lock, Zap, Users, Plus, Minus } from "lucide-react";
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
      { title: "CERTIGO. — From knowledge to verified proof, instantly" },
      { name: "description", content: "The fastest way to create credentials employers can verify instantly. Type a skill, learn, pass a quiz, get a QR-verified certificate." },
      { property: "og:title", content: "CERTIGO. — Verified credentials in minutes" },
      { property: "og:description", content: "From knowledge to verified proof — instantly." },
    ],
  }),
  component: Home,
});

function Chapter({
  id,
  chapter,
  section,
  title,
  aside,
  defaultOpen = false,
  children,
}: {
  id?: string;
  chapter: string; // "I", "II"...
  section: string; // short section name
  title?: string;
  aside?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="group flex w-full items-center justify-between gap-6 border-b-2 border-foreground py-6 text-left transition-colors hover:bg-foreground hover:text-background"
        >
          <div className="flex flex-1 flex-col gap-3 px-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-foreground px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-background group-hover:bg-background group-hover:text-foreground">
                ◆ Chapter {chapter}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground group-hover:text-background/70">
                Section · {section}
              </span>
            </div>
            {title && (
              <h2 className="font-display text-3xl tracking-[-0.04em] uppercase md:text-5xl">
                {title}
              </h2>
            )}
            {aside && <div className="font-serif text-sm italic text-muted-foreground group-hover:text-background/70">{aside}</div>}
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center border-2 border-foreground bg-background text-foreground transition-transform group-hover:bg-wax group-hover:text-background group-hover:border-wax">
            {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </span>
        </button>
      </div>
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 py-16">{children}</div>
        </div>
      </div>
    </section>
  );
}

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
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
          {/* institutional headline strap */}
          <div className="mb-12 flex flex-wrap items-center justify-between gap-3 border-b-2 border-foreground pb-4">
            <div className="micro-label">◆ Professional Certification Authority</div>
            <div className="micro-label hidden sm:block">Issued Worldwide · Verified at certigo.institute</div>
          </div>
          <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-foreground" />
                <div className="micro-label">{t("hero.label")}</div>
              </div>
              <h1 className="mt-6 font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.88] tracking-[-0.05em] text-balance uppercase text-foreground">
                {t("hero.title.a")}
                <br />
                <span className="font-serif italic font-semibold normal-case tracking-[-0.02em] text-foreground/85">{t("hero.title.b")}</span>
                <br />
                <span className="text-wax">{t("hero.title.c")}</span>
              </h1>
              <div className="mt-8 max-w-xl border-l-2 border-foreground/70 pl-5">
                <p className="font-serif text-xl italic text-foreground/85 text-balance">{t("hero.sub")}</p>
              </div>
              <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
                <Button size="lg" className="h-12 rounded-none bg-foreground px-7 font-mono text-[11px] uppercase tracking-[0.22em] text-background hover:bg-foreground/90" onClick={start}>
                  {t("cta.generate")} <ArrowRight className="ms-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 rounded-none border-2 border-foreground px-7 font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-foreground hover:text-background" onClick={() => nav({ to: "/verify" })}>
                  {t("cta.viewdemo")}
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-foreground/20 pt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <span>◆ {t("hero.bullet.cc")}</span>
                <span>◆ {t("hero.bullet.free")}</span>
                <span>◆ {t("hero.bullet.fast")}</span>
              </div>
            </div>
            {/* DEMO CERTIFICATE — exhibition plate */}
            <div className="relative mx-auto w-full max-w-[620px]">
              <div className="absolute -inset-3 -z-10 border-2 border-foreground" />
              <div className="absolute -top-3 -left-3 -z-10 h-6 w-6 bg-wax" />
              <div className="relative bg-card p-3 shadow-frame sm:p-4">
                <div className="ring-1 ring-foreground/10">
                  <CertificateView
                    compact
                    serial="KR-2026-DEMO01"
                    recipientName="Amara Okafor"
                    courseTopic="Certified Prompt Engineering Professional (CPEP)"
                    score={94}
                    issuedAt={new Date().toISOString()}
                    verifyUrl={typeof window !== "undefined" ? `${window.location.origin}/verify/KR-2026-DEMO01` : "/verify/KR-2026-DEMO01"}
                  />
                </div>
                {/* exhibition plaque */}
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-foreground/15 px-1 pt-3">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    <QrCode className="h-3 w-3" /> <span>Plate I · {t("cta.scanorvisit")}</span>
                  </div>
                  <a href="/verify/KR-2026-DEMO01" className="font-mono text-[10px] uppercase tracking-[0.22em] text-wax underline-offset-4 hover:underline">
                    {t("cta.opendemo")} →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y-2 border-foreground bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { icon: QrCode, label: t("trust.qr") },
              { icon: ShieldCheck, label: t("trust.tamper") },
              { icon: Building2, label: t("trust.employers") },
              { icon: Globe, label: t("trust.global") },
            ].map(({ icon: I, label }) => (
              <span key={label} className="inline-flex items-center gap-2 border border-background/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em]">
                <I className="h-3 w-3 text-wax" /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <Chapter chapter="I" section={t("how.label")} title={t("how.title")} aside="A four-step protocol" defaultOpen>
        <div className="grid gap-0 md:grid-cols-4">
          {[
            { n: "01", t: t("how.s1.t"), d: t("how.s1.d") },
            { n: "02", t: t("how.s2.t"), d: t("how.s2.d") },
            { n: "03", t: t("how.s3.t"), d: t("how.s3.d") },
            { n: "04", t: t("how.s4.t"), d: t("how.s4.d") },
          ].map((s, i) => (
            <div key={s.n} className={`group relative bg-card p-7 transition-colors hover:bg-foreground hover:text-background ${i > 0 ? "md:border-l border-foreground/20" : ""} border-b border-foreground/20 md:border-b-0`}>
              <div className="font-display text-5xl text-wax leading-none">{s.n}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground group-hover:text-background/60">Step {s.n}</div>
              <h3 className="mt-5 font-display text-lg tracking-tight uppercase">{s.t}</h3>
              <p className="mt-2 font-serif text-base leading-snug italic text-muted-foreground group-hover:text-background/80">{s.d}</p>
            </div>
          ))}
        </div>
      </Chapter>

      {/* TRUST CALLOUT — declaration */}
      <section className="border-y-2 border-foreground bg-card">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="micro-label">◆ {t("trust2.label")}</div>
          <h2 className="mt-5 font-serif text-4xl italic font-semibold tracking-[-0.02em] md:text-6xl text-balance">"{t("trust2.title")}"</h2>
          <div className="mx-auto mt-6 h-px w-24 bg-foreground" />
          <p className="mx-auto mt-6 max-w-2xl font-serif text-lg italic text-muted-foreground text-balance">{t("trust2.body")}</p>
          <Button className="mt-10 h-12 rounded-none bg-foreground px-7 font-mono text-[11px] uppercase tracking-[0.22em] text-background hover:bg-wax" onClick={() => nav({ to: "/verify" })}>
            {t("trust2.cta")} <ArrowRight className="ms-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <Chapter chapter="II" section={t("who.label")} title="Who it serves">
        <div className="grid gap-0 md:grid-cols-3 border border-foreground/20">
          {[
            { t: t("who.1.t"), d: t("who.1.d") },
            { t: t("who.2.t"), d: t("who.2.d") },
            { t: t("who.3.t"), d: t("who.3.d") },
          ].map((c, i) => (
            <div key={c.t} className={`p-10 ${i > 0 ? "md:border-l border-foreground/20" : ""}`}>
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center bg-foreground font-mono text-[10px] tracking-[0.2em] text-background">0{i + 1}</span>
                <Sparkles className="h-4 w-4 text-wax" />
              </div>
              <h3 className="mt-6 font-display text-2xl tracking-[-0.03em] uppercase">{c.t}</h3>
              <p className="mt-3 font-serif text-base italic text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </Chapter>

      {/* MANIFESTO — institute charter */}
      <section className="relative bg-foreground text-background">
        <div className="mx-auto max-w-5xl px-6 py-32 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-background/50">◆ Charter · {t("manifesto.label")}</div>
          <div className="mx-auto mt-6 h-px w-24 bg-wax" />
          <h2 className="mt-8 font-display text-4xl leading-[0.95] tracking-[-0.04em] uppercase md:text-7xl">
            {t("manifesto.title.a")} <br/>
            <span className="font-serif italic font-semibold normal-case tracking-[-0.02em] text-background/65">{t("manifesto.title.b")}</span>
          </h2>
          <p className="mx-auto mt-10 max-w-2xl font-serif text-xl italic leading-snug text-background/75">{t("manifesto.body")}</p>
          <div className="mx-auto mt-10 h-px w-24 bg-wax" />
          <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-background/50">— The Certigo Certification Board</div>
        </div>
      </section>

      {/* SHARING */}
      <Chapter chapter="III" section="Distribution" title="How credentials travel">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            [t("share.1.t"), t("share.1.d")],
            [t("share.2.t"), t("share.2.d")],
            [t("share.3.t"), t("share.3.d")],
          ].map(([title, d]) => (
            <div key={title} className="border-l-2 border-wax ps-5">
              <h3 className="font-display text-xl tracking-tight uppercase">{title}</h3>
              <p className="mt-2 font-serif text-base italic text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Chapter>

      {/* PRICING — registry of credentials */}
      <Chapter chapter="IV" section={t("pricing.label")} title={t("pricing.title")}>
        <div className="grid gap-0 md:grid-cols-3 border border-foreground/20">
            {[
              { tier: "I", name: t("pricing.starter.name"), price: t("pricing.starter.price"), desc: t("pricing.starter.desc"), features: ["AI course generation", "QR verification", "Watermarked PDF"] },
              { tier: "II", name: t("pricing.pro.name"), price: "$19", per: "/mo", highlight: true, desc: t("pricing.pro.desc"), features: ["Unlimited certificates", "No CERTIGO. branding", "LinkedIn integration", "Priority AI"] },
              { tier: "III", name: t("pricing.business.name"), price: "$29", per: "/seat", desc: t("pricing.business.desc"), features: ["Bulk issuance", "Admin dashboard", "Custom branding", "SSO"] },
            ].map((p, i) => (
              <div key={p.name} className={`relative p-8 ${i > 0 ? "md:border-l border-foreground/20" : ""} ${p.highlight ? "bg-foreground text-background" : "bg-background"}`}>
                {p.highlight && <span className="absolute -top-3 start-8 bg-wax px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-background">◆ {t("pricing.popular")}</span>}
                <div className={`flex items-center justify-between border-b ${p.highlight ? "border-background/30" : "border-foreground/20"} pb-3`}>
                  <span className={`font-mono text-[10px] uppercase tracking-[0.22em] ${p.highlight ? "text-background/70" : "text-muted-foreground"}`}>Tier {p.tier}</span>
                  <span className={`font-mono text-[10px] uppercase tracking-[0.22em] ${p.highlight ? "text-wax" : "text-wax"}`}>Class {p.tier}</span>
                </div>
                <h3 className="mt-5 font-display text-3xl tracking-[-0.03em] uppercase">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-6xl tracking-[-0.045em]">{p.price}</span>
                  {p.per && <span className={`font-mono text-xs uppercase tracking-widest ${p.highlight ? "text-background/60" : "text-muted-foreground"}`}>{p.per}</span>}
                </div>
                <p className={`mt-3 font-serif text-base italic ${p.highlight ? "text-background/75" : "text-muted-foreground"}`}>{p.desc}</p>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.features.map((f) => <li key={f} className="flex items-center gap-2"><BadgeCheck className={`h-4 w-4 ${p.highlight ? "text-wax" : "text-wax"}`} /> {f}</li>)}
                </ul>
                <Button className={`mt-8 w-full h-11 rounded-none font-mono text-[10px] uppercase tracking-[0.22em] ${p.highlight ? "bg-wax text-background hover:bg-wax/90" : "bg-foreground text-background hover:bg-foreground/90"}`} onClick={() => nav({ to: "/auth" })}>
                  {t("pricing.cta")}
                </Button>
              </div>
            ))}
        </div>
      </Chapter>

      {/* TESTIMONIALS — recipient correspondence */}
      <Chapter chapter="V" section="Recipient Correspondence" title="Letters from the field">
        <div className="grid gap-0 md:grid-cols-3 border border-foreground/20">
          {[
            { q: "I went from 'self-taught' to 'verified' in an afternoon. Got the interview a week later.", n: "Tunde A.", c: "Lagos" },
            { q: "We onboarded 40 contractors and certified them on our internal SOPs. Game changer.", n: "Wanjiku M.", c: "Nairobi" },
            { q: "My students love how clean the certificates look. They actually share them.", n: "Liam V.", c: "Cape Town" },
          ].map((c, i) => (
            <figure key={c.n} className={`p-10 ${i > 0 ? "md:border-l border-foreground/20" : ""}`}>
              <div className="font-display text-5xl text-wax leading-none">"</div>
              <blockquote className="mt-3 font-serif text-xl italic leading-snug text-foreground">{c.q}</blockquote>
              <div className="mt-6 h-px w-12 bg-foreground" />
              <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">— {c.n} · {c.c}</figcaption>
            </figure>
          ))}
        </div>
      </Chapter>

      {/* FAQ — institute responses */}
      <Chapter id="faq" chapter="VI" section={t("faq.label")} title={t("faq.title")} aside={t("faq.intro")}>
        <div className="mx-auto max-w-4xl">
          <Accordion type="single" collapsible>
            {[
              {
                q: "How is a CERTIGO. certificate verified?",
                a: "Every certificate has a unique serial and a QR code that links to a public ledger page on certigo.app/verify. Anyone — recruiter, employer, school — can scan and confirm authenticity in seconds. No login, no friction.",
              },
              {
                q: "Can a CERTIGO. certificate be faked or edited?",
                a: "No. Certificate metadata (serial, recipient, course, score, issue date) is anchored to our verification ledger at issue time. The public verify page always returns the original record — any edited PDF will fail the QR check.",
              },
              {
                q: "Are these credentials accepted by employers?",
                a: "CERTIGO. certificates are designed for skill-based hiring. They tell an employer exactly what was learned, the score earned, and provide a one-tap way to confirm it. They complement — not replace — formal degrees.",
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
      </Chapter>

      {/* ABOUT — institute brief */}
      <Chapter id="about" chapter="VII" section={t("about.label")} title={t("about.title")}>
        <AboutBlock t={t} />
      </Chapter>

      {/* CONTACT — institute correspondence (minimal webmail) */}
      <Chapter id="contact" chapter="VIII" section={t("contact.label")} title={t("contact.title")}>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="border-l-2 border-foreground/70 pl-6">
              <p className="font-serif text-lg italic text-foreground/85">{t("contact.body")}</p>
              <div className="mt-10 divide-y divide-foreground/15 border-y border-foreground/15">
                {[
                  { icon: Mail, label: t("contact.sales"), value: "hello@certigo.app", href: "mailto:hello@certigo.app" },
                  { icon: MessageCircle, label: t("contact.support"), value: "support@certigo.app", href: "mailto:support@certigo.app" },
                  { icon: MapPin, label: t("contact.hq"), value: t("contact.hq.value") },
                ].map((row) => {
                  const Inner = (
                    <div className="flex items-center justify-between gap-4 py-4">
                      <div className="flex items-center gap-4">
                        <row.icon className="h-4 w-4 text-wax" />
                        <div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{row.label}</div>
                          <div className="mt-0.5 font-display text-sm tracking-tight uppercase">{row.value}</div>
                        </div>
                      </div>
                      {row.href && <ArrowRight className="h-4 w-4 text-foreground/60" />}
                    </div>
                  );
                  return row.href ? (
                    <a key={row.label} href={row.href} className="block hover:bg-foreground hover:text-background transition-colors px-1">{Inner}</a>
                  ) : (
                    <div key={row.label} className="px-1">{Inner}</div>
                  );
                })}
              </div>
            </div>
            {/* Minimal editorial webmail */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const data = new FormData(form);
                const subject = encodeURIComponent(`CERTIGO. enquiry from ${data.get("name") || "website"}`);
                const body = encodeURIComponent(`${data.get("message") || ""}\n\n— ${data.get("name") || ""} (${data.get("email") || ""})`);
                window.location.href = `mailto:hello@certigo.app?subject=${subject}&body=${body}`;
              }}
              className="border-2 border-foreground bg-background"
            >
              <div className="flex items-center justify-between border-b border-foreground/20 px-5 py-3">
                <div className="micro-label">◆ Compose · Webmail</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">to: hello@certigo.app</div>
              </div>
              <div className="divide-y divide-foreground/15">
                <label className="flex items-baseline gap-4 px-5 py-3">
                  <span className="w-16 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">From</span>
                  <Input name="name" required placeholder={t("contact.form.name.ph")} className="h-9 flex-1 rounded-none border-0 px-0 shadow-none focus-visible:ring-0 font-serif text-base" />
                </label>
                <label className="flex items-baseline gap-4 px-5 py-3">
                  <span className="w-16 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Reply</span>
                  <Input type="email" name="email" required placeholder={t("contact.form.email.ph")} className="h-9 flex-1 rounded-none border-0 px-0 shadow-none focus-visible:ring-0 font-serif text-base" />
                </label>
                <div className="px-5 py-3">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Message</span>
                  <textarea name="message" rows={6} required placeholder={t("contact.form.message.ph")} className="mt-2 w-full resize-none border-0 bg-transparent px-0 font-serif text-base italic leading-relaxed focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t-2 border-foreground px-5 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{t("contact.form.reply")}</span>
                <Button type="submit" className="h-10 rounded-none bg-foreground px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-background hover:bg-wax">
                  {t("contact.form.send")} <ArrowRight className="ms-2 h-4 w-4" />
                </Button>
              </div>
            </form>
        </div>
      </Chapter>

      {/* FINAL CTA — closing colophon */}
      <section className="relative overflow-hidden border-t-2 border-foreground">
        <div className="absolute inset-0 -z-10 gradient-paper" />
        <div className="mx-auto max-w-4xl px-6 py-28 text-center">
          <div className="micro-label">◆ Colophon · {t("final.label")}</div>
          <div className="mx-auto mt-6 h-px w-24 bg-wax" />
          <h2 className="mt-8 font-display text-4xl leading-[0.95] tracking-[-0.04em] uppercase md:text-6xl text-balance">
            {t("final.title.a")} <span className="font-serif italic font-semibold normal-case tracking-[-0.02em] text-wax">{t("final.title.b")}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-serif text-lg italic text-muted-foreground">{t("final.body")}</p>
          <form
            onSubmit={(e) => { e.preventDefault(); start(); }}
            className="mx-auto mt-10 flex max-w-xl flex-col gap-0 sm:flex-row border-2 border-foreground"
          >
            <Input
              value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder={t("final.placeholder")}
              className="h-12 flex-1 rounded-none border-0 bg-background px-4 font-serif text-base shadow-none focus-visible:ring-0"
            />
            <Button type="submit" className="h-12 rounded-none bg-foreground px-6 font-mono text-[11px] uppercase tracking-[0.22em] text-background hover:bg-wax">{t("final.cta")} <ArrowRight className="ms-2 h-4 w-4" /></Button>
          </form>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{t("final.foot")}</p>
        </div>
        <footer className="border-t-2 border-foreground bg-foreground text-background">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 md:flex-row">
            <div className="font-display text-sm tracking-[-0.04em]">CERTIGO<span className="text-wax">.</span></div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-background/60">© {new Date().getFullYear()} CERTIGO. · {t("footer.copy")}</div>
          </div>
        </footer>
      </section>
    </div>
  );
}
