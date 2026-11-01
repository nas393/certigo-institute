import { Link } from "@tanstack/react-router";

/** Shows the configured email address, or a link to the contact form when none is set. */
export function ContactLine({ email }: { email: string | null }) {
  return email
    ? <a href={`mailto:${email}`} className="underline underline-offset-4">{email}</a>
    : <Link to="/contact" className="underline underline-offset-4">our contact form</Link>;
}
