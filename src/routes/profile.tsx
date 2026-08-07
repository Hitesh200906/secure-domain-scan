import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck, Camera, Check, Copy, Coins, Key, LifeBuoy, Loader2, LogOut, MessageSquare,
  Monitor, Send, Shield, ShieldCheck, Smartphone, Sparkles, Trash2, Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api-client";
import { uploadStoreAsset } from "@/lib/uploads";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { RoleBadge } from "@/components/ui/RoleBadge";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Account — Nexefy Security" },
      { name: "description", content: "Manage your Nexefy Security account: profile details, credits, support tickets, security settings and API keys." },
      { property: "og:title", content: "Account — Nexefy Security" },
      { property: "og:description", content: "Manage your Nexefy Security account, credits and security settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ tab: (s.tab as string) || undefined }),
  component: ProfilePage,
});

type Tab = "general" | "credits" | "tickets" | "security" | "api";
type Ticket = { id: string; subject: string; status: string; priority: string; created_at: string; message: string; email: string; name: string };
type TMsg = { id: string; author_type: string; author_name: string | null; body: string; created_at: string };

const CREDIT_PACKS = [
  {
    id: "starter",
    name: "Recon",
    credits: 10,
    price: 29,
    per: "2.90",
    blurb: "For occasional audits and one-off checks.",
    perks: ["10 full-stack scans", "PDF report export", "Email delivery"],
    tone: "from-emerald-500/15 via-emerald-500/[0.04] to-transparent",
    ring: "border-emerald-400/20",
    chip: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    accent: "text-emerald-300",
  },
  {
    id: "pro",
    name: "Sentinel",
    credits: 50,
    price: 119,
    per: "2.38",
    blurb: "Best value for continuous monitoring.",
    perks: ["50 full-stack scans", "Priority queue", "Critical alerting", "Team sharing"],
    tone: "from-indigo-500/20 via-indigo-500/[0.05] to-transparent",
    ring: "border-indigo-400/30",
    chip: "bg-indigo-400/10 text-indigo-300 border-indigo-400/20",
    accent: "text-indigo-300",
    popular: true,
  },
  {
    id: "scale",
    name: "Fortress",
    credits: 150,
    price: 299,
    per: "1.99",
    blurb: "For agencies and multi-domain estates.",
    perks: ["150 full-stack scans", "Dedicated analyst", "API access", "SLA response"],
    tone: "from-amber-500/15 via-amber-500/[0.04] to-transparent",
    ring: "border-amber-400/20",
    chip: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    accent: "text-amber-300",
  },
] as const;

