import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, EmptyState, Btn } from "@/components/business/primitives";
import { Zap, Plus, Mail, Webhook, UserPlus, ShoppingCart, Clock } from "lucide-react";

export const Route = createFileRoute("/business/automation")({ component: AutomationPage });

function AutomationPage() {
  const templates = [
    { i: Mail, t: "Welcome email on signup", d: "Trigger: new member → Send email", a: "text-blue-400" },
    { i: ShoppingCart, t: "Post-purchase thank you", d: "Trigger: order paid → Email + tag", a: "text-emerald-400" },
    { i: UserPlus, t: "VIP promote at $500 LTV", d: "Trigger: LTV threshold → Add role", a: "text-purple-400" },
    { i: Webhook, t: "Send order to Discord", d: "Trigger: order paid → Webhook", a: "text-orange-400" },
    { i: Clock, t: "Weekly recap digest", d: "Trigger: schedule → Email", a: "text-pink-400" },
  ];
  return (
    <div>
      <PageHeader title="Automation" description="Trigger → condition → action. Wire up any business workflow, no code."
        actions={<Btn variant="primary" size="sm"><Plus className="size-3.5" />New workflow</Btn>} />
      <div className="text-[11px] uppercase tracking-widest text-neutral-500 mb-2 px-1">Templates</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {templates.map(t => (
          <Panel key={t.t} className="p-4 hover:-translate-y-0.5 transition cursor-pointer">
            <t.i className={`size-5 ${t.a}`} />
            <div className="mt-3 text-[13.5px] font-semibold text-white">{t.t}</div>
            <div className="mt-1 text-[11.5px] text-neutral-500">{t.d}</div>
          </Panel>
        ))}
      </div>
      <Panel>
        <div className="px-5 py-3 border-b border-white/[0.06] text-[13px] font-medium">Your workflows</div>
        <EmptyState icon={Zap} accent="text-orange-400" title="No workflows yet" description="Every workflow you create appears here with run history and success rate." />
      </Panel>
    </div>
  );
}
