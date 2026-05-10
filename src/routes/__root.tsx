import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
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

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-black tracking-tighter">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
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
      { title: "CERTIGO. — Verified credentials, instantly" },
      { name: "description", content: "CERTIGO. turns any skill into a verified, QR-checked credential employers trust. From knowledge to verified proof — instantly." },
      { property: "og:title", content: "CERTIGO. — Verified credentials, instantly" },
      { property: "og:description", content: "CERTIGO. turns any skill into a verified, QR-checked credential employers trust. From knowledge to verified proof — instantly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "CERTIGO. — Verified credentials, instantly" },
      { name: "twitter:description", content: "CERTIGO. turns any skill into a verified, QR-checked credential employers trust. From knowledge to verified proof — instantly." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/fa968dfd-8290-4094-a1ed-f62431fe9fee" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/fa968dfd-8290-4094-a1ed-f62431fe9fee" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
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
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            <CopyGuard />
            <GoogleTranslate />
            <Outlet />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

/**
 * Google Translate auto-detection.
 * - No visible UI (widget div is hidden, banner suppressed via CSS).
 * - Sets the `googtrans` cookie based on `navigator.language` so the
 *   translation is applied on first paint.
 */
function GoogleTranslate() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("google-translate-script")) return;

    const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
    if (browserLang && browserLang !== "en") {
      const cookie = `/en/${browserLang}`;
      document.cookie = `googtrans=${cookie};path=/`;
      try {
        document.cookie = `googtrans=${cookie};path=/;domain=.${window.location.hostname.replace(/^www\./, "")}`;
      } catch { /* ignore */ }
    }

    (window as any).googleTranslateElementInit = () => {
      const g = (window as any).google;
      if (g?.translate?.TranslateElement) {
        new g.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element"
        );
      }
    };

    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return <div id="google_translate_element" style={{ display: "none" }} aria-hidden />;
}
