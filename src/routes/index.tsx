import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { VerificationPlayground } from "@/components/playground/VerificationPlayground";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CERTIGO. — Your next credential, issued in 10 minutes" },
      { name: "description", content: "Earn a verified professional credential in ten minutes. One quiz, one share-ready certificate, one click to LinkedIn." },
      { property: "og:title", content: "CERTIGO. — Verified credentials for professionals" },
      { property: "og:description", content: "Earn a verified credential in ten minutes. Share it to LinkedIn in one click." },
    ],
  }),
  component: Home,
});

const ROLES = [
  { id: "pm", label: "Product Manager", slug: "product-management-foundations" },
  { id: "eng", label: "Engineer", slug: "cloud-fundamentals" },
  { id: "design", label: "Designer", slug: "ux-research-methods" },
  { id: "data", label: "Data / AI", slug: "prompt-engineering-essentials" },
];

function Home() {
  const nav = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<any>(null);

  useEffect(() => {
    if (!role) { setRecommended(null); return; }
    const slug = ROLES.find((r) => r.id === role)?.slug;
    if (!slug) return;
    supabase.from("certifications").select("slug,title,summary,skills,category").eq("slug", slug).maybeSingle()
      .then(({ data }) => setRecommended(data));
  }, [role]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="mx-auto max-w-5xl px-5 pt-16 pb-12 sm:px-8 sm:pt-24">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ For professionals</div>
        <h1 className="mt-4 font-display text-5xl font-black tracking-tighter sm:text-7xl">
          Your next credential,<br />issued in <span className="text-emerald-600">10 minutes</span>.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          One short quiz. One QR-verified certificate. One click to LinkedIn. No bulk, no admin, no waiting.
        </p>

        <div className="mt-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">What do you do?</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={"rounded-full border px-4 py-2 text-sm font-medium transition " + (role === r.id ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-border hover:border-foreground/40")}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {recommended && (
          <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">
              <Sparkles className="h-3 w-3" /> Recommended for you
            </div>
            <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight">{recommended.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{recommended.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(recommended.skills ?? []).map((s: string) => (
                <span key={s} className="rounded-full bg-muted px-2.5 py-1 text-[11px]">{s}</span>
              ))}
            </div>
            <Button
              className="mt-5 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => nav({ to: "/c/$slug", params: { slug: recommended.slug } })}
            >
              Start in 10 minutes <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="mt-6">
          <Link to="/catalog" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            or browse the full catalog →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { n: "01", t: "Pick a certification", d: "Six career-relevant tracks. Each one is short and to the point." },
            { n: "02", t: "Pass one quiz", d: "Eight questions. Pass at 70%. Your answers are stored." },
            { n: "03", t: "Share to LinkedIn", d: "Add to Profile button is pre-filled with your verified credential metadata." },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-border bg-card p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ {s.n}</div>
              <div className="mt-3 font-display text-lg font-extrabold">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <VerificationPlayground />

      <footer className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          CERTIGO<span className="text-emerald-600">.</span> · © {new Date().getFullYear()} · <Link to="/terms" className="hover:text-foreground">Terms</Link> · <Link to="/privacy" className="hover:text-foreground">Privacy</Link> · <Link to="/contact" className="hover:text-foreground">Contact</Link>
        </div>
      </footer>
    </div>
  );
}

type PlaygroundState = "idle" | "scanning" | "decrypting" | "verified" | "notfound";

function VerificationPlayground() {
  const [serial, setSerial] = useState("");
  const [state, setState] = useState<PlaygroundState>("idle");
  const [hit, setHit] = useState<any>(null);
  const [sample, setSample] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("certificates").select("serial").order("issued_at", { ascending: false }).limit(1)
      .then(({ data }) => setSample(data?.[0]?.serial ?? null));
  }, []);

  async function run(input: string) {
    const s = input.trim().toUpperCase();
    if (!s) return;
    setHit(null);
    setState("scanning");
    await new Promise((r) => setTimeout(r, 600));
    setState("decrypting");
    const { data } = await supabase
      .from("certificates")
      .select("serial, recipient_name, issued_at, revoked, certifications(title, issuer_name)")
      .eq("serial", s)
      .maybeSingle();
    await new Promise((r) => setTimeout(r, 500));
    if (data && !data.revoked) {
      setHit(data);
      setState("verified");
    } else {
      setState("notfound");
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          <ScanLine className="h-3 w-3" /> Verification playground
        </div>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">
          Try a live verification.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Paste any CERTIGO. serial below. We'll scan, decrypt, and resolve it to the live record.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="CERT-XXXX-NNNN"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            className="font-mono uppercase"
            onKeyDown={(e) => e.key === "Enter" && run(serial)}
          />
          <Button onClick={() => run(serial)} className="bg-foreground text-background hover:bg-foreground/90">
            <Search className="mr-2 h-4 w-4" /> Verify
          </Button>
        </div>
        {sample && (
          <button
            onClick={() => { setSerial(sample); run(sample); }}
            className="mt-2 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground"
          >
            ↗ try sample {formatReference(sample)}
          </button>
        )}

        <div className="mt-6 min-h-[160px]">
          {state === "idle" && (
            <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
              Awaiting input…
            </div>
          )}
          {(state === "scanning" || state === "decrypting") && (
            <div className="overflow-hidden rounded-md border border-border bg-neutral-950 p-6 font-mono text-xs text-emerald-400">
              <div className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> {state === "scanning" ? "Scanning QR signature…" : "Decrypting registry record…"}</div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded bg-emerald-400/10">
                <div className="h-full w-1/2 animate-pulse bg-emerald-400/60" />
              </div>
            </div>
          )}
          {state === "verified" && hit && (
            <div className="rounded-md border-2 border-emerald-600 bg-emerald-50 p-6 text-emerald-900">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em]">
                <ShieldCheck className="h-4 w-4" /> CERTIGO<span className="text-emerald-700">.</span> SECURED
              </div>
              <div className="mt-3 font-display text-2xl font-black">{hit.recipient_name}</div>
              <div className="text-sm">{hit.certifications?.title} · {hit.certifications?.issuer_name}</div>
              <div className="mt-1 font-mono text-[11px]">{formatReference(hit.serial)}</div>
              <Link
                to="/verify/$id"
                params={{ id: hit.serial }}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
              >
                Open public record <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
          {state === "notfound" && (
            <div className="rounded-md border-2 border-destructive bg-destructive/5 p-6 text-sm text-destructive">
              No certificate found for that serial. Double-check the reference.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Linkedin className="h-3.5 w-3.5" /> One-click add to LinkedIn after you pass.
      </div>
    </section>
  );
}