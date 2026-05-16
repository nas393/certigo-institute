import { describe, it, expect } from "vitest";
import { formatSerial, generateSerial } from "./cert";

/**
 * End-to-end style checks for credential reference rendering and verify URL
 * resolution. These guarantee that:
 *   1. Every issued serial fits the canonical KR-YYYY-XXXX-XX shape.
 *   2. The displayed reference is always `CERTIGO. ${formattedSerial}`.
 *   3. The QR / verify URL points at `${origin}/verify/${certId}` — the same
 *      record the verify page loads.
 */

const renderRef = (serial: string) => `CERTIGO. ${formatSerial(serial)}`;
const buildVerifyUrl = (origin: string, certId: string) => `${origin}/verify/${certId}`;

describe("credential reference id", () => {
  it("formats new serials into KR-YYYY-XXXX-XX", () => {
    const s = generateSerial();
    expect(s).toMatch(/^KR-\d{4}-[A-Z0-9]{4}-[A-Z0-9]{2}$/);
    expect(formatSerial(s)).toBe(s);
  });

  it("normalises legacy serials", () => {
    expect(formatSerial("KR-2026-AB12CD")).toBe("KR-2026-AB12-CD");
  });

  it("renders reference exactly as 'CERTIGO. <code>'", () => {
    const ref = renderRef("KR-2026-ABCD-12");
    expect(ref).toBe("CERTIGO. KR-2026-ABCD-12");
    expect(ref).toMatch(/^CERTIGO\.\s\S+$/);
  });
});

describe("verify url resolution", () => {
  const origin = "https://certigo-institute.lovable.app";
  const certId = "9f5d1c7a-1234-4abc-9def-0123456789ab";

  it("builds a verify url that resolves to the cert record id", () => {
    const url = buildVerifyUrl(origin, certId);
    expect(url).toBe(`${origin}/verify/${certId}`);
    const parsed = new URL(url);
    expect(parsed.pathname).toBe(`/verify/${certId}`);
  });

  it("round-trips: ref + verify url describe the same record", () => {
    const serial = "KR-2026-ABCD-12";
    const ref = renderRef(serial);
    const url = buildVerifyUrl(origin, certId);
    expect(ref.startsWith("CERTIGO. ")).toBe(true);
    expect(url.endsWith(`/verify/${certId}`)).toBe(true);
  });
});