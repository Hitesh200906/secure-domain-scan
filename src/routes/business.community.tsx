import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState, Panel, Btn } from "@/components/business/primitives";
import { UsersRound, Plus, Hash, Megaphone, Calendar } from "lucide-react";

export const Route = createFileRoute("/business/community")({ component: CommunityPage });

function CommunityPage() {
  return (
    <div>
      <PageHeader
        title="Community"
        description="Channels, events, and conversations for your audience."
        actions={<Btn variant="primary" size="sm"><Plus className="size-3.5" />New channel</Btn>}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-4">
        <Panel className="p-2">
          <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-neutral-500">Channels</div>
          {[
            {i: Hash, n: "general"}, {i: Hash, n: "showcase"}, {i: Megaphone, n: "announcements"}, {i: Calendar, n: "events"}
          ].map(c => (
            <button key={c.n} className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-neutral-400 hover:bg-white/[0.04] hover:text-white">
              <c.i className="size-3.5" />{c.n}
            </button>
          ))}
        </Panel>
        <Panel>
          <EmptyState icon={UsersRound} accent="text-pink-400"
            title="Your community starts here"
            description="Create channels, host events, run leaderboards, and moderate conversations. Every post, comment, and reaction lives here."
            action={<Btn variant="primary"><Plus className="size-3.5" />Create first post</Btn>}
          />
        </Panel>
      </div>
    </div>
  );
}
