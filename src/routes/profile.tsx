import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Certogo" }, { name: "description", content: "Edit your Certogo profile and language." }] }),
  component: Profile,
});

function Profile() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const { lang, setLang } = useI18n();
  const [name, setName] = useState(""); const [avatar, setAvatar] = useState("");
  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) { setName(data.display_name ?? ""); setAvatar(data.avatar_url ?? ""); }
    });
  }, [user]);
  const save = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ display_name: name, avatar_url: avatar, language: lang, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    if (error) toast.error(error.message); else toast.success("Saved");
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="micro-label">◆ Profile</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter">Your details</h1>
        <Card className="mt-8 p-6 space-y-4">
          <div><Label>Display name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Avatar URL</Label><Input value={avatar} onChange={(e) => setAvatar(e.target.value)} /></div>
          <div>
            <Label>Language</Label>
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2">
              <option value="en">English</option><option value="fr">Français</option>
              <option value="es">Español</option><option value="ar">العربية</option>
            </select>
          </div>
          <Button onClick={save} className="w-full">Save</Button>
        </Card>
      </div>
    </div>
  );
}
