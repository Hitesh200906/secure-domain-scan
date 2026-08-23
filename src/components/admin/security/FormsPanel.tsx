import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell, Section, Badge } from "@/components/admin/AdminShell";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Search, Send } from "lucide-react";
import { TECH_LABELS } from "@/lib/scan-config.schemas";
import { adminDispatchScan } from "@/lib/admin-scans.functions";

type ScanRow = {
  id: string;
  user_id: string;
  full_name: string;
  company?: string | null;
  email: string;
  business_email?: string | null;
  target_url: string;
  plan: string;
  status: string;
  verification_status?: string | null;
  scan_config?: Record<string, unknown> | null;
  config_submitted_at?: string | null;
  dispatched_at?: string | null;
  dispatch_error?: string | null;
  created_at: string;
};

/** Scan-request forms submitted by customers, forwarded to the AI scanner by an admin. */
export function FormsPanel() {
  const [rows, setRows] = useState<ScanRow[]>([]);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const dispatchScan = useServerFn(adminDispatchScan);

  const load = () =>
    api.admin
      .listScans()
      .then(({ scans }) => setRows(((scans ?? []) as ScanRow[]).filter((s) => !!s.scan_config)))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load"));

  useEffect(() => { load(); }, []);

  const send = async (s: ScanRow) => {
    setSendingId(s.id);
    try {
      await dispatchScan({ data: { id: s.id } });
      toast.success("Form sent to the AI scanner");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send to the scanner");
    } finally {
      setSendingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.email, r.business_email, r.full_name, r.target_url].some((v) => (v ?? "").toLowerCase().includes(q)),
    );
  }, [rows, query]);

  const open = rows.find((r) => r.id === openId) ?? null;

  if (open) {
    const cfg = (open.scan_config ?? {}) as Record<string, unknown>;
    const adv = (cfg.advanced ?? {}) as Record<string, unknown>;
    return (
      <AdminShell title="Scan request form" description={`Submitted for ${open.target_url}`}>
        <button
          onClick={() => setOpenId(null)}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 text-[12px] text-white/65 transition hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Back to forms
        </button>

        <div className="space-y-4">
          <Section title="Customer">
            <div className="grid gap-3 sm:grid-cols-2">
              <Row label="Full name" value={open.full_name} />
              <Row label="Company" value={open.company || "—"} />
              <Row label="Account email" value={open.email} />
              <Row label="Business email" value={open.business_email || "—"} />
              <Row label="Target website" value={open.target_url} />
              <Row label="Plan" value={open.plan} />
              <Row label="Verification" value={open.verification_status ?? "unverified"} />
              <Row label="Submitted" value={open.config_submitted_at ? new Date(open.config_submitted_at).toLocaleString() : "—"} />
            </div>
          </Section>

          <Section title="AI requirement details">
            <div className="grid gap-3 sm:grid-cols-2">
              <Row label="Authentication" value={cfg.authentication === "login_required" ? "Login Required" : "Public"} />
              <Row label="Secure test session" value={cfg.secure_session_requested ? "Requested" : "Not requested"} />
              <Row label="WAF" value={cfg.waf === "waf" ? "Cloudflare / Other WAF" : "None"} />
              <Row label="Technology" value={TECH_LABELS[(cfg.technology as keyof typeof TECH_LABELS) ?? "not_sure"] ?? "Not Sure"} />
              <Row label="Scan rate" value={String(cfg.scan_rate ?? "—")} />
              <Row label="Scan depth" value={String(cfg.scan_depth ?? "—")} />
              <Row label="AI validation" value={cfg.ai_validation ? "Enabled" : "Disabled"} />
              <Row label="Respect robots.txt" value={adv.respect_robots ? "Yes" : "No"} />
              <Row label="Include subdomains" value={adv.include_subdomains ? "Yes" : "No"} />
              <Row label="Include API endpoints" value={adv.include_api_endpoints ? "Yes" : "No"} />
              <Row label="Max crawl depth" value={String(adv.max_crawl_depth ?? "—")} />
              <Row label="Request timeout" value={`${adv.request_timeout ?? "—"}s`} />
              <div className="sm:col-span-2">
                <Row label="Custom URL exclusions" value={String(adv.excluded_urls || "—")} />
              </div>
            </div>
          </Section>

          <Section title="Pipeline">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={open.status === "completed" ? "ok" : open.status === "failed" ? "danger" : "warn"}>
                {open.status.replace(/_/g, " ")}
              </Badge>
              {open.dispatched_at && (
                <span className="text-[11px] text-muted-foreground">
                  Sent to scanner {new Date(open.dispatched_at).toLocaleString()}
                </span>
              )}
              {open.dispatch_error && <span className="text-[11px] text-rose-300">{open.dispatch_error}</span>}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                disabled={sendingId === open.id}
                onClick={() => send(open)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-[12px] font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
              >
                {sendingId === open.id ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                {open.dispatched_at ? "Resend to AI scanner" : "Send to AI scanner"}
              </button>
              <span className="text-xs text-muted-foreground">
                The scanner returns the finished report to the admin panel, where you release it to the customer from Scan
                Management.
              </span>
            </div>
          </Section>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Forms" description={`${rows.length} scan request forms received from customers.`}>
      <div className="mb-4 relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by customer email…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-white/25"
        />
      </div>

      <Section title={`Requests · ${filtered.length}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <th className="px-2 py-2 text-left">Website</th>
                <th className="px-2 text-left">Customer</th>
                <th className="px-2 text-left">Plan</th>
                <th className="px-2 text-left">Status</th>
                <th className="px-2 text-left">Submitted</th>
                <th className="px-2 text-right">Form</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-white/5">
                  <td className="px-2 py-3"><div className="max-w-[240px] truncate">{s.target_url}</div></td>
                  <td className="px-2"><div className="text-sm">{s.full_name}</div><div className="text-[11px] text-muted-foreground">{s.email}</div></td>
                  <td className="px-2"><Badge tone="info">{s.plan}</Badge></td>
                  <td className="px-2"><Badge tone={s.status === "completed" ? "ok" : s.status === "failed" ? "danger" : "warn"}>{s.status.replace(/_/g, " ")}</Badge></td>
                  <td className="px-2 text-xs text-muted-foreground">
                    {s.config_submitted_at ? new Date(s.config_submitted_at).toLocaleString() : new Date(s.created_at).toLocaleString()}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        disabled={sendingId === s.id}
                        onClick={() => send(s)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-3 py-1.5 text-[11px] text-neutral-200 transition hover:border-white/30 disabled:opacity-50"
                      >
                        {sendingId === s.id ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
                        {s.dispatched_at ? "Resend" : "Send to scanner"}
                      </button>
                    <button
                      onClick={() => setOpenId(s.id)}
                      className="rounded-lg bg-[#2563EB] px-3.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-[#1D4ED8]"
                    >
                      View
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No scan request forms yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </AdminShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/40 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm text-white">{value}</div>
    </div>
  );
}
