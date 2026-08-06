import { createFileRoute } from "@tanstack/react-router";
import { FileText, Scale, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Legal — Privacy, Terms & Compliance | Nexefy Security" },
      {
        name: "description",
        content:
          "Read Nexefy Security's privacy policy, terms of service, and compliance commitments covering data handling, security scanning, and customer obligations.",
      },
      { property: "og:title", content: "Legal — Privacy, Terms & Compliance | Nexefy Security" },
      {
        property: "og:description",
        content:
          "Privacy policy, terms of service, and compliance information for Nexefy Security customers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LegalPage,
});

const sections = [
  { id: "privacy", label: "Privacy Policy", icon: ShieldCheck },
  { id: "terms", label: "Terms of Service", icon: FileText },
  { id: "compliance", label: "Compliance", icon: Scale },
];

function LegalPage() {
  return (
    <div className="relative pt-28 sm:pt-36 pb-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <header className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-primary uppercase">Legal</p>
          <h1 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-[-0.03em]">
            Privacy, Terms &amp; Compliance
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Everything about how Nexefy Security handles your data, what you agree to when using our
            platform, and the standards we hold ourselves to. Last updated{" "}
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
          </p>
        </header>

        <nav className="mt-8 flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-[13px] text-muted-foreground hover:text-white transition"
            >
              <s.icon className="size-3.5" />
              {s.label}
            </a>
          ))}
        </nav>

        <div className="mt-12 space-y-14">
          <Section id="privacy" title="Privacy Policy">
            <P>
              We collect only what is required to operate Nexefy Security: your account email, the
              domains and assets you submit for scanning, scan results, and basic product telemetry.
            </P>
            <List
              items={[
                "Account data — email, display name, and authentication metadata, stored securely and never sold.",
                "Scan data — targets you submit, findings we generate, and reports you export. Visible only to you and members you invite.",
                "Usage data — aggregated, non-identifying metrics used to improve reliability and performance.",
              ]}
            />
            <H3>How we use it</H3>
            <P>
              To run scans you request, deliver reports, send service notifications, prevent abuse,
              and improve detection quality. We do not use your scan results to train third-party
              models or share them with advertisers.
            </P>
            <H3>Retention &amp; deletion</H3>
            <P>
              Scan results are retained for the lifetime of your account, or until you delete them.
              Deleting your account removes your personal data and reports within 30 days. You may
              request an export or deletion at any time via our contact page.
            </P>
          </Section>

          <Section id="terms" title="Terms of Service">
            <P>
              By creating an account you agree to these terms. If you use Nexefy Security on behalf
              of an organization, you confirm you are authorized to bind that organization.
            </P>
            <H3>Authorized scanning only</H3>
            <P>
              You may only scan domains, applications, and infrastructure that you own or have
              explicit written permission to test. Unauthorized scanning is prohibited and may be
              illegal. Violations result in immediate account termination.
            </P>
            <H3>Acceptable use</H3>
            <List
              items={[
                "No reverse engineering, resale, or white-labelling of the platform without a written agreement.",
                "No attempts to disrupt, overload, or circumvent rate limits and access controls.",
                "No uploading of malware, unlawful content, or third-party data you lack rights to.",
              ]}
            />
            <H3>Plans &amp; billing</H3>
            <P>
              Paid plans renew automatically until cancelled. You can cancel at any time and keep
              access until the end of the current billing period. Fees already paid are
              non-refundable except where required by law.
            </P>
            <H3>Disclaimer</H3>
            <P>
              Security scanning reduces risk but cannot guarantee the absence of vulnerabilities.
              The service is provided "as is" without warranties, and our liability is limited to
              the amount you paid in the preceding twelve months.
            </P>
          </Section>

          <Section id="compliance" title="Compliance">
            <P>
              We design Nexefy Security around least-privilege access, encrypted transport and
              storage, and auditable operations.
            </P>
            <List
              items={[
                "Encryption — all traffic is served over TLS, and data at rest is encrypted by our infrastructure providers.",
                "Access control — row-level security isolates every customer's data; internal access is role-based and logged.",
                "Auditability — administrative actions are written to an append-only audit log.",
                "Vulnerability reporting — found an issue in our platform? Report it through the contact page and we will respond promptly.",
              ]}
            />
            <H3>Data processing</H3>
            <P>
              We process customer data as a processor acting on your instructions. Sub-processors
              are used for hosting, database, and email delivery. If you require a data processing
              agreement, reach out through the contact page.
            </P>
            <H3>Questions</H3>
            <P>
              For privacy requests, security disclosures, or compliance documentation, contact our
              team and we will get back to you.
            </P>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em]">{title}</h2>
      <div className="mt-4 space-y-4 rounded-2xl glass p-5 sm:p-7">{children}</div>
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-2 text-sm font-semibold text-white">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>;
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
