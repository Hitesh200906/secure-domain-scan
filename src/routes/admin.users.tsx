import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, Section, Badge } from "@/components/admin/AdminShell";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { Search, Plus, Minus, Ban, Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

type Profile = {
  id: string; full_name: string | null; email: string | null; company: string | null;
  plan: string; credits: number; status: string; created_at: string;
};

function UsersPage() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Profile | null>(null);

  const load = async () => {
    try {
      const { users } = await api.admin.listUsers();
      setRows((users ?? []) as Profile[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    if (filter !== "all" && r.plan !== filter && r.status !== filter) return false;
    const s = q.toLowerCase();
    return !s || (r.full_name?.toLowerCase().includes(s) || r.email?.toLowerCase().includes(s) || r.company?.toLowerCase().includes(s));
  });

  const act = async (p: Profile, patch: Partial<Profile>, action: string) => {
    try {
      await api.admin.updateUser(p.id, patch as never);
      toast.success(action);
      await logAudit(action, { type: "user", id: p.id }, patch);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <AdminShell title="User Management" description={`${rows.length} accounts across all plans.`}>
      <Section title="All users" action={
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-8 pr-3 py-1.5 text-xs bg-white/[0.04] border border-white/10 rounded-lg w-56" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="text-xs bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1.5">
            <option value="all">All</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      }>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <Th>User</Th><Th>Plan</Th><Th>Credits</Th><Th>Status</Th><Th>Joined</Th><Th className="text-right pr-2">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <Td>
                    <button onClick={() => setSelected(r)} className="text-left">
                      <div className="font-medium">{r.full_name || "—"}</div>
                      <div className="text-[11px] text-muted-foreground">{r.email || r.id.slice(0, 8)}</div>
                    </button>
                  </Td>
                  <Td><Badge tone={r.plan === "enterprise" ? "info" : r.plan === "professional" ? "ok" : "neutral"}>{r.plan}</Badge></Td>
                  <Td>{r.credits}</Td>
                  <Td><Badge tone={r.status === "active" ? "ok" : r.status === "banned" ? "danger" : "warn"}>{r.status}</Badge></Td>
                  <Td className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</Td>
                  <Td className="text-right pr-2">
                    <div className="inline-flex gap-1">
                      <IconBtn title="+1 credit" onClick={() => act(r, { credits: r.credits + 1 }, "credits.add")}><Plus className="size-3" /></IconBtn>
                      <IconBtn title="-1 credit" onClick={() => act(r, { credits: Math.max(0, r.credits - 1) }, "credits.remove")}><Minus className="size-3" /></IconBtn>
                      {r.status !== "banned" ? (
                        <IconBtn title="Ban" tone="danger" onClick={() => act(r, { status: "banned" }, "user.ban")}><Ban className="size-3" /></IconBtn>
                      ) : (
                        <IconBtn title="Unban" tone="ok" onClick={() => act(r, { status: "active" }, "user.unban")}><Check className="size-3" /></IconBtn>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No users match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} onChange={(u) => { setSelected(u); load(); }} />}
    </AdminShell>
  );
}

function UserDrawer({ user, onClose, onChange }: { user: Profile; onClose: () => void; onChange: (u: Profile) => void }) {
  const [scans, setScans] = useState<{ id: string; target_url: string; status: string; created_at: string }[]>([]);
  useEffect(() => {
    api.admin.listScans(user.id)
      .then(({ scans }) => setScans((scans ?? []) as never))
      .catch(() => setScans([]));
  }, [user.id]);

  const update = async (patch: Partial<Profile>, action: string) => {
    try {
      await api.admin.updateUser(user.id, patch as never);
      await logAudit(action, { type: "user", id: user.id }, patch);
      toast.success("Updated");
      onChange({ ...user, ...patch });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md glass-strong border-l border-white/10 p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">User details</h3>
          <button onClick={onClose} className="size-8 grid place-items-center rounded-full glass"><X className="size-4" /></button>
        </div>
        <div className="space-y-1 mb-6">
          <div className="text-xl font-medium">{user.full_name || "Unnamed"}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
          <div className="flex gap-2 mt-3">
            <Badge tone="info">{user.plan}</Badge>
            <Badge tone={user.status === "active" ? "ok" : "danger"}>{user.status}</Badge>
            <Badge>{user.credits} credits</Badge>
          </div>
        </div>
        <div className="space-y-2 mb-6">
          <h4 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Change plan</h4>
          <div className="flex gap-2">
            {["starter", "professional", "enterprise"].map((p) => (
              <button key={p} onClick={() => update({ plan: p }, "user.plan.change")}
                className={`flex-1 text-xs py-2 rounded-lg border ${user.plan === p ? "bg-primary text-primary-foreground border-primary" : "glass"}`}>{p}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2 mb-6">
          <h4 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Account</h4>
          <button onClick={() => update({ status: "suspended" }, "user.suspend")} className="w-full text-xs py-2 rounded-lg glass">Suspend account</button>
          <button onClick={() => toast.success("Reset email queued (mock)")} className="w-full text-xs py-2 rounded-lg glass">Send password reset</button>
          <button onClick={() => { update({ status: "active" }, "user.verify"); toast.success("Email verified manually"); }} className="w-full text-xs py-2 rounded-lg glass">Verify email manually</button>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Scan history ({scans.length})</h4>
          <div className="space-y-1.5">
            {scans.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs glass rounded-lg px-3 py-2">
                <span className="truncate">{s.target_url}</span>
                <Badge tone={s.status === "completed" ? "ok" : "warn"}>{s.status}</Badge>
              </div>
            ))}
            {scans.length === 0 && <div className="text-xs text-muted-foreground">No scans yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left px-2 py-2 font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-2 py-3 ${className}`}>{children}</td>;
}
function IconBtn({ children, onClick, title, tone }: { children: React.ReactNode; onClick: () => void; title: string; tone?: "danger" | "ok" }) {
  const c = tone === "danger" ? "hover:text-rose-300 hover:border-rose-400/30" : tone === "ok" ? "hover:text-emerald-300 hover:border-emerald-400/30" : "hover:text-primary hover:border-primary/30";
  return <button title={title} onClick={onClick} className={`size-7 grid place-items-center rounded-lg glass transition ${c}`}>{children}</button>;
}
