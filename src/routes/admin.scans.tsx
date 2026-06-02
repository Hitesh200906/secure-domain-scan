import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, Section, Badge } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { CheckCircle2, XCircle, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/scans")({ component: ScansPage });

type Scan = { id: string; user_id: string; full_name: string; email: string; target_url: string; plan: string; status: string; created_at: string };

function ScansPage() {
  const [rows, setRows] = useState<Scan[]>([]);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const { data } = await supabase.from("scan_requests").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as never);
  };
  useEffect(() => { load(); }, []);

  const act = async (s: Scan, patch: Partial<Scan>, action: string) => {
    await supabase.from("scan_requests").update(patch).eq("id", s.id);
    await logAudit(action, { type: "scan", id: s.id }, patch);
    toast.success(action);
    load();
  };
  const remove = async (s: Scan) => {
    await supabase.from("scan_requests").delete().eq("id", s.id);
    await logAudit("scan.delete", { type: "scan", id: s.id });
    toast.success("Deleted");
    load();
  };
  const uploadReport = async (s: Scan) => {
    const url = prompt("Report URL (PDF link):");
    if (!url) return;
    await supabase.from("reports").insert({ scan_id: s.id, user_id: s.user_id, title: `Report for ${s.target_url}`, file_url: url, severity: "medium" });
    await act(s, { status: "completed" }, "scan.report.upload");
  };

  const filtered = rows.filter((r) => filter === "all" || r.status === filter);

  return (
    <AdminShell title="Scan Management" description={`${rows.length} scan requests across all customers.`}>
      <div className="flex gap-2 mb-4">
        {["all", "pending", "in_progress", "completed", "failed"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded-full border transition ${filter === s ? "bg-primary text-primary-foreground border-primary" : "glass"}`}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>
      <Section title="All scans">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead><tr className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <th className="text-left px-2 py-2">Scan</th><th className="text-left px-2">User</th><th className="text-left px-2">Plan</th>
              <th className="text-left px-2">Status</th><th className="text-left px-2">Date</th><th className="text-right px-2">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-white/5">
                  <td className="px-2 py-3">
                    <div className="text-sm truncate max-w-[260px]">{s.target_url}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{s.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-2"><div className="text-sm">{s.full_name}</div><div className="text-[11px] text-muted-foreground">{s.email}</div></td>
                  <td className="px-2"><Badge tone="info">{s.plan}</Badge></td>
                  <td className="px-2"><Badge tone={s.status === "completed" ? "ok" : s.status === "failed" ? "danger" : "warn"}>{s.status}</Badge></td>
                  <td className="px-2 text-muted-foreground text-xs">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="px-2 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button title="Mark complete" onClick={() => act(s, { status: "completed" }, "scan.complete")} className="size-7 grid place-items-center rounded-lg glass hover:text-emerald-300"><CheckCircle2 className="size-3.5" /></button>
                      <button title="Mark failed" onClick={() => act(s, { status: "failed" }, "scan.fail")} className="size-7 grid place-items-center rounded-lg glass hover:text-rose-300"><XCircle className="size-3.5" /></button>
                      <button title="Upload report" onClick={() => uploadReport(s)} className="size-7 grid place-items-center rounded-lg glass hover:text-primary"><Upload className="size-3.5" /></button>
                      <button title="Delete" onClick={() => remove(s)} className="size-7 grid place-items-center rounded-lg glass hover:text-rose-300"><Trash2 className="size-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No scans.</td></tr>}
            </tbody>
          </table>
        </div>
      </Section>
    </AdminShell>
  );
}
