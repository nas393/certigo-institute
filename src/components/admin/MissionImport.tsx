import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

/** Mission files live in content-src/missions/<course-slug>.json and are bundled into the admin page only.
 *  A mission goes live only if its review passed (review.score_pct >= 90); the rest are loaded unpublished. */
const files = import.meta.glob("../../../content-src/missions/*.json", {
  eager: true,
  import: "default",
}) as Record<string, any>;
const missions = Object.values(files);

export function MissionImport() {
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  async function run() {
    setBusy(true);
    const out: string[] = [];
    for (const m of missions) {
      const publish = (m.review?.score_pct ?? 0) >= 90;
      const { data, error } = await (supabase.rpc as any)("admin_upsert_mission", {
        _slug: m.slug,
        _title: m.title,
        _content: m.content,
        _review: m.review ?? {},
        _publish: publish,
      });
      out.push(
        error
          ? `✗ ${m.slug}: ${error.message}`
          : data?.ok
            ? `✓ ${m.slug}: ${data.steps} steps, ${data.published ? "live" : "draft"}`
            : `✗ ${m.slug}: ${data?.error}`,
      );
    }
    setLog(out);
    setBusy(false);
    toast.success(
      `Missions imported: ${out.filter((l) => l.startsWith("✓")).length}/${missions.length}`,
    );
  }
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        ◆ Missions
      </div>
      <p className="mt-1 text-sm">
        {missions.length} mission file(s) in this build. Import loads them; reviewed ones (≥ 90%) go
        live, which requires a passed mission before the exam.
      </p>
      <Button className="mt-3" disabled={busy} onClick={run}>
        {busy ? "Importing…" : "Import missions"}
      </Button>
      {log.length > 0 && <pre className="mt-3 whitespace-pre-wrap text-xs">{log.join("\n")}</pre>}
    </div>
  );
}
