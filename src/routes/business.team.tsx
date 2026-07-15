import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, EmptyState, Btn } from "@/components/business/primitives";
import { UserCog, UserPlus, Shield, Building2 } from "lucide-react";

export const Route = createFileRoute("/business/team")({ component: TeamPage });

function TeamPage() {
  return (
    <div>
      <PageHeader title="Team" description="Invite teammates, assign roles, and manage permissions."
        actions={<Btn variant="primary" size="sm"><UserPlus className="size-3.5" />Invite member</Btn>} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        <Panel className="p-4"><div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-neutral-500"><Shield className="size-3.5 text-blue-400" />Roles</div><div className="mt-2 text-2xl font-semibold">4</div><div className="text-[11.5px] text-neutral-500 mt-0.5">Owner · Admin · Editor · Viewer</div></Panel>
        <Panel className="p-4"><div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-neutral-500"><Building2 className="size-3.5 text-emerald-400" />Departments</div><div className="mt-2 text-2xl font-semibold">0</div><div className="text-[11.5px] text-neutral-500 mt-0.5">Sales · Support · Ops</div></Panel>
        <Panel className="p-4"><div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-neutral-500"><UserCog className="size-3.5 text-purple-400" />Seats</div><div className="mt-2 text-2xl font-semibold">1<span className="text-[13px] text-neutral-500 font-normal"> / 5</span></div><div className="text-[11.5px] text-neutral-500 mt-0.5">Upgrade for more</div></Panel>
      </div>
      <Panel>
        <div className="px-5 py-3 border-b border-white/[0.06] text-[13px] font-medium">Members</div>
        <EmptyState icon={UserCog} accent="text-blue-400" title="You're the only one here" description="Invite teammates to collaborate on products, community, and support." />
      </Panel>
    </div>
  );
}
