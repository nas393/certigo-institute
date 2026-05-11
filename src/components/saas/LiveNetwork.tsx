import { useEffect, useState } from "react";
import { Activity, BadgeCheck, Globe2, ShieldCheck, Sparkles, Users, MapPin, Clock } from "lucide-react";

/* ───────── Simulated structured event stream ───────── */
type Event = {
  id: string;
  kind: "issued" | "verified" | "claimed" | "created";
  text: string;
  region: string;
  ts: number;
};

const SEEDS: Omit<Event, "id" | "ts">[] = [
  { kind: "issued",   text: "Digital Marketing credential issued",            region: "Lisbon, PT" },
  { kind: "verified", text: "HR Fundamentals verified",                       region: "Luanda, AO" },
  { kind: "created",  text: "Project Management credential created by Training Partner", region: "São Paulo, BR" },
  { kind: "claimed",  text: "New credential claimed by professional profile", region: "Madrid, ES" },
  { kind: "verified", text: "Leadership & Communication verified by employer",region: "Paris, FR" },
  { kind: "issued",   text: "Supply Chain Management credential issued",      region: "Dubai, AE" },
  { kind: "verified", text: "Cybersecurity Governance verified",              region: "London, UK" },
  { kind: "issued",   text: "Risk & Compliance credential issued",            region: "Nairobi, KE" },
  { kind: "claimed",  text: "Public profile claimed credential",              region: "Mexico City, MX" },
  { kind: "verified", text: "Lean Six Sigma credential verified",             region: "Berlin, DE" },
];

function fmtAgo(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function kindMeta(k: Event["kind"]) {
  switch (k) {
    case "issued":   return { icon: Sparkles,    color: "text-[var(--primary)]", label: "Issued" };
    case "verified": return { icon: ShieldCheck, color: "text-[var(--accent)]",  label: "Verified" };
    case "claimed":  return { icon: BadgeCheck,  color: "text-[var(--primary)]", label: "Claimed" };
    case "created":  return { icon: Activity,    color: "text-[var(--accent)]",  label: "Created" };
  }
}

export function LiveNetwork() {
  const [events, setEvents] = useState<Event[]>(() =>
    SEEDS.slice(0, 6).map((s, i) => ({ ...s, id: `seed-${i}`, ts: Date.now() - (i + 1) * 1000 * 60 * (i + 2) }))
  );

  useEffect(() => {
    const t = setInterval(() => {
      const s = SEEDS[Math.floor(Math.random() * SEEDS.length)];
      setEvents((prev) => [{ ...s, id: crypto.randomUUID?.() ?? String(Math.random()), ts: Date.now() }, ...prev].slice(0, 8));
    }, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <div className="micro-label flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
              </span>
              ◆ Live credential network
            </div>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              The verification network is <span className="gradient-text">always on.</span>
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              A continuous stream of issuance, verification and claim events flowing through the global registry.
              Every event is signed, public and traceable to its issuer.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 max-w-sm">
              {[
                { icon: Globe2, t: "42 countries" },
                { icon: Users,  t: "Issuers active" },
                { icon: ShieldCheck, t: "Signed events" },
              ].map(({ icon: Icon, t }) => (
                <div key={t} className="rounded-lg border border-border bg-surface p-3 text-center">
                  <Icon className="mx-auto h-4 w-4 text-[var(--primary)]" />
                  <div className="mt-1.5 text-[11px] font-medium text-muted-foreground">{t}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="frame-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Registry event stream
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">/v1/events</span>
            </div>
            <ul className="divide-y divide-border">
              {events.map((e) => {
                const m = kindMeta(e.kind);
                const Icon = m.icon;
                return (
                  <li key={e.id} className="flex items-center gap-4 px-5 py-3.5">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface ${m.color}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span className="truncate">{e.text}</span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{e.region}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{fmtAgo(e.ts)}</span>
                        <span className="font-mono text-[10px] uppercase tracking-widest">{m.label}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Activity overview metrics ───────── */
export function ActivityOverview() {
  const metrics = [
    { k: "1,284",  l: "Credentials issued (last 30 days)" },
    { k: "37",     l: "Active issuing organizations" },
    { k: "9,612",  l: "Verified credentials" },
    { k: "42",     l: "Countries with activity" },
    { k: "21,407", l: "Verification requests processed" },
  ];
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="micro-label">◆ Platform activity overview</div>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Conservative, pilot-stage signal — verifiable on every issuer page.
            </h2>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Updated continuously
          </span>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {metrics.map((m) => (
            <div key={m.l} className="rounded-xl border border-border bg-card p-5">
              <div className="font-display text-3xl font-black tracking-tight">{m.k}</div>
              <div className="mt-1 text-xs text-muted-foreground">{m.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Why CERTIGO is trusted ───────── */
export function TrustPillars() {
  const pillars = [
    { t: "Unique credential ID system per certificate", d: "Every credential carries an immutable serial bound to its issuer namespace." },
    { t: "Tamper-resistant verification model",          d: "Hash-anchored records make any post-issuance modification immediately detectable." },
    { t: "Public credential registry",                   d: "Every issuance is queryable through an open, signed verification endpoint." },
    { t: "Instant global verification",                  d: "Sub-second lookups from any region, any device, with QR or direct URL." },
    { t: "Issuer-controlled issuance",                   d: "Only verified organizations can mint, suspend or revoke credentials in their namespace." },
  ];
  return (
    <section>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20">
        <div className="micro-label">◆ Why CERTIGO. is trusted</div>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          A trust layer engineered for verification — not marketing.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p, i) => (
            <div key={p.t} className="rounded-2xl border border-border bg-card p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--primary)]">
                {String(i + 1).padStart(2, "0")} · System logic
              </div>
              <div className="mt-3 font-display text-base font-extrabold">{p.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Early Network Participants ───────── */
export function EarlyAdopters() {
  const rows = [
    { kind: "Training Provider",  region: "Angola",      status: "Live",        color: "text-[var(--accent)]" },
    { kind: "Corporate HR Team",  region: "EU region",   status: "Finalizing",  color: "text-[var(--primary)]" },
    { kind: "Bootcamp Partner",   region: "LATAM",       status: "In progress", color: "text-amber-500" },
    { kind: "Academic Institute", region: "MENA region", status: "Onboarding",  color: "text-[var(--primary)]" },
  ];
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
        <div className="micro-label">◆ Early network participants</div>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold tracking-tight">
          Early adopters validating the credential infrastructure.
        </h2>
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-3 border-b border-border bg-surface px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Participant</span><span>Region</span><span className="text-right">Status</span>
          </div>
          {rows.map((r) => (
            <div key={r.kind + r.region} className="grid grid-cols-3 items-center border-b border-border px-5 py-4 last:border-0">
              <div className="font-display text-sm font-extrabold">{r.kind}</div>
              <div className="text-sm text-muted-foreground">{r.region}</div>
              <div className={`text-right text-xs font-semibold ${r.color}`}>{r.status}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}