import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ShieldCheck, Loader2, Search, Linkedin, ScanLine } from "lucide-react";
import { formatReference } from "@/lib/cert";

type PlaygroundState = "idle" | "scanning" | "decrypting" | "verified" | "notfound";

export function VerificationPlayground() {
  const [serial, setSerial] = useState("");
  const [state, setState] = useState<PlaygroundState>("idle");
  const [hit, setHit] = useState<any>(null);
  const [sample, setSample] = useState<string | null>(null);

  useEffect(() => {
    supabase.rpc("sample_certificate_serial")
      .then(({ data }: any) => setSample(typeof data === "string" ? data : data?.[0] ?? null));
  }, []);

  async function run(input: string) {
    const s = input.trim().toUpperCase();
    if (!s) return;
    setHit(null);
    setState("scanning");
    await new Promise((r) => setTimeout(r, 600));
    setState("decrypting");
    const { data: raw } = await supabase.rpc("verify_certificate", { lookup: s });
    const row: any = Array.isArray(raw) ? raw[0] : raw;
    const data = row ? { ...row, certifications: { title: row.cert_title, issuer_name: row.issuer_name } } : null;
    await new Promise((r) => setTimeout(r, 500));
    if (data && !data.revoked) {
      setHit(data);
      setState("verified");
    } else {
      setState("notfound");
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8" data-testid="playground">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          <ScanLine className="h-3 w-3" /> Verification playground
        </div>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">Try a live verification.</h2>
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
            data-testid="playground-input"
          />
          <Button onClick={() => run(serial)} className="bg-foreground text-background hover:bg-foreground/90" data-testid="playground-verify">
            <Search className="mr-2 h-4 w-4" /> Verify
          </Button>
        </div>
        {sample && (
          <button
            onClick={() => { setSerial(sample); run(sample); }}
            className="mt-2 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground"
            data-testid="playground-sample"
          >
            ↗ try sample {formatReference(sample)}
          </button>
        )}

        <div className="mt-6 min-h-[160px]" data-testid="playground-output">
          {state === "idle" && (
            <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">Awaiting input…</div>
          )}
          {(state === "scanning" || state === "decrypting") && (
            <div className="overflow-hidden rounded-md border border-border bg-neutral-950 p-6 font-mono text-xs text-emerald-400" data-testid="playground-scanning">
              <div className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> {state === "scanning" ? "Scanning QR signature…" : "Decrypting registry record…"}</div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded bg-emerald-400/10">
                <div className="h-full w-1/2 animate-pulse bg-emerald-400/60" />
              </div>
            </div>
          )}
          {state === "verified" && hit && (
            <div className="rounded-md border-2 border-emerald-600 bg-emerald-50 p-6 text-emerald-900" data-testid="playground-secured">
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
            <div className="rounded-md border-2 border-destructive bg-destructive/5 p-6 text-sm text-destructive" data-testid="playground-notfound">
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