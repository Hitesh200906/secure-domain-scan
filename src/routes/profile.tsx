import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck, Camera, Check, CircleUserRound, Copy, Coins, Crown, Database, Key, KeyRound, LifeBuoy,
  Loader2, LogOut, MessageSquare, MessagesSquare, Monitor, Send, ShieldHalf, ShieldCheck, Smartphone,
  Trash2, User2, Zap, ChevronRight, AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api-client";
import { uploadStoreAsset } from "@/lib/uploads";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { BackButton } from "@/components/site/BackButton";
import textureImg from "@/assets/profile-texture.jpg";

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

const NAV: { key: Tab; label: string; icon: typeof User2; hint: string; tint: string }[] = [
  { key: "general", label: "General", icon: CircleUserRound, hint: "Profile and account info", tint: "text-[#4d7cff]" },
  { key: "security", label: "Security", icon: ShieldHalf, hint: "Password and sessions", tint: "text-neutral-300" },
  { key: "credits", label: "Credits", icon: Database, hint: "Balance and top-ups", tint: "text-[#4d7cff]" },
  { key: "tickets", label: "Tickets", icon: MessagesSquare, hint: "Support and requests", tint: "text-emerald-400" },
  { key: "api", label: "API Keys", icon: KeyRound, hint: "Integrations and access", tint: "text-amber-400" },
];


const CREDIT_PACKS = [
  { id: "starter", name: "Recon", credits: 10, price: 29, per: "2.90", blurb: "For occasional audits and one-off checks.", perks: ["10 full-stack scans", "PDF report export", "Email delivery"] },
  { id: "pro", name: "Sentinel", credits: 50, price: 119, per: "2.38", blurb: "Best value for continuous monitoring.", perks: ["50 full-stack scans", "Priority queue", "Critical alerting", "Team sharing"], popular: true },
  { id: "scale", name: "Fortress", credits: 150, price: 299, per: "1.99", blurb: "For agencies and multi-domain estates.", perks: ["150 full-stack scans", "Dedicated analyst", "API access", "SLA response"] },
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
    <div className="relative min-h-screen bg-black">
      {/* page ambience — texture, no glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden">
        <img src={textureImg} alt="" aria-hidden="true" className="size-full object-cover opacity-[0.35]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/85 to-black" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        <BackButton label="Back" fallback="/" />

        {/* page header */}
        <header className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Nexefy Security</div>
            <h1 className="mt-1 truncate text-2xl sm:text-3xl font-semibold tracking-tight">Account center</h1>
          </div>
        </header>

        <div className="mt-5 grid md:grid-cols-[minmax(230px,22%)_1fr] gap-4 lg:gap-6 items-start">
          {/* ---------- Left rail ---------- */}
          <div className="md:sticky md:top-24 space-y-4">

            {/* Identity card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              <img src={textureImg} alt="" aria-hidden="true" loading="lazy" width={1280} height={640}
                className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-black/90" />
              <div className="relative p-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="size-16 rounded-xl overflow-hidden border border-white/12 bg-white/[0.04] grid place-items-center text-xl font-semibold">
                      {profile.avatar_url
                        ? <img src={profile.avatar_url} alt={`${displayName} profile photo`} className="size-full object-cover" />
                        : initials}
                    </div>
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading || !user}
                      aria-label="Upload profile photo"
                      className="absolute -bottom-1.5 -right-1.5 size-7 rounded-lg border border-white/15 bg-black grid place-items-center hover:border-white/40 transition disabled:opacity-60">
                      {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { onPickAvatar(e.target.files?.[0]); e.target.value = ""; }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-base font-semibold tracking-tight truncate">{displayName}</h1>
                      <RoleBadge role={role} size="sm" />
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{user?.email}</div>
                  </div>
                </div>




                <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                  <BadgeCheck className="size-3" /> Member since {joinDate}
                </div>
              </div>
            </div>

            {/* Nav card — vertical rail on desktop, horizontal scroller on mobile */}
            <nav className="rounded-2xl border border-white/10 bg-black p-2 flex md:block gap-2 overflow-x-auto">
              {NAV.map((n) => {
                const active = tab === n.key;
                const count = n.key === "tickets" ? tickets.length : n.key === "credits" ? profile.credits : 0;
                return (
                  <button key={n.key} onClick={() => setTab(n.key)}
                    className={`group relative shrink-0 md:w-full flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left transition border ${
                      active ? "border-white/20" : "border-transparent hover:border-white/10"
                    }`}>
                    <span aria-hidden className={`absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(0,0,0,0)_62%)] transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                    <span aria-hidden className={`absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-white/50 transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`} />
                    <span className="relative size-8 rounded-lg border border-white/10 bg-black grid place-items-center shrink-0">
                      <n.icon className={`size-4 ${n.tint}`} />
                    </span>
                    <span className="relative min-w-0 flex-1">
                      <span className={`block text-sm whitespace-nowrap ${active ? "text-white" : "text-neutral-200"}`}>{n.label}</span>
                      <span className="hidden md:block text-[10px] text-muted-foreground truncate">{n.hint}</span>
                    </span>
                    {count > 0 && <span className="relative hidden md:inline text-[10px] rounded-full border border-white/10 bg-black px-1.5 py-0.5 text-neutral-300 tabular-nums">{count}</span>}
                  </button>
                );
              })}

              <div className="hidden md:block my-2 h-px bg-white/10" />

              {user && (
                <button onClick={signOut}
                  className="group relative shrink-0 md:w-full flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left border border-transparent hover:border-white/10 transition">
                  <span aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(90deg,rgba(220,38,38,0.16),rgba(0,0,0,0)_62%)]" />
                  <span className="relative size-8 rounded-lg border border-white/10 bg-black grid place-items-center shrink-0">
                    <LogOut className="size-4 text-red-500" />
                  </span>
                  <span className="relative min-w-0 flex-1">
                    <span className="block text-sm whitespace-nowrap">Sign out</span>
                    <span className="hidden md:block text-[10px] text-muted-foreground truncate">End this session</span>
                  </span>
                </button>
              )}
            </nav>


            {/* Danger zone */}
            {user && (
              <div className="rounded-2xl border border-white/10 bg-black p-4">
                <div className="flex items-center gap-3">
                  <span className="size-8 rounded-lg border border-white/10 bg-black grid place-items-center shrink-0">
                    <AlertTriangle className="size-4 text-red-500" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">Danger zone</div>
                    <div className="text-[10px] text-muted-foreground">Irreversible account actions</div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
                <button className="mt-3 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-xs inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-white/25 transition">
                  <Trash2 className="size-3.5" /> Delete account
                </button>
              </div>
            )}

          </div>

          {/* ---------- Right content ---------- */}
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
            {tab === "general" && (
              <>
                <Banner title="General" desc="Your identity across Nexefy Security reports and notifications." />
                <div className="grid xl:grid-cols-3 gap-4">
                  <Card title="Account information" className="xl:col-span-2">
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
                </div>

                <Card title="Account overview" desc="Your plan usage and account summary.">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <OverviewTile
                      icon={<Database className="size-4 text-[#4d7cff]" />}
                      ring="border-white/10"
                      value={String(profile.credits)} label="Credits" hint="Available balance"
                      action={{ text: "Buy", onClick: () => setTab("credits") }}
                    />
                    <OverviewTile
                      icon={<MessagesSquare className="size-4 text-emerald-400" />}
                      ring="border-white/10"
                      value={String(tickets.length)} label="Tickets" hint="Open tickets"
                      action={{ text: "View", onClick: () => setTab("tickets") }}
                    />
                    <OverviewTile
                      icon={<Crown className="size-4 text-amber-400" />}
                      ring="border-white/10"
                      value={profile.plan} label="Plan" hint="Current plan"
                      action={{ text: "Upgrade", to: "/pricing" }}
                    />
                  </div>
                </Card>

              </>
            )}

            {tab === "credits" && (
              <>
                <div className="relative overflow-hidden rounded-2xl border border-white/10">
                  <img src={textureImg} alt="" aria-hidden="true" loading="lazy" width={1280} height={640} className="absolute inset-0 size-full object-cover" />
                  <div className="absolute inset-0 bg-black/90" />
                  <div className="relative p-6 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/15 bg-black/50 text-neutral-300">
                        <Coins className="size-3" /> Credit balance
                      </div>
                      <div className="mt-3 flex items-end gap-2">
                        <span className="text-5xl font-semibold tracking-tight tabular-nums">{profile.credits}</span>
                        <span className="pb-2 text-sm text-muted-foreground">credits left</span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground max-w-sm">
                        One credit runs one complete full-stack security scan, including the deliverable report.
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Usage this cycle</div>
                      <div className="mt-2 h-2 w-full sm:w-52 rounded-full bg-white/[0.08] overflow-hidden">
                        <div className="h-full rounded-full bg-white/60" style={{ width: `${Math.min(100, (profile.credits / 50) * 100)}%` }} />
                      </div>
                      <div className="mt-2 text-[11px] text-muted-foreground capitalize">{profile.plan} plan</div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {CREDIT_PACKS.map((p) => (
                    <div key={p.id} className={`relative overflow-hidden rounded-2xl border p-5 flex flex-col ${"popular" in p && p.popular ? "border-white/20 bg-white/[0.04]" : "border-white/10 bg-white/[0.02]"}`}>
                      {"popular" in p && p.popular && (
                        <span className="absolute top-4 right-4 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/20 text-neutral-300">Best value</span>
                      )}
                      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
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
                            <Check className="size-3.5 shrink-0 mt-px" /><span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => toast.info("Checkout is opening soon — contact us to top up today.")}
                        className={`mt-5 w-full rounded-full px-4 py-2.5 text-sm font-medium transition hover:scale-[1.02] ${
                          "popular" in p && p.popular ? "bg-white text-black" : "border border-white/15 hover:border-white/35"
                        }`}>
                        Buy {p.credits} credits
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "tickets" && (
              <>
                <Banner title="Support tickets" desc="Every conversation you've had with the Nexefy team." />
                <div className="grid xl:grid-cols-[320px_1fr] gap-4">
                  <Card title="Your tickets" desc={tickets.length ? `${tickets.length} conversation${tickets.length === 1 ? "" : "s"}.` : "Open a request from Contact."}>
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
                          className={`w-full text-left p-3 rounded-xl border transition ${activeTicket?.id === t.id ? "border-white/20 bg-white/[0.06]" : "border-white/8 hover:border-white/20"}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium truncate">{t.subject}</span>
                            <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-white/10 text-muted-foreground">{t.status.replace("_", " ")}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{t.message}</div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground/70">{new Date(t.created_at).toLocaleString()}</span>
                            <span className="text-[10px] rounded-full border border-white/15 bg-black px-2 py-0.5 text-neutral-300 inline-flex items-center gap-1">
                              View <ChevronRight className="size-3" />
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>
                  <Card title={activeTicket ? activeTicket.subject : "Conversation"} desc={activeTicket ? `Ticket #${activeTicket.id.slice(0, 8)} · ${activeTicket.status.replace("_", " ")}` : "Pick a ticket to view the thread."}>
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
                        <div className="flex gap-2 pt-3 mt-3 border-t border-white/8">
                          <textarea value={ticketReply} onChange={(e) => setTicketReply(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendTicketReply(); } }}
                            placeholder="Reply to our team…" rows={2}
                            className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-white/30" />
                          <button onClick={sendTicketReply} disabled={!ticketReply.trim()}
                            className="self-end rounded-xl bg-white text-black px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50">
                            <Send className="size-3.5" /> Send
                          </button>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </>
            )}

            {tab === "security" && (
              <>
                <Banner title="Security" desc="Credentials, two-factor and active sessions for this account." />
                <div className="grid lg:grid-cols-2 gap-4">
                  <Card title="Password" desc="Change your password regularly to keep your account secure.">
                    <Field label="Current password" value="" onChange={() => {}} type="password" />
                    <Field label="New password" value="" onChange={() => {}} type="password" />
                    <button className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium hover:border-white/30 transition">Update password</button>
                  </Card>
                  <Card title="Two-factor authentication" desc="Protect your account with an additional layer.">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg border border-white/10 grid place-items-center"><Smartphone className="size-4" /></div>
                        <div>
                          <div className="text-sm">Authenticator app</div>
                          <div className="text-[11px] text-muted-foreground">Not configured</div>
                        </div>
                      </div>
                      <button className="text-xs hover:underline">Enable</button>
                    </div>
                  </Card>
                  <Card title="Active sessions" className="lg:col-span-2">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg border border-white/10 grid place-items-center"><Monitor className="size-4" /></div>
                        <div>
                          <div className="text-sm flex items-center gap-2">This device <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/10 text-muted-foreground">CURRENT</span></div>
                          <div className="text-[11px] text-muted-foreground">Active now</div>
                        </div>
                      </div>
                      <ShieldCheck className="size-4" />
                    </div>
                  </Card>
                </div>
              </>
            )}

            {tab === "api" && (
              <>
                <Banner title="API keys" desc="Integrate Nexefy Security scans into your own stack." />
                <Card title="Keys">
                  <div className="p-4 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg border border-white/10 grid place-items-center"><Key className="size-4" /></div>
                        <div>
                          <div className="text-sm">Production key</div>
                          <div className="text-[11px] text-muted-foreground font-mono">nxs_live_••••••••••••3f8a</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => { navigator.clipboard.writeText("nxs_live_xxxxx"); toast.success("Copied"); }} className="text-xs text-muted-foreground hover:text-white inline-flex items-center gap-1"><Copy className="size-3" /> Copy</button>
                        <button className="text-xs text-destructive hover:underline">Revoke</button>
                      </div>
                    </div>
                  </div>
                  <button className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium hover:border-white/30 transition inline-flex items-center gap-2"><Key className="size-4" /> Generate new key</button>
                </Card>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}


function OverviewTile({ icon, ring, value, label, hint, action }: {
  icon: React.ReactNode; ring: string; value: string; label: string; hint: string;
  action: { text: string; onClick?: () => void; to?: string };
}) {
  const btn = "rounded-full border border-white/15 bg-black px-3 py-1 text-[11px] font-medium text-neutral-200 hover:border-white/40 hover:text-white transition";
  return (
    <div className="rounded-xl border border-white/10 bg-black p-4">
      <div className="flex items-center gap-3">
        <span className={`size-10 rounded-full border ${ring} bg-black grid place-items-center shrink-0`}>{icon}</span>
        <div className="min-w-0">
          <div className="text-xl font-semibold capitalize tabular-nums truncate">{value}</div>
          <div className="text-xs text-neutral-300">{label}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">{hint}</span>
        {action.to
          ? <Link to={action.to as never} className={btn}>{action.text}</Link>
          : <button onClick={action.onClick} className={btn}>{action.text}</button>}
      </div>
    </div>
  );
}

function Banner({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10">
      <img src={textureImg} alt="" aria-hidden="true" loading="lazy" width={1280} height={640} className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-black/90" />
      <div className="relative px-5 py-4">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

function Card({ title, desc, children, className = "" }: { title: string; desc?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-black p-5 sm:p-6 ${className}`}>
      <div className="space-y-4">
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
      <div className="mt-1.5 flex items-center rounded-xl bg-white/[0.03] border border-white/10 focus-within:border-white/30 transition">
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
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm border ${isAdmin ? "border-white/15 bg-white/[0.08]" : "border-white/10 bg-white/[0.04]"}`}>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{who} · {new Date(when).toLocaleString()}</div>
        <div className="whitespace-pre-wrap">{body}</div>
      </div>
    </div>
  );
}
