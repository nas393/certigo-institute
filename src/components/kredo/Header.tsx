import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, ShieldCheck } from "lucide-react";

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
          <span className="grid h-8 w-8 place-items-center rounded-lg gradient-hero text-white shadow-glow">
            <ShieldCheck className="h-4 w-4" />
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
