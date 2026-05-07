import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette, RotateCcw } from "lucide-react";
import { ACCENTS, BACKGROUNDS, FONTS, useTheme, type AccentKey, type BgKey, type FontKey } from "@/lib/theme";

export function ThemeSwitcher() {
  const { accent, bg, font, setAccent, setBg, setFont, reset } = useTheme();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Customize theme">
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-4">
        <div className="flex items-center justify-between">
          <div className="micro-label">◆ Theme</div>
          <button onClick={reset} className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>

        <div className="mt-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Accent</div>
          <div className="grid grid-cols-7 gap-1.5">
            {(Object.keys(ACCENTS) as AccentKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setAccent(k)}
                title={ACCENTS[k].label}
                className={`h-7 w-7 rounded-full border-2 transition ${accent === k ? "border-foreground scale-110" : "border-border"}`}
                style={{ background: ACCENTS[k].swatch }}
              />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Background</div>
          <div className="grid grid-cols-5 gap-1.5">
            {(Object.keys(BACKGROUNDS) as BgKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setBg(k)}
                title={BACKGROUNDS[k].label}
                className={`h-9 rounded-md border-2 transition ${bg === k ? "border-foreground scale-105" : "border-border"}`}
                style={{ background: BACKGROUNDS[k].swatch }}
              />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Font</div>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(FONTS) as FontKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setFont(k)}
                className={`rounded-md border px-2 py-1.5 text-xs transition ${font === k ? "border-foreground bg-accent" : "border-border"}`}
                style={{ fontFamily: FONTS[k].display }}
              >
                {FONTS[k].label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Certificates keep their classic look</p>
      </PopoverContent>
    </Popover>
  );
}