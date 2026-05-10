import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  const cols: { title: string; links: { to: string; label: string }[] }[] = [
    { title: "Product", links: [
      { to: "/product", label: "Overview" },
      { to: "/pricing", label: "Pricing" },
      { to: "/verify", label: "Verify a credential" },
    ]},
    { title: "Company", links: [
      { to: "/security", label: "Security" },
      { to: "/contact", label: "Contact" },
    ]},
    { title: "Legal", links: [
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms" },
    ]},
  ];

  return (
    <footer className="bg-ink mt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg gradient-hero text-white">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="font-display text-[20px] font-extrabold tracking-tight text-white">
                CERTIGO<span style={{ color: "#06B6D4" }}>.</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-white/60">
              The global infrastructure for issuing, sharing and verifying digital credentials in seconds.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">{c.title}</div>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to as any} className="text-sm text-white/80 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} CERTIGO. All rights reserved.</span>
          <span>Built for trust. Engineered for scale.</span>
        </div>
      </div>
    </footer>
  );
}
