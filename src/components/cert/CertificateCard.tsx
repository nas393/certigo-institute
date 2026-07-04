import { MonochromeCertificate } from "@/components/certigo/MonochromeCertificate";
import { formatReference } from "@/lib/cert";

interface Props {
  serial: string;
  recipientName: string;
  certTitle: string;
  issuedAt: string;
  score: number;
  verifyUrl: string;
  skills?: string[];
}

export function CertificateCard(p: Props) {
  return (
    <MonochromeCertificate
      variant="01"
      recipientName={p.recipientName}
      courseTitle={p.certTitle}
      issueDate={p.issuedAt}
      certificateId={formatReference(p.serial)}
      verifyUrl={p.verifyUrl}
      scorePct={p.score}
      skills={p.skills}
    />
  );
}