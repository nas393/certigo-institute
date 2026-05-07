import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/unlock")({
  head: () => ({ meta: [{ title: "Upgrade to Pro — Kredo" }, { name: "description", content: "Unlock unlimited verified credentials." }] }),
  component: Unlock,
});

function Unlock() {
  const nav = useNavigate();
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
            {["Unlimited certificates", "No Kredo watermark on PDF", "Priority AI generation", "LinkedIn integration", "Public profile page"].map((f) => (
              <li key={f} className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-primary" /> {f}</li>
            ))}
          </ul>
          <div className="mt-8 flex items-baseline gap-2">
            <span className="font-display text-5xl font-black tracking-tighter">$19</span>
            <span className="text-muted-foreground">/ month</span>
          </div>
          <Button className="mt-6 w-full h-12">Upgrade to Pro</Button>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Coming soon · Get notified at launch</p>
        </Card>
        <Button variant="link" className="mt-4" onClick={() => nav({ to: "/dashboard" })}>← Back to dashboard</Button>
      </div>
    </div>
  );
}
