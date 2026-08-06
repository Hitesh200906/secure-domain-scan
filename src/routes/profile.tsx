import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Bell, Calendar, Copy, Key, LifeBuoy, Loader2, LogOut, MessageSquare, Monitor,
  Radar, Send, Shield, ShieldCheck, Smartphone, Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { RoleBadge } from "@/components/ui/RoleBadge";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Account — Nexefy Security" },
      { name: "description", content: "Manage your Nexefy Security account: profile details, scans, support tickets, security settings and API keys." },
      { property: "og:title", content: "Account — Nexefy Security" },
      { property: "og:description", content: "Manage your Nexefy Security account, scans and security settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ tab: (s.tab as string) || undefined }),
  component: ProfilePage,
});

type Tab = "general" | "scans" | "tickets" | "security" | "notifications" | "api";
type Ticket = { id: string; subject: string; status: string; priority: string; created_at: string; message: string; email: string; name: string };
type TMsg = { id: string; author_type: string; author_name: string | null; body: string; created_at: string };
type Scan = { id: string; target_url: string; status: string; created_at: string };

function ProfilePage() {
  const { user } = useAuth();
  const { role } = useAdmin();
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [tab, setTab] = useState<Tab>((search.tab as Tab) ?? "general");
  const [profile, setProfile] = useState({ full_name: "", role_title: "", company: "", plan: "starter", credits: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scans, setScans] = useState<Scan[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [ticketMsgs, setTicketMsgs] = useState<TMsg[]>([]);
  const [ticketReply, setTicketReply] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.profile().then(({ profile: data }) => {
      if (data) setProfile({
        full_name: data.full_name ?? "",
        role_title: data.role_title ?? "",
        company: data.company ?? "",
        plan: data.plan ?? "starter",
        credits: data.credits ?? 0,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
    api.listTickets().then(({ tickets }) => setTickets((tickets ?? []) as Ticket[])).catch(() => setTickets([]));
    api.listScans().then(({ scans }) => setScans((scans ?? []) as Scan[])).catch(() => setScans([]));
  }, [user]);

  useEffect(() => {
    if (!activeTicket) return;
    const load = () =>
      api.listTicketMessages(activeTicket.id).then(({ messages }) => {
        setTicketMsgs((messages ?? []) as TMsg[]);
        setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }).catch(() => undefined);
    load();
    const ch = supabase.channel(`tk-${activeTicket.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${activeTicket.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeTicket]);

  const sendTicketReply = async () => {
    if (!activeTicket || !ticketReply.trim()) return;
    const body = ticketReply.trim();
    setTicketReply("");
    try {
      await api.sendTicketMessage(activeTicket.id, body, profile.full_name || user?.email || activeTicket.name);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reply");
    }
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api.updateProfile({ full_name: profile.full_name, role_title: profile.role_title, company: profile.company });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally { setSaving(false); }
  };

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/" }); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-5 animate-spin text-primary" /></div>;

  const displayName = profile.full_name || user?.email || "Your account";
  const initials = (profile.full_name || user?.email || "?").trim()[0].toUpperCase();
  const joinDate = user ? new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "—";

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-10">
        <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-white inline-flex items-center gap-1.5">
          ← Back to dashboard
        </Link>

        {/* Identity */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="mt-6 rounded-2xl bg-black border border-white/10 px-5 sm:px-7 py-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="size-16 rounded-2xl bg-white/5 border border-white/10 grid place-items-center text-2xl font-semibold">
            {initials}
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight truncate">{displayName}</h1>
              <RoleBadge role={role} size="sm" />
            </div>
            <div className="mt-1 text-xs text-muted-foreground truncate">
              {user?.email}{profile.role_title ? ` · ${profile.role_title}` : ""}{profile.company ? ` · ${profile.company}` : ""}
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
              <Calendar className="size-3" /> Member since {joinDate}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-white/10 px-4 py-2.5 text-center">
              <div className="text-sm font-semibold capitalize">{profile.plan}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Plan</div>
            </div>
            <div className="rounded-xl border border-white/10 px-4 py-2.5 text-center">
              <div className="text-sm font-semibold">{profile.credits}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Credits</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto">
          {([
            ["general", "General"],
            ["scans", `Scans${scans.length ? ` · ${scans.length}` : ""}`],
            ["tickets", `Tickets${tickets.length ? ` · ${tickets.length}` : ""}`],
            ["security", "Security"],
            ["notifications", "Notifications"],
            ["api", "API Keys"],
          ] as [Tab, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`relative px-4 py-3 text-sm whitespace-nowrap transition ${tab === k ? "text-white" : "text-muted-foreground hover:text-white"}`}>
              {l}
              {tab === k && <motion.div layoutId="tab" className="absolute inset-x-3 bottom-0 h-px bg-white/60" />}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "general" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-4">
              <Card title="Account information" className="lg:col-span-2">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full name" value={profile.full_name} onChange={(v) => setProfile({ ...profile, full_name: v })} />
                  <Field label="Role / Title" value={profile.role_title} onChange={(v) => setProfile({ ...profile, role_title: v })} />
                  <Field label="Company" value={profile.company} onChange={(v) => setProfile({ ...profile, company: v })} />
                  <Field label="Email" value={user?.email ?? ""} readOnly />
                </div>
                {user && (
                  <button onClick={save} disabled={saving} className="mt-2 rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60 hover:scale-[1.02] transition">
                    {saving && <Loader2 className="size-4 animate-spin" />} Save changes
                  </button>
                )}
              </Card>
              <Card title="Account details">
                <Row label="User ID" value={user ? `${user.id.slice(0, 8)}…` : "—"} mono />
                <Row label="Auth provider" value={user ? (user.app_metadata?.provider ?? "email") : "—"} />
                <Row label="Last sign-in" value={user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "—"} />
                <Row label="Plan" value={profile.plan} />
              </Card>
            </motion.div>
          )}

          {tab === "scans" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card title="Your security scans" desc="Every scan you have requested with Nexefy Security.">
                {scans.length === 0 ? (
                  <div className="text-center py-12">
                    <Radar className="size-8 mx-auto text-muted-foreground" />
                    <div className="mt-3 text-sm">No scans yet</div>
                    <Link to="/scan/new" search={{ plan: "starter" }} className="mt-4 inline-flex rounded-full bg-white text-black px-4 py-2 text-xs font-medium">Request a scan</Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scans.map((s) => (
                      <div key={s.id} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-white/10">
                        <div className="min-w-0">
                          <div className="text-sm truncate">{s.target_url}</div>
                          <div className="text-[11px] text-muted-foreground">{new Date(s.created_at).toLocaleString()}</div>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-white/5 border border-white/10">{s.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {tab === "tickets" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-[340px_1fr] gap-4">
              <Card title="Your tickets" desc={tickets.length ? `${tickets.length} conversation${tickets.length === 1 ? "" : "s"} with our team.` : "Submit a request from Contact to open a ticket."}>
                <div className="space-y-2 max-h-[520px] overflow-y-auto -mx-2 px-2">
                  {tickets.length === 0 && (
                    <div className="text-center py-10">
                      <LifeBuoy className="size-8 mx-auto text-muted-foreground" />
                      <div className="mt-3 text-sm">No tickets yet</div>
                      <Link to="/contact" className="mt-4 inline-flex rounded-full bg-white text-black px-4 py-2 text-xs font-medium">Open a ticket</Link>
                    </div>
                  )}
                  {tickets.map((t) => (
                    <button key={t.id} onClick={() => setActiveTicket(t)}
                      className={`w-full text-left p-3 rounded-xl border transition ${activeTicket?.id === t.id ? "border-primary/40 bg-primary/5" : "border-white/5 hover:border-white/15"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{t.subject}</span>
                        <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full ${t.status === "resolved" || t.status === "closed" ? "bg-emerald-400/10 text-emerald-300" : "bg-primary/10 text-primary"}`}>{t.status.replace("_", " ")}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{t.message}</div>
                      <div className="text-[10px] text-muted-foreground/70 mt-1.5">{new Date(t.created_at).toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              </Card>
              <Card title={activeTicket ? activeTicket.subject : "Conversation"} desc={activeTicket ? `Ticket #${activeTicket.id.slice(0, 8)} · ${activeTicket.status.replace("_", " ")}` : "Pick a ticket to view the conversation with our team."}>
                {!activeTicket ? (
                  <div className="text-center py-16 text-sm text-muted-foreground">
                    <MessageSquare className="size-8 mx-auto mb-3 text-muted-foreground/50" />
                    Select a ticket on the left.
                  </div>
                ) : (
                  <div className="flex flex-col h-[520px]">
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      <ChatBubble side="user" who={activeTicket.name} when={activeTicket.created_at} body={activeTicket.message} />
                      {ticketMsgs.map((m) => (
                        <ChatBubble key={m.id} side={m.author_type === "admin" ? "admin" : "user"} who={m.author_name || m.author_type} when={m.created_at} body={m.body} />
                      ))}
                      <div ref={msgEndRef} />
                    </div>
                    <div className="flex gap-2 pt-3 mt-3 border-t border-white/5">
                      <textarea value={ticketReply} onChange={(e) => setTicketReply(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendTicketReply(); } }}
                        placeholder="Reply to our team…" rows={2}
                        className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary/40" />
                      <button onClick={sendTicketReply} disabled={!ticketReply.trim()}
                        className="self-end rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50">
                        <Send className="size-3.5" /> Send
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {tab === "security" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-4">
              <Card title="Password" desc="Change your password regularly to keep your account secure.">
                <Field label="Current password" value="" onChange={() => {}} type="password" />
                <Field label="New password" value="" onChange={() => {}} type="password" />
                <button className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium hover:border-white/30 transition">Update password</button>
              </Card>
              <Card title="Two-factor authentication" desc="Protect your account with an additional layer.">
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg border border-white/10 grid place-items-center"><Smartphone className="size-4 text-primary" /></div>
                    <div>
                      <div className="text-sm">Authenticator app</div>
                      <div className="text-[11px] text-muted-foreground">Not configured</div>
                    </div>
                  </div>
                  <button className="text-xs text-primary hover:underline">Enable</button>
                </div>
              </Card>
              <Card title="Active sessions" className="lg:col-span-2">
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg border border-white/10 grid place-items-center"><Monitor className="size-4" /></div>
                    <div>
                      <div className="text-sm flex items-center gap-2">This device <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">CURRENT</span></div>
                      <div className="text-[11px] text-muted-foreground">Active now</div>
                    </div>
                  </div>
                  <ShieldCheck className="size-4 text-emerald-400" />
                </div>
              </Card>
            </motion.div>
          )}

          {tab === "notifications" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4">
              <Card title="Email notifications" desc="Choose what we should email you about.">
                {[
                  { l: "Scan completed", d: "Notify me when a security scan finishes.", on: true },
                  { l: "New report available", d: "Email me when a report is delivered.", on: true },
                  { l: "Critical findings", d: "Immediate alerts for critical vulnerabilities.", on: true },
                  { l: "Support replies", d: "When our team replies to your ticket.", on: true },
                  { l: "Product updates", d: "New features and improvements.", on: false },
                ].map((n) => (
                  <div key={n.l} className="flex items-center justify-between p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <Bell className="size-4 text-primary" />
                      <div>
                        <div className="text-sm">{n.l}</div>
                        <div className="text-[11px] text-muted-foreground">{n.d}</div>
                      </div>
                    </div>
                    <Toggle defaultOn={n.on} />
                  </div>
                ))}
              </Card>
            </motion.div>
          )}

          {tab === "api" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4">
              <Card title="API Keys" desc="Use API keys to integrate Nexefy Security into your stack.">
                <div className="p-4 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg border border-white/10 grid place-items-center"><Key className="size-4 text-primary" /></div>
                      <div>
                        <div className="text-sm">Production key</div>
                        <div className="text-[11px] text-muted-foreground font-mono">nxs_live_••••••••••••3f8a</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { navigator.clipboard.writeText("nxs_live_xxxxx"); toast.success("Copied"); }} className="text-xs text-muted-foreground hover:text-white inline-flex items-center gap-1"><Copy className="size-3" /> Copy</button>
                      <button className="text-xs text-destructive hover:underline">Revoke</button>
                    </div>
                  </div>
                </div>
                <button className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium hover:border-white/30 transition inline-flex items-center gap-2"><Key className="size-4" /> Generate new key</button>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Danger zone */}
        <div className="mt-8 rounded-3xl border border-white/10 p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl border border-white/10 grid place-items-center text-destructive"><Shield className="size-4" /></div>
            <div>
              <div className="text-sm font-medium">Danger zone</div>
              <div className="text-xs text-muted-foreground">Sign out or delete your account.</div>
            </div>
          </div>
          {user && (
            <div className="flex gap-2">
              <button onClick={signOut} className="rounded-full border border-white/15 px-4 py-2 text-sm inline-flex items-center gap-2 hover:border-white/30 transition">
                <LogOut className="size-4" /> Sign out
              </button>
              <button className="rounded-full border border-white/15 px-4 py-2 text-sm inline-flex items-center gap-2 hover:border-destructive/40 hover:text-destructive transition">
                <Trash2 className="size-4" /> Delete account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, desc, children, className = "" }: { title: string; desc?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-black p-5 sm:p-6 space-y-4 ${className}`}>
      <div>
        <div className="text-sm font-medium">{title}</div>
        {desc && <div className="text-xs text-muted-foreground mt-1">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, readOnly, type = "text", prefix }: {
  label: string; value: string; onChange?: (v: string) => void; readOnly?: boolean; type?: string; prefix?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1.5 flex items-center rounded-xl bg-white/[0.03] border border-white/10 focus-within:border-primary/50 transition">
        {prefix && <span className="pl-3 text-sm text-muted-foreground">{prefix}</span>}
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-transparent px-4 py-2.5 text-sm focus:outline-none disabled:opacity-60 read-only:text-muted-foreground"
        />
      </div>
    </label>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs py-2 border-b border-white/[0.06] last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono" : "capitalize"}>{value}</span>
    </div>
  );
}

function Toggle({ defaultOn, onChange }: { defaultOn?: boolean; onChange?: (v: boolean) => void }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <button
      onClick={() => { setOn(!on); onChange?.(!on); }}
      className={`w-11 h-6 rounded-full relative transition ${on ? "bg-primary" : "bg-white/10"}`}
      aria-pressed={on}
    >
      <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function ChatBubble({ side, who, when, body }: { side: "user" | "admin"; who: string; when: string; body: string }) {
  const isAdmin = side === "admin";
  return (
    <div className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm border ${isAdmin ? "border-primary/25 bg-primary/5" : "border-white/10 bg-white/[0.04]"}`}>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{who} · {new Date(when).toLocaleString()}</div>
        <div className="whitespace-pre-wrap">{body}</div>
      </div>
    </div>
  );
}
