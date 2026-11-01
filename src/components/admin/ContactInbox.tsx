import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Msg { id: string; created_at: string; name: string; email: string; company: string | null; role: string | null; message: string; handled: boolean }

/** Messages sent through the public contact form (admins only, enforced in the database). */
export function ContactInbox() {
  const [rows, setRows] = useState<Msg[] | null>(null);
  const [showAll, setShowAll] = useState(false);
  async function load() {
    let q = (supabase as any).from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);
    if (!showAll) q = q.eq("handled", false);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    setRows((data ?? []) as Msg[]);
  }
  useEffect(() => { void load(); }, [showAll]);
  async function toggle(m: Msg) {
    const { error } = await (supabase as any).from("contact_messages").update({ handled: !m.handled }).eq("id", m.id);
    if (error) return toast.error(error.message);
    void load();
  }
  return (
    <div>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> Show handled messages too
      </label>
      {rows === null ? null : rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No {showAll ? "" : "open "}messages.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((m) => (
            <li key={m.id} className={"rounded-xl border border-border bg-card p-4 " + (m.handled ? "opacity-60" : "")}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-sm font-semibold">
                  {m.name} · <a href={`mailto:${m.email}`} className="text-emerald-700 hover:underline">{m.email}</a>
                  {(m.company || m.role) && <span className="font-normal text-muted-foreground"> · {[m.role, m.company].filter(Boolean).join(", ")}</span>}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{m.message}</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => void toggle(m)}>{m.handled ? "Reopen" : "Mark handled"}</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
