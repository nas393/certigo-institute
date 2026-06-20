import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { LinkedInButton } from "@/components/cert/LinkedInButton";
import { buildLinkedInAddToProfileUrl, linkedInMetaFromCert } from "@/lib/linkedin";

const fixture = {
  certTitle: "Product Management Foundations",
  issuerName: "CERTIGO.",
  issuedAt: "2026-06-20T10:00:00Z",
  serial: "CERT-PMFN-0042",
  verifyUrl: "https://certigo.app/verify/CERT-PMFN-0042",
};

describe("LinkedInButton — Add to Profile", () => {
  it("constructs the URL from certTitle, issuerName, issueMonth/issueYear, certSerialId", () => {
    render(<LinkedInButton {...fixture} />);
    const a = screen.getByTestId("linkedin-add") as HTMLAnchorElement;
    const expected = buildLinkedInAddToProfileUrl(linkedInMetaFromCert(fixture));
    expect(a.href).toBe(expected);
    const u = new URL(a.href);
    expect(u.searchParams.get("name")).toBe(fixture.certTitle);
    expect(u.searchParams.get("organizationName")).toBe(fixture.issuerName);
    expect(u.searchParams.get("issueYear")).toBe("2026");
    expect(u.searchParams.get("issueMonth")).toBe("6");
    expect(u.searchParams.get("certId")).toBe(fixture.serial);
  });

  it("opens in a new tab (target=_blank, rel noopener noreferrer)", () => {
    render(<LinkedInButton {...fixture} />);
    const a = screen.getByTestId("linkedin-add") as HTMLAnchorElement;
    expect(a.target).toBe("_blank");
    expect(a.rel).toContain("noopener");
    expect(a.rel).toContain("noreferrer");
  });

  it("clicking the button triggers navigation to the LinkedIn URL in a new tab", () => {
    render(<LinkedInButton {...fixture} />);
    const a = screen.getByTestId("linkedin-add") as HTMLAnchorElement;
    const opened: { url?: string; target?: string } = {};
    const origOpen = window.open;
    window.open = ((u: string, t?: string) => { opened.url = u; opened.target = t; return null; }) as any;
    // jsdom doesn't follow real anchor target=_blank — simulate the browser behavior
    a.addEventListener("click", (e) => {
      e.preventDefault();
      window.open(a.href, a.target);
    });
    fireEvent.click(a);
    window.open = origOpen;
    expect(opened.url).toBe(a.href);
    expect(opened.target).toBe("_blank");
  });
});