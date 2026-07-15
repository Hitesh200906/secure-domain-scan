import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState, Panel, Btn } from "@/components/business/primitives";
import { Bell, CheckCheck, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store-context";

export const Route = createFileRoute("/business/notifications")({ component: NotificationsPage });

type N = { id: string; title: string | null; message: string | null; created_at: string; read: boolean | null; type: string | null };

function NotificationsPage() {
  const store = useStore();
  const [items, setItems] = useState<N[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setItems([]);
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      setItems((data as any) ?? []);
    })();
  }, [store?.id]);

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Everything happening across your business, in one inbox."
        actions={<>
          <Btn variant="ghost" size="sm"><Filter className="size-3.5" />Filter</Btn>
          <Btn variant="secondary" size="sm"><CheckCheck className="size-3.5" />Mark all read</Btn>
        </>}
      />
      <Panel>
        {items === null ? (
          <div className="p-6 space-y-2">{Array.from({length:6}).map((_,i)=>(<div key={i} className="h-14 rounded-lg bg-white/[0.03] animate-pulse" />))}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={Bell} accent="text-orange-400" title="You're all caught up" description="New orders, comments, messages, and system alerts will appear here." />
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {items.map((n) => (
              <div key={n.id} className="flex items-start gap-3 px-5 py-3.5">
                <span className={`mt-1.5 size-1.5 rounded-full ${n.read ? "bg-neutral-700" : "bg-orange-400"}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-white truncate">{n.title ?? n.type ?? "Notification"}</div>
                  {n.message && <div className="text-[12px] text-neutral-500 truncate">{n.message}</div>}
                </div>
                <div className="text-[11px] text-neutral-600 shrink-0">{new Date(n.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
