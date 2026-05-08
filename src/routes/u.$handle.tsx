import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Award, ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/u/$handle")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.handle} — Certogo profile` },
      { name: "description", content: `Verified credentials issued to ${params.handle} on Certogo.` },
    ],
  }),
  component: PublicProfile,
});

function PublicProfile() {
  const { handle } = useParams({ from: "/u/$handle" });
  const [profile, setProfile] = useState<any>(null);
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Match handle against user_id (uuid) or display_name
      const { data: profs } = await supabase.from("profiles").select("*").or(`user_id.eq.${handle},display_name.eq.${handle}`).limit(1);
      const p = profs?.[0];
      setProfile(p);
      if (p) {
        const { data: cs } = await supabase.from("certificates").select("*").eq("user_id", p.user_id).order("issued_at", { ascending: false });
        setCerts((cs || []).filter((c: any) => !c.revoked));
      }
      setLoading(false);
    })();
  }, [handle]);

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!profile) return (
    <div className="min-h-screen bg-background"><Header />
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl font-black tracking-tighter">Profile not found</h1>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="micro-label">◆ Public profile</div>
        <div className="mt-4 flex items-center gap-5">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 font-display text-2xl font-black text-primary">
              {(profile.display_name || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-display text-4xl font-black tracking-tighter">{profile.display_name || "Anonymous"}</h1>
            <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-primary" /> {certs.length} verified credentials
            </div>
          </div>
        </div>

        <section className="mt-12">
          <div className="micro-label">◆ Credentials</div>
          {certs.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No public credentials yet.</p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {certs.map((c) => (
                <Link key={c.id} to="/verify/$id" params={{ id: c.id }}>
                  <Card className="flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-elegant">
                    <div className="grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-primary"><Award /></div>
                    <div>
                      <div className="font-display font-bold tracking-tight">{c.course_topic}</div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{c.serial} · {c.score}%</div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
