export function generateSerial(): string {
  const year = new Date().getFullYear();
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `KR-${year}-${rnd}`;
}
