import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params, ...rest }: any) => (
    <a href={typeof to === "string" ? to : "#"} {...rest}>{children}</a>
  ),
}));

const SAMPLE = {
  serial: "CERT-PMFN-0042",
  recipient_name: "Alex Johnson",
  issued_at: "2026-06-20T10:00:00Z",
  revoked: false,
  certifications: { title: "Product Management Foundations", issuer_name: "CERTIGO." },
};

// Mock the supabase client BEFORE importing the component
vi.mock("@/integrations/supabase/client", () => {
  const rpc = vi.fn((fn: string, args?: any) => {
    if (fn === "sample_certificate_serial") {
      return Promise.resolve({ data: SAMPLE.serial, error: null });
    }
    if (fn === "verify_certificate") {
      const lookup = String(args?.lookup ?? "").toUpperCase();
      if (lookup === SAMPLE.serial) {
        return Promise.resolve({
          data: [{
            serial: SAMPLE.serial,
            recipient_name: SAMPLE.recipient_name,
            issued_at: SAMPLE.issued_at,
            revoked: false,
            score: 96,
            cert_title: SAMPLE.certifications.title,
            issuer_name: SAMPLE.certifications.issuer_name,
            skills: [],
          }],
          error: null,
        });
      }
      return Promise.resolve({ data: [], error: null });
    }
    return Promise.resolve({ data: null, error: null });
  });
  return { supabase: { rpc, from: vi.fn(() => ({})) } };
});

import { VerificationPlayground } from "@/components/playground/VerificationPlayground";

describe("Verification Playground", () => {
  it("resolves a sample ID to a real record and shows the CERTIGO. SECURED card", async () => {
    render(<VerificationPlayground />);

    // Sample button populates after initial sample fetch
    const sampleBtn = await screen.findByTestId("playground-sample", {}, { timeout: 3000 });
    expect(sampleBtn.textContent).toContain(SAMPLE.serial);

    fireEvent.click(sampleBtn);
    // Scan animation appears synchronously
    await waitFor(() => expect(screen.getByTestId("playground-scanning")).toBeInTheDocument());

    await waitFor(() => {
      const card = screen.getByTestId("playground-secured");
      expect(card).toBeInTheDocument();
      expect(card.textContent).toContain("CERTIGO");
      expect(card.textContent).toContain("SECURED");
      expect(card.textContent).toContain(SAMPLE.recipient_name);
      expect(card.textContent).toContain(SAMPLE.serial);
    }, { timeout: 4000 });
    expect(screen.queryByTestId("playground-notfound")).toBeNull();
  });

  it("shows the 'not found' state (and NOT the secured card) for an unknown serial", async () => {
    render(<VerificationPlayground />);
    const input = screen.getByTestId("playground-input");
    const verify = screen.getByTestId("playground-verify");
    fireEvent.change(input, { target: { value: "CERT-NOPE-0000" } });
    fireEvent.click(verify);
    await waitFor(
      () => expect(screen.getByTestId("playground-notfound")).toBeInTheDocument(),
      { timeout: 4000 },
    );
    expect(screen.queryByTestId("playground-secured")).toBeNull();
  });
});