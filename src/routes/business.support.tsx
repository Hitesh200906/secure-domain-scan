import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Btn, EmptyState } from "@/components/business/primitives";
import { LifeBuoy, MessageSquare, BookOpen, Bug, Sparkles, MapPin, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/business/support")({ component: SupportPage });

function SupportPage() {
  const cards = [
    { icon: BookOpen, t: "Knowledge base", d: "Guides, tutorials, and how-tos.", a: "text-blue-400" },
    { icon: MessageSquare, t: "Live chat", d: "Talk to a human, 24/7.", a: "text-purple-400" },
    { icon: Bug, t: "Report a bug", d: "Something broken? Tell us.", a: "text-orange-400" },
    { icon: Sparkles, t: "Feature requests", d: "Vote on what we build next.", a: "text-pink-400" },
    { icon: MapPin, t: "Roadmap", d: "What's shipping this quarter.", a: "text-cyan-400" },
    { icon: CheckCircle2, t: "System status", d: "All systems operational.", a: "text-emerald-400" },
  ];
  return (
    <div>
      <PageHeader title="Support" description="Help, docs, tickets, and the Forge roadmap — all in one place." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {cards.map(c => (
          <Panel key={c.t} className="p-5 hover:-translate-y-0.5 transition cursor-pointer">
            <c.icon className={`size-5 ${c.a}`} />
            <div className="mt-3 text-[14px] font-semibold text-white">{c.t}</div>
            <div className="mt-1 text-[12.5px] text-neutral-500">{c.d}</div>
          </Panel>
        ))}
      </div>
      <Panel>
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <div className="text-[13px] font-medium">Your tickets</div>
          <Btn variant="primary" size="sm">New ticket</Btn>
        </div>
        <EmptyState icon={LifeBuoy} title="No open tickets" description="Support tickets you open will appear here with status and history." />
      </Panel>
    </div>
  );
}
