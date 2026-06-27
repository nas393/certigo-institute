import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Copy, Link as LinkIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";

/**
 * Staging-only UI: generates a public, login-free shareable verification link
 * for the given certificate. Public `/verify/$serial` is already RLS-readable,
 * so the link works without a session — but the toggle (and any guidance) is
 * gated to non-production builds so it never appears on the published site.
 */
export function StagingShareToggle({ serial }: { serial: string }) {
  // Show only outside the published production deploy.
  const isStaging =
    import.meta.env.DEV ||
    import.meta.env.MODE !== "production" ||
    (typeof window !== "undefined" && /lovable\.app|localhost|preview/i.test(window.location.hostname) && !/^certigo-institute\.lovable\.app$/i.test(window.location.hostname));
  if (!isStaging) return null;

  const [on, setOn] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/verify/${serial}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Shareable link copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <div
      data-testid="staging-share-toggle"
      className="mt-6 rounded-md border-2 border-dashed border-amber-500/50 bg-amber-50/40 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-amber-700">
            ◆ Staging only · share link
          </div>
          <div className="mt-1 text-sm text-amber-900">
            Generate a public verification link — opens for anyone, no login required.
          </div>
        </div>
        <Switch checked={on} onCheckedChange={setOn} aria-label="Enable share link" />
      </div>
      {on && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded border border-amber-300 bg-white px-3 py-2 font-mono text-[11px] text-neutral-800">
            <LinkIcon className="h-3.5 w-3.5 text-amber-600" />
            <span className="truncate" data-testid="staging-share-url">{url}</span>
          </div>
          <Button size="sm" variant="outline" onClick={copy}>
            <Copy className="mr-1 h-3.5 w-3.5" /> Copy
          </Button>
          <Button size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3.5 w-3.5" /> Open
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}