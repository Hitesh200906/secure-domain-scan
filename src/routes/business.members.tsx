import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, EmptyState, Btn } from "@/components/business/primitives";
import { Users, Plus, Search, Filter, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store-context";
import { getStoreOrders, type Order } from "@/lib/business";

export const Route = createFileRoute("/business/members")({ component: MembersPage });

function MembersPage() {
  const store = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => { if (store) getStoreOrders(store.id).then(setOrders); }, [store?.id]);

  const members = Array.from(new Map(orders.filter(o => o.buyer_email).map(o => [o.buyer_email!, o])).values())
    .filter(o => !q || (o.buyer_email ?? "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Members"
        description="Everyone in your ecosystem — buyers, subscribers, community."
        actions={<>
          <Btn variant="ghost" size="sm"><Download className="size-3.5" />Export</Btn>
          <Btn variant="primary" size="sm"><Plus className="size-3.5" />Invite</Btn>
        </>}
      />
      <Panel>
        <div className="flex items-center gap-2 p-3 border-b border-white/[0.06]">
          <div className="flex-1 flex items-center gap-2 rounded-lg border border-white/10 bg-[#0d0d0d] px-2.5 py-1.5">
            <Search className="size-3.5 text-neutral-500" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search members…" className="flex-1 bg-transparent outline-none text-[13px] text-white placeholder:text-neutral-600" />
          </div>
          <Btn variant="ghost" size="sm"><Filter className="size-3.5" />Filters</Btn>
        </div>
        {members.length === 0 ? (
          <EmptyState icon={Users} accent="text-blue-400" title="No members yet"
            description="Once someone buys, joins your community, or signs up, they'll appear here with orders, tags, and lifetime value." />
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {members.map(m => (
              <div key={m.buyer_email} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 hover:bg-white/[0.02]">
                <div className="size-9 rounded-full bg-gradient-to-br from-blue-500/40 to-purple-500/40 grid place-items-center text-[12px] font-semibold uppercase">{(m.buyer_email??"?")[0]}</div>
                <div className="min-w-0">
                  <div className="text-[13.5px] text-white truncate">{m.buyer_email}</div>
                  <div className="text-[11px] text-neutral-500">Joined {new Date(m.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-[12px] text-neutral-400">{orders.filter(o=>o.buyer_email===m.buyer_email).length} orders</div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
