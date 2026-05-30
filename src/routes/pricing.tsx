import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Pricing } from "@/components/site/Pricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Nexus Security" },
      {
        name: "description",
        content:
          "Transparent pricing for individual scans and continuous security monitoring. Starter, Professional, and Enterprise tiers.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Pricing built for every team"
        description="Start with a one-time scan, scale to continuous coverage. No hidden seats. No surprise overages."
      />
      <Pricing />

      <section className="relative py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-medium tracking-tight text-center">FAQ</h2>
          <div className="mt-10 divide-y divide-white/10 glass rounded-3xl">
            {[
              {
                q: "How fast do I get a report?",
                a: "Most scans complete within 24 hours. Critical findings are surfaced in real time as they are discovered.",
              },
              {
                q: "Do you support continuous monitoring?",
                a: "Yes. Professional and Enterprise plans include continuous scanning with configurable frequency.",
              },
              {
                q: "Is there a free trial?",
                a: "Every account gets one complimentary baseline scan. No credit card required.",
              },
              {
                q: "Are reports compliance-ready?",
                a: "Enterprise reports map findings to SOC 2, ISO 27001, PCI-DSS and HIPAA controls.",
              },
            ].map((f) => (
              <details key={f.q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium">{f.q}</span>
                  <span className="text-primary text-lg leading-none transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
