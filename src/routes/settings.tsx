import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n, type Lang } from "@/lib/i18n";
import { useTheme, ACCENTS, BACKGROUNDS, FONTS, type AccentKey, type BgKey, type FontKey } from "@/lib/theme";
import { Settings as SettingsIcon, Check, RotateCcw } from "lucide-react";

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
  const { lang, setLang } = useI18n();
  const { accent, bg, font, setAccent, setBg, setFont, reset } = useTheme();

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

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={reset}><RotateCcw className="me-2 h-4 w-4" /> Reset to defaults</Button>
        </div>
      </div>
    </div>
  );
}