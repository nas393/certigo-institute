import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useI18n, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="font-display text-xl font-black tracking-tighter">
          KREDO<span className="text-primary">.</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">{t("nav.home")}</Link>
          {user && <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">{t("nav.dashboard")}</Link>}
          <Link to="/verify" className="text-sm font-medium text-muted-foreground hover:text-foreground">{t("nav.verify")}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="hidden rounded-md border border-border bg-transparent px-2 py-1 font-mono text-xs uppercase tracking-widest text-muted-foreground sm:block"
          >
            <option value="en">EN</option><option value="fr">FR</option>
            <option value="es">ES</option><option value="ar">AR</option>
          </select>
          {user ? (
            <Button variant="outline" size="sm" onClick={async () => { await signOut(); nav({ to: "/" }); }}>{t("nav.signout")}</Button>
          ) : (
            <Button size="sm" onClick={() => nav({ to: "/auth" })}>{t("nav.signin")}</Button>
          )}
        </div>
      </div>
    </header>
  );
}
