import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/use-admin";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

/**
 * CERTIGO. mark — minimalist geometric monogram.
 * A precise open "C" arc on a deep navy square with rounded corners,
 * resolved by an emerald verification check at its terminal. Technical,
 * professional, instantly readable at favicon size.
 */
function CertigoMark({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden role="img">
      {/* Navy tile */}
      <rect x="2" y="2" width="60" height="60" rx="14" fill="#0B1B3A" />
      {/* Subtle inset hairline */}
      <rect x="5" y="5" width="54" height="54" rx="11" fill="none" stroke="#ffffff" strokeOpacity="0.08" />
      {/* Open geometric "C" — arc opens to the right where the check resolves it */}
      <path
        d="M44 20a16 16 0 1 0 0 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="square"
      />
      {/* Verification check — closes the C, emerald accent */}
      <path
        d="M38 32.5l5 5 9.5-11"
        fill="none"
        stroke="#10B981"
        strokeWidth="4.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

const NAV: { to: string; key: string }[] = [
  { to: "/catalog", key: "nav.catalog" },
  { to: "/pricing", key: "nav.pricing" },
  { to: "/about", key: "nav.about" },
  { to: "/hr", key: "nav.hr" },
  { to: "/contact", key: "nav.contact" },
];

export function Header() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { t } = useI18n();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const accountLinks = user
    ? [
        { to: "/portal", label: t("nav.learning") },
        { to: "/dashboard", label: t("nav.dashboard") },
        { to: "/profile", label: t("nav.profile") },
        ...(isAdmin ? [{ to: "/admin", label: t("nav.admin") }] : []),
      ]
    : [];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" aria-label="CERTIGO. home">
          <span className="grid h-9 w-9 place-items-center" aria-hidden>
            <CertigoMark size={36} />
          </span>
          <span className="font-display text-[20px] font-extrabold tracking-tight text-foreground">
            CERTIGO<span style={{ color: "#10B981" }}>.</span>
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
              {t(l.key)}
            </Link>
          ))}
          {accountLinks.map((l) => (
            <Link key={l.to} to={l.to as any} className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {user ? (
            <Button
              size="sm"
              variant="outline"
              className="hidden md:inline-flex h-9"
              onClick={async () => { await signOut(); nav({ to: "/" }); }}
            >
              {t("auth.signOut")}
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="hidden md:inline-flex h-9 text-sm"
                onClick={() => nav({ to: "/auth" })}
              >
                {t("auth.signIn")}
              </Button>
              <Button
                size="sm"
                className="hidden md:inline-flex h-9 gradient-hero text-white border-0 hover:opacity-95"
                onClick={() => nav({ to: "/catalog" })}
              >
                {t("auth.start")}
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
                  CERTIGO<span style={{ color: "#10B981" }}>.</span>
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
                    {t(l.key)}
                  </Link>
                ))}
                {accountLinks.map((l) => (
                  <Link key={l.to} to={l.to as any} onClick={() => setOpen(false)}
                    className="border-b border-border py-3 text-sm font-medium hover:text-[var(--primary)]">
                    {l.label}
                  </Link>
                ))}
                <div className="mt-6 flex flex-col gap-2">
                  {user ? (
                    <Button variant="outline" onClick={async () => { setOpen(false); await signOut(); nav({ to: "/" }); }}>
                      {t("auth.signOut")}
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => { setOpen(false); nav({ to: "/auth" }); }}>
                        {t("auth.signIn")}
                      </Button>
                      <Button className="gradient-hero text-white border-0" onClick={() => { setOpen(false); nav({ to: "/catalog" }); }}>
                        {t("auth.start")}
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
