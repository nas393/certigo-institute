/**
 * Serial format: CERT-XXXX-NNNN
 *   - XXXX: 4 uppercase letters/digits derived from the certification slug or random
 *   - NNNN: 4 random digits
 * Reference rendering: `CERTIGO. CERT-XXXX-NNNN`
 */
const SERIAL_RE = /^CERT-[A-Z0-9]{4}-\d{4}$/;

function codeFromSlug(slug?: string): string {
  const base = (slug ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (base.length >= 4) {
    // pick 4 distinctive letters: first letter of each word-ish chunk if possible
    const initials = (slug ?? "")
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
    if (initials.length >= 4) return initials.slice(0, 4);
    return base.slice(0, 4);
  }
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = base;
  while (out.length < 4) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export function generateSerial(slug?: string): string {
  const code = codeFromSlug(slug);
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `CERT-${code}-${num}`;
}

export function formatSerial(serial: string): string {
  if (!serial) return serial;
  const s = serial.toUpperCase().trim();
  if (SERIAL_RE.test(s)) return s;
  // legacy / partial — keep readable
  return s;
}

/** Canonical reference: `CERTIGO. CERT-XXXX-NNNN` */
export function formatReference(serial: string): string {
  return `CERTIGO. ${formatSerial(serial)}`;
}

export function isValidSerial(serial: string): boolean {
  return SERIAL_RE.test((serial ?? "").toUpperCase().trim());
}

/**
 * Resolve the printed recipient name for a certificate.
 * Rules:
 *   1. Prefer profile.display_name (trimmed).
 *   2. Fall back to identity-provider name (e.g. Google full_name / display_name).
 *   3. Fall back to the email local-part.
 *   4. Never return empty; caps at 120 chars to protect layout.
 */
export function resolveRecipientName(input: {
  profileName?: string | null;
  providerName?: string | null;
  email?: string | null;
}): string {
  const clean = (s?: string | null) =>
    (s ?? "").replace(/\s+/g, " ").trim();
  const candidates = [
    clean(input.profileName),
    clean(input.providerName),
    clean(input.email).split("@")[0],
  ];
  const first = candidates.find((c) => c.length > 0) ?? "CERTIGO. Recipient";
  return first.slice(0, 120);
}
