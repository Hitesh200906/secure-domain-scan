import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, Section, Badge, SuperAdminGate } from "@/components/admin/AdminShell";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { Trash2, Search, ShieldCheck, KeyRound, Copy, X } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";

export const Route = createFileRoute("/admin/admins")({ component: () => <SuperAdminGate><AdminsPage /></SuperAdminGate> });

type Admin = { id: string; email: string; full_name: string | null; role: string; permissions: string[]; active: boolean; created_at: string; api_key?: string | null };

function AdminsPage() {
  const [rows, setRows] = useState<Admin[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ email: "", full_name: "", role: "admin" as "admin" | "super_admin" });
  const { isMasterAdmin } = useAdmin();
  const [issued, setIssued] = useState<{ email: string; key: string } | null>(null);

  const load = async () => {
    try {
      const { admins } = await api.admin.listAdmins();
      setRows((admins ?? []) as Admin[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    }
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) return;
    try {
      await api.admin.createAdmin(form);
      await logAudit("admin.create", { type: "admin", id: form.email }, form);
      toast.success("Admin added");
      setForm({ email: "", full_name: "", role: "admin" });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const remove = async (a: Admin) => {
    if (a.role === "super_admin") return toast.error("Cannot remove super admin");
    try {
      await api.admin.deleteAdmin(a.id);
      await logAudit("admin.remove", { type: "admin", id: a.id });
      toast.success("Removed");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const toggle = async (a: Admin) => {
    try {
      await api.admin.updateAdmin(a.id, { active: !a.active });
      await logAudit(a.active ? "admin.disable" : "admin.enable", { type: "admin", id: a.id });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const issueKey = async (a: Admin) => {
    try {
      const { api_key } = await api.admin.generateAdminApiKey(a.id);
      await logAudit("admin.api_key.generate", { type: "admin", id: a.id });
      setIssued({ email: a.email, key: api_key });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate key");
    }
  };

  const revokeKey = async (a: Admin) => {
    try {
      await api.admin.revokeAdminApiKey(a.id);
      await logAudit("admin.api_key.revoke", { type: "admin", id: a.id });
      toast.success("API key revoked");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to revoke key");
    }
  };

  const filtered = rows.filter((r) => !q || r.email.toLowerCase().includes(q.toLowerCase()) || r.full_name?.toLowerCase().includes(q.toLowerCase()));

  return (
    <AdminShell title="Admin Management" description="Add, remove, and manage administrators with role-based permissions.">
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <Section title={`Administrators · ${rows.length}`} action={
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-8 pr-3 py-1.5 text-xs bg-white/[0.04] border border-white/10 rounded-lg w-56" />
          </div>
        }>
          <div className="space-y-2">
            {filtered.map((a) => (
              <div key={a.id} className="flex items-center gap-4 glass rounded-xl p-4">
                <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 grid place-items-center">
                  <ShieldCheck className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm flex items-center gap-2">{a.full_name || "—"}
                    <Badge tone={a.role === "super_admin" ? "info" : "neutral"}>{a.role.replace("_", " ")}</Badge>
                    {!a.active && <Badge tone="danger">Disabled</Badge>}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{a.email}</div>
                  <div className="text-[10px] mt-1 text-muted-foreground">
                    {a.api_key ? <span className="text-emerald-300/80">Console API key issued</span> : <span>No console API key</span>}
                  </div>
                  <div className="text-[10px] mt-1 text-muted-foreground">Permissions: {(a.permissions || []).join(", ") || "—"}</div>
                </div>
                {isMasterAdmin && (
                  <>
                    <button onClick={() => issueKey(a)} title="Generate console API key"
                      className="text-[11px] glass px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                      <KeyRound className="size-3" /> {a.api_key ? "Regenerate key" : "Generate key"}
                    </button>
                    {a.api_key && (
                      <button onClick={() => revokeKey(a)} className="text-[11px] glass px-3 py-1.5 rounded-full text-rose-300">Revoke</button>
                    )}
                  </>
                )}
                <button onClick={() => toggle(a)} className="text-[11px] glass px-3 py-1.5 rounded-full">{a.active ? "Disable" : "Enable"}</button>
                {a.role !== "super_admin" && (
                  <button onClick={() => remove(a)} className="size-8 grid place-items-center rounded-lg glass hover:text-rose-300"><Trash2 className="size-3.5" /></button>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Add new admin">
          <form onSubmit={add} className="space-y-3 text-sm">
            <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Input label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "super_admin" })} className="mt-1.5 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm">
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <button className="w-full bg-white text-black rounded-full py-2.5 text-sm font-medium">Add admin</button>
          </form>
        </Section>
      </div>
      {issued && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/85 p-4" onClick={() => setIssued(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-medium text-white">Console API key issued</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">Share this key with {issued.email}. It is shown once.</div>
              </div>
              <button onClick={() => setIssued(null)} className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/60"><X className="size-3.5" /></button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <code className="flex-1 truncate text-[12px] text-white">{issued.key}</code>
              <button
                onClick={() => { navigator.clipboard.writeText(issued.key); toast.success("Key copied"); }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-medium text-black"
              >
                <Copy className="size-3" /> Copy
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              The admin enters this key after continuing with their Gmail address to unlock the console.
            </p>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Input({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</label>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm" />
    </div>
  );
}
