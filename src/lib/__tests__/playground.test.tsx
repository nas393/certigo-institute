import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

const SAMPLE = {
  serial: "CERT-PMFN-0042",
  recipient_name: "Alex Johnson",
  issued_at: "2026-06-20T10:00:00Z",
  revoked: false,
  certifications: { title: "Product Management Foundations", issuer_name: "CERTIGO." },
};

// Mock the supabase client BEFORE importing the component
vi.mock("@/integrations/supabase/client", () => {
  function makeChain(result: any) {
    const chain: any = {};
    const methods = ["select", "order", "limit", "eq", "or"];
    methods.forEach((m) => (chain[m] = vi.fn(() => chain)));
    chain.maybeSingle = vi.fn(async () => result);
    chain.then = (resolve: any) => Promise.resolve(result).then(resolve);
    return chain;
  }
  const fromImpl: any = vi.fn((table: string) => {
    if (table !== "certificates") return makeChain({ data: [], error: null });
    return {
      select: vi.fn((cols: string) => {
        if (cols.includes("recipient_name")) {
          // The eq("serial", X) branch resolves with maybeSingle
          return {
            eq: vi.fn((_c: string, val: string) => ({
              maybeSingle: vi.fn(async () =>
                val === SAMPLE.serial ? { data: SAMPLE, error: null } : { data: null, error: null },
              ),
            })),
          };
        }
        // sample list branch
        return {
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              then: (resolve: any) => Promise.resolve({ data: [{ serial: SAMPLE.serial }], error: null }).then(resolve),
            })),
          })),
        };
      }),
    };
  });
  return { supabase: { from: fromImpl } };
});

import { VerificationPlayground } from "@/components/playground/VerificationPlayground";

describe("Verification Playground", () => {
  beforeEach(() => vi.useFakeTimers());

  it("resolves a sample ID to a real record and shows the CERTIGO. SECURED card", async () => {
    render(<VerificationPlayground />);

    // Sample button populates after initial sample fetch
    const sampleBtn = await screen.findByTestId("playground-sample", {}, { timeout: 2000 });
    expect(sampleBtn.textContent).toContain(SAMPLE.serial);

    await act(async () => { fireEvent.click(sampleBtn); });
    // Scan + decrypt animation visible
    expect(screen.getByTestId("playground-scanning")).toBeInTheDocument();

    // Advance through scan (600ms) + decrypt (500ms)
    await act(async () => { await vi.advanceTimersByTimeAsync(1200); });

    await waitFor(() => {
      const card = screen.getByTestId("playground-secured");
      expect(card).toBeInTheDocument();
      expect(card.textContent).toContain("CERTIGO");
      expect(card.textContent).toContain("SECURED");
      expect(card.textContent).toContain(SAMPLE.recipient_name);
      expect(card.textContent).toContain(SAMPLE.serial);
    });
    // The green card should NOT be there when a wrong serial is used
    expect(screen.queryByTestId("playground-notfound")).toBeNull();
  });

  it("shows the 'not found' state (and NOT the secured card) for an unknown serial", async () => {
    render(<VerificationPlayground />);
    const input = screen.getByTestId("playground-input");
    const verify = screen.getByTestId("playground-verify");
    fireEvent.change(input, { target: { value: "CERT-NOPE-0000" } });
    await act(async () => { fireEvent.click(verify); });
    await act(async () => { await vi.advanceTimersByTimeAsync(1200); });
    await waitFor(() => {
      expect(screen.getByTestId("playground-notfound")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("playground-secured")).toBeNull();
  });
});