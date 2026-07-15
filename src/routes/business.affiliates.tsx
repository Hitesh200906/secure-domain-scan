import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState, Panel, Btn } from "@/components/business/primitives";
import { Share2, Plus, TrendingUp, DollarSign, Users, Trophy } from "lucide-react";

export const Route = createFileRoute("/business/affiliates")({ component: AffiliatesPage });

function AffiliatesPage() {
  const stats = [
    { l: "Active affiliates", v: 0, i: Users, a: "text-blue-400" },
    { l: "Referral revenue", v: "$0", i: DollarSign, a: "text-emerald-400" },
    { l: "Clicks (30d)", v: 0, i: TrendingUp, a: "text-cyan-400" },
    { l: "Top performer", v: "—", i: Trophy, a: "text-orange-400" },
  ];
  return (
    <div>
      <PageHeader
        title="Affiliates"
        description="Recruit partners, track referrals, and pay out commissions."
        actions={<Btn variant="primary" size="sm"><Plus className="size-3.5" />Invite affiliate</Btn>}
      />
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
      <Panel>
        <EmptyState icon={Share2} accent="text-orange-400"
          title="Launch your affiliate program"
          description="Set commission tiers, share swipeable assets, generate referral links, and detect fraud automatically."
          action={<Btn variant="primary">Configure program</Btn>}
        />
      </Panel>
    </div>
  );
}
