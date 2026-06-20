import { describe, it, expect } from "vitest";
import { buildLinkedInAddToProfileUrl, linkedInMetaFromCert } from "@/lib/linkedin";

describe("buildLinkedInAddToProfileUrl", () => {
  const meta = {
    certTitle: "Product Management Foundations",
    issuerName: "CERTIGO.",
    issueYear: 2026,
    issueMonth: 6,
    certSerialId: "CERT-PMFN-0042",
    verifyUrl: "https://certigo.app/verify/CERT-PMFN-0042",
  };

  it("contains all 6 spec params and CERTIFICATION_NAME task", () => {
    const url = buildLinkedInAddToProfileUrl(meta);
    const u = new URL(url);
    expect(u.host).toBe("www.linkedin.com");
    expect(u.pathname).toBe("/profile/add");
    expect(u.searchParams.get("startTask")).toBe("CERTIFICATION_NAME");
    expect(u.searchParams.get("name")).toBe(meta.certTitle);
    expect(u.searchParams.get("organizationName")).toBe(meta.issuerName);
    expect(u.searchParams.get("issueYear")).toBe("2026");
    expect(u.searchParams.get("issueMonth")).toBe("6");
    expect(u.searchParams.get("certUrl")).toBe(meta.verifyUrl);
    expect(u.searchParams.get("certId")).toBe(meta.certSerialId);
  });

  it("URL-encodes title with spaces and special chars", () => {
    const url = buildLinkedInAddToProfileUrl({ ...meta, certTitle: "AI & Data — Pro" });
    expect(url).toContain("name=AI+%26+Data+%E2%80%94+Pro");
    expect(new URL(url).searchParams.get("name")).toBe("AI & Data — Pro");
  });

  it("derives year/month from issuedAt", () => {
    const m = linkedInMetaFromCert({
      certTitle: "X", issuedAt: "2026-06-20T10:00:00Z", serial: "CERT-XXXX-1234",
      verifyUrl: "https://x/verify/CERT-XXXX-1234",
    });
    expect(m.issueYear).toBe(2026);
    expect(m.issueMonth).toBe(6);
    expect(m.issuerName).toBe("CERTIGO.");
    expect(m.certSerialId).toBe("CERT-XXXX-1234");
  });
});