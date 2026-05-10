import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/kredo/ThemeSwitcher";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Header() {
  const { user, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();
  const nav = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").then(({ data }) => setIsAdmin((data?.length ?? 0) > 0));
  }, [user]);

  const navLink = "font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors";

  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/92 backdrop-blur-xl">
      {/* institute strap */}
      <div className="border-b border-foreground/15 bg-foreground text-background">
        <div className="mx-auto flex h-7 max-w-7xl items-center justify-between px-6 font-mono text-[10px] uppercase tracking-[0.28em]">
          <span className="opacity-80">CERTIGO Institute · Professional Certification Authority</span>
          <span className="hidden opacity-60 sm:inline">EST. MMXXVI · Geneva · Lagos · Singapore</span>
        </div>
      </div>

      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-6 px-6">
        <Link to="/" className="flex items-baseline gap-3" aria-label="CERTIGO. home">
          <span className="font-display text-[26px] leading-none tracking-[-0.045em] text-foreground">
            CERTIGO<span className="text-wax">.</span>
          </span>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground sm:inline">
            Institute
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          <Link to="/" className={navLink}>{t("nav.home")}</Link>
          {user && <Link to="/dashboard" className={navLink}>{t("nav.dashboard")}</Link>}
          <Link to="/verify" className={navLink}>{t("nav.verify")}</Link>
          {user && <Link to="/profile" className={navLink}>{t("nav.profile")}</Link>}
          <Link to="/settings" className={navLink}>{t("nav.settings")}</Link>
          {isAdmin && <Link to="/admin" className={navLink}>Admin</Link>}
        </nav>

        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            aria-label={t("lang.label")}
            className="border-x border-foreground/30 bg-transparent px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground focus:outline-none"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="pt">PT</option>
            <option value="fr">FR</option>
            <option value="ar">AR</option>
          </select>
          <div className="hidden sm:block"><ThemeSwitcher /></div>
          {user ? (
            <Button variant="outline" size="sm" className="hidden md:inline-flex h-9 rounded-none border-foreground font-mono text-[10px] uppercase tracking-[0.22em]" onClick={async () => { await signOut(); nav({ to: "/" }); }}>
              {t("nav.signout")}
            </Button>
          ) : (
            <Button size="sm" className="hidden md:inline-flex h-9 rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-[10px] uppercase tracking-[0.22em]" onClick={() => nav({ to: "/auth" })}>
              {t("nav.signin")}
            </Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden h-9 w-9 rounded-none border-foreground" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-l-2 border-foreground bg-background">
              <SheetHeader>
                <SheetTitle className="font-display tracking-tight">CERTIGO<span className="text-wax">.</span></SheetTitle>
                <div className="micro-label">Institute · Menu</div>
              </SheetHeader>
              <nav className="mt-6 flex flex-col">
                {[
                  { to: "/" as const, label: t("nav.home") },
                  ...(user ? [{ to: "/dashboard" as const, label: t("nav.dashboard") }] : []),
                  { to: "/verify" as const, label: t("nav.verify") },
                  ...(user ? [{ to: "/profile" as const, label: t("nav.profile") }] : []),
                  { to: "/settings" as const, label: t("nav.settings") },
                ].map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                    className="border-b border-foreground/15 py-3 font-mono text-xs uppercase tracking-[0.22em] hover:text-wax">
                    {l.label}
                  </Link>
                ))}
                <div className="mt-6 border-t-2 border-foreground pt-5">
                  <label className="micro-label mb-2 block">{t("lang.label")}</label>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as Lang)}
                    className="w-full border border-foreground bg-transparent px-3 py-2 font-mono text-xs uppercase tracking-[0.18em]"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="pt">Português</option>
                    <option value="fr">Français</option>
                    <option value="ar">العربية</option>
                  </select>
                  {user ? (
                    <Button variant="outline" className="mt-4 w-full rounded-none border-foreground font-mono text-[10px] uppercase tracking-[0.22em]" onClick={async () => { setOpen(false); await signOut(); nav({ to: "/" }); }}>
                      {t("nav.signout")}
                    </Button>
                  ) : (
                    <Button className="mt-4 w-full rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-[10px] uppercase tracking-[0.22em]" onClick={() => { setOpen(false); nav({ to: "/auth" }); }}>
                      {t("nav.signin")}
                    </Button>
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
