import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState, Panel, Btn } from "@/components/business/primitives";
import { MessageSquare, Plus, Search, Pin, Inbox } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/business/messages")({ component: MessagesPage });

function MessagesPage() {
  const [q, setQ] = useState("");
  return (
    <div>
      <PageHeader
        title="Messages"
        description="Customer conversations, internal notes, and AI-assisted replies."
        actions={<Btn variant="primary" size="sm"><Plus className="size-3.5" />New message</Btn>}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-4 h-[calc(100vh-14rem)] min-h-[500px]">
        <Panel className="flex flex-col overflow-hidden">
          <div className="p-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0d0d0d] px-2.5 py-1.5">
              <Search className="size-3.5 text-neutral-500" />
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search inbox…" className="flex-1 bg-transparent outline-none text-[12.5px] text-white placeholder:text-neutral-600" />
            </div>
            <div className="mt-2 flex gap-1 text-[11px] text-neutral-500">
              {["All","Unread","Pinned","Archived"].map(t=><button key={t} className="px-2 py-1 rounded hover:bg-white/[0.04]">{t}</button>)}
            </div>
          </div>
          <div className="flex-1 grid place-items-center px-4">
            <div className="text-center text-[12px] text-neutral-600">
              <Inbox className="size-5 mx-auto mb-2 text-neutral-700" />
              No conversations yet
            </div>
          </div>
        </Panel>
        <Panel className="grid place-items-center">
          <EmptyState icon={MessageSquare} accent="text-purple-400"
            title="Your inbox is quiet"
            description="Once buyers, members, or teammates reach out you'll see threads here with typing indicators, read receipts, and AI reply suggestions."
            action={<Btn variant="secondary"><Pin className="size-3.5" />Pin a template</Btn>}
          />
        </Panel>
      </div>
    </div>
  );
}
