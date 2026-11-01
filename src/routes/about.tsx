import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How we assess — CERTIGO." },
      { name: "description", content: "How CERTIGO courses are written, how exams work, how certificates are verified, and what a CERTIGO certificate is and is not." },
    ],
  }),
  component: AboutPage,
});

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-extrabold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">◆ About CERTIGO</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter sm:text-5xl">How we teach, test and certify</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          CERTIGO is an online platform for practical, job-focused certificates. Here is exactly how it works, so you and your employer know what a CERTIGO certificate means.
        </p>

        <Block title="1. How courses are written">
          <p>Each course covers one practical skill area in short modules: what the skill is, how it is done in real workplaces, common mistakes, and a worked example.</p>
          <p>Courses are drafted with the help of AI writing tools, then reviewed, edited and approved by the CERTIGO Certifications Office before they are published. Nothing goes live without that approval.</p>
          <p>The lessons are free to read. You only pay if you want to take the exam and earn the certificate.</p>
        </Block>

        <Block title="2. How the exam works">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Questions are drawn at random from a larger question bank, and the order of questions and answers is shuffled for every attempt.</li>
            <li>Answers are graded on our servers. The correct answers are never sent to your browser.</li>
            <li>Each course has a published pass mark, shown on the course page and on the certificate.</li>
            <li>If you don't pass, you can retake: the second attempt opens 24 hours after the first, and later attempts need 7 days between them.</li>
          </ul>
        </Block>

        <Block title="3. How a certificate is verified">
          <p>Every certificate has a unique number (for example CERT-PEOP-1234) and a QR code. Scanning the code, or entering the number in the verification box on our <Link to="/" className="underline underline-offset-4">home page</Link>, shows the live record: holder, course, issue date and status.</p>
          <p>If a certificate is ever withdrawn, its record shows it as revoked straight away, wherever it has been shared.</p>
        </Block>

        <Block title="4. What a CERTIGO certificate is, and is not">
          <p>A CERTIGO certificate shows that the holder studied the course and passed its exam at the stated pass mark.</p>
          <p>It is not a university degree, it is not a government qualification, and it is not issued by or equivalent to any professional body's certification (such as PMP, ACCA or CISSP). We don't claim accreditation we don't have.</p>
        </Block>

        <Block title="5. Questions">
          <p>Write to us through the <Link to="/contact" className="underline underline-offset-4">contact page</Link>. Employers can check any certificate on the verification page without an account.</p>
        </Block>
      </article>
      <Footer />
    </div>
  );
}
