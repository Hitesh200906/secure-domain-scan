import { motion } from "framer-motion";
import { Globe } from "./Globe";
import { ModeToggle } from "./ModeToggle";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      <Globe />
      <div className="absolute inset-0 grid-bg opacity-50 -z-10 animate-grid-pan" />
      {/* Aurora blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-32 size-[480px] rounded-full bg-[oklch(0.86_0.16_200_/0.18)] blur-[100px] animate-aurora-1" />
        <div className="absolute top-1/3 -right-40 size-[520px] rounded-full bg-[oklch(0.75_0.13_180_/0.18)] blur-[110px] animate-aurora-2" />
        <div className="absolute bottom-0 left-1/3 size-[420px] rounded-full bg-[oklch(0.86_0.16_200_/0.14)] blur-[100px] animate-aurora-3" />
      </div>
      {/* Scanline sweep */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-scanline" />
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent animate-scanline" style={{ animationDelay: "4s" }} />
      </div>
      {/* Orbiting rings */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="size-[640px] sm:size-[820px] rounded-full border border-primary/10 animate-orbit-slow" />
        <div className="absolute inset-12 rounded-full border border-secondary/10 animate-orbit-rev" />
        <div className="absolute inset-32 rounded-full border border-primary/[0.06]" />
      </div>
      {/* Corner radar ping */}
      <div className="pointer-events-none absolute top-24 right-8 -z-10 hidden md:block">
        <div className="relative size-32">
          <div className="absolute inset-0 rounded-full border border-primary/20" />
          <div className="absolute inset-4 rounded-full border border-primary/15" />
          <div className="absolute inset-8 rounded-full border border-primary/10" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-radar-ping" />
        </div>
      </div>



      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center pt-28 sm:pt-32 pb-20 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs text-muted-foreground"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="tracking-[0.18em] uppercase">System Online</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 text-[40px] leading-[1] sm:text-6xl md:text-7xl lg:text-[88px] font-semibold tracking-[-0.04em] sm:leading-[0.95] text-gradient"
        >
          AI-Powered
          <br />
          Security Analysis
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-5 sm:mt-7 max-w-2xl mx-auto text-sm sm:text-lg text-muted-foreground leading-relaxed"
        >
          Detect vulnerabilities before attackers do. Get detailed, actionable security
          reports powered by AI and industry-leading security methodologies.
        </motion.p>

        <div className="mt-10 flex justify-center">
          <ModeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-14 sm:mt-20 flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-10 gap-y-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground/70"
        >
          <span>SOC 2 Type II</span>
          <span>·</span>
          <span>ISO 27001</span>
          <span>·</span>
          <span>OWASP Verified</span>
          <span>·</span>
          <span>GDPR Compliant</span>
        </motion.div>
      </div>
    </section>
  );
}
