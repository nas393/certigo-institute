import { describe, expect, it } from "vitest";
import { buildCertificateDocument, certificateSkills, gradeFor, type CertificateRecord } from "@/lib/certificate-data";

const base: CertificateRecord = {
  id: "e8930590-7f5d-4c75-a98d-9e13f1f6ddf2", serial: "CERT-BRAN-2091", recipient_name: "Nassim",
  recipient_id: "2950c7b9-0e87-4d78-8bbf-80fc3fecbee8", issued_at: "2026-06-27T08:35:35Z", revoked: false,
  score: 75, cert_title: "Brand Positioning", slug: "brand-positioning", issuer_name: "CERTIGO.", summary: "",
  skills: ["Positioning", "Messaging"], modules: [{ title: "Audience", minutes: 18, skills: ["Research"] }], pass_score: 70,
};

describe("certificate document (one source for screen, print and PDF)", () => {
  it("shows PASSED on the certificate and the real score only in the transcript", () => {
    const d = buildCertificateDocument(base);
    expect(d.certificate).not.toHaveProperty("scorePct");
    expect(d.transcript?.finalScorePct).toBe(75);
    expect(d.transcript?.finalGrade).toBe("C");
  });
  it("always includes skills and a transcript when the course has lessons or skills", () => {
    const d = buildCertificateDocument(base);
    expect(d.certificate.skills).toEqual(["Positioning", "Messaging"]);
    expect(d.transcript?.modules).toHaveLength(1);
    expect(d.transcript?.modules[0].title).toBe("Module 1 · Audience");
  });
  it("falls back to lesson skills when the course has none", () => {
    expect(certificateSkills({ skills: [], modules: [{ skills: ["A", "B"] }, { skills: ["B", "C"] }] })).toEqual(["A", "B", "C"]);
  });
  it("adds a translated copy only for a non-English learner, with RTL for Arabic", () => {
    expect(buildCertificateDocument(base).second).toBeUndefined();
    const ar = buildCertificateDocument(base, { lang: "ar", translatedTitle: "تموضع العلامة" });
    expect(ar.second?.dir).toBe("rtl");
    expect(ar.second?.courseTitle).toBe("تموضع العلامة");
    expect(ar.second?.footnote).toMatch(/مترجمة/);
  });
  it("old and new certificates produce the same shape", () => {
    const old = buildCertificateDocument(base);
    const fresh = buildCertificateDocument({ ...base, serial: "CERT-DIFF-4828", score: 100, issued_at: new Date().toISOString() });
    expect(Object.keys(old.certificate).sort()).toEqual(Object.keys(fresh.certificate).sort());
    expect(gradeFor(100)).toBe("A");
  });
});
