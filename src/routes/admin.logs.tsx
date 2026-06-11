import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, Section, Badge, SuperAdminGate } from "@/components/admin/AdminShell";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/admin/logs")({ component: () => <SuperAdminGate><LogsPage /></SuperAdminGate> });

type Log = { id: string; actor_email: string | null; action: string; target_type: string | null; target_id: string | null; metadata: Record<string, unknown>; created_at: string };

function LogsPage() {
  const [rows, setRows] = useState<Log[]>([]);
  useEffect(() => {
    api.admin.listAuditLogs()
      .then(({ logs }) => setRows((logs ?? []) as Log[]))
      .catch(() => setRows([]));
  }, []);

  return (
    <AdminShell title="Audit Logs" description="Every admin action is recorded here.">
      <Section title={`${rows.length} events`}>
        <div className="space-y-1.5 text-sm">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-3 glass rounded-xl px-4 py-2.5">
              <Badge tone="info">{r.action}</Badge>
              <span className="text-[12px] text-muted-foreground truncate flex-1">
                {r.actor_email || "system"} {r.target_type ? `· ${r.target_type}:${(r.target_id || "").slice(0, 8)}` : ""}
              </span>
              <span className="text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
            </div>
          ))}
          {rows.length === 0 && <div className="text-muted-foreground text-center py-12 text-sm">No audit events yet.</div>}
        </div>
      </Section>
    </AdminShell>
  );
}
