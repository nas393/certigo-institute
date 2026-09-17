import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign, ShieldOff } from "lucide-react";
import { toast } from "sonner";

export function PricingTools({ categories, onDone }: { categories: string[]; onDone: () => void | Promise<void> }) {
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("10");
  const [busy, setBusy] = useState(false);

  const [serial, setSerial] = useState("");
  const [certBusy, setCertBusy] = useState(false);

  async function applyPrice() {
    const cents = Math.max(0, Math.round(Number(price || 0) * 100));
    const where = category ? `every course in ${category}` : "every course";
    if (!window.confirm(`Set the price of ${where} to $${(cents / 100).toFixed(2)}?`)) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("admin_bulk_set_price", {
      _category: (category || null) as unknown as string,
      _price_cents: cents,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${data ?? 0} course${data === 1 ? "" : "s"} repriced.`);
    await onDone();
  }

  async function setRevoked(revoked: boolean) {
    const s = serial.trim().toUpperCase();
    if (!s) { toast.error("Enter a credential reference."); return; }
    setCertBusy(true);
    const { error } = await supabase.rpc("admin_set_certificate_revoked", { _serial: s, _revoked: revoked });
    setCertBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(revoked ? `${s} revoked.` : `${s} restored.`);
    setSerial("");
    await onDone();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-700">◆ Pricing</div>
        <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight">Set prices in bulk</h2>
        <p className="mt-1 text-sm text-muted-foreground">Reprice one category at a time, or the whole catalogue at once.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="p-cat">Category</Label>
            <select
              id="p-cat"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="p-price">New price (USD)</Label>
            <Input id="p-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>
        <Button onClick={() => void applyPrice()} disabled={busy} className="mt-4 min-h-[44px] bg-emerald-600 text-white hover:bg-emerald-700">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />} Apply price
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-700">◆ Credentials</div>
        <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight">Revoke or restore</h2>
        <p className="mt-1 text-sm text-muted-foreground">A revoked credential still verifies, but shows as revoked to anyone checking it.</p>
        <div className="mt-4">
          <Label htmlFor="p-serial">Credential reference</Label>
          <Input id="p-serial" placeholder="CERT-XXXX-0000" value={serial} onChange={(e) => setSerial(e.target.value.toUpperCase())} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" className="min-h-[44px] text-destructive" disabled={certBusy} onClick={() => void setRevoked(true)}>
            {certBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldOff className="mr-2 h-4 w-4" />} Revoke
          </Button>
          <Button variant="outline" className="min-h-[44px]" disabled={certBusy} onClick={() => void setRevoked(false)}>
            Restore
          </Button>
        </div>
      </div>
    </div>
  );
}
