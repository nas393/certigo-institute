import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/kredo/ThemeSwitcher";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import logoUrl from "@/assets/kredo-logo.png";

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
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoUrl} alt="Kredo" className="h-6 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">{t("nav.home")}</Link>
          {user && <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">{t("nav.dashboard")}</Link>}
          <Link to="/verify" className="text-sm font-medium text-muted-foreground hover:text-foreground">{t("nav.verify")}</Link>
          {user && <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground">Profile</Link>}
          <Link to="/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground">Settings</Link>
          {isAdmin && <Link to="/admin" className="text-sm font-medium text-primary hover:text-primary/80">Admin</Link>}
        </nav>
        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="hidden rounded-md border border-border bg-transparent px-2 py-1 font-mono text-xs uppercase tracking-widest text-muted-foreground sm:block"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="pt">PT</option>
            <option value="fr">FR</option>
            <option value="ar">AR</option>
          </select>
          <div className="hidden sm:block"><ThemeSwitcher /></div>
          {user ? (
            <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={async () => { await signOut(); nav({ to: "/" }); }}>{t("nav.signout")}</Button>
          ) : (
            <Button size="sm" className="hidden md:inline-flex" onClick={() => nav({ to: "/auth" })}>{t("nav.signin")}</Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {[
                  { to: "/" as const, label: t("nav.home") },
                  ...(user ? [{ to: "/dashboard" as const, label: t("nav.dashboard") }] : []),
                  { to: "/verify" as const, label: t("nav.verify") },
                  ...(user ? [{ to: "/profile" as const, label: "Profile" }] : []),
                  { to: "/settings" as const, label: "Settings" },
                  ...(isAdmin ? [{ to: "/admin" as const, label: "Admin" }] : []),
                ].map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
                    {l.label}
                  </Link>
                ))}
                <div className="mt-4 border-t border-border pt-4">
                  {user ? (
                    <Button variant="outline" className="w-full" onClick={async () => { setOpen(false); await signOut(); nav({ to: "/" }); }}>{t("nav.signout")}</Button>
                  ) : (
                    <Button className="w-full" onClick={() => { setOpen(false); nav({ to: "/auth" }); }}>{t("nav.signin")}</Button>
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
