import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { Features } from "@/components/site/Features";
import { HowItWorks } from "@/components/site/HowItWorks";
import { ReportShowcase } from "@/components/site/ReportShowcase";
import { Testimonials } from "@/components/site/Testimonials";
import { Pricing } from "@/components/site/Pricing";
import { Social } from "@/components/site/Social";
import { SectionHeader } from "@/components/site/Features";
import { Float3D, SectionBackdrop } from "@/components/site/SectionFx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexus Security — AI-Powered Security Analysis" },
      {
        name: "description",
        content:
          "Detect vulnerabilities before attackers do. AI-powered security audits, pen test reports, and continuous monitoring for modern teams.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <ReportShowcase />
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <SectionBackdrop variant="circuit" opacity={0.1} />
        <Float3D shape="pyramid" className="top-12 left-[3%] w-28 sm:w-40 opacity-70" duration={12} />
        <Float3D shape="torus" className="bottom-16 right-[4%] w-28 sm:w-40 opacity-65" rotate={[10, -10]} duration={11} />
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            eyebrow="Pricing"
            title="Simple pricing, enterprise depth"
            description="Start with a single scan or scale to continuous monitoring across your estate."
          />
          <div className="mt-16">
            <Pricing compact />
          </div>
        </div>
      </section>
      <Social />
      <Testimonials />
      <CTASection />
    </>
  );
}

function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <SectionBackdrop variant="grid" opacity={0.12} />
      <Float3D shape="lock" className="top-10 left-[5%] w-28 sm:w-36 opacity-70" duration={11} />
      <Float3D shape="hex" className="bottom-10 right-[5%] w-28 sm:w-40 opacity-65" rotate={[15, -15]} duration={13} />
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative rounded-3xl overflow-hidden p-px bg-gradient-to-b from-primary/40 via-secondary/20 to-transparent">
          <div className="relative rounded-[calc(theme(borderRadius.3xl)-1px)] bg-[oklch(0.05_0.008_220)] p-12 sm:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 hero-gradient opacity-60" />
            <div className="relative">
              <h2 className="text-4xl sm:text-5xl font-semibold tracking-[-0.03em] text-gradient">
                Ship faster. Sleep better.
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Run your first AI-powered security scan in under 60 seconds.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-medium hover:shadow-[0_0_40px_-4px_oklch(0.86_0.16_200_/0.7)] transition"
                >
                  Start Free Scan →
                </a>
                <a
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium text-white"
                >
                  Compare Plans
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
