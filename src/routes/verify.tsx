import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Header } from "@/components/kredo/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Verify a Kredo certificate" }, { name: "description", content: "Verify the authenticity of any Kredo certificate." }] }),
  component: Verify,
});

function Verify() {
  const [v, setV] = useState(""); const [busy, setBusy] = useState(false); const nav = useNavigate();
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = v.trim();
    if (!raw) return;
    setBusy(true);
    try {
      // Allow pasting full verify URL
      const fromUrl = raw.match(/verify\/([0-9a-f-]{36})/i)?.[1];
      const candidate = fromUrl ?? raw;
      if (UUID_RE.test(candidate)) {
        nav({ to: "/verify/$id", params: { id: candidate } });
        return;
      }
      // Try lookup by serial
      const { data, error } = await supabase
        .from("certificates")
        .select("id")
        .eq("serial", candidate.toUpperCase())
        .maybeSingle();
      if (error || !data) { toast.error("Certificate not found"); return; }
      nav({ to: "/verify/$id", params: { id: data.id } });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
        <div className="mt-4 micro-label">◆ Public Ledger</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter md:text-5xl">Verify a Kredo credential.</h1>
        <p className="mt-3 text-muted-foreground">Paste a certificate ID, serial, or full verify URL — or scan the QR code.</p>
        <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md gap-2">
          <Input value={v} onChange={(e) => setV(e.target.value)} placeholder="Certificate ID, serial, or URL" className="h-12" />
          <Button type="submit" disabled={busy} className="h-12 px-6">Verify</Button>
        </form>
      </div>
    </div>
  );
}
