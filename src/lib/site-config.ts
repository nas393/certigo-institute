/**
 * Site contact details come from environment variables (Vercel → Settings → Environment Variables).
 * Nothing is hardcoded: until an address is set, pages point people to the contact form instead.
 */
const env = (k: string): string | null => {
  const v = (import.meta.env as Record<string, string | undefined>)[k];
  return v && v.trim() ? v.trim() : null;
};

export const SUPPORT_EMAIL = env("VITE_SUPPORT_EMAIL");
export const PRIVACY_EMAIL = env("VITE_PRIVACY_EMAIL") ?? SUPPORT_EMAIL;
export const LEGAL_EMAIL = env("VITE_LEGAL_EMAIL") ?? SUPPORT_EMAIL;
