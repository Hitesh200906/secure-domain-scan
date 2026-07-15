import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Btn } from "@/components/business/primitives";
import { Sparkles, Send, TrendingUp, Users2, DollarSign, Lightbulb } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/business/ai")({ component: AIPage });

function AIPage() {
  const [q, setQ] = useState("");
  const prompts = [
    { i: TrendingUp, t: "Forecast next month's revenue", a: "text-emerald-400" },
    { i: Users2, t: "Segment my top 10% customers", a: "text-blue-400" },
    { i: DollarSign, t: "Which product should I price higher?", a: "text-purple-400" },
    { i: Lightbulb, t: "Draft a launch email for my new product", a: "text-orange-400" },
  ];
  return (
    <div>
      <PageHeader title="AI Assistant" description="Your business advisor, marketing copilot, and growth strategist." />
      <Panel className="p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 grid place-items-center"><Sparkles className="size-4" /></div>
          <div>
            <div className="text-[14px] font-semibold">Forge AI</div>
            <div className="text-[11.5px] text-neutral-500">Trained on your store data</div>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-3 flex items-end gap-2">
          <textarea value={q} onChange={e=>setQ(e.target.value)} rows={2}
            placeholder="Ask anything about your business…"
            className="flex-1 bg-transparent outline-none text-[13.5px] text-white placeholder:text-neutral-600 resize-none" />
          <Btn variant="primary" size="sm"><Send className="size-3.5" />Ask</Btn>
        </div>
      </Panel>
      <div className="text-[11px] uppercase tracking-widest text-neutral-500 mb-2 px-1">Try asking</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {prompts.map(p => (
          <button key={p.t} onClick={()=>setQ(p.t)} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#111] hover:bg-[#151515] transition p-3 text-left">
            <p.i className={`size-4 ${p.a}`} />
            <span className="text-[13px] text-white">{p.t}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
