import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — CERTIGO." }] }),
  component: ProfilePage,
});

type ProfileRow = {
  display_name: string | null;
  headline: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
};

function ProfilePage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileRow>({
    display_name: "",
    headline: "",
    linkedin_url: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, headline, linkedin_url, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();
      setForm({
        display_name:
          data?.display_name ??
          (user.user_metadata?.display_name as string | undefined) ??
          (user.user_metadata?.full_name as string | undefined) ??
          user.email!.split("@")[0],
        headline: data?.headline ?? "",
        linkedin_url: data?.linkedin_url ?? "",
        avatar_url: data?.avatar_url ?? "",
      });
      setLoading(false);
    })();
  }, [user]);

  async function save() {
    if (!user) return;
    const name = (form.display_name ?? "").trim();
    if (!name) { toast.error("Full legal name is required."); return; }
    if (name.length > 120) { toast.error("Name is too long (120 chars max)."); return; }
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        display_name: name,
        headline: form.headline?.trim() || null,
        linkedin_url: form.linkedin_url?.trim() || null,
        avatar_url: form.avatar_url?.trim() || null,
      },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved. Future certificates will use this name.");
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to dashboard
        </Link>
        <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ Profile</div>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tighter">Your credential identity</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is the name printed on every certificate and transcript you earn on CERTIGO.
          Edit it here once — it persists for all future exams.
        </p>

        <div className="mt-8 space-y-5 rounded-xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full legal name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={form.display_name ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              placeholder="Jane A. Doe"
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground">Appears on the certificate exactly as typed.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">Professional headline</Label>
            <Input
              id="headline"
              value={form.headline ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
              placeholder="Senior Product Manager · FinTech"
              maxLength={160}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              type="url"
              value={form.linkedin_url ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
              placeholder="https://www.linkedin.com/in/yourhandle"
              maxLength={300}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar image URL</Label>
            <Textarea
              id="avatar"
              rows={2}
              value={form.avatar_url ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))}
              placeholder="https://…/me.jpg"
              maxLength={500}
            />
          </div>

          <div className="space-y-1 rounded-lg border border-dashed border-border bg-muted/40 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Account</div>
            <div className="text-sm font-medium">{user?.email}</div>
            <div className="text-xs text-muted-foreground">Signed in via your identity provider.</div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => nav({ to: "/dashboard" })}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
