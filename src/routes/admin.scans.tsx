import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, Section, Badge } from "@/components/admin/AdminShell";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { CheckCircle2, XCircle, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/scans")({ component: ScansPage });

type Scan = { id: string; user_id: string; full_name: string; email: string; business_email?: string | null; target_url: string; plan: string; status: string; verification_method?: string | null; verification_status?: string | null; verified_at?: string | null; created_at: string };

function ScansPage() {
  const [rows, setRows] = useState<Scan[]>([]);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    try {
      const { scans } = await api.admin.listScans();
      setRows((scans ?? []) as Scan[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    }
  };
  useEffect(() => { load(); }, []);

  const act = async (s: Scan, patch: { status?: string }, action: string) => {
    try {
      await api.admin.updateScan(s.id, patch);
      await logAudit(action, { type: "scan", id: s.id }, patch);
      toast.success(action);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  const remove = async (s: Scan) => {
    try {
      await api.admin.deleteScan(s.id);
      await logAudit("scan.delete", { type: "scan", id: s.id });
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };
  const uploadReport = async (s: Scan) => {
    const url = prompt("Report URL (PDF link):");
    if (!url) return;
    try {
      await api.admin.createReport({
        scan_id: s.id,
        user_id: s.user_id,
        title: `Report for ${s.target_url}`,
        file_url: url,
        severity: "medium",
      });
      await act(s, { status: "completed" }, "scan.report.upload");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const filtered = rows.filter((r) => filter === "all" || r.status === filter);
  const incoming = rows.filter((r) => r.status === "pending" && r.verification_status === "verified");

  return (
    <AdminShell title="Scan Management" description={`${rows.length} scan requests across all customers.`}>
      <Section title={`Incoming scan requests (${incoming.length})`}>
        {incoming.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No verified requests waiting.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {incoming.map((s) => (
              <div key={s.id} className="rounded-xl border border-white/5 bg-black/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm text-white">{s.target_url}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {s.full_name} · {s.business_email || s.email}
                    </div>
                  </div>
                  <Badge tone="ok">verified</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <Badge tone="info">{s.plan}</Badge>
                  <span>via {s.verification_method === "manual" ? "site code (AI checked)" : "email code"}</span>
                  <span>· {new Date(s.created_at).toLocaleString()}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => act(s, { status: "in_progress" }, "scan.start")} className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#1D4ED8]">
                    Start scan
                  </button>
                  <button onClick={() => act(s, { status: "failed" }, "scan.reject")} className="rounded-lg glass px-3 py-1.5 text-[11px] hover:text-rose-300">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="flex flex-wrap gap-2 my-4">
        {["all", "awaiting_verification", "pending", "in_progress", "completed", "failed"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded-full border transition ${filter === s ? "bg-primary text-primary-foreground border-primary" : "glass"}`}>
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>
      <Section title="All scans">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead><tr className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <th className="text-left px-2 py-2">Scan</th><th className="text-left px-2">User</th><th className="text-left px-2">Plan</th>
              <th className="text-left px-2">Verification</th>
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
                  <td className="px-2">
                    <Badge tone={s.verification_status === "verified" ? "ok" : "warn"}>
                      {s.verification_status ?? "unverified"}
                    </Badge>
                    <div className="text-[10px] text-muted-foreground mt-1">{s.verification_method ?? "—"}</div>
                  </td>
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
