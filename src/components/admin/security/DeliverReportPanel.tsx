import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Search, Send, UserCheck, UserX } from "lucide-react";
import { Section } from "@/components/admin/AdminShell";
import { adminDeliverReportByEmail, adminLookupAccount } from "@/lib/admin-scans.functions";
import { logAudit } from "@/lib/audit";

type Account = { id: string; full_name: string | null; email: string | null; company: string | null };
type ScanRow = { id: string; target_url: string; plan: string; status: string; created_at: string };

/**
 * Reports arrive from the scanning team addressed to a customer email.
 * The admin looks that email up against registered accounts and, once matched,
 * delivers the report straight into that account.
 */
export function DeliverReportPanel({ onDelivered }: { onDelivered?: () => void }) {
  const lookup = useServerFn(adminLookupAccount);
  const deliver = useServerFn(adminDeliverReportByEmail);

  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    severity: "" as "" | "low" | "medium" | "high" | "critical",
    file_url: "",
    findings: "",
    scan_id: "",
  });

  const find = async () => {
    if (!email.trim()) return;
    setChecking(true);
    setAccount(null);
    setNotFound(false);
    try {
      const res = await lookup({ data: { email: email.trim() } });
      if (!res.found) {
        setNotFound(true);
        setScans([]);
        return;
      }
      setAccount(res.account);
      setScans(res.scans);
      setForm((f) => ({
        ...f,
        scan_id: res.scans[0]?.id ?? "",
        title: f.title || (res.scans[0] ? `Security report — ${res.scans[0].target_url}` : ""),
      }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setChecking(false);
    }
  };

  const send = async () => {
    if (!account) return;
    if (!form.title.trim()) {
      toast.error("Give the report a title");
      return;
    }
    setSending(true);
    try {
      const res = await deliver({
        data: {
          email: email.trim(),
          title: form.title.trim(),
          ...(form.summary.trim() ? { summary: form.summary.trim() } : {}),
          ...(form.severity ? { severity: form.severity } : {}),
          ...(form.file_url.trim() ? { file_url: form.file_url.trim() } : {}),
          ...(form.findings.trim() ? { findings: form.findings } : {}),
          ...(form.scan_id ? { scan_id: form.scan_id } : {}),
        },
      });
      await logAudit("report.deliver_by_email", { type: "report", id: res.report_id ?? "new" }, { email: email.trim() });
      toast.success(`Report delivered to ${email.trim()}`);
      setForm({ title: "", summary: "", severity: "", file_url: "", findings: "", scan_id: "" });
      setAccount(null);
      setEmail("");
      onDelivered?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delivery failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <Section title="Deliver a report by customer email">
      <p className="-mt-1 mb-4 text-[12px] text-muted-foreground">
        Paste the email the report was filed under. We match it to the registered account and send the report
        straight to that user's dashboard.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && find()}
            placeholder="customer@company.com"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-white/25"
          />
        </div>
        <button
          onClick={find}
          disabled={checking}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-[12px] text-white transition hover:border-white/30 disabled:opacity-50"
        >
          {checking ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
          Find account
        </button>
      </div>

      {notFound && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/5 px-4 py-3 text-[12px] text-rose-200">
          <UserX className="size-4" /> No Nexefy account is registered with that email.
        </div>
      )}

      {account && (
        <div className="mt-4 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/5 px-4 py-3 text-[12px] text-emerald-200">
            <UserCheck className="size-4" />
            Matched {account.full_name || "account"} · {account.email}
            {account.company ? ` · ${account.company}` : ""}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <LabeledInput label="Report title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Security report — example.com" />
            <div>
              <div className="mb-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Linked scan request</div>
              <select
                value={form.scan_id}
                onChange={(e) => setForm({ ...form, scan_id: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25"
              >
                <option value="">Not linked to a request</option>
                {scans.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.target_url} · {s.plan} · {s.status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Severity</div>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value as typeof form.severity })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25"
              >
                <option value="">Not set</option>
                {["low", "medium", "high", "critical"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <LabeledInput label="Report file link (optional)" value={form.file_url} onChange={(v) => setForm({ ...form, file_url: v })} placeholder="https://…" />
          </div>

          <LabeledArea label="Summary" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} rows={3} placeholder="Short summary shown to the customer." />
          <LabeledArea label="Findings (JSON or plain text)" value={form.findings} onChange={(v) => setForm({ ...form, findings: v })} rows={6} placeholder='[{"title":"…","severity":"high"}]' />

          <button
            onClick={send}
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-[12px] font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            {sending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            Send report to this account
          </button>
        </div>
      )}
    </Section>
  );
}

function LabeledInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25"
      />
    </div>
  );
}

function LabeledArea({ label, value, onChange, rows, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows: number; placeholder?: string }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25"
      />
    </div>
  );
}
