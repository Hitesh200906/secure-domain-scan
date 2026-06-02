import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Bell, Camera, CheckCircle2, Copy, CreditCard, Key, LifeBuoy, Loader2, LogOut,
  Mail, MessageSquare, Monitor, Send, Shield, ShieldCheck, Smartphone, Sparkles, Trash2, Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
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
    let q = supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    if (user) q = q.or(`user_id.eq.${user.id},email.eq.${user.email}`);
    else if (search.tab) return;
    const { data } = await q;
    setTickets((data ?? []) as Ticket[]);
  };

  useEffect(() => { loadTickets(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  useEffect(() => {
    if (!activeTicket) return;
    const load = () =>
      supabase.from("ticket_messages").select("*").eq("ticket_id", activeTicket.id).order("created_at")
        .then(({ data }) => {
          setTicketMsgs((data ?? []) as TMsg[]);
          setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        });
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
    await supabase.from("ticket_messages").insert({
      ticket_id: activeTicket.id, author_type: "user",
      author_name: profile.full_name || user?.email || activeTicket.name, body,
    });
    await supabase.from("support_tickets").update({ status: "open", updated_at: new Date().toISOString() }).eq("id", activeTicket.id);
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
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile({
        full_name: data.full_name ?? "",
        role_title: data.role_title ?? "",
        company: data.company ?? "",
        plan: data.plan ?? "starter",
        credits: data.credits ?? 0,
      });
      setLoading(false);
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name, role_title: profile.role_title, company: profile.company,
    }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
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
              <div className="text-xs text-muted-foreground/70 mt-1 font-mono">{user?.email}</div>
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
            ["general", "General"], ["security", "Security"], ["billing", "Billing"],
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
                  <Field label="Email" value={user?.email ?? ""} readOnly />
                </div>
                <button onClick={save} disabled={saving} className="mt-2 rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60 hover:shadow-[0_0_30px_-4px_oklch(0.86_0.16_200_/0.5)] transition">
                  {saving && <Loader2 className="size-4 animate-spin" />} Save changes
                </button>
              </Card>
              <Card title="Account">
                <Row label="Member since" value={new Date(user?.created_at ?? Date.now()).toLocaleDateString()} />
                <Row label="User ID" value={`${user?.id.slice(0, 8)}…`} mono />
                <Row label="Auth provider" value={user?.app_metadata?.provider ?? "email"} />
                <Row label="Last sign-in" value={user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "—"} />
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
            <button onClick={signOut} className="rounded-full glass px-4 py-2 text-sm inline-flex items-center gap-2 hover:border-white/20 transition">
              <LogOut className="size-4" /> Sign out
            </button>
            <button className="rounded-full glass px-4 py-2 text-sm inline-flex items-center gap-2 hover:border-destructive/40 hover:text-destructive transition">
              <Trash2 className="size-4" /> Delete account
            </button>
          </div>
        </div>
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
