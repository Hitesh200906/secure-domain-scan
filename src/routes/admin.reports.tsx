import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, Section, Badge } from "@/components/admin/AdminShell";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { Download, Trash2, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({ component: ReportsPage });

type R = { id: string; title: string; summary: string | null; severity: string | null; file_url: string | null; scan_id: string | null; user_id: string | null; created_at: string };

function ReportsPage() {
  const [rows, setRows] = useState<R[]>([]);
  const [form, setForm] = useState({ title: "", summary: "", severity: "medium" as "low" | "medium" | "high" | "critical", file_url: "", scan_id: "", user_id: "" });

  const load = async () => {
    try {
      const { reports } = await api.admin.listReports();
      setRows((reports ?? []) as R[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    }
  };
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.user_id) return toast.error("user_id is required");
    try {
      await api.admin.createReport({
        title: form.title,
        summary: form.summary || undefined,
        severity: form.severity,
        file_url: form.file_url || undefined,
        scan_id: form.scan_id || undefined,
        user_id: form.user_id,
      });
      await logAudit("report.create", { type: "report", id: form.title });
      toast.success("Report uploaded");
      setForm({ title: "", summary: "", severity: "medium", file_url: "", scan_id: "", user_id: "" });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const remove = async (r: R) => {
    try {
      await api.admin.deleteReport(r.id);
      await logAudit("report.delete", { type: "report", id: r.id });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <AdminShell title="Report Center" description="Upload, link and distribute security reports to customers.">
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <Section title={`Reports · ${rows.length}`}>
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-4 glass rounded-xl p-4">
                <div className="size-10 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20 grid place-items-center"><FileText className="size-4 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{r.summary || "—"}</div>
                  <div className="flex gap-1.5 mt-1">
                    <Badge tone={r.severity === "critical" ? "danger" : r.severity === "high" ? "warn" : "info"}>{r.severity}</Badge>
                    <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {r.file_url && (
                  <a href={r.file_url} target="_blank" rel="noreferrer" className="size-8 grid place-items-center rounded-lg glass hover:text-primary"><Download className="size-3.5" /></a>
                )}
                <button onClick={() => remove(r)} className="size-8 grid place-items-center rounded-lg glass hover:text-rose-300"><Trash2 className="size-3.5" /></button>
              </div>
            ))}
            {rows.length === 0 && <div className="text-sm text-muted-foreground py-8 text-center">No reports yet.</div>}
          </div>
        </Section>

        <Section title="Upload report">
          <form onSubmit={create} className="space-y-3 text-sm">
            <In label="Title" v={form.title} on={(v) => setForm({ ...form, title: v })} req />
            <In label="Summary" v={form.summary} on={(v) => setForm({ ...form, summary: v })} />
            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Severity</label>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as typeof form.severity })} className="mt-1.5 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm">
                <option>low</option><option>medium</option><option>high</option><option>critical</option>
              </select>
            </div>
            <In label="File URL" v={form.file_url} on={(v) => setForm({ ...form, file_url: v })} />
            <In label="Scan ID (optional)" v={form.scan_id} on={(v) => setForm({ ...form, scan_id: v })} />
            <In label="User ID (required)" v={form.user_id} on={(v) => setForm({ ...form, user_id: v })} req />
            <button className="w-full bg-white text-black rounded-full py-2.5 text-sm font-medium">Upload</button>
          </form>
        </Section>
      </div>
    </AdminShell>
  );
}

function In({ label, v, on, req }: { label: string; v: string; on: (v: string) => void; req?: boolean }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</label>
      <input value={v} required={req} onChange={(e) => on(e.target.value)} className="mt-1.5 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm" />
    </div>
  );
}
