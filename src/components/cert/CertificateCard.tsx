import { CertificateSheet } from "@/components/cert/CertificateView";
import type { CertificateProps } from "@/lib/certificate-data";

/** On-screen certificate. The same component and props are used for print and PDF. */
export function CertificateCard(props: CertificateProps) {
  return <CertificateSheet {...props} />;
}
