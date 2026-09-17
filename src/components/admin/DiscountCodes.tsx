import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Ticket, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

export type CourseOption = { id: string; title: string };

type Code = {
  id: string;
  code: string;
  percent_off: number;
  certification_id: string | null;
  max_redemptions: number | null;
  redemptions: number;
  expires_at: string | null;
  active: boolean;
  note: string;
};

const blank = { code: "", percent_off: "20", certification_id: "", max_redemptions: "", expires_at: "", note: "" };

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `CERTIGO${out}`;
}

export function DiscountCodes({ courses, userId }: { courses: CourseOption[]; userId: string | undefined }) {
  const [rows, setRows] = useState<Code[] | null>(null);
  const [form, setForm] = useState({ ...blank });
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("discount_codes")
      .select("id, code, percent_off, certification_id, max_redemptions, redemptions, expires_at, active, note")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setRows((data ?? []) as Code[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function create() {
    const code = (form.code.trim() || randomCode()).toUpperCase().replace(/[^A-Z0-9-]/g, "");
    if (code.length < 3) { toast.error("A code needs at least 3 characters."); return; }
    const percent = Math.min(100, Math.max(1, Math.round(Number(form.percent_off || 0))));
    if (!percent) { toast.error("Set a discount between 1 and 100 percent."); return; }
    setSaving(true);
    const { error } = await supabase.from("discount_codes").insert({
      code,
      percent_off: percent,
      certification_id: form.certification_id || null,
      max_redemptions: form.max_redemptions ? Math.max(1, Math.round(Number(form.max_redemptions))) : null,
      expires_at: form.expires_at ? new Date(`${form.expires_at}T23:59:59`).toISOString() : null,
      note: form.note.trim(),
      created_by: userId ?? null,
    });
    setSaving(false);
    if (error) {
      toast.error(/unique|duplicate/i.test(error.message) ? "That code already exists." : error.message);
      return;
    }
    toast.success(`Code ${code} created.`);
    setForm({ ...blank });
    setCreating(false);
    await load();
  }

  async function toggle(c: Code) {
    const { error } = await supabase.from("discount_codes").update({ active: !c.active }).eq("id", c.id);
    if (error) { toast.error(error.message); return; }
    setRows((r) => (r ?? []).map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)));
  }

  async function remove(c: Code) {
    if (!window.confirm(`Delete code ${c.code}?`)) return;
    const { error } = await supabase.from("discount_codes").delete().eq("id", c.id);
    if (error) { toast.error(error.message); return; }
    setRows((r) => (r ?? []).filter((x) => x.id !== c.id));
    toast.success("Code deleted.");
  }

  function copy(code: string) {
    void navigator.clipboard?.writeText(code);
    toast.success(`${code} copied.`);
  }

  const courseName = (id: string | null) => (id ? courses.find((c) => c.id === id)?.title ?? "Course" : "All courses");

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-700">◆ Discounts</div>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">Discount codes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Share a code to take a percentage off one course or every course. Learners enter it in the shop.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="min-h-[44px]" onClick={() => setForm((f) => ({ ...f, code: randomCode() }))}>
            Suggest code
          </Button>
          <Button
            className="min-h-[44px] bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => setCreating((v) => !v)}
          >
            <Plus className="mr-2 h-4 w-4" /> New code
          </Button>
        </div>
      </div>

      {creating && (
        <div className="mt-5 rounded-xl border border-border bg-muted/30 p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="d-code">Code</Label>
              <Input id="d-code" placeholder={randomCode()} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <Label htmlFor="d-pct">Discount (%)</Label>
              <Input id="d-pct" inputMode="numeric" value={form.percent_off} onChange={(e) => setForm({ ...form, percent_off: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="d-course">Applies to</Label>
              <select
                id="d-course"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.certification_id}
                onChange={(e) => setForm({ ...form, certification_id: e.target.value })}
              >
                <option value="">All courses</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="d-max">Max uses (optional)</Label>
              <Input id="d-max" inputMode="numeric" placeholder="unlimited" value={form.max_redemptions} onChange={(e) => setForm({ ...form, max_redemptions: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="d-exp">Expires (optional)</Label>
              <Input id="d-exp" type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="d-note">Internal note</Label>
              <Input id="d-note" placeholder="e.g. LinkedIn campaign" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={() => void create()} disabled={saving} className="min-h-[44px] bg-emerald-600 text-white hover:bg-emerald-700">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ticket className="mr-2 h-4 w-4" />} Create code
            </Button>
            <Button variant="outline" className="min-h-[44px]" onClick={() => { setCreating(false); setForm({ ...blank }); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="mt-5">
        {!rows ? (
          <div className="grid place-items-center py-8"><Loader2 className="animate-spin" /></div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No discount codes yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="p-3">Code</th><th className="p-3">Off</th><th className="p-3">Applies to</th>
                  <th className="p-3">Used</th><th className="p-3">Expires</th><th className="p-3">Status</th><th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 last:border-0">
                    <td className="p-3">
                      <button onClick={() => copy(c.code)} className="inline-flex items-center gap-1.5 font-mono font-semibold hover:underline">
                        {c.code} <Copy className="h-3 w-3 text-muted-foreground" />
                      </button>
                      {c.note ? <div className="text-xs text-muted-foreground">{c.note}</div> : null}
                    </td>
                    <td className="p-3">{c.percent_off}%</td>
                    <td className="p-3">{courseName(c.certification_id)}</td>
                    <td className="p-3">{c.redemptions}{c.max_redemptions ? ` / ${c.max_redemptions}` : ""}</td>
                    <td className="p-3">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</td>
                    <td className="p-3">
                      <span className={"rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] " + (c.active ? "bg-emerald-600/10 text-emerald-700" : "bg-muted text-muted-foreground")}>
                        {c.active ? "active" : "paused"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => void toggle(c)}>{c.active ? "Pause" : "Activate"}</Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => void remove(c)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
