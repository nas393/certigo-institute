import { useEffect, useState } from "react";

/**
 * Persistent CERTIGO INSTITUTE standard:
 * one signature pair (A–F) + one electronic stamp (#1–#3) used across every
 * certificate, transcript, verify modal and PDF export.
 */
export type PairId = "A" | "B" | "C" | "D" | "E" | "F";
export type StampNum = 1 | 2 | 3;
export type SigVariant = 0 | 1 | 2 | 3 | 4 | 5;

export interface CertigoStandard {
  pairId: PairId;
  stamp: StampNum;
}

export const PAIR_DEFINITIONS: Record<PairId, { pair: [SigVariant, SigVariant]; label: string; hint: string }> = {
  A: { pair: [0, 3], label: "Executive · Angular",     hint: "Bold cap + sharp angular CEO mark" },
  B: { pair: [1, 5], label: "Copperplate · Minister",  hint: "Flowing loops + elegant low descender" },
  C: { pair: [2, 4], label: "Diplomat · Continuous",   hint: "Slanted ascender + single-stroke flow" },
  D: { pair: [0, 1], label: "Executive · Copperplate", hint: "Reference-style bold + flowing loops" },
  E: { pair: [3, 2], label: "Angular · Diplomat",      hint: "Sharp + slanted, classical pairing" },
  F: { pair: [5, 4], label: "Minister · Continuous",   hint: "Soft elegant + relentless single line" },
};

export const STAMP_NUMS: StampNum[] = [1, 2, 3];

const STORAGE_KEY = "certigo.standard.v1";
const DEFAULT_STANDARD: CertigoStandard = { pairId: "D", stamp: 2 };

export function getStandard(): CertigoStandard {
  if (typeof window === "undefined") return DEFAULT_STANDARD;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STANDARD;
    const parsed = JSON.parse(raw);
    if (parsed && PAIR_DEFINITIONS[parsed.pairId as PairId] && [1, 2, 3].includes(parsed.stamp)) {
      return { pairId: parsed.pairId, stamp: parsed.stamp };
    }
  } catch { /* noop */ }
  return DEFAULT_STANDARD;
}

export function setStandard(next: CertigoStandard): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("certigo:standard:changed", { detail: next }));
}

/** React hook with cross-tab + same-tab sync. */
export function useCertigoStandard(): [CertigoStandard, (n: CertigoStandard) => void] {
  const [s, setS] = useState<CertigoStandard>(() => getStandard());
  useEffect(() => {
    const onChange = () => setS(getStandard());
    window.addEventListener("storage", onChange);
    window.addEventListener("certigo:standard:changed", onChange as EventListener);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("certigo:standard:changed", onChange as EventListener);
    };
  }, []);
  return [s, (n) => { setStandard(n); setS(n); }];
}

/** Convenience: resolve the active signature pair as SignatureVariant tuple. */
export function useStandardPair(): [SigVariant, SigVariant] {
  const [s] = useCertigoStandard();
  return PAIR_DEFINITIONS[s.pairId].pair;
}

/** Convenience: resolve the active stamp as 0|1|2 (zero-indexed for component). */
export function useStandardStampVariant(): 0 | 1 | 2 {
  const [s] = useCertigoStandard();
  return (s.stamp - 1) as 0 | 1 | 2;
}