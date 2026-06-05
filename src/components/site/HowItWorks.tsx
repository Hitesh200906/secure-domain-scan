import { motion } from "framer-motion";
import { Crosshair, Cpu, FileCheck } from "lucide-react";
import { SectionHeader } from "./Features";
import { Float3D, SectionBackdrop } from "./SectionFx";

const steps = [
  {
    n: "01",
    icon: Crosshair,
    title: "Submit Target",
    desc: "Provide a domain, website URL, or IP address. Our intake adapts to any asset.",
    items: ["Domain", "Website URL", "IP Address"],
  },
  {
    n: "02",
    icon: Cpu,
    title: "AI Analysis",
    desc: "Our engine orchestrates hundreds of checks while AI agents reason over evidence in real time.",
    items: ["Vulnerability Scanning", "Security Analysis", "Threat Assessment"],
  },
  {
    n: "03",
    icon: FileCheck,
    title: "Receive Report",
    desc: "A polished, executive-ready report lands in your dashboard with a clear remediation plan.",
    items: ["Security Score", "Findings", "Remediation Guide"],
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="How it works"
          title="From input to insight in three steps"
          description="Our pipeline takes you from raw target to executive-ready report — without the toil."
        />

        <div className="mt-20 relative">
          <div
            aria-hidden
            className="hidden lg:block absolute left-0 right-0 top-[44px] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          />
          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative"
              >
                <div className="relative mx-auto size-[88px] rounded-2xl glass-strong grid place-items-center mb-8">
                  <s.icon className="size-7 text-primary" strokeWidth={1.4} />
                  <span className="absolute -top-2 -right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-xl font-medium tracking-tight text-center">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground text-center leading-relaxed max-w-sm mx-auto">
                  {s.desc}
                </p>
                <ul className="mt-5 flex flex-wrap justify-center gap-2">
                  {s.items.map((it) => (
                    <li
                      key={it}
                      className="text-xs px-2.5 py-1 rounded-full glass text-muted-foreground"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
