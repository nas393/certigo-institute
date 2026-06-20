/**
 * Build the LinkedIn "Add to Profile" 1-click URL.
 *
 * Spec (LinkedIn Add to Profile button):
 *   https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME
 *     &name=<certTitle>
 *     &organizationName=<issuerName>
 *     &issueYear=<YYYY>
 *     &issueMonth=<M>          (1-12, no leading zero)
 *     &certUrl=<absolute verify URL>
 *     &certId=<serial>
 */
export interface LinkedInCertMeta {
  certTitle: string;
  issuerName: string;
  issueYear: number;
  issueMonth: number; // 1-12
  certSerialId: string;
  verifyUrl: string;
}

export function buildLinkedInAddToProfileUrl(m: LinkedInCertMeta): string {
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: m.certTitle,
    organizationName: m.issuerName,
    issueYear: String(m.issueYear),
    issueMonth: String(m.issueMonth),
    certUrl: m.verifyUrl,
    certId: m.certSerialId,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

export function linkedInMetaFromCert(opts: {
  certTitle: string;
  issuerName?: string;
  issuedAt: string | Date;
  serial: string;
  verifyUrl: string;
}): LinkedInCertMeta {
  const d = opts.issuedAt instanceof Date ? opts.issuedAt : new Date(opts.issuedAt);
  return {
    certTitle: opts.certTitle,
    issuerName: opts.issuerName ?? "CERTIGO.",
    issueYear: d.getUTCFullYear(),
    issueMonth: d.getUTCMonth() + 1,
    certSerialId: opts.serial,
    verifyUrl: opts.verifyUrl,
  };
}