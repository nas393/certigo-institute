import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";
import { buildLinkedInAddToProfileUrl, linkedInMetaFromCert } from "@/lib/linkedin";

interface Props {
  certTitle: string;
  issuerName?: string;
  issuedAt: string;
  serial: string;
  verifyUrl: string;
  className?: string;
}

export function LinkedInButton(p: Props) {
  const url = buildLinkedInAddToProfileUrl(
    linkedInMetaFromCert({
      certTitle: p.certTitle,
      issuerName: p.issuerName,
      issuedAt: p.issuedAt,
      serial: p.serial,
      verifyUrl: p.verifyUrl,
    }),
  );
  return (
    <Button
      asChild
      className={"bg-[#0A66C2] text-white hover:bg-[#0a4f96] " + (p.className ?? "")}
    >
      <a href={url} target="_blank" rel="noopener noreferrer" data-testid="linkedin-add">
        <Linkedin className="mr-2 h-4 w-4" /> Add to LinkedIn
      </a>
    </Button>
  );
}