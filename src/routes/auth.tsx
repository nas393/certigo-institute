import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/kredo/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — CERTIGO. Institute" }, { name: "description", content: "Access the CERTIGO. Institute candidate portal." }] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!loading && user) nav({ to: "/dashboard" }); }, [user, loading]);

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { display_name: name } } });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Check your inbox to confirm your email.");
  };
  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false); if (error) toast.error(error.message);
  };
  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (r.error) toast.error("Google sign-in failed");
  };

  const inputCls = "h-11 rounded-none border-foreground/30 bg-background focus-visible:ring-0 focus-visible:border-foreground";
  const labelCls = "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1fr_1fr] lg:items-start">
        {/* Left: institutional plate */}
        <div className="hidden lg:block">
          <div className="relative border-2 border-foreground bg-card p-10 shadow-frame">
            <div className="absolute -top-3 -left-3 h-6 w-6 bg-wax" />
            <div className="micro-label">◆ Candidate Portal · Vol. I</div>
            <h2 className="mt-6 font-display text-5xl uppercase leading-[0.9] tracking-[-0.045em]">
              The Institute<br/>
              <span className="font-serif italic font-semibold normal-case text-foreground/70">welcomes you.</span>
            </h2>
            <div className="mt-8 h-px w-24 bg-foreground" />
            <p className="mt-6 font-serif text-lg italic text-muted-foreground">
              CERTIGO. credentials are issued under the Digital Skills Competency Framework (DSCF™), recognized by hiring authorities across thirty-eight countries.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-6">
              {[["12,400+", "Credentials issued"], ["84,000+", "Verifications"]].map(([n, l]) => (
                <div key={l} className="border-t border-foreground pt-3">
                  <div className="font-display text-3xl tracking-[-0.04em]">{n}</div>
                  <div className="micro-label mt-1">{l}</div>
                </div>
              ))}
            </div>
            <div className="mt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              ◆ Issued by the Certigo Certification Board
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div>
          <div className="micro-label">◆ Section A · Access</div>
          <h1 className="mt-4 font-display text-4xl uppercase tracking-[-0.04em] md:text-5xl">
            Issue your first<br/><span className="text-wax">credential.</span>
          </h1>
          <p className="mt-3 font-serif text-lg italic text-muted-foreground">Enter your details to begin certification.</p>

          <Button variant="outline" className="mt-8 h-11 w-full rounded-none border-2 border-foreground font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-foreground hover:text-background" onClick={google}>
            Continue with Google
          </Button>
          <div className="my-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <div className="h-px flex-1 bg-foreground/30" /> ◆ or by email <div className="h-px flex-1 bg-foreground/30" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 rounded-none border border-foreground bg-transparent p-0">
              <TabsTrigger value="signin" className="rounded-none font-mono text-[11px] uppercase tracking-[0.22em] data-[state=active]:bg-foreground data-[state=active]:text-background">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-none font-mono text-[11px] uppercase tracking-[0.22em] data-[state=active]:bg-foreground data-[state=active]:text-background">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4 pt-6">
                <div><Label className={labelCls}>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-2 ${inputCls}`} /></div>
                <div><Label className={labelCls}>Password</Label><Input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} className={`mt-2 ${inputCls}`} /></div>
                <Button type="submit" className="h-11 w-full rounded-none bg-foreground font-mono text-[11px] uppercase tracking-[0.22em] text-background hover:bg-wax" disabled={busy}>{busy ? "..." : "◆ Sign in"}</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-4 pt-6">
                <div><Label className={labelCls}>Display name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} className={`mt-2 ${inputCls}`} /></div>
                <div><Label className={labelCls}>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-2 ${inputCls}`} /></div>
                <div><Label className={labelCls}>Password</Label><Input type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} className={`mt-2 ${inputCls}`} /></div>
                <Button type="submit" className="h-11 w-full rounded-none bg-foreground font-mono text-[11px] uppercase tracking-[0.22em] text-background hover:bg-wax" disabled={busy}>{busy ? "..." : "◆ Create account"}</Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-8 border-t border-foreground/20 pt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            By continuing you accept the Institute's Terms · DSCF™ Framework
          </p>
        </div>
      </div>
    </div>
  );
}
