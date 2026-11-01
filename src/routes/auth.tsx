import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/kredo/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — CERTIGO." }] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && user) nav({ to: "/dashboard" }); }, [user, loading, nav]);

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password: pw,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { display_name: name } },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome. Check your inbox to confirm your email.");
  };
  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false); if (error) toast.error(error.message);
  };
  const forgot = async () => {
    if (!email) { toast.error("Enter your email first, then tap “Forgot password?”."); return; }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    // Same message either way, so the form doesn't reveal which emails have accounts.
    if (error && error.status === 429) toast.error("Too many requests. Please wait a few minutes and try again.");
    else toast.success("If an account exists for this email, a reset link is on its way.");
  };


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-md px-5 py-16">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ Account</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter">Sign in to CERTIGO<span className="text-emerald-600">.</span></h1>
        <p className="mt-2 text-sm text-muted-foreground">Your certificates are tied to your account.</p>

        <div className="mt-6" />

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={signIn} className="mt-4 space-y-3">
              <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label>Password</Label><Input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} /></div>
              <Button type="submit" disabled={busy} className="w-full">{busy ? "…" : "Sign in"}</Button>
              <button type="button" onClick={() => void forgot()} disabled={busy} className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Forgot password?
              </button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={signUp} className="mt-4 space-y-3">
              <div><Label>Full name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="The name printed on your certificate" /></div>
              <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label>Password</Label><Input type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} /></div>
              <Button type="submit" disabled={busy} className="w-full">{busy ? "…" : "Create account"}</Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← back to home</Link>
        </p>
      </div>
    </div>
  );
}