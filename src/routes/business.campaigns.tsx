import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, EmptyState, Btn } from "@/components/business/primitives";
import { Megaphone, Plus, Users, DollarSign, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/business/campaigns")({ component: CampaignsPage });

function CampaignsPage() {
  const stats = [
    { l: "Active campaigns", v: 0, i: Megaphone, a: "text-pink-400" },
    { l: "Total reach", v: 0, i: Users, a: "text-blue-400" },
    { l: "Attributed revenue", v: "$0", i: DollarSign, a: "text-emerald-400" },
    { l: "Avg ROI", v: "—", i: TrendingUp, a: "text-cyan-400" },
  ];
  const types = ["Clipping", "Influencer", "Affiliate", "Referral", "Email", "Social", "UGC"];
  return (
    <div>
      <PageHeader title="Campaigns" description="Clipping, influencer, referral, and social campaigns with attribution."
        actions={<Btn variant="primary" size="sm"><Plus className="size-3.5" />New campaign</Btn>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <Panel key={s.l} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest text-neutral-500">{s.l}</span>
              <s.i className={`size-4 ${s.a}`} />
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">{s.v}</div>
          </Panel>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {types.map(t => <span key={t} className="text-[11.5px] rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-neutral-400">{t}</span>)}
      </div>
      <Panel>
        <EmptyState icon={Megaphone} accent="text-pink-400" title="Launch your first campaign"
          description="Track reach, conversions, ROI, and approve applications from one hub."
          action={<Btn variant="primary"><Plus className="size-3.5" />Create campaign</Btn>} />
      </Panel>
    </div>
  );
}
