import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { Check, Clock, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Course Shop — CERTIGO." },
      { name: "description", content: "Browse every CERTIGO. course with its price and study time, and add it straight to your learning portal." },
      { property: "og:title", content: "Course Shop — CERTIGO." },
      { property: "og:description", content: "Every CERTIGO. course with price, duration and instant access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

type ShopCourse = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  price_cents: number;
  modules: unknown;
  question_count: number;
};

/** Total study time: sum of lesson minutes, plus ~10 minutes for the exam. */
function durationLabel(modules: unknown): string {
  const list = Array.isArray(modules) ? (modules as Array<{ minutes?: number }>) : [];
  const lessonMinutes = list.reduce((sum, m) => sum + (Number(m?.minutes) || 12), 0);
  const total = lessonMinutes + 10;
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function ShopPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState<ShopCourse[] | null>(null);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  useEffect(() => {
    supabase
      .from("certifications")
      .select("id, slug, title, category, summary, price_cents, modules, question_count")
      .order("category")
      .order("title")
      .then(({ data }) => setRows((data ?? []) as ShopCourse[]));
  }, []);

  useEffect(() => {
    if (!user) { setOwned(new Set()); return; }
    supabase.from("enrollments").select("certification_id").eq("user_id", user.id)
      .then(({ data }) => setOwned(new Set((data ?? []).map((e: any) => e.certification_id))));
  }, [user]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set((rows ?? []).map((r) => r.category))).sort()],
    [rows],
  );

  const needle = q.trim().toLowerCase();
  const shown = (rows ?? []).filter(
    (r) =>
      (cat === "All" || r.category === cat) &&
      (!needle || r.title.toLowerCase().includes(needle) || r.summary.toLowerCase().includes(needle) || r.category.toLowerCase().includes(needle)),
  );

  async function buy(c: ShopCourse) {
    if (!user) { nav({ to: "/auth" }); return; }
    setBusy(c.id);
    const { error } = await supabase.from("enrollments").insert({ user_id: user.id, certification_id: c.id });
    setBusy(null);
    if (error && !/duplicate|unique/i.test(error.message)) { toast.error(error.message); return; }
    setOwned((prev) => new Set(prev).add(c.id));
    toast.success(`${c.title} added to My learning.`);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="mx-auto max-w-7xl px-5 pt-16 pb-2 sm:px-8 sm:pt-20">
        <div className="flex items-start gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg gradient-hero text-white">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--primary)]">Shop</div>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Pick a course. Start in seconds.
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Every course includes the lessons, the exam, the certificate, the transcript and lifetime verification.
              Add one to your learning portal and begin right away.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="w-full max-w-xs">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  cat === c ? "border-transparent bg-[var(--primary)] text-white" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8">
        {!rows ? (
          <div className="grid place-items-center py-20"><Loader2 className="animate-spin" /></div>
        ) : shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No course matches your search.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((c) => {
              const has = owned.has(c.id);
              return (
                <div key={c.id} className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">◆ {c.category}</div>
                  <Link to="/c/$slug" params={{ slug: c.slug }} className="mt-2 font-display text-lg font-extrabold leading-snug hover:underline">
                    {c.title}
                  </Link>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.summary}</p>

                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {durationLabel(c.modules)}</span>
                    <span>{c.question_count} exam questions</span>
                  </div>

                  <div className="mt-auto pt-6">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="font-display text-2xl font-black tracking-tighter">{formatPrice(c.price_cents)}</div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">per credential</div>
                      </div>
                      {has ? (
                        <Link to="/portal">
                          <Button variant="outline" size="sm" className="h-10">
                            <Check className="mr-1.5 h-4 w-4" /> In My learning
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          className="h-10 gradient-hero border-0 text-white"
                          disabled={busy === c.id}
                          onClick={() => void buy(c)}
                        >
                          {busy === c.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ShoppingBag className="mr-1.5 h-4 w-4" />}
                          {user ? "Buy course" : "Sign in to buy"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
