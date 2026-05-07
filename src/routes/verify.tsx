import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/kredo/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Verify a Kredo certificate" }, { name: "description", content: "Verify the authenticity of any Kredo certificate." }] }),
  component: Verify,
});

function Verify() {
  const [v, setV] = useState(""); const nav = useNavigate();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = v.trim();
    if (id) nav({ to: "/verify/$id", params: { id } });
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
        <div className="mt-4 micro-label">◆ Public Ledger</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter md:text-5xl">Verify a Kredo credential.</h1>
        <p className="mt-3 text-muted-foreground">Paste a certificate ID or scan the QR code on the certificate.</p>
        <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md gap-2">
          <Input value={v} onChange={(e) => setV(e.target.value)} placeholder="Certificate ID (UUID)" className="h-12" />
          <Button type="submit" className="h-12 px-6">Verify</Button>
        </form>
      </div>
    </div>
  );
}
