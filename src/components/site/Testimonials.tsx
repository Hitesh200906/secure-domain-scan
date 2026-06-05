import { motion } from "framer-motion";
import { SectionHeader } from "./Features";
import { Float3D, SectionBackdrop } from "./SectionFx";

const items = [
  {
    quote:
      "Nexus replaced three vendors and a quarterly pen test. Our engineers ship faster knowing the platform has their back.",
    name: "Aarav Mehta",
    role: "CTO, Lendwise",
    badge: "Series B Fintech",
  },
  {
    quote:
      "The reports look like something McKinsey would hand a board. Our customers' security teams ask for them by name.",
    name: "Priya Shah",
    role: "Founder, Quill API",
    badge: "SaaS Startup",
  },
  {
    quote:
      "We run continuous scans across 40+ client environments. Nothing has matched Nexus on signal-to-noise.",
    name: "Daniel Okafor",
    role: "Director of Security, Northwave Agency",
    badge: "Agency",
  },
  {
    quote:
      "An AI co-pilot that actually understands our architecture. Triage time is down 70% across the team.",
    name: "Sofia Lindqvist",
    role: "VP Engineering, Halcyon",
    badge: "Enterprise",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <SectionBackdrop variant="circuit" opacity={0.08} />
      <Float3D shape="torus" className="top-12 right-[5%] w-28 sm:w-40 opacity-70" duration={10} />
      <Float3D shape="pyramid" className="bottom-10 left-[5%] w-28 sm:w-36 opacity-60" rotate={[12, -12]} duration={13} />
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Trusted globally"
          title="Loved by security and engineering teams"
        />

        <div className="mt-16 grid md:grid-cols-2 gap-5">
          {items.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass rounded-3xl p-8"
            >
              <blockquote className="text-lg leading-relaxed text-white/90">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground glass px-2 py-1 rounded-full">
                  {t.badge}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
