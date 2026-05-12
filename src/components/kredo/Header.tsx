import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

/**
 * Stamp-only CERTIGO mark — gold electronic-seal style.
 * No red wax. Clean, ministerial, scalable.
 */
function CertigoMark({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden role="img">
      <defs>
        <radialGradient id="certigo-mark-g" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f1d68a" />
          <stop offset="55%" stopColor="#c9a24a" />
          <stop offset="100%" stopColor="#8a6a23" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="#0b1a3a" />
      <circle cx="50" cy="50" r="46" fill="none" stroke="url(#certigo-mark-g)" strokeWidth="2.4" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="url(#certigo-mark-g)" strokeWidth="0.8" opacity="0.65" />
      <text x="50" y="62" textAnchor="middle"
        fontFamily="'Cormorant Garamond', 'Times New Roman', serif"
        fontSize="44" fontWeight="700" fill="url(#certigo-mark-g)">C</text>
      {/* tick stripes around perimeter */}
      <g stroke="url(#certigo-mark-g)" strokeWidth="0.6" opacity="0.7">
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const x1 = 50 + Math.cos(a) * 40, y1 = 50 + Math.sin(a) * 40;
          const x2 = 50 + Math.cos(a) * 44, y2 = 50 + Math.sin(a) * 44;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
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