function ProfilePage() {
  const { user } = useAuth();
  const { role } = useAdmin();
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [tab, setTab] = useState<Tab>((search.tab as Tab) ?? "general");
  const [profile, setProfile] = useState({ full_name: "", role_title: "", company: "", plan: "starter", credits: 0, avatar_url: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
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
        avatar_url: data.avatar_url ?? "",
      });
      setLoading(false);
    }).catch(() => setLoading(false));
    api.listTickets().then(({ tickets }) => setTickets((tickets ?? []) as Ticket[])).catch(() => setTickets([]));
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

  const onPickAvatar = async (file?: File | null) => {
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    try {
      const url = await uploadStoreAsset(user.id, file, "avatar");
      const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      if (error) throw new Error(error.message);
      setProfile((p) => ({ ...p, avatar_url: url }));
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally { setUploading(false); }
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
          className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-black px-5 sm:px-7 py-6">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-600/12 via-black to-emerald-600/[0.07]" />
          <div className="pointer-events-none absolute inset-0 bg-black/50" />
          <div className="relative flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group">
              <div className="size-20 rounded-2xl overflow-hidden border border-white/12 bg-gradient-to-br from-indigo-500/20 to-black grid place-items-center text-2xl font-semibold">
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt={`${displayName} profile photo`} className="size-full object-cover" />
                  : initials}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading || !user}
                aria-label="Upload profile photo"
                className="absolute -bottom-1.5 -right-1.5 size-8 rounded-xl border border-white/15 bg-black/90 backdrop-blur grid place-items-center hover:border-indigo-400/50 hover:text-indigo-300 transition disabled:opacity-60"
              >
                {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { onPickAvatar(e.target.files?.[0]); e.target.value = ""; }} />
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
                <BadgeCheck className="size-3 text-emerald-400/80" /> Member since {joinDate}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.07] px-4 py-2.5 text-center">
                <div className="text-sm font-semibold capitalize text-indigo-200">{profile.plan}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Plan</div>
              </div>
              <button onClick={() => setTab("credits")} className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.07] px-4 py-2.5 text-center hover:border-amber-400/40 transition">
                <div className="text-sm font-semibold text-amber-200">{profile.credits}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Credits</div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto">
          {([
            ["general", "General"],
            ["credits", "Credits"],
            ["tickets", `Tickets${tickets.length ? ` · ${tickets.length}` : ""}`],
            ["security", "Security"],
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
              <Card title="Account information" tint="indigo" className="lg:col-span-2">
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
              <Card title="Account details" tint="emerald">
                <Row label="User ID" value={user ? `${user.id.slice(0, 8)}…` : "—"} mono />
                <Row label="Auth provider" value={user ? (user.app_metadata?.provider ?? "email") : "—"} />
                <Row label="Last sign-in" value={user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "—"} />
                <Row label="Plan" value={profile.plan} />
              </Card>
            </motion.div>
          )}

          {tab === "credits" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Balance banner */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/20 via-black to-indigo-600/15" />
                <div className="pointer-events-none absolute inset-0 bg-black/60" />
                <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-300">
                      <Coins className="size-3" /> Credit balance
                    </div>
                    <div className="mt-3 flex items-end gap-2">
                      <motion.span
                        key={profile.credits}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="text-5xl sm:text-6xl font-semibold tracking-tight tabular-nums"
                      >
                        {profile.credits}
                      </motion.span>
                      <span className="pb-2 text-sm text-muted-foreground">credits left</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground max-w-sm">
                      One credit runs one complete full-stack security scan, including the deliverable report.
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Usage this cycle</div>
                    <div className="mt-2 h-2 w-full sm:w-52 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (profile.credits / 50) * 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400/70 to-indigo-400/70"
                      />
                    </div>
                    <div className="mt-2 text-[11px] text-muted-foreground capitalize">{profile.plan} plan</div>
                  </div>
                </div>
              </div>

              {/* Packs */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="size-4 text-indigo-300" />
                  <h2 className="text-sm font-medium">Buy credits</h2>
                  <span className="text-xs text-muted-foreground">— larger packs cost less per scan</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {CREDIT_PACKS.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ y: -4 }}
                      className={`relative overflow-hidden rounded-3xl border ${p.ring} p-6 flex flex-col`}
                    >
                      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${p.tone}`} />
                      <div className="pointer-events-none absolute inset-0 bg-black/55" />
                      <div className="relative flex flex-col flex-1">
                        {"popular" in p && p.popular && (
                          <span className={`absolute -top-1 right-0 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${p.chip}`}>
                            Best value
                          </span>
                        )}
                        <div className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest ${p.accent}`}>
                          <Zap className="size-3" /> {p.name}
                        </div>
                        <div className="mt-3 flex items-baseline gap-1">
                          <span className="text-3xl font-semibold tracking-tight">${p.price}</span>
                          <span className="text-xs text-muted-foreground">/ ${p.per} per scan</span>
                        </div>
                        <div className="mt-1 text-sm font-medium">{p.credits} credits</div>
                        <p className="mt-1.5 text-xs text-muted-foreground">{p.blurb}</p>
                        <ul className="mt-4 space-y-2 flex-1">
                          {p.perks.map((perk) => (
                            <li key={perk} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Check className={`size-3.5 shrink-0 mt-px ${p.accent}`} />
                              <span>{perk}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => toast.info("Checkout is opening soon — contact us to top up today.")}
                          className={`mt-5 w-full rounded-full px-4 py-2.5 text-sm font-medium transition hover:scale-[1.02] ${
                            "popular" in p && p.popular
                              ? "bg-white text-black"
                              : "border border-white/15 hover:border-white/35"
                          }`}
                        >
                          Buy {p.credits} credits
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { l: "Never expire", d: "Credits stay in your account for life.", c: "text-emerald-300", b: "border-emerald-400/15", g: "from-emerald-500/10" },
                  { l: "Instant activation", d: "Balance updates the moment payment clears.", c: "text-indigo-300", b: "border-indigo-400/15", g: "from-indigo-500/10" },
                  { l: "Volume pricing", d: "Need 500+? We'll build a custom quote.", c: "text-amber-300", b: "border-amber-400/15", g: "from-amber-500/10" },
                ].map((x) => (
                  <div key={x.l} className={`relative overflow-hidden rounded-2xl border ${x.b} p-4`}>
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${x.g} to-transparent`} />
                    <div className="pointer-events-none absolute inset-0 bg-black/60" />
                    <div className="relative">
                      <div className={`text-sm font-medium ${x.c}`}>{x.l}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{x.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "tickets" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-[340px_1fr] gap-4">
              <Card title="Your tickets" tint="indigo" desc={tickets.length ? `${tickets.length} conversation${tickets.length === 1 ? "" : "s"} with our team.` : "Submit a request from Contact to open a ticket."}>
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
                      className={`w-full text-left p-3 rounded-xl border transition ${activeTicket?.id === t.id ? "border-indigo-400/40 bg-indigo-500/10" : "border-white/5 hover:border-white/15"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{t.subject}</span>
                        <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full ${t.status === "resolved" || t.status === "closed" ? "bg-emerald-400/10 text-emerald-300" : "bg-indigo-400/10 text-indigo-300"}`}>{t.status.replace("_", " ")}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{t.message}</div>
                      <div className="text-[10px] text-muted-foreground/70 mt-1.5">{new Date(t.created_at).toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              </Card>
              <Card tint="emerald" title={activeTicket ? activeTicket.subject : "Conversation"} desc={activeTicket ? `Ticket #${activeTicket.id.slice(0, 8)} · ${activeTicket.status.replace("_", " ")}` : "Pick a ticket to view the conversation with our team."}>
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
                        className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-indigo-400/40" />
                      <button onClick={sendTicketReply} disabled={!ticketReply.trim()}
                        className="self-end rounded-xl bg-white text-black px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50">
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
              <Card title="Password" tint="indigo" desc="Change your password regularly to keep your account secure.">
                <Field label="Current password" value="" onChange={() => {}} type="password" />
                <Field label="New password" value="" onChange={() => {}} type="password" />
                <button className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium hover:border-white/30 transition">Update password</button>
              </Card>
              <Card title="Two-factor authentication" tint="amber" desc="Protect your account with an additional layer.">
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg border border-white/10 grid place-items-center"><Smartphone className="size-4 text-amber-300" /></div>
                    <div>
                      <div className="text-sm">Authenticator app</div>
                      <div className="text-[11px] text-muted-foreground">Not configured</div>
                    </div>
                  </div>
                  <button className="text-xs text-amber-300 hover:underline">Enable</button>
                </div>
              </Card>
              <Card title="Active sessions" tint="emerald" className="lg:col-span-2">
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

          {tab === "api" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4">
              <Card title="API Keys" tint="indigo" desc="Use API keys to integrate Nexefy Security into your stack.">
                <div className="p-4 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg border border-white/10 grid place-items-center"><Key className="size-4 text-indigo-300" /></div>
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
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-red-500/15 p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-red-600/10 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-black/60" />
          <div className="relative flex items-center gap-3">
            <div className="size-10 rounded-xl border border-red-500/20 grid place-items-center text-destructive"><Shield className="size-4" /></div>
            <div>
              <div className="text-sm font-medium">Danger zone</div>
              <div className="text-xs text-muted-foreground">Sign out or delete your account.</div>
            </div>
          </div>
          {user && (
            <div className="relative flex gap-2">
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

const TINTS: Record<string, string> = {
  indigo: "from-indigo-600/10",
  emerald: "from-emerald-500/10",
  amber: "from-amber-500/10",
};

function Card({ title, desc, children, className = "", tint = "indigo" }: { title: string; desc?: string; children: React.ReactNode; className?: string; tint?: "indigo" | "emerald" | "amber" }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 p-5 sm:p-6 ${className}`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${TINTS[tint]} to-transparent`} />
      <div className="pointer-events-none absolute inset-0 bg-black/60" />
      <div className="relative space-y-4">
        <div>
          <div className="text-sm font-medium">{title}</div>
          {desc && <div className="text-xs text-muted-foreground mt-1">{desc}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, readOnly, type = "text", prefix }: {
  label: string; value: string; onChange?: (v: string) => void; readOnly?: boolean; type?: string; prefix?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1.5 flex items-center rounded-xl bg-white/[0.03] border border-white/10 focus-within:border-indigo-400/50 transition">
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

function ChatBubble({ side, who, when, body }: { side: "user" | "admin"; who: string; when: string; body: string }) {
  const isAdmin = side === "admin";
  return (
    <div className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm border ${isAdmin ? "border-indigo-400/25 bg-indigo-500/10" : "border-white/10 bg-white/[0.04]"}`}>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{who} · {new Date(when).toLocaleString()}</div>
        <div className="whitespace-pre-wrap">{body}</div>
      </div>
    </div>
  );
}
