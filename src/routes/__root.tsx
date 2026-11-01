import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import appCss from "../styles.css?url";
import { useEffect } from "react";

function CopyGuard() {
  useEffect(() => {
    const isUnlocked = () => {
      try { return localStorage.getItem("kredo.unlocked") === "1"; } catch { return false; }
    };
    const block = (e: Event) => {
      if (isUnlocked()) return;
      const target = e.target as HTMLElement | null;
      // allow inputs / textareas / contenteditable
      if (target && (target.closest("input, textarea, [contenteditable='true']"))) return;
      e.preventDefault();
    };
    const blockKeys = (e: KeyboardEvent) => {
      if (isUnlocked()) return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["c", "x", "s", "p", "u"].includes(k)) {
        const target = e.target as HTMLElement | null;
        if (target && target.closest("input, textarea, [contenteditable='true']")) return;
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("selectstart", block);
    document.addEventListener("keydown", blockKeys);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("selectstart", block);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);
  return null;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="micro-label">◆ 404</div>
        <h1 className="mt-4 font-display text-5xl font-black tracking-tighter">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-black tracking-tighter">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error instanceof Error ? error.message : String(error)}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CERTIGO. — Learn it. Pass it. Prove it." },
      { name: "description", content: "Learn the essentials free, pass a real exam, and get a certificate employers can verify in seconds." },
      { property: "og:title", content: "CERTIGO. — Learn it. Pass it. Prove it." },
      { property: "og:description", content: "Learn the essentials free, pass a real exam, and get a certificate employers can verify in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "CERTIGO. — Learn it. Pass it. Prove it." },
      { name: "twitter:description", content: "Learn the essentials free, pass a real exam, and get a certificate employers can verify in seconds." },
      { property: "og:image", content: "/og.png" },
      { name: "twitter:image", content: "/og.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:wght@500;700;900&family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <I18nProvider>
          <CopyGuard />
          <Outlet />
          <Toaster />
        </I18nProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}


