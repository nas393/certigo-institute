import { createFileRoute } from "@tanstack/react-router";
import { SUPPORT_EMAIL } from "@/lib/site-config";
import { useState } from "react";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Building2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CERTIGO." },
      { name: "description", content: "Talk to the CERTIGO. team about credential issuance, verification, security review or enterprise pricing." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [busy, setBusy] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const f = new FormData(formEl);
    const v = (k: string) => String(f.get(k) ?? "");
    setBusy(true);
    const { error } = await (supabase as any).rpc("submit_contact", {
      _name: v("name"), _email: v("email"), _company: v("company"), _role: v("role"), _message: v("message"),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Message sent. We'll get back to you by email.");
    formEl.reset();
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-glow)" }} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-20 pb-12 sm:pt-28">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">Contact</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Talk to a real <span className="gradient-text">credentials team.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Sales, security review, partnerships or general questions. We read every message.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <aside className="space-y-4">
            {[
              { icon: Mail, t: "Email", d: SUPPORT_EMAIL ?? "Use the form on this page" },
              { icon: Building2, t: "Enterprise", d: "Dedicated onboarding & SLAs" },
                          ].map(({ icon: Icon, ...c }) => (
              <div key={c.t} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg gradient-hero text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{c.t}</div>
                    <div className="text-sm font-semibold">{c.d}</div>
                  </div>
                </div>
              </div>
            ))}
          </aside>

          <form onSubmit={onSubmit} className="frame-card p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" required />
              <Field label="Work email" name="email" type="email" required />
              <Field label="Company" name="company" />
              <Field label="Role" name="role" placeholder="HR, L&D, Founder…" />
            </div>
            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">How can we help?</label>
              <Textarea name="message" required rows={6} placeholder="Tell us about your use case, cohort size, or compliance requirements." className="mt-2" />
            </div>
            <Button type="submit" disabled={busy} size="lg" className="mt-6 gradient-hero text-white border-0 hover:opacity-95">
              {busy ? "Sending…" : "Send message"} <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</label>
      <Input name={name} type={type} required={required} placeholder={placeholder} className="mt-2 h-11" />
    </div>
  );
}