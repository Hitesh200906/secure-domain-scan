import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Bell, Camera, CheckCircle2, Copy, CreditCard, Key, LifeBuoy, Loader2, LogOut,
  Mail, MessageSquare, Monitor, Send, Shield, ShieldCheck, Smartphone, Sparkles, Trash2, Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Nexus Security" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ tab: (s.tab as string) || undefined }),
  component: ProfilePage,
});

type Tab = "general" | "security" | "tickets" | "billing" | "notifications" | "api";
type Ticket = { id: string; subject: string; status: string; priority: string; created_at: string; message: string; email: string; name: string };
type TMsg = { id: string; author_type: string; author_name: string | null; body: string; created_at: string };

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [tab, setTab] = useState<Tab>(((search.tab as Tab) ?? "general"));
  const [profile, setProfile] = useState({
    full_name: "", role_title: "", company: "", plan: "starter", credits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [ticketMsgs, setTicketMsgs] = useState<TMsg[]>([]);
  const [ticketReply, setTicketReply] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);

  const loadTickets = async () => {
    if (!user) return;
    try {
      const { tickets } = await api.listTickets();
      setTickets((tickets ?? []) as Ticket[]);
    } catch {
      setTickets([]);
    }
  };

  useEffect(() => { loadTickets(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  useEffect(() => {
    if (!activeTicket) return;
    const load = () =>
      api.listTicketMessages(activeTicket.id).then(({ messages }) => {
        setTicketMsgs((messages ?? []) as TMsg[]);
        setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }).catch(() => undefined);
    load();
    // Realtime subscription stays on Supabase Auth's publishable connection — no service-role usage.
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
      await api.sendTicketMessage(
        activeTicket.id,
        body,
        profile.full_name || user?.email || activeTicket.name,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reply");
    }
  };



  useEffect(() => {
    if (!user) {
      // Demo data when browsing without an account
      setProfile({
        full_name: "Demo Analyst",
        role_title: "Security Engineer",
        company: "Nexus Demo Co.",
        plan: "professional",
        credits: 12,
      });
      setLoading(false);
      return;
    }
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
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api.updateProfile({
        full_name: profile.full_name,
        role_title: profile.role_title,
        company: profile.company,
      });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/" }); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-5 animate-spin text-primary" /></div>;

  const initials = (profile.full_name || user?.email || "?").trim()[0].toUpperCase();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 size-[500px] rounded-full bg-[oklch(0.86_0.16_200_/0.1)] blur-[120px] animate-aurora-1" />
        <div className="absolute bottom-0 right-1/4 size-[500px] rounded-full bg-[oklch(0.75_0.13_180_/0.1)] blur-[120px] animate-aurora-2" />
        <div className="absolute inset-0 grid-bg opacity-20" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-white inline-flex items-center gap-1.5">
          ← Back to dashboard
        </Link>

        {/* Hero / identity card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mt-6 glass-strong rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 size-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative">
              <div className="size-24 rounded-2xl bg-gradient-to-br from-primary to-secondary grid place-items-center text-4xl font-semibold text-black shadow-[0_0_40px_-4px_oklch(0.86_0.16_200_/0.6)]">
                {initials}
              </div>
              <button className="absolute -bottom-1.5 -right-1.5 size-8 rounded-full glass-strong grid place-items-center hover:border-primary/40 transition">
                <Camera className="size-3.5" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                <CheckCircle2 className="size-3" /> Verified account
              </div>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight truncate">{profile.full_name || "Your profile"}</h1>
              <div className="text-sm text-muted-foreground mt-0.5">{profile.role_title || "—"}{profile.company && ` · ${profile.company}`}</div>
              <div className="text-xs text-muted-foreground/70 mt-1 font-mono">{user?.email || "demo@nexussecurity.com"}</div>
            </div>
            <div className="flex gap-2">
              <StatPill label="Plan" value={profile.plan.toUpperCase()} icon={ShieldCheck} />
              <StatPill label="Credits" value={String(profile.credits)} icon={Zap} />
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto">
          {([
            ["general", "General"], ["tickets", `Tickets${tickets.length ? ` · ${tickets.length}` : ""}`],
            ["security", "Security"], ["billing", "Billing"],
            ["notifications", "Notifications"], ["api", "API Keys"],
          ] as [Tab, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`relative px-4 py-3 text-sm transition ${tab === k ? "text-white" : "text-muted-foreground hover:text-white"}`}>
              {l}
              {tab === k && <motion.div layoutId="tab" className="absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-primary to-secondary" />}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "general" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-4">
              <Card title="Personal information" className="lg:col-span-2">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full name" value={profile.full_name} onChange={(v) => setProfile({ ...profile, full_name: v })} />
                  <Field label="Role / Title" value={profile.role_title} onChange={(v) => setProfile({ ...profile, role_title: v })} />
                  <Field label="Company" value={profile.company} onChange={(v) => setProfile({ ...profile, company: v })} />
                  <Field label="Email" value={user?.email ?? "demo@nexussecurity.com"} readOnly />
                </div>
                {user && (
                  <button onClick={save} disabled={saving} className="mt-2 rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60 hover:shadow-[0_0_30px_-4px_oklch(0.86_0.16_200_/0.5)] transition">
                    {saving && <Loader2 className="size-4 animate-spin" />} Save changes
                  </button>
                )}
              </Card>
              <Card title="Account">
                <Row label="Member since" value={user ? new Date(user.created_at).toLocaleDateString() : "Jan 15, 2026"} />
                <Row label="User ID" value={user ? `${user.id.slice(0, 8)}…` : "demo-user"} mono />
                <Row label="Auth provider" value={user ? (user.app_metadata?.provider ?? "email") : "email"} />
                <Row label="Last sign-in" value={user ? (user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "—") : "Active now"} />
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
              <Card title={activeTicket ? activeTicket.subject : "Conversation"} desc={activeTicket ? `Ticket #${activeTicket.id.slice(0, 8)} · ${activeTicket.status.replace("_", " ")}` : "Pick a ticket to view the conversation with our security team."}>
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
                <button className="rounded-full glass px-5 py-2.5 text-sm font-medium hover:border-primary/40 transition">Update password</button>
              </Card>
              <Card title="Two-factor authentication" desc="Protect your account with an additional layer.">
                <div className="flex items-center justify-between p-4 rounded-xl glass">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg glass grid place-items-center"><Smartphone className="size-4 text-primary" /></div>
                    <div>
                      <div className="text-sm">Authenticator app</div>
                      <div className="text-[11px] text-muted-foreground">Not configured</div>
                    </div>
                  </div>
                  <button className="text-xs text-primary hover:underline">Enable</button>
                </div>
              </Card>
              <Card title="Active sessions" className="lg:col-span-2">
                <div className="space-y-2">
                  {[
                    { device: "MacBook Pro · Chrome", loc: "San Francisco, US", current: true, when: "Active now" },
                    { device: "iPhone 15 · Safari", loc: "San Francisco, US", current: false, when: "2 hours ago" },
                  ].map((s) => (
                    <div key={s.device} className="flex items-center justify-between p-4 rounded-xl glass">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg glass grid place-items-center"><Monitor className="size-4" /></div>
                        <div>
                          <div className="text-sm flex items-center gap-2">{s.device}{s.current && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">CURRENT</span>}</div>
                          <div className="text-[11px] text-muted-foreground">{s.loc} · {s.when}</div>
                        </div>
                      </div>
                      {!s.current && <button className="text-xs text-destructive hover:underline">Revoke</button>}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {tab === "billing" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-4">
              <Card title="Current plan" className="lg:col-span-2">
                <div className="flex items-center justify-between p-5 rounded-2xl glass relative overflow-hidden">
                  <div className="absolute inset-0 animate-shimmer opacity-30" />
                  <div className="relative">
                    <div className="text-[10px] uppercase tracking-widest text-primary">{profile.plan} plan</div>
                    <div className="mt-1 text-2xl font-semibold text-gradient-accent capitalize">{profile.plan}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{profile.credits} scans remaining this cycle</div>
                  </div>
                  <Link to="/pricing" className="relative rounded-full bg-white text-black px-4 py-2 text-xs font-medium inline-flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> Upgrade
                  </Link>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Recent invoices</div>
                  {[
                    { d: "Nov 2026", amt: "$0.00", s: "Trial" },
                    { d: "Oct 2026", amt: "$0.00", s: "Trial" },
                  ].map((i) => (
                    <div key={i.d} className="flex items-center justify-between p-3 rounded-xl glass text-xs">
                      <span>{i.d}</span><span className="font-mono">{i.amt}</span><span className="text-muted-foreground">{i.s}</span>
                      <button className="text-primary hover:underline">Download</button>
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Payment method">
                <div className="p-5 rounded-xl glass text-center">
                  <CreditCard className="size-8 mx-auto text-muted-foreground" />
                  <div className="mt-3 text-sm">No payment method</div>
                  <div className="text-[11px] text-muted-foreground mt-1">Add a card to upgrade plans.</div>
                  <button className="mt-4 rounded-full glass px-4 py-2 text-xs hover:border-primary/40 transition">Add card</button>
                </div>
              </Card>
            </motion.div>
          )}

          {tab === "notifications" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4">
              <Card title="Email notifications" desc="Choose what we should email you about.">
                {[
                  { l: "Critical findings", d: "Notify me when critical vulnerabilities are detected.", on: true },
                  { l: "Scan completion", d: "Email me when a scan finishes.", on: true },
                  { l: "Weekly digest", d: "A summary of your security posture every Monday.", on: false },
                  { l: "Product updates", d: "New features and improvements.", on: false },
                ].map((n) => (
                  <div key={n.l} className="flex items-center justify-between p-4 rounded-xl glass">
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
              <Card title="API Keys" desc="Use API keys to integrate Nexus Security into your CI/CD pipeline.">
                <div className="p-4 rounded-xl glass">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg glass grid place-items-center"><Key className="size-4 text-primary" /></div>
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
                <button className="rounded-full glass px-5 py-2.5 text-sm font-medium hover:border-primary/40 transition inline-flex items-center gap-2"><Key className="size-4" /> Generate new key</button>
              </Card>
              <Card title="Webhooks" desc="Send scan events to your endpoint.">
                <div className="text-xs text-muted-foreground p-4 rounded-xl glass text-center">No webhooks configured.</div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Danger zone */}
        <div className="mt-8 glass rounded-3xl p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl glass grid place-items-center text-destructive"><Shield className="size-4" /></div>
            <div>
              <div className="text-sm font-medium">Danger zone</div>
              <div className="text-xs text-muted-foreground">Sign out everywhere or delete your account.</div>
            </div>
          </div>
          <div className="flex gap-2">
            {user && (
              <button onClick={signOut} className="rounded-full glass px-4 py-2 text-sm inline-flex items-center gap-2 hover:border-white/20 transition">
                <LogOut className="size-4" /> Sign out
              </button>
            )}
            {user && (
              <button className="rounded-full glass px-4 py-2 text-sm inline-flex items-center gap-2 hover:border-destructive/40 hover:text-destructive transition">
                <Trash2 className="size-4" /> Delete account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ side, who, when, body }: { side: "user" | "admin"; who: string; when: string; body: string }) {
  return (
    <div className={`flex ${side === "admin" ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${side === "admin" ? "glass border-primary/20" : "bg-primary/15 border border-primary/30"}`}>
        <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">{side === "admin" ? "Nexus Team" : who} · {new Date(when).toLocaleString()}</div>
        <div className="text-sm whitespace-pre-wrap">{body}</div>
      </div>
    </div>
  );
}

function Card({ title, desc, children, className = "" }: { title: string; desc?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-strong rounded-3xl p-6 space-y-4 ${className}`}>
      <div>
        <div className="text-base font-medium">{title}</div>
        {desc && <div className="text-xs text-muted-foreground mt-1">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, readOnly, type = "text" }: { label: string; value: string; onChange?: (v: string) => void; readOnly?: boolean; type?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type={type} value={value} readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className={`mt-1.5 w-full rounded-xl bg-[oklch(0.06_0.008_220)] border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 ${readOnly ? "text-muted-foreground cursor-not-allowed" : ""}`}
      />
    </label>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0 text-sm">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={mono ? "font-mono text-xs" : "text-xs"}>{value}</span>
    </div>
  );
}

function StatPill({ label, value, icon: Icon }: { label: string; value: string; icon: typeof ShieldCheck }) {
  return (
    <div className="glass rounded-2xl px-4 py-3 min-w-[110px]">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5"><Icon className="size-3 text-primary" />{label}</div>
      <div className="mt-1 text-lg font-semibold text-gradient-accent">{value}</div>
    </div>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className={`relative w-10 h-6 rounded-full transition ${on ? "bg-primary" : "bg-white/10"}`}>
      <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${on ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </button>
  );
}
