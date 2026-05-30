import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";

const tiers = [
  {
    name: "Starter",
    price: "₹999",
    cadence: "/scan",
    desc: "For founders and indie hackers running their first audit.",
    features: ["Basic Scan", "PDF Report", "Email Support"],
    cta: "Get Started",
    href: "/contact",
    highlight: false,
  },
  {
    name: "Professional",
    price: "₹4,999",
    cadence: "/month",
    desc: "Everything growing teams need to stay continuously protected.",
    features: [
      "Full Security Audit",
      "Priority Reports",
      "AI Recommendations",
      "API Analysis",
    ],
    cta: "Most Popular",
    href: "/contact",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    desc: "Dedicated coverage for regulated environments and large estates.",
    features: [
      "Dedicated Security Team",
      "Continuous Monitoring",
      "Compliance Reports",
      "Custom Integrations",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlight: false,
  },
];

export function Pricing({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`relative ${compact ? "py-16" : "py-24 sm:py-32"}`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className={`relative rounded-3xl p-px ${
                t.highlight
                  ? "bg-gradient-to-b from-primary/60 via-secondary/30 to-transparent"
                  : "bg-white/[0.08]"
              }`}
            >
              <div className="rounded-[calc(theme(borderRadius.3xl)-1px)] bg-[oklch(0.05_0.008_220)] p-8 h-full flex flex-col">
                {t.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] bg-primary text-primary-foreground px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {t.name}
                  </div>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-5xl font-semibold tracking-tight">
                      {t.price}
                    </span>
                    <span className="text-sm text-muted-foreground">{t.cadence}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {t.desc}
                  </p>
                </div>

                <ul className="mt-8 space-y-3 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className="size-4 mt-0.5 text-primary shrink-0"
                        strokeWidth={2}
                      />
                      <span className="text-white/90">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={t.href}
                  className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition ${
                    t.highlight
                      ? "bg-white text-black hover:shadow-[0_0_40px_-4px_oklch(0.86_0.16_200_/0.7)]"
                      : "glass text-white hover:border-white/20"
                  }`}
                >
                  {t.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
