import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Trash2, ShieldOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Certogo" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

function Admin() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [certs, setCerts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      const ok = (roles?.length ?? 0) > 0;
      setIsAdmin(ok);
      if (!ok) return;
      const [c, p] = await Promise.all([
        supabase.from("certificates").select("*").order("issued_at", { ascending: false }).limit(200),
        supabase.from("profiles").select("*").limit(200),
      ]);
      setCerts(c.data || []);
      setProfiles(p.data || []);
    })();
  }, [user]);

  const revoke = async (id: string, val: boolean) => {
    const { error } = await supabase.from("certificates").update({ revoked: val }).eq("id", id);
    if (error) return toast.error(error.message);
    setCerts((s) => s.map((c) => c.id === id ? { ...c, revoked: val } : c));
    toast.success(val ? "Revoked" : "Restored");
  };
  const del = async (id: string) => {
    if (!confirm("Delete certificate permanently?")) return;
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setCerts((s) => s.filter((c) => c.id !== id));
  };
  const togglePremium = async (uid: string, val: boolean) => {
    const { error } = await supabase.from("profiles").update({ premium: val }).eq("user_id", uid);
    if (error) return toast.error(error.message);
    setProfiles((s) => s.map((p) => p.user_id === uid ? { ...p, premium: val } : p));
  };

  if (loading || isAdmin === null) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!isAdmin) return (
    <div className="min-h-screen bg-background"><Header />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-black tracking-tighter">Admin access required</h1>
        <p className="mt-2 text-muted-foreground">Use an unlock code on the <a href="/unlock" className="text-primary underline">unlock page</a> if you have one.</p>
      </div>
    </div>
  );

  const filtered = certs.filter((c) => !q || c.serial.toLowerCase().includes(q.toLowerCase()) || c.recipient_name.toLowerCase().includes(q.toLowerCase()) || c.course_topic.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="micro-label">◆ Admin</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter">Certificate management</h1>

        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by serial, name, topic" className="mt-6 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />

        <Card className="mt-6 divide-y">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-display font-bold tracking-tight">{c.course_topic} {c.revoked && <span className="ms-2 rounded bg-destructive/20 px-2 py-0.5 font-mono text-[10px] text-destructive">REVOKED</span>}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{c.serial} · {c.recipient_name} · {c.score}%</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => revoke(c.id, !c.revoked)}>
                  {c.revoked ? <><ShieldCheck className="me-1 h-4 w-4" />Restore</> : <><ShieldOff className="me-1 h-4 w-4" />Revoke</>}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => del(c.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No certificates.</div>}
        </Card>

        <h2 className="mt-12 font-display text-2xl font-black tracking-tight">Users</h2>
        <Card className="mt-4 divide-y">
          {profiles.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{p.display_name || "—"} {p.premium && <span className="ms-2 rounded bg-primary/20 px-2 py-0.5 font-mono text-[10px] text-primary">PRO</span>}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{p.user_id}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => togglePremium(p.user_id, !p.premium)}>{p.premium ? "Remove Pro" : "Grant Pro"}</Button>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
