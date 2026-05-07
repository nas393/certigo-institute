import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useI18n, type Lang } from "@/lib/i18n";
import { useTheme, ACCENTS, BACKGROUNDS, FONTS, type AccentKey, type BgKey, type FontKey } from "@/lib/theme";
import { Settings as SettingsIcon, Check, RotateCcw, KeyRound } from "lucide-react";
import { CERT_TEMPLATES, type CertTemplate, CertificateView } from "@/components/kredo/CertificateView";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Kredo" },
      { name: "description", content: "Personalize your Kredo experience: language, color, background, and typography." },
    ],
  }),
  component: Settings,
});

const LANGS: { v: Lang; label: string }[] = [
  { v: "en", label: "English" },
  { v: "es", label: "Español" },
  { v: "pt", label: "Português" },
  { v: "fr", label: "Français" },
  { v: "ar", label: "العربية" },
];

function Settings() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { lang, setLang } = useI18n();
  const { accent, bg, font, setAccent, setBg, setFont, reset } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compact, setCompact] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [certTpl, setCertTpl] = useState<CertTemplate>("classic");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReducedMotion(localStorage.getItem("kredo.motion") === "reduced");
    setCompact(localStorage.getItem("kredo.density") === "compact");
    document.documentElement.classList.toggle("reduce-motion", localStorage.getItem("kredo.motion") === "reduced");
    const t = (localStorage.getItem("kredo.certTemplate") as CertTemplate) || "classic";
    setCertTpl(t);
  }, []);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name ?? ""));
  }, [user]);

  const saveName = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ display_name: displayName.trim() }).eq("user_id", user.id);
    if (error) toast.error(error.message); else toast.success("Profile updated");
  };
  const toggleMotion = (v: boolean) => {
    setReducedMotion(v);
    localStorage.setItem("kredo.motion", v ? "reduced" : "normal");
    document.documentElement.classList.toggle("reduce-motion", v);
  };
  const toggleCompact = (v: boolean) => {
    setCompact(v);
    localStorage.setItem("kredo.density", v ? "compact" : "comfortable");
  };
  const tryAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { nav({ to: "/auth" }); return; }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { nav({ to: "/auth" }); return; }
      const res = await fetch("/api/public/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: adminCode }),
      });
      const r = await res.json();
      if (r.ok) { toast.success("Access granted"); nav({ to: "/admin" }); }
      else toast.error("Invalid code");
    } catch { toast.error("Could not verify code"); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <div>
            <div className="micro-label">◆ Preferences</div>
            <h1 className="font-display text-4xl font-black tracking-tighter">Settings</h1>
          </div>
        </div>

        <Card className="mt-8 p-6">
          <h2 className="font-display text-xl font-black tracking-tight">Language</h2>
          <p className="mt-1 text-sm text-muted-foreground">Used across the app interface. Certificates remain in the original course language.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button
                key={l.v}
                onClick={() => setLang(l.v)}
                className={`rounded-full border px-4 py-2 text-sm transition ${lang === l.v ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}
              >
                {lang === l.v && <Check className="me-1 inline h-3.5 w-3.5" />}
                {l.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="font-display text-xl font-black tracking-tight">Accent color</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pick a primary color. Certificates always render in the canonical Kredo palette.</p>
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-7">
            {(Object.keys(ACCENTS) as AccentKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setAccent(k)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition ${accent === k ? "border-foreground" : "border-border hover:border-foreground/40"}`}
              >
                <span className="h-8 w-8 rounded-full ring-1 ring-border" style={{ background: ACCENTS[k].swatch }} />
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{ACCENTS[k].label}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="font-display text-xl font-black tracking-tight">Background</h2>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {(Object.keys(BACKGROUNDS) as BgKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setBg(k)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition ${bg === k ? "border-foreground" : "border-border hover:border-foreground/40"}`}
              >
                <span className="h-8 w-12 rounded ring-1 ring-border" style={{ background: BACKGROUNDS[k].swatch }} />
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{BACKGROUNDS[k].label}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="font-display text-xl font-black tracking-tight">Typography</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(FONTS) as FontKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setFont(k)}
                className={`rounded-lg border p-3 text-start transition ${font === k ? "border-foreground" : "border-border hover:border-foreground/40"}`}
                style={{ fontFamily: FONTS[k].display }}
              >
                <div className="font-black">{FONTS[k].label}</div>
                <div className="mt-1 text-xs text-muted-foreground">The quick brown fox.</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="font-display text-xl font-black tracking-tight">Certificate template</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pick the design used when generating your certificates. The accent dot follows your theme color.</p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CERT_TEMPLATES.map((t) => (
              <button
                key={t.key}
                onClick={() => { setCertTpl(t.key); localStorage.setItem("kredo.certTemplate", t.key); }}
                className={`group rounded-lg border p-2 text-start transition ${certTpl === t.key ? "border-foreground ring-2 ring-primary/30" : "border-border hover:border-foreground/40"}`}
              >
                <div className="overflow-hidden rounded">
                  <CertificateView
                    compact
                    template={t.key}
                    serial="KR-2026-PREVIEW"
                    recipientName="Your Name"
                    courseTopic="Sample Course"
                    score={94}
                    issuedAt={new Date().toISOString()}
                    verifyUrl="https://kredo.app/verify/preview"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{t.label}</span>
                  {certTpl === t.key && <Check className="h-4 w-4 text-primary" />}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{t.hint}</div>
              </button>
            ))}
          </div>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={reset}><RotateCcw className="me-2 h-4 w-4" /> Reset to defaults</Button>
        </div>

        {user && (
          <Card className="mt-6 p-6">
            <h2 className="font-display text-xl font-black tracking-tight">Profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your display name appears on your public profile.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" maxLength={80} className="h-10" />
              <Button onClick={saveName}>Save</Button>
            </div>
          </Card>
        )}

        <Card className="mt-6 p-6">
          <h2 className="font-display text-xl font-black tracking-tight">Accessibility & density</h2>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="font-medium">Reduce motion</div>
              <div className="text-sm text-muted-foreground">Disables non-essential animations.</div>
            </div>
            <Switch checked={reducedMotion} onCheckedChange={toggleMotion} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="font-medium">Compact layout</div>
              <div className="text-sm text-muted-foreground">Tighter spacing across cards and lists.</div>
            </div>
            <Switch checked={compact} onCheckedChange={toggleCompact} />
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="font-display text-xl font-black tracking-tight">Advanced</h2>
          <p className="mt-1 text-sm text-muted-foreground">Authorized personnel only.</p>
          <form onSubmit={tryAdmin} className="mt-3 flex gap-2">
            <Input value={adminCode} onChange={(e) => setAdminCode(e.target.value)} type="password" placeholder="Access code" autoComplete="off" className="h-10 font-mono" />
            <Button type="submit" variant="outline"><KeyRound className="me-2 h-4 w-4" /> Enter</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}