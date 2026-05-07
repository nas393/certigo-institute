export function generateSerial(): string {
  const year = new Date().getFullYear();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = (n: number) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `KR-${year}-${pick(4)}-${pick(2)}`;
}

// Normalize legacy serials (e.g. KR-2026-AB12CD) to KR-YYYY-XXXX-XX for display.
export function formatSerial(serial: string): string {
  if (!serial) return serial;
  const s = serial.toUpperCase().trim();
  if (/^KR-\d{4}-[A-Z0-9]{4}-[A-Z0-9]{2}$/.test(s)) return s;
  const m = s.match(/^KR-(\d{4})-([A-Z0-9]+)$/);
  if (m) {
    const tail = m[2].padEnd(6, "0").slice(0, 6);
    return `KR-${m[1]}-${tail.slice(0, 4)}-${tail.slice(4, 6)}`;
  }
  return s;
}
