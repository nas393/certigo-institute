import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/kredo/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, BadgeCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/unlock")({
  head: () => ({ meta: [{ title: "Upgrade to Pro — Kredo" }, { name: "description", content: "Unlock unlimited verified credentials." }] }),
  component: Unlock,
});

function Unlock() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { nav({ to: "/auth" }); return; }
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { toast.error("Please sign in again"); nav({ to: "/auth" }); return; }
      const res = await fetch("/api/public/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });
      const r = await res.json();
      if (r.ok) {
        toast.success("Everything unlocked!");
        try { localStorage.setItem("kredo.unlocked", "1"); } catch {}
        nav({ to: "/dashboard" });
      } else {
        toast.error("Invalid unlock code");
      }
    } catch {
      toast.error("Failed to redeem");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-primary" />
        <div className="mt-4 micro-label">◆ Kredo Pro</div>
        <h1 className="mt-3 font-display text-5xl font-black tracking-tighter">Unlimited credentials. No watermark.</h1>
        <p className="mt-4 text-muted-foreground">Upgrade once. Issue forever.</p>
        <Card className="mt-10 p-8 text-start">
          <ul className="space-y-3">
            {["Unlimited certificates", "No Kredo watermark on PDF", "Priority AI generation", "Public profile page", "LinkedIn share-ready"].map((f) => (
              <li key={f} className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-primary" /> {f}</li>
            ))}
          </ul>
          <div className="mt-8 flex items-baseline gap-2">
            <span className="font-display text-5xl font-black tracking-tighter">$19</span>
            <span className="text-muted-foreground">/ month</span>
          </div>
          <Button className="mt-6 w-full h-12">Upgrade to Pro</Button>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Coming soon</p>
        </Card>

        <Card className="mt-6 p-6 text-start">
          <div className="flex items-center gap-2 micro-label"><KeyRound className="h-3 w-3" /> Have an unlock code?</div>
          <form onSubmit={submit} className="mt-3 flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code"
              type="password"
              autoComplete="off"
              className="h-11 font-mono"
            />
            <Button type="submit" disabled={busy || !code.trim()} className="h-11">Redeem</Button>
          </form>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">A valid code unlocks all features instantly</p>
        </Card>

        <Button variant="link" className="mt-4" onClick={() => nav({ to: "/dashboard" })}>← Back to dashboard</Button>
      </div>
    </div>
  );
}
