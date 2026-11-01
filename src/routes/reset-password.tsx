import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/kredo/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — CERTIGO." }, { name: "robots", content: "noindex" }] }),
  component: ResetPasswordPage,
});

/** Opened from the reset email. Supabase signs the user in with a recovery session; they then set a new password. */
function ResetPasswordPage() {
  const nav = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => setReady((r) => r ?? !!data.session));
    const t = setTimeout(() => setReady((r) => r ?? false), 4000);
    return () => { sub.subscription.unsubscribe(); clearTimeout(t); };
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Use at least 8 characters.");
    if (pw !== pw2) return toast.error("The two passwords don't match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-md px-5 py-16">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ Account</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter">Set a new password<span className="text-emerald-600">.</span></h1>
        {ready === false ? (
          <p className="mt-4 text-sm text-muted-foreground">
            This reset link is invalid or has expired.{" "}
            <Link to="/auth" className="underline underline-offset-4">Request a new one</Link> from the sign-in page.
          </p>
        ) : (
          <form onSubmit={save} className="mt-6 space-y-3">
            <div><Label>New password</Label><Input type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
            <div><Label>Repeat new password</Label><Input type="password" required minLength={8} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
            <Button type="submit" disabled={busy || !ready} className="w-full">{busy ? "…" : ready ? "Save new password" : "Checking link…"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
