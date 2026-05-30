import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Globe } from "./Globe";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      <Globe />
      <div className="absolute inset-0 grid-bg opacity-50 -z-10" />

      <div className="relative mx-auto max-w-5xl px-6 text-center pt-32 pb-24">
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
          className="mt-7 text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-semibold tracking-[-0.04em] leading-[0.95] text-gradient"
        >
          AI-Powered
          <br />
          Security Analysis
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-7 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          Detect vulnerabilities before attackers do. Get detailed, actionable security
          reports powered by AI and industry-leading security methodologies.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            to="/contact"
            className="group relative inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-medium hover:shadow-[0_0_40px_-4px_oklch(0.86_0.16_200_/0.7)] transition-all"
          >
            Start Security Scan
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium text-white hover:border-white/20 transition"
          >
            View Plans
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs uppercase tracking-[0.2em] text-muted-foreground/70"
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
