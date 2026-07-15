import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Btn } from "@/components/business/primitives";
import { Blocks, Check } from "lucide-react";

export const Route = createFileRoute("/business/marketplace")({ component: MarketplacePage });

const APPS = [
  { n: "Discord", d: "Sync roles + notifications to Discord.", a: "bg-indigo-500/20 text-indigo-300", installed: true },
  { n: "Slack", d: "Order alerts in your Slack channel.", a: "bg-purple-500/20 text-purple-300" },
  { n: "Stripe", d: "Payments and payouts.", a: "bg-violet-500/20 text-violet-300", installed: true },
  { n: "PayPal", d: "Alt payment method.", a: "bg-sky-500/20 text-sky-300" },
  { n: "Zapier", d: "5000+ app connections.", a: "bg-orange-500/20 text-orange-300" },
  { n: "Notion", d: "Sync docs to Notion.", a: "bg-neutral-500/20 text-neutral-300" },
  { n: "GitHub", d: "Issue + release automation.", a: "bg-white/10 text-white" },
  { n: "Google", d: "Sign-in + Calendar events.", a: "bg-red-500/20 text-red-300" },
  { n: "OpenAI", d: "Custom AI workflows.", a: "bg-emerald-500/20 text-emerald-300" },
  { n: "Supabase", d: "Custom backend hooks.", a: "bg-green-500/20 text-green-300" },
];

function MarketplacePage() {
  return (
    <div>
      <PageHeader title="App Marketplace" description="Extend Forge with integrations, apps, and connectors." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {APPS.map(a => (
          <Panel key={a.n} className="p-4 flex items-start gap-3 hover:-translate-y-0.5 transition">
            <div className={`size-10 rounded-xl grid place-items-center text-[13px] font-bold ${a.a}`}>{a.n[0]}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <div className="text-[14px] font-semibold text-white">{a.n}</div>
                {a.installed && <span className="text-[10px] rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 flex items-center gap-0.5"><Check className="size-2.5" />Installed</span>}
              </div>
              <div className="mt-0.5 text-[12px] text-neutral-500">{a.d}</div>
              <div className="mt-3">
                <Btn variant={a.installed ? "ghost" : "secondary"} size="sm">{a.installed ? "Configure" : "Install"}</Btn>
              </div>
            </div>
          </Panel>
        ))}
        <Panel className="p-4 border-dashed grid place-items-center min-h-[112px] text-center">
          <div>
            <Blocks className="size-5 mx-auto text-neutral-500" />
            <div className="mt-2 text-[12.5px] text-neutral-500">Build your own with the Forge API</div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
