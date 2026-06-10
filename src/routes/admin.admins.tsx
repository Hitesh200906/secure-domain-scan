import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, Section, Badge, SuperAdminGate } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { Trash2, Search, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/admins")({ component: () => <SuperAdminGate><AdminsPage /></SuperAdminGate> });

type Admin = { id: string; email: string; full_name: string | null; role: string; permissions: string[]; active: boolean; created_at: string };

function AdminsPage() {
  const [rows, setRows] = useState<Admin[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ email: "", full_name: "", role: "admin" });

  const load = async () => {
    const { data } = await supabase.from("admins").select("*").order("created_at");
    setRows((data ?? []) as never);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) return;
    const { error } = await supabase.from("admins").insert({ ...form, permissions: form.role === "super_admin" ? ["*"] : ["users.read", "tickets.respond"] });
    if (error) return toast.error(error.message);
    await logAudit("admin.create", { type: "admin", id: form.email }, form);
    toast.success("Admin added");
    setForm({ email: "", full_name: "", role: "admin" });
    load();
  };

  const remove = async (a: Admin) => {
    if (a.role === "super_admin") return toast.error("Cannot remove super admin");
    const { error } = await supabase.from("admins").delete().eq("id", a.id);
    if (error) return toast.error(error.message);
    await logAudit("admin.remove", { type: "admin", id: a.id });
    toast.success("Removed");
    load();
  };

  const toggle = async (a: Admin) => {
    await supabase.from("admins").update({ active: !a.active }).eq("id", a.id);
    await logAudit(a.active ? "admin.disable" : "admin.enable", { type: "admin", id: a.id });
    load();
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
                  <div className="text-[10px] mt-1 text-muted-foreground">Permissions: {(a.permissions || []).join(", ") || "—"}</div>
                </div>
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
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1.5 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm">
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <button className="w-full bg-white text-black rounded-full py-2.5 text-sm font-medium">Add admin</button>
          </form>
        </Section>
      </div>
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
