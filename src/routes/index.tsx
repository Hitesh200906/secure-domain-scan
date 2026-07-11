import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { Features } from "@/components/site/Features";
import { HowItWorks } from "@/components/site/HowItWorks";
import { ReportShowcase } from "@/components/site/ReportShowcase";
import { Testimonials } from "@/components/site/Testimonials";
import { Pricing } from "@/components/site/Pricing";
import { Social } from "@/components/site/Social";
import { SectionHeader } from "@/components/site/Features";
import { SectionBackdrop } from "@/components/site/SectionFx";
import { NexusHome } from "@/components/site/NexusHome";
import { useAppMode } from "@/lib/app-mode";
import { useAuth } from "@/hooks/use-auth";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexefy — The home of internet business" },
      {
        name: "description",
        content:
          "Discover thousands of communities, courses, and digital products — or launch your own store in minutes on Nexefy.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { mode } = useAppMode();

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {mode === "nexus" ? (
          <motion.div
            key="nexus"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <NexusHome />
          </motion.div>
        ) : (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <SecurityHome />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SecurityHome() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <ReportShowcase />
      <section className="relative py-16 sm:py-32 overflow-hidden">
        <SectionBackdrop variant="circuit" opacity={0.1} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Pricing"
            title="Simple pricing, enterprise depth"
            description="Start with a single scan or scale to continuous monitoring across your estate."
          />
          <div className="mt-10 sm:mt-16">
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
  const { user } = useAuth();
  return (
    <section className="relative py-16 sm:py-32 overflow-hidden">
      <SectionBackdrop variant="grid" opacity={0.12} />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden p-px bg-gradient-to-b from-primary/40 via-secondary/20 to-transparent">
          <div className="relative rounded-[calc(theme(borderRadius.3xl)-1px)] bg-[oklch(0.05_0.008_220)] p-8 sm:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 hero-gradient opacity-60" />
            <div className="relative">
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-gradient">
                Ship faster. Sleep better.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                Run your first AI-powered security scan in under 60 seconds.
              </p>
              <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                {!user ? (
                  <a
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-medium hover:shadow-[0_0_40px_-4px_oklch(0.86_0.16_200_/0.7)] transition"
                  >
                    Sign Up →
                  </a>
                ) : (
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-medium hover:shadow-[0_0_40px_-4px_oklch(0.86_0.16_200_/0.7)] transition"
                  >
                    Contact
                  </a>
                )}
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
