// Persists a pending certification choice across an auth bounce so the
// dashboard can prefill the topic + level + outline after sign-in.

export interface PendingCertification {
  topic: string;
  level: "foundational" | "intermediate" | "advanced";
  code: string;
  outline?: string[];
  competencies?: string[];
}

const KEY = "certigo.pending-cert";

export function setPendingCertification(p: PendingCertification) {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(KEY, JSON.stringify(p)); } catch { /* noop */ }
}

export function consumePendingCertification(): PendingCertification | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    return JSON.parse(raw) as PendingCertification;
  } catch { return null; }
}

export function peekPendingCertification(): PendingCertification | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingCertification) : null;
  } catch { return null; }
}
