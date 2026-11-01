import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Check, Tag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface CheckoutInfo {
  currency: string; single_cents: number; pass_cents: number; pass_days: number; mode: "off" | "test" | "live";
  access: { access: boolean; via?: "admin" | "pass" | "single"; until?: string };
}

export const money = (c: number, cur = "USD") => `${cur === "EUR" ? "€" : "$"}${(c / 100).toFixed(c % 100 ? 2 : 0)}`;

/** Prices and the signed-in learner's access, computed on the server. */
export function useCheckoutInfo(certificationId?: string | null) {
  const { user } = useAuth();
  const [info, setInfo] = useState<CheckoutInfo | null>(null);
  const reload = useCallback(async () => {
    const { data } = await (supabase as any).rpc("checkout_info", { _certification_id: certificationId ?? null });
    setInfo(data as CheckoutInfo);
  }, [certificationId, user?.id]);
  useEffect(() => { void reload(); }, [reload]);
  return { info, reload };
}

interface Pending { order_id: string; total_cents: number; currency: string; kind: "single" | "pass" }

/**
 * Buy a single certificate exam or the monthly pass, with an optional promo code.
 * Prices and discounts are calculated by the server; the browser never marks anything paid.
 */
export function CheckoutPanel({ certificationId, info, onPaid, showSingle = true }: {
  certificationId?: string | null; info: CheckoutInfo; onPaid: () => void; showSingle?: boolean;
}) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  async function buy(kind: "single" | "pass") {
    if (!user) { nav({ to: "/auth" }); return; }
    setBusy(kind);
    const { data, error } = await (supabase as any).rpc("create_order", {
      _kind: kind, _certification_id: kind === "single" ? certificationId : null, _code: code.trim() || null,
    });
    setBusy(null);
    if (error) return toast.error(error.message);
    if (data.status === "paid") { toast.success("Done. Your access is active."); onPaid(); return; }
    setPending({ order_id: data.order_id, total_cents: data.total_cents, currency: data.currency, kind });
  }

  async function testPay() {
    if (!pending) return;
    setBusy("test");
    const { error } = await (supabase as any).rpc("test_pay_order", { _order_id: pending.order_id });
    setBusy(null);
    if (error) return toast.error(error.message);
    setPending(null);
    toast.success("Test payment recorded. Your access is active.");
    onPaid();
  }

  if (info.mode === "off") {
    return <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">Certificate purchases open soon.</p>;
  }

  if (pending) {
    return (
      <div className="rounded-xl border border-emerald-600/30 bg-emerald-50/50 p-5">
        <div className="text-sm font-semibold">Order created: {money(pending.total_cents, pending.currency)}</div>
        {info.mode === "test" ? (
          <>
            <p className="mt-1 text-xs text-muted-foreground">
              Test mode (staging): no real payment is taken. Confirm to simulate a successful payment.
            </p>
            <Button className="mt-3 bg-emerald-600 text-white hover:bg-emerald-700" disabled={busy === "test"} onClick={() => void testPay()}>
              {busy === "test" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm test payment
            </Button>
          </>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            Online payment is being connected. Your order is saved; we'll email you when you can complete it.
          </p>
        )}
        <button className="ml-3 mt-3 text-xs text-muted-foreground underline" onClick={() => setPending(null)}>Cancel</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={"grid gap-3 " + (showSingle ? "sm:grid-cols-2" : "")}>
        {showSingle && (
          <div className="rounded-xl border border-border p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">This certificate</div>
            <div className="mt-1 text-3xl font-black">{money(info.single_cents, info.currency)}</div>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li className="flex gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Exam + verified certificate and transcript</li>
              <li className="flex gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Retakes included until you pass</li>
            </ul>
            <Button className="mt-4 w-full bg-emerald-600 text-white hover:bg-emerald-700" disabled={!!busy} onClick={() => void buy("single")}>
              {busy === "single" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {user ? "Buy certificate exam" : "Sign in to buy"}
            </Button>
          </div>
        )}
        <div className="rounded-xl border-2 border-emerald-600/40 p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-700">Monthly pass</div>
          <div className="mt-1 text-3xl font-black">{money(info.pass_cents, info.currency)}<span className="text-sm font-medium text-muted-foreground"> / {info.pass_days} days</span></div>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li className="flex gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Every certificate exam, open for {info.pass_days} days</li>
            <li className="flex gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> No auto-renewal: renew only if you want</li>
          </ul>
          <Button variant={showSingle ? "outline" : "default"} className={"mt-4 w-full " + (showSingle ? "" : "bg-emerald-600 text-white hover:bg-emerald-700")} disabled={!!busy} onClick={() => void buy("pass")}>
            {busy === "pass" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {user ? "Get the monthly pass" : "Sign in to buy"}
          </Button>
        </div>
      </div>
      {showCode ? (
        <div className="flex max-w-sm gap-2">
          <Input placeholder="Promo code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <span className="self-center text-xs text-muted-foreground">applied when you buy</span>
        </div>
      ) : (
        <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:underline" onClick={() => setShowCode(true)}>
          <Tag className="h-3.5 w-3.5" /> Have a promo code?
        </button>
      )}
    </div>
  );
}
