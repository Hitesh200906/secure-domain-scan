import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

type Plan = {
  id: string; slug: string; name: string; headline: string | null; description: string | null;
  price_monthly: number; price_label: string | null; features: string[]; popular: boolean; cta_label: string | null; sort_order: number;
};

const FALLBACK_PLANS: Plan[] = [
  {
    id: "fallback-starter", slug: "starter", name: "Starter", headline: "For solo founders & small sites",
    description: "Run a full security audit on a single domain. Get an AI-generated report in minutes.",
    price_monthly: 49, price_label: "/month", popular: false, cta_label: "Start scanning", sort_order: 1,
    features: ["1 domain", "Weekly scans", "AI vulnerability report", "Email alerts", "Community support"],
  },
  {
    id: "fallback-professional", slug: "professional", name: "Professional", headline: "For growing engineering teams",
    description: "Continuous monitoring, advanced detection, and remediation playbooks for production estates.",
    price_monthly: 199, price_label: "/month", popular: true, cta_label: "Start free trial", sort_order: 2,
    features: ["10 domains", "Daily scans", "OWASP Top 10 + CVE feeds", "Slack & PagerDuty alerts", "Priority email support", "PDF & JSON exports"],
  },
  {
    id: "fallback-enterprise", slug: "enterprise", name: "Enterprise", headline: "Deep coverage at scale",
    description: "Dedicated infrastructure, SAML SSO, custom integrations, and a named security engineer.",
    price_monthly: 899, price_label: "/month", popular: false, cta_label: "Enterprise scan", sort_order: 3,
    features: ["Unlimited domains", "Real-time monitoring", "SAML SSO + audit log export", "Dedicated security engineer", "99.99% SLA", "Custom integrations"],
  },
];

export function Pricing({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [usedFreeScan, setUsedFreeScan] = useState(false);
  useEffect(() => {
    api.publicPricing()
      .then(({ plans }) => {
        if (Array.isArray(plans) && plans.length > 0) setPlans(plans as Plan[]);
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  useEffect(() => {
    if (!user) { setUsedFreeScan(false); return; }
    api.listScans()
      .then(({ scans }) => setUsedFreeScan((scans?.length ?? 0) > 0))
      .catch(() => { /* assume not used */ });
  }, [user]);

  const ctaFor = (slug: string, fallback: string | null) => {
    if (slug === "starter" && !usedFreeScan) return "Start free scan";
    return fallback || "Get started";
  };



  return (
    <section className={`relative ${compact ? "py-12 sm:py-16" : "py-16 sm:py-32"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className={`relative rounded-3xl p-px ${t.popular ? "bg-gradient-to-b from-primary/60 via-secondary/30 to-transparent" : "bg-white/[0.08]"}`}
            >
              <div className="rounded-[calc(theme(borderRadius.3xl)-1px)] bg-[oklch(0.05_0.008_220)] p-6 sm:p-8 h-full flex flex-col">
                {t.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] bg-primary text-primary-foreground px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t.name}</div>
                  <div className="mt-4 sm:mt-5 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-semibold tracking-tight">
                      {t.slug === "starter" && !usedFreeScan
                        ? "Free"
                        : t.price_monthly > 0
                          ? t.price_monthly.toLocaleString()
                          : (t.price_label || "Custom")}
                    </span>
                    {t.price_monthly > 0 && !(t.slug === "starter" && !usedFreeScan) && (
                      <span className="text-sm text-muted-foreground">credits</span>
                    )}
                    {t.slug === "starter" && !usedFreeScan && (
                      <span className="text-sm text-muted-foreground">first scan</span>
                    )}
                  </div>


                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t.description || t.headline}</p>
                </div>

                <ul className="mt-8 space-y-3 flex-1">
                  {(t.features || []).map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="size-4 mt-0.5 text-primary shrink-0" strokeWidth={2} />
                      <span className="text-white/90">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  {...(user
                    ? { to: "/scan/new" as const, search: { plan: t.slug as "starter" | "professional" | "enterprise" } }
                    : { to: "/login" as const })}
                  className={`group relative mt-8 inline-flex items-center justify-center overflow-hidden rounded-full px-5 py-3 text-sm font-medium transition-transform duration-300 hover:scale-[1.03] ${t.popular ? "bg-white text-black" : "glass text-white hover:border-white/20"}`}
                >
                  <span className="relative">{ctaFor(t.slug, t.cta_label)}</span>

                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
