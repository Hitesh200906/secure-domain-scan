import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Plan = {
  id: string; slug: string; name: string; headline: string | null; description: string | null;
  price_monthly: number; price_label: string | null; features: string[]; popular: boolean; cta_label: string | null; sort_order: number;
};

export function Pricing({ compact = false }: { compact?: boolean }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  useEffect(() => {
    supabase.from("pricing_plans").select("*").eq("active", true).order("sort_order")
      .then(({ data }) => setPlans((data ?? []) as never));
  }, []);

  return (
    <section className={`relative ${compact ? "py-16" : "py-24 sm:py-32"}`}>
      <div className="mx-auto max-w-7xl px-6">
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
              <div className="rounded-[calc(theme(borderRadius.3xl)-1px)] bg-[oklch(0.05_0.008_220)] p-8 h-full flex flex-col">
                {t.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] bg-primary text-primary-foreground px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t.name}</div>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-5xl font-semibold tracking-tight">
                      {t.price_monthly > 0 ? `$${t.price_monthly}` : (t.price_label || "Custom")}
                    </span>
                    {t.price_monthly > 0 && <span className="text-sm text-muted-foreground">{t.price_label || "/month"}</span>}
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
                  to="/scan/new"
                  search={{ plan: t.slug as "starter" | "professional" | "enterprise" }}
                  className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition ${t.popular ? "bg-white text-black hover:shadow-[0_0_40px_-4px_oklch(0.86_0.16_200_/0.7)]" : "glass text-white hover:border-white/20"}`}
                >
                  {t.cta_label || "Get started"}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
