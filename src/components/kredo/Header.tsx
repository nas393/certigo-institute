import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

/**
 * CERTIGO. mark — refined ministerial seal.
 * Deep navy medallion, brushed-gold serif monogram C with the brand
 * terminal dot, double engraved ring with guilloche bead-work.
 */
function CertigoMark({ size = 32 }: { size?: number }) {
  const beads = Array.from({ length: 48 });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden role="img">
      <defs>
        <radialGradient id="certigo-medallion" cx="38%" cy="30%" r="85%">
          <stop offset="0%" stopColor="#16294f" />
          <stop offset="60%" stopColor="#0b1a3a" />
          <stop offset="100%" stopColor="#050d22" />
        </radialGradient>
        <linearGradient id="certigo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7e4a3" />
          <stop offset="40%" stopColor="#d8b15a" />
          <stop offset="70%" stopColor="#a37b2c" />
          <stop offset="100%" stopColor="#6e4f17" />
        </linearGradient>
        <linearGradient id="certigo-gold-soft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1d68a" />
          <stop offset="100%" stopColor="#b0832e" />
        </linearGradient>
      </defs>

      {/* Medallion */}
      <circle cx="50" cy="50" r="47" fill="url(#certigo-medallion)" />

      {/* Outer engraved ring */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="url(#certigo-gold)" strokeWidth="1.4" />
      <circle cx="50" cy="50" r="43.2" fill="none" stroke="url(#certigo-gold)" strokeWidth="0.5" opacity="0.7" />

      {/* Guilloche bead ring */}
      <g fill="url(#certigo-gold-soft)">
        {beads.map((_, i) => {
          const a = (i / beads.length) * Math.PI * 2;
          const x = 50 + Math.cos(a) * 44.6;
          const y = 50 + Math.sin(a) * 44.6;
          return <circle key={i} cx={x} cy={y} r="0.55" opacity={i % 2 ? 0.9 : 0.55} />;
        })}
      </g>

      {/* Inner stage */}
      <circle cx="50" cy="50" r="35" fill="none" stroke="url(#certigo-gold)" strokeWidth="0.9" opacity="0.85" />
      <circle cx="50" cy="50" r="33.4" fill="none" stroke="url(#certigo-gold)" strokeWidth="0.4" opacity="0.45" />

      {/* Monogram C with brand terminal dot */}
      <g transform="translate(0,2)">
        <text
          x="46.5"
          y="64"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', 'Playfair Display', 'Times New Roman', serif"
          fontStyle="italic"
          fontWeight="600"
          fontSize="46"
          fill="url(#certigo-gold)"
          style={{ paintOrder: "stroke fill" }}
          stroke="#3a2a08"
          strokeWidth="0.4"
          strokeOpacity="0.55"
        >
          C
        </text>
        {/* Brand dot — echoes the wordmark's terminal period */}
        <circle cx="66.5" cy="62" r="3.2" fill="url(#certigo-gold-soft)" />
        <circle cx="65.4" cy="60.9" r="0.9" fill="#fff8e1" opacity="0.85" />
      </g>

      {/* Hairline tick marks at cardinal points */}
      <g stroke="url(#certigo-gold)" strokeWidth="0.7" opacity="0.85">
        <line x1="50" y1="3.5" x2="50" y2="7.5" />
        <line x1="50" y1="92.5" x2="50" y2="96.5" />
        <line x1="3.5" y1="50" x2="7.5" y2="50" />
        <line x1="92.5" y1="50" x2="96.5" y2="50" />
      </g>

      {/* Soft top highlight for dimensional read */}
      <ellipse cx="38" cy="22" rx="22" ry="8" fill="#ffffff" opacity="0.06" />
    </svg>
  );
}

const NAV: { to: string; label: string }[] = [
  { to: "/product", label: "Product" },
  { to: "/pricing", label: "Pricing" },
  { to: "/security", label: "Security" },
  { to: "/verify", label: "Verify" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
      .then(({ data }) => setIsAdmin((data?.length ?? 0) > 0));
  }, [user]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" aria-label="CERTIGO. home">
          <span className="grid h-9 w-9 place-items-center" aria-hidden>
            <CertigoMark size={36} />
          </span>
          <span className="font-display text-[20px] font-extrabold tracking-tight text-foreground">
            CERTIGO<span className="text-[hsl(var(--accent))]" style={{ color: "var(--primary)" }}>.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((l) => (
            <Link
              key={l.to}
              to={l.to as any}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-sm font-medium text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button
              size="sm"
              variant="outline"
              className="hidden md:inline-flex h-9"
              onClick={async () => { await signOut(); nav({ to: "/" }); }}
            >
              Sign out
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="hidden md:inline-flex h-9 text-sm"
                onClick={() => nav({ to: "/auth" })}
              >
                Sign in
              </Button>
              <Button
                size="sm"
                className="hidden md:inline-flex h-9 gradient-hero text-white border-0 hover:opacity-95"
                onClick={() => nav({ to: "/auth" })}
              >
                Start free trial
              </Button>
            </>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden h-9 w-9" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background">
              <SheetHeader>
                <SheetTitle className="font-display text-xl font-extrabold">
                  CERTIGO<span style={{ color: "var(--primary)" }}>.</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col">
                {NAV.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to as any}
                    onClick={() => setOpen(false)}
                    className="border-b border-border py-3 text-sm font-medium hover:text-[var(--primary)]"
                  >
                    {l.label}
                  </Link>
                ))}
                {user && (
                  <Link to="/dashboard" onClick={() => setOpen(false)}
                    className="border-b border-border py-3 text-sm font-medium hover:text-[var(--primary)]">
                    Dashboard
                  </Link>
                )}
                <div className="mt-6 flex flex-col gap-2">
                  {user ? (
                    <Button variant="outline" onClick={async () => { setOpen(false); await signOut(); nav({ to: "/" }); }}>
                      Sign out
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => { setOpen(false); nav({ to: "/auth" }); }}>
                        Sign in
                      </Button>
                      <Button className="gradient-hero text-white border-0" onClick={() => { setOpen(false); nav({ to: "/auth" }); }}>
                        Start free trial
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
