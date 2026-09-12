/** Extract CERTIGO. credential references from arbitrary CV text. */
const SERIAL_GLOBAL = /CERT-[A-Za-z0-9]{4}-\d{4}/g;

export function extractSerials(text: string): string[] {
  const found = (text ?? "").match(SERIAL_GLOBAL) ?? [];
  const out: string[] = [];
  for (const s of found) {
    const up = s.toUpperCase();
    if (!out.includes(up)) out.push(up);
  }
  return out;
}

export interface SerialCheck {
  input: string;
  found: boolean;
  serial: string | null;
  status: "active" | "revoked" | "unverified";
  recipient_name: string | null;
  cert_title: string | null;
  issuer_name: string | null;
  issued_at: string | null;
}

export function summariseChecks(rows: SerialCheck[]) {
  return {
    total: rows.length,
    active: rows.filter((r) => r.status === "active").length,
    revoked: rows.filter((r) => r.status === "revoked").length,
    unverified: rows.filter((r) => r.status === "unverified").length,
  };
}
