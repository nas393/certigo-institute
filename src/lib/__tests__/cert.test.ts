import { describe, it, expect } from "vitest";
import { formatSerial, formatReference, generateSerial, isValidSerial } from "@/lib/cert";

describe("cert serial format", () => {
  it("generateSerial yields CERT-XXXX-NNNN with 4 digits", () => {
    for (let i = 0; i < 50; i++) {
      const s = generateSerial("product-management-foundations");
      expect(s).toMatch(/^CERT-[A-Z0-9]{4}-\d{4}$/);
    }
  });

  it("isValidSerial accepts canonical form only", () => {
    expect(isValidSerial("CERT-PMFN-0042")).toBe(true);
    expect(isValidSerial("cert-pmfn-0042")).toBe(true); // case-insensitive validation
    expect(isValidSerial("KR-2026-ABCD-12")).toBe(false);
    expect(isValidSerial("nope")).toBe(false);
  });

  it("formatReference renders exactly `CERTIGO. CERT-XXXX-NNNN`", () => {
    expect(formatReference("CERT-PMFN-0042")).toBe("CERTIGO. CERT-PMFN-0042");
    expect(formatReference("cert-pmfn-0042")).toBe("CERTIGO. CERT-PMFN-0042");
  });

  it("formatSerial uppercases input", () => {
    expect(formatSerial("cert-pmfn-0042")).toBe("CERT-PMFN-0042");
  });
});