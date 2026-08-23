import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell, Section, Badge } from "@/components/admin/AdminShell";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { TECH_LABELS } from "@/lib/scan-config.schemas";
import { adminListScanReports, adminReleaseReport } from "@/lib/admin-scans.functions";
import { ArrowLeft, CheckCircle2, Loader2, Search, Send, Trash2, XCircle } from "lucide-react";

type ScanReport = {
  id: string;
  title: string;
  summary: string | null;
  severity: string | null;
  delivered_at: string | null;
  created_at: string;
};

/** Reports returned by the AI scanner for one request, with a release action. */
function ScanReports({ scanId }: { scanId: string }) {
  const [reports, setReports] = useState<ScanReport[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const listReports = useServerFn(adminListScanReports);
  const release = useServerFn(adminReleaseReport);

  const load = () =>
    listReports({ data: { id: scanId } })
      .then((r) => setReports(r.reports))
      .catch(() => setReports([]));

  useEffect(() => { load(); }, [scanId]);

  const send = async (r: ScanReport) => {
    setBusyId(r.id);
    try {
      await release({ data: { id: r.id } });
      await logAudit("report.release", { type: "report", id: r.id });
      toast.success("Report released to the customer");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to release report");
    } finally {
      setBusyId(null);
    }
  };

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-black/40 py-10 text-center text-sm text-muted-foreground">
        No report received from the AI scanner yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div key={r.id} className="rounded-xl border border-white/8 bg-black/40 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm text-white">{r.title}</div>
              <div className="text-[11px] text-muted-foreground">
                Received {new Date(r.created_at).toLocaleString()}
                {r.severity ? ` · severity ${r.severity}` : ""}
              </div>
            </div>
            {r.delivered_at ? (
              <Badge tone="ok">Delivered to customer</Badge>
            ) : (
              <button
                disabled={busyId === r.id}
                onClick={() => send(r)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-[12px] font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
              >
                {busyId === r.id ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                Send report to customer
              </button>
            )}
          </div>
          {r.summary && <p className="mt-2 text-xs text-muted-foreground">{r.summary}</p>}
        </div>
      ))}
    </div>
  );
}

type Scan = {
  id: string;
  user_id: string;
  full_name: string;
  role_title?: string | null;
  company?: string | null;
  email: string;
  business_email?: string | null;
  target_url: string;
  plan: string;
  status: string;
  score?: number | null;
  findings_count?: number | null;
  verification_method?: string | null;
  verification_status?: string | null;
  verification_notes?: string | null;
  verified_at?: string | null;
  scan_config?: Record<string, unknown> | null;
  created_at: string;
};

const FILTERS = ["all", "awaiting_verification", "pending", "in_progress", "completed", "failed"];

export function ScansPanel() {
  const [rows, setRows] = useState<Scan[]>([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { scans } = await api.admin.listScans();
      setRows((scans ?? []) as Scan[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (s: Scan, status: "completed" | "failed" | "in_progress") => {
    setBusy(true);
    try {
      await api.admin.updateScan(s.id, { status });
      await logAudit(`scan.${status}`, { type: "scan", id: s.id }, { status });
      if (status === "completed" || status === "failed") {
        try {
          await api.admin.notifyUser(
            s.user_id,
            status === "completed" ? "Your security report is ready" : "Your scan could not be completed",
            status === "completed"
              ? `The scan for ${s.target_url} is complete. Open your dashboard to read the full report.`
              : `We could not complete the scan for ${s.target_url}. Our team will reach out with the details.`,
            "/dashboard",
          );
        } catch { /* notification is best-effort */ }
      }
      toast.success(status === "completed" ? "Report marked completed" : status === "failed" ? "Report marked failed" : "Scan started");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (s: Scan) => {
    setBusy(true);
    try {
      await api.admin.deleteScan(s.id);
      await logAudit("scan.delete", { type: "scan", id: s.id });
      toast.success("Report deleted");
      setOpenId(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!q) return true;
      return (
        (r.email ?? "").toLowerCase().includes(q) ||
        (r.business_email ?? "").toLowerCase().includes(q) ||
        (r.full_name ?? "").toLowerCase().includes(q) ||
        (r.target_url ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, filter, query]);

  const openScan = rows.find((r) => r.id === openId) ?? null;

  if (openScan) {
    return (
      <AdminShell title="Report details" description={`Submitted for ${openScan.target_url}`}>
        <button
          onClick={() => setOpenId(null)}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 text-[12px] text-white/65 transition hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Back to scans
        </button>

        <div className="space-y-4">
          <Section title="Submitted details">
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Full name" value={openScan.full_name} />
              <Detail label="Role" value={openScan.role_title || "—"} />
              <Detail label="Company" value={openScan.company || "—"} />
              <Detail label="Account email" value={openScan.email} />
              <Detail label="Business email" value={openScan.business_email || "—"} />
              <Detail label="Target website" value={openScan.target_url} />
              <Detail label="Plan" value={openScan.plan} />
              <Detail label="Verification" value={`${openScan.verification_method ?? "—"} · ${openScan.verification_status ?? "unverified"}`} />
              <Detail label="Submitted" value={new Date(openScan.created_at).toLocaleString()} />
              <Detail label="Request ID" value={openScan.id} mono />
            </div>
          </Section>

          <Section title="AI requirement details">
            {openScan.scan_config ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {configEntries(openScan.scan_config).map(([label, value]) => (
                  <Detail key={label} label={label} value={value} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-black/40 py-10 text-center text-sm text-muted-foreground">
                Customer has not submitted the scan configuration form yet.
              </div>
            )}
          </Section>


          <Section title="Status">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={openScan.status === "completed" ? "ok" : openScan.status === "failed" ? "danger" : "warn"}>
                {openScan.status.replace(/_/g, " ")}
              </Badge>
              {openScan.score != null && <span className="text-xs text-muted-foreground">Score {openScan.score}/100</span>}
              {openScan.findings_count != null && <span className="text-xs text-muted-foreground">{openScan.findings_count} findings</span>}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                disabled={busy}
                onClick={() => setStatus(openScan, "completed")}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-[12px] font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
              >
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />} Completed
              </button>
              <button
                disabled={busy}
                onClick={() => setStatus(openScan, "failed")}
                className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-4 py-2 text-[12px] text-neutral-200 transition hover:border-rose-400/40 hover:text-rose-300 disabled:opacity-50"
              >
                <XCircle className="size-3.5" /> Failed
              </button>
              <button
                disabled={busy}
                onClick={() => remove(openScan)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-4 py-2 text-[12px] text-neutral-200 transition hover:border-rose-400/40 hover:text-rose-300 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" /> Delete report
              </button>
            </div>
          </Section>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Scan Management" description={`${rows.length} scan requests across all customers.`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer email…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-white/25"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-3 py-1.5 text-xs transition ${filter === s ? "border-primary bg-primary text-primary-foreground" : "glass"}`}>
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <Section title={`Reports · ${filtered.length}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <th className="px-2 py-2 text-left">Scan</th>
                <th className="px-2 text-left">User</th>
                <th className="px-2 text-left">Plan</th>
                <th className="px-2 text-left">Verification</th>
                <th className="px-2 text-left">Status</th>
                <th className="px-2 text-left">Date</th>
                <th className="px-2 text-right">Report</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-white/5">
                  <td className="px-2 py-3">
                    <div className="max-w-[260px] truncate text-sm">{s.target_url}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{s.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-2"><div className="text-sm">{s.full_name}</div><div className="text-[11px] text-muted-foreground">{s.email}</div></td>
                  <td className="px-2"><Badge tone="info">{s.plan}</Badge></td>
                  <td className="px-2">
                    <Badge tone={s.verification_status === "verified" ? "ok" : "warn"}>{s.verification_status ?? "unverified"}</Badge>
                    <div className="mt-1 text-[10px] text-muted-foreground">{s.verification_method ?? "—"}</div>
                  </td>
                  <td className="px-2"><Badge tone={s.status === "completed" ? "ok" : s.status === "failed" ? "danger" : "warn"}>{s.status.replace(/_/g, " ")}</Badge></td>
                  <td className="px-2 text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="px-2 py-3 text-right">
                    <button
                      onClick={() => setOpenId(s.id)}
                      className="rounded-lg bg-[#2563EB] px-3.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-[#1D4ED8]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">No scans match this view.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </AdminShell>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/40 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`mt-1 break-words text-sm text-white ${mono ? "font-mono text-[12px]" : ""}`}>{value}</div>
    </div>
  );
}

function configEntries(cfg: Record<string, unknown>): [string, string][] {
  const adv = (cfg.advanced ?? {}) as Record<string, unknown>;
  return [
    ["Authentication", cfg.authentication === "login_required" ? "Login Required" : "Public"],
    ["Secure test session", cfg.secure_session_requested ? "Requested" : "Not requested"],
    ["WAF", cfg.waf === "waf" ? "Cloudflare / Other WAF" : "None"],
    ["Technology", TECH_LABELS[(cfg.technology as keyof typeof TECH_LABELS) ?? "not_sure"] ?? "Not Sure"],
    ["Scan rate", String(cfg.scan_rate ?? "—")],
    ["Scan depth", String(cfg.scan_depth ?? "—")],
    ["AI validation", cfg.ai_validation ? "Enabled" : "Disabled"],
    ["Respect robots.txt", adv.respect_robots ? "Yes" : "No"],
    ["Include subdomains", adv.include_subdomains ? "Yes" : "No"],
    ["Include API endpoints", adv.include_api_endpoints ? "Yes" : "No"],
    ["Max crawl depth", String(adv.max_crawl_depth ?? "—")],
    ["Request timeout", `${adv.request_timeout ?? "—"}s`],
    ["Custom URL exclusions", String(adv.excluded_urls || "—")],
  ];
}
