import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Settings { pass_cents: number; pass_days: number; currency: string; payments_mode: string }
interface Order { id: string; created_at: string; kind: string; total_cents: number; discount_cents: number; currency: string; status: string; provider: string | null; certification_id: string | null }

const money = (c: number, cur: string) => `${cur === "EUR" ? "€" : "$"}${(c / 100).toFixed(c % 100 ? 2 : 0)}`;

/** Monthly pass price, payment mode and recent orders. Single-certificate prices are set per course. */
export function PaymentSettings() {
  const db = supabase as any;
  const [s, setS] = useState<Settings | null>(null);
  const [form, setForm] = useState({ pass: "", days: "", currency: "USD", mode: "test" });
  const [orders, setOrders] = useState<Order[]>([]);
  async function load() {
    const { data } = await db.from("pricing_settings").select("pass_cents, pass_days, currency, payments_mode").maybeSingle();
    if (data) { setS(data); setForm({ pass: String(data.pass_cents / 100), days: String(data.pass_days), currency: data.currency, mode: data.payments_mode }); }
    const { data: o } = await db.from("orders").select("id, created_at, kind, total_cents, discount_cents, currency, status, provider, certification_id").order("created_at", { ascending: false }).limit(25);
    setOrders(o ?? []);
  }
  useEffect(() => { void load(); }, []);
  async function save() {
    if (form.mode === "live" && !window.confirm("Live mode accepts real payments only through the payment provider. The provider is not connected yet, so purchases will stay pending. Continue?")) return;
    const { error } = await db.from("pricing_settings").update({
      pass_cents: Math.max(0, Math.round(Number(form.pass) * 100)), pass_days: Math.max(1, Math.round(Number(form.days))),
      currency: form.currency, payments_mode: form.mode, updated_at: new Date().toISOString(),
    }).eq("id", true);
    if (error) return toast.error(error.message);
    toast.success("Payment settings saved."); void load();
  }
  if (!s) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-700">◆ Payments</div>
      <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight">Monthly pass & payment mode</h2>
      <p className="mt-1 text-sm text-muted-foreground">Single-certificate prices are set per course (below). The pass opens every exam for the set number of days.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        <div><Label>Pass price</Label><Input inputMode="decimal" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} /></div>
        <div><Label>Pass length (days)</Label><Input inputMode="numeric" value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} /></div>
        <div><Label>Currency</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
            <option>USD</option><option>EUR</option>
          </select></div>
        <div><Label>Payment mode</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
            <option value="test">Test (staging only)</option><option value="live">Live (provider only)</option><option value="off">Off (no purchases)</option>
          </select></div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Test mode lets buyers confirm orders without paying, for testing. Never use it on the public launch.</p>
      <Button className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => void save()}>Save</Button>

      <h3 className="mt-8 font-semibold">Recent orders</h3>
      {orders.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No orders yet.</p> : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-1">Date</th><th>Type</th><th>Total</th><th>Discount</th><th>Status</th><th>Via</th></tr></thead>
            <tbody>{orders.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="py-1.5">{new Date(o.created_at).toLocaleString()}</td>
                <td>{o.kind === "pass" ? "Monthly pass" : "Certificate"}</td>
                <td>{money(o.total_cents, o.currency)}</td>
                <td>{o.discount_cents ? money(o.discount_cents, o.currency) : "—"}</td>
                <td>{o.status}</td>
                <td>{o.provider ?? "—"}</td>
              </tr>))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
