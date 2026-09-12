/** Course pricing helpers. Prices are stored in cents on certifications. */
export function formatPrice(cents: number | null | undefined): string {
  const c = Math.max(0, Math.round(cents ?? 0));
  if (c === 0) return "Free";
  return c % 100 === 0 ? `$${c / 100}` : `$${(c / 100).toFixed(2)}`;
}
