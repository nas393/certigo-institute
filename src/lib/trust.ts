/**
 * CERTIGO. Trust Status — a transparent authenticity score for one credential.
 * Every factor is derived from the verification record itself; nothing is invented.
 */

export interface VerificationRecord {
  found: boolean;
  serial: string;
  recipient_name: string;
  recipient_id: string;
  issued_at: string;
  revoked: boolean;
  score: number;
  cert_title: string;
  issuer_name: string;
  category: string;
  summary: string;
  competencies: string[];
  modules: any[];
  question_count: number;
  pass_score: number;
  hours: number;
  attempt_count: number;
  issuer_credentials_issued: number;
  scan_count?: number;
}

export interface TrustFactor {
  label: string;
  detail: string;
  points: number;
  max: number;
  ok: boolean;
}

export interface TrustStatus {
  score: number;
  factors: TrustFactor[];
  band: "high" | "medium" | "low";
}

export function computeTrust(r: VerificationRecord): TrustStatus {
  const factors: TrustFactor[] = [];

  const issuerOk = !!r.issuer_name?.trim();
  factors.push({
    label: "Verified issuer",
    detail: issuerOk ? `${r.issuer_name} is a registered issuer` : "No issuer on record",
    points: issuerOk ? 20 : 0,
    max: 20,
    ok: issuerOk,
  });

  const identityOk = !!r.recipient_id && !!r.recipient_name?.trim();
  factors.push({
    label: "Verified identity",
    detail: identityOk ? "Recipient authenticated at issuance" : "Recipient not authenticated",
    points: identityOk ? 20 : 0,
    max: 20,
    ok: identityOk,
  });

  const assessed = r.attempt_count > 0 && r.score >= (r.pass_score ?? 70);
  factors.push({
    label: "Assessment completed",
    detail: assessed
      ? `Scored ${r.score}% against a ${r.pass_score}% pass mark over ${r.question_count} questions`
      : "No passing assessment on record",
    points: assessed ? 20 : 0,
    max: 20,
    ok: assessed,
  });

  const evidence = (r.modules?.length ?? 0) > 0 || (r.competencies?.length ?? 0) > 0;
  factors.push({
    label: "Evidence attached",
    detail: evidence
      ? `${r.modules?.length ?? 0} syllabus modules · ${r.competencies?.length ?? 0} competencies`
      : "No syllabus or competency evidence",
    points: evidence ? 15 : 0,
    max: 15,
    ok: evidence,
  });

  factors.push({
    label: "Credential active",
    detail: r.revoked ? "Credential has been revoked" : "Status ACTIVE — no expiry",
    points: r.revoked ? 0 : 15,
    max: 15,
    ok: !r.revoked,
  });

  const history = r.issuer_credentials_issued > 0;
  factors.push({
    label: "Issuer history",
    detail: history
      ? `${r.issuer_credentials_issued} credential${r.issuer_credentials_issued === 1 ? "" : "s"} issued on this course`
      : "First credential from this issuer",
    points: history ? 10 : 5,
    max: 10,
    ok: history,
  });

  const score = factors.reduce((s, f) => s + f.points, 0);
  return {
    score,
    factors,
    band: score >= 90 ? "high" : score >= 70 ? "medium" : "low",
  };
}

/** Human date used across verification surfaces: "12 September 2026". */
export function formatLongDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
