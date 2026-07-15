import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, EmptyState } from "@/components/business/primitives";
import { BarChart3, TrendingUp, Users, DollarSign, Globe2, MousePointerClick } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store-context";
import { getStoreOrders, type Order } from "@/lib/business";

export const Route = createFileRoute("/business/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const store = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [range, setRange] = useState<7 | 30 | 90>(30);

  useEffect(() => { if (store) getStoreOrders(store.id).then(setOrders); }, [store?.id]);

  const start = new Date(); start.setDate(start.getDate() - range);
  const scoped = orders.filter(o => new Date(o.created_at) >= start);
  const gross = scoped.reduce((s, o) => s + Number(o.amount || 0), 0);
  const buyers = new Set(scoped.map(o => o.buyer_email ?? o.buyer_id).filter(Boolean));
  const aov = scoped.length ? gross / scoped.length : 0;

  const tiles = [
    { label: "Revenue", value: `$${gross.toFixed(2)}`, icon: DollarSign, accent: "text-emerald-400" },
    { label: "Orders", value: scoped.length, icon: BarChart3, accent: "text-blue-400" },
    { label: "Customers", value: buyers.size, icon: Users, accent: "text-purple-400" },
    { label: "AOV", value: `$${aov.toFixed(2)}`, icon: TrendingUp, accent: "text-cyan-400" },
    { label: "Visitors", value: "—", icon: Globe2, accent: "text-orange-400" },
    { label: "Conversion", value: "—", icon: MousePointerClick, accent: "text-pink-400" },
  ];

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Deep insight into revenue, traffic, conversion, and audience."
        actions={
          <div className="flex rounded-lg border border-white/10 overflow-hidden">
            {[7,30,90].map(d => (
              <button key={d} onClick={() => setRange(d as any)}
                className={`px-3 py-1.5 text-[12px] ${range===d?"bg-white text-black":"text-neutral-400 hover:bg-white/5"}`}>
                {d}d
              </button>
            ))}
          </div>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {tiles.map(t => (
          <Panel key={t.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest text-neutral-500">{t.label}</span>
              <t.icon className={`size-4 ${t.accent}`} />
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">{t.value}</div>
          </Panel>
        ))}
      </div>
      <Panel className="p-0">
        <EmptyState icon={BarChart3} accent="text-cyan-400"
          title="Advanced analytics dashboards"
          description="Funnels, cohorts, retention curves, geo heatmaps, referral attribution, and custom exports are being wired up. Your live metrics above update in real-time."
        />
      </Panel>
    </div>
  );
}
