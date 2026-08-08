import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck, Pencil, CircleUserRound, Copy, Coins, Crown, Database, Key, KeyRound, LifeBuoy,
  Loader2, LogOut, MessageSquare, MessagesSquare, Monitor, Send, ShieldHalf, ShieldCheck, Smartphone,
  Trash2, User2, ChevronRight, AlertTriangle,

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
import pageBgAsset from "@/assets/profile-bg.png.asset.json";


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
  { key: "security", label: "Security", icon: ShieldHalf, hint: "Password and sessions", tint: "text-[#4d7cff]" },
  { key: "credits", label: "Credits", icon: Database, hint: "Balance and top-ups", tint: "text-[#4d7cff]" },
  { key: "tickets", label: "Tickets", icon: MessagesSquare, hint: "Support and requests", tint: "text-emerald-400" },
  { key: "api", label: "API Keys", icon: KeyRound, hint: "Integrations and access", tint: "text-amber-400" },
];


const CURRENCIES = [
  { code: "USD", symbol: "$", rate: 1, label: "US Dollar" },
  { code: "EUR", symbol: "€", rate: 0.92, label: "Euro" },
  { code: "GBP", symbol: "£", rate: 0.79, label: "British Pound" },
  { code: "INR", symbol: "₹", rate: 83, label: "Indian Rupee" },
  { code: "AED", symbol: "AED ", rate: 3.67, label: "UAE Dirham" },
  { code: "AUD", symbol: "A$", rate: 1.52, label: "Australian Dollar" },
] as const;

const CREDIT_PRESETS = [
  { credits: 10, tag: "Starter", tint: "emerald", note: "10 full scans" },
  { credits: 25, tag: "Popular", tint: "violet", note: "25 full scans" },
  { credits: 50, tag: "Best value", tint: "amber", note: "50 full scans" },
  { credits: 100, tag: "Scale", tint: "sky", note: "100 full scans" },
] as const;

const TINTS: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  emerald: { border: "border-emerald-400/40", bg: "bg-emerald-500/10", text: "text-emerald-300", dot: "bg-emerald-400" },
  violet: { border: "border-violet-400/40", bg: "bg-violet-500/10", text: "text-violet-300", dot: "bg-violet-400" },
  amber: { border: "border-amber-400/40", bg: "bg-amber-500/10", text: "text-amber-300", dot: "bg-amber-400" },
  sky: { border: "border-sky-400/40", bg: "bg-sky-500/10", text: "text-sky-300", dot: "bg-sky-400" },
};


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
  const roleTitle =
    role === "master_admin" ? "Master Admin" :
    role === "super_admin" ? "Super Admin" :
    role === "admin" ? "Admin" : "";


  return (
    <div className="relative min-h-screen bg-black">
      {/* page background — uploaded texture with 30% black coating */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <img src={pageBgAsset.url} alt="" aria-hidden="true" className="size-full object-cover" />
        <div className="absolute inset-0 bg-black/70" />
      </div>


      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid md:grid-cols-[minmax(250px,23%)_1fr] gap-4 lg:gap-6 items-start">
          {/* ---------- Left rail — single unified panel ---------- */}
          <aside className="relative overflow-hidden rounded-2xl border border-white/10 md:sticky md:top-6 md:min-h-[calc(100vh-3rem)] flex flex-col">
            <img src={textureImg} alt="" aria-hidden="true" loading="lazy" width={1280} height={640}
              className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-black/90" />

            <div className="relative flex flex-col flex-1 p-4">
              {/* Back + title */}
              <BackButton label="Back" fallback="/" />
              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Nexefy Security</div>
                <h1 className="mt-1 truncate text-xl font-semibold tracking-tight">Account center</h1>
              </div>

              <div className="my-4 h-px bg-white/10" />

              {/* Identity */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading || !user}
                    aria-label="Change profile photo"
                    className="group/av relative size-14 rounded-xl overflow-hidden border border-white/12 bg-white/[0.04] grid place-items-center text-lg font-semibold disabled:opacity-60">
                    {profile.avatar_url
                      ? <img src={profile.avatar_url} alt={`${displayName} profile photo`} className="size-full object-cover" />
                      : initials}
                    <span className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 transition group-hover/av:opacity-100">
                      {uploading ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
                    </span>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { onPickAvatar(e.target.files?.[0]); e.target.value = ""; }} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold tracking-tight truncate">{displayName}</div>
                  {roleTitle && (
                    <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{roleTitle}</div>
                  )}
                </div>

              </div>
              <div className="mt-3 text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                <BadgeCheck className="size-3" /> Member since {joinDate}
              </div>

              <div className="my-4 h-px bg-white/10" />

              {/* Nav */}
              <nav className="flex md:block gap-2 md:space-y-1.5 overflow-x-auto md:overflow-visible">
                {NAV.map((n) => {
                  const active = tab === n.key;
                  const count = n.key === "tickets" ? tickets.length : n.key === "credits" ? profile.credits : 0;
                  return (
                    <button key={n.key} onClick={() => setTab(n.key)}
                      className={`group relative shrink-0 md:w-full flex items-center gap-2.5 overflow-hidden rounded-xl border px-3 py-1.5 text-left transition hover:border-white/25 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] ${
                        active ? "border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]" : "border-transparent"
                      }`}>


                      <span className="relative size-7 rounded-lg grid place-items-center shrink-0">
                        <n.icon className={`size-4 ${n.key === "security" ? "text-white" : n.tint} transition ${active ? "" : "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100"}`} />
                      </span>
                      <span className={`relative min-w-0 flex-1 block text-sm whitespace-nowrap ${active ? "text-white" : "text-neutral-200"}`}>{n.label}</span>
                      {count > 0 && <span className="relative hidden md:inline text-[10px] rounded-full bg-white/[0.06] px-1.5 py-0.5 text-neutral-300 tabular-nums">{count}</span>}
                    </button>
                  );
                })}

                {user && (
                  <>
                    <div className="hidden md:block my-2 h-px bg-white/10" />
                    <button onClick={signOut}
                      className="group relative shrink-0 md:w-full flex items-center gap-2.5 overflow-hidden rounded-xl border border-transparent px-3 py-1.5 text-left transition hover:border-white/25 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]">
                      <span className="relative size-7 rounded-lg grid place-items-center shrink-0">
                        <LogOut className="size-4 text-neutral-400 transition-colors group-hover:text-red-500" />
                      </span>
                      <span className="relative min-w-0 flex-1 block text-sm whitespace-nowrap">Sign out</span>
                    </button>
                  </>
                )}

              </nav>

              {/* Danger zone — pinned to bottom of the rail */}
              {user && (
                <div className="mt-6 md:mt-auto md:pt-6">
                  <div className="h-px bg-white/10" />
                  <div className="mt-4 flex items-center gap-3">
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
                    <Trash2 className="size-3.5 text-red-500" /> Delete account
                  </button>
                </div>
              )}
            </div>
          </aside>


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
                {/* Balance hero */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                  className="relative overflow-hidden rounded-3xl border border-white/12"
                >
                  <img src={textureImg} alt="" aria-hidden="true" loading="lazy" width={1280} height={640} className="absolute inset-0 size-full object-cover" />
                  <div className="absolute inset-0 bg-black/85" />
                  <div
                    className="absolute inset-0 opacity-[0.14]"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px)",
                      backgroundSize: "44px 44px",
                      maskImage: "radial-gradient(ellipse at 20% 30%, black 20%, transparent 75%)",
                    }}
                  />
                  <motion.div
                    aria-hidden
                    className="absolute inset-y-0 w-40 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)]"
                    animate={{ x: ["-10%", "120%"] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                  />

                  <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/15 bg-black/60 text-neutral-300">
                        <Coins className="size-3 text-amber-400" /> Credit balance
                      </div>
                      <div className="mt-4 flex items-end gap-2">
                        <motion.span
                          key={profile.credits}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                          className="text-6xl font-semibold tracking-tight tabular-nums leading-none"
                        >
                          {profile.credits}
                        </motion.span>
                        <span className="pb-1 text-sm text-muted-foreground">credits left</span>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground max-w-sm leading-relaxed">
                        One credit runs one complete full-stack security scan, including the deliverable report.
                      </p>
                      <button
                        onClick={() => document.getElementById("credit-plans")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                        className="group relative mt-5 inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/20 bg-black px-5 py-2.5 text-sm font-medium transition-transform duration-300 hover:scale-[1.03]"
                      >
                        <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-out group-hover:translate-y-0" />
                        <Coins className="relative size-4 transition-colors duration-500 group-hover:text-black" />
                        <span className="relative transition-colors duration-500 group-hover:text-black">Buy credits</span>
                      </button>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Usage this cycle</div>
                      <div className="mt-2 h-2 w-full sm:w-56 rounded-full bg-white/[0.08] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-white/70"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (profile.credits / 50) * 100)}%` }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                        />
                      </div>
                      <div className="mt-2 text-[11px] text-muted-foreground capitalize">{profile.plan} plan</div>
                    </div>
                  </div>
                </motion.div>

                <CreditPurchase />

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
                          <LifeBuoy className="size-8 mx-auto text-emerald-400" />
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
                        <MessageSquare className="size-8 mx-auto mb-3 text-[#4d7cff]" />
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
                        <div className="size-10 rounded-lg border border-white/10 grid place-items-center"><Smartphone className="size-4 text-[#4d7cff]" /></div>
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
                        <div className="size-10 rounded-lg border border-white/10 grid place-items-center"><Monitor className="size-4 text-[#4d7cff]" /></div>
                        <div>
                          <div className="text-sm flex items-center gap-2">This device <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/10 text-muted-foreground">CURRENT</span></div>
                          <div className="text-[11px] text-muted-foreground">Active now</div>
                        </div>
                      </div>
                      <ShieldCheck className="size-4 text-emerald-400" />
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
                        <div className="size-10 rounded-lg border border-white/10 grid place-items-center"><Key className="size-4 text-amber-400" /></div>
                        <div>
                          <div className="text-sm">Production key</div>
                          <div className="text-[11px] text-muted-foreground font-mono">nxs_live_••••••••••••3f8a</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => { navigator.clipboard.writeText("nxs_live_xxxxx"); toast.success("Copied"); }} className="text-xs text-muted-foreground hover:text-white inline-flex items-center gap-1"><Copy className="size-3 text-[#4d7cff]" /> Copy</button>
                        <button className="text-xs text-destructive hover:underline">Revoke</button>
                      </div>
                    </div>
                  </div>
                  <button className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium hover:border-white/30 transition inline-flex items-center gap-2"><Key className="size-4 text-amber-400" /> Generate new key</button>
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

function CreditPurchase() {
  const [selected, setSelected] = useState<number>(25);
  const [custom, setCustom] = useState<string>("");
  const [cur, setCur] = useState<(typeof CURRENCIES)[number]>(CURRENCIES[0]);

  const customNum = Math.max(0, Math.floor(Number(custom) || 0));
  const credits = custom.trim() ? customNum : selected;
  const usd = credits; // 1 credit = $1
  const total = usd * cur.rate;
  const fmt = (n: number) =>
    `${cur.symbol}${n.toLocaleString(undefined, { maximumFractionDigits: cur.code === "INR" ? 0 : 2 })}`;

  return (
    <div id="credit-plans" className="relative overflow-hidden rounded-3xl border border-white/12 bg-black/70">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "radial-gradient(600px 240px at 10% 0%, rgba(139,92,246,0.55), transparent 60%), radial-gradient(500px 220px at 90% 100%, rgba(16,185,129,0.45), transparent 60%), radial-gradient(500px 220px at 60% 20%, rgba(56,189,248,0.35), transparent 60%)",
        }}
      />
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Choose credits</div>
            <div className="text-xs text-muted-foreground mt-1">
              Pay as you go — no subscription. Credits never expire.
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-300">
            <Coins className="size-3.5" /> 1 credit = $1 USD
          </div>
        </div>

        {/* Presets */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CREDIT_PRESETS.map((p) => {
            const t = TINTS[p.tint];
            const active = !custom.trim() && selected === p.credits;
            return (
              <button
                key={p.credits}
                onClick={() => { setCustom(""); setSelected(p.credits); }}
                className={`text-left rounded-2xl border p-4 transition-colors ${
                  active ? `${t.border} ${t.bg}` : "border-white/10 bg-black/50 hover:border-white/25"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase tracking-widest ${active ? t.text : "text-muted-foreground"}`}>{p.tag}</span>
                  <span className={`size-2 rounded-full ${active ? t.dot : "bg-white/15"}`} />
                </div>
                <div className="mt-3 text-2xl font-semibold tabular-nums">{p.credits}</div>
                <div className="text-[11px] text-muted-foreground">{p.note}</div>
                <div className={`mt-2 text-xs tabular-nums ${active ? t.text : "text-white/70"}`}>{fmt(p.credits * cur.rate)}</div>
              </button>
            );
          })}
        </div>

        {/* Custom + currency */}
        <div className="mt-4 grid md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-violet-400/25 bg-violet-500/[0.07] p-4">
            <div className="text-[10px] uppercase tracking-widest text-violet-300">Custom amount</div>
            <div className="mt-3 flex items-center gap-2">
              <input
                inputMode="numeric"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="e.g. 175"
                className="w-full rounded-xl border border-white/12 bg-black/60 px-3 py-2.5 text-sm outline-none focus:border-violet-400/50"
              />
              <span className="text-xs text-muted-foreground shrink-0">credits</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Any amount from 1 to 10,000 credits.</div>
          </div>

          <div className="rounded-2xl border border-sky-400/25 bg-sky-500/[0.07] p-4">
            <div className="text-[10px] uppercase tracking-widest text-sky-300">Pay in your currency</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCur(c)}
                  title={c.label}
                  className={`rounded-lg px-2.5 py-1.5 text-xs border transition-colors ${
                    cur.code === c.code ? "border-sky-400/50 bg-sky-500/15 text-sky-200" : "border-white/10 bg-black/50 text-white/70 hover:border-white/25"
                  }`}
                >
                  {c.code}
                </button>
              ))}
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Converted at checkout using live rates.</div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 rounded-2xl border border-white/12 bg-black/60 p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Credits</div>
              <div className="mt-1 text-xl font-semibold tabular-nums text-amber-300">{credits || 0}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Unit price</div>
              <div className="mt-1 text-xl font-semibold tabular-nums text-emerald-300">{fmt(cur.rate)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total ({cur.code})</div>
              <div className="mt-1 text-xl font-semibold tabular-nums text-sky-300">{fmt(total)}</div>
            </div>
          </div>
          <button
            disabled={!credits}
            onClick={() => toast.info(`Checkout opening soon — ${credits} credits for ${fmt(total)}.`)}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/20 bg-black px-6 py-3 text-sm font-medium transition-transform duration-300 hover:scale-[1.03] disabled:opacity-40 disabled:hover:scale-100"
          >
            <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-out group-hover:translate-y-0" />
            <Coins className="relative size-4 transition-colors duration-500 group-hover:text-black" />
            <span className="relative transition-colors duration-500 group-hover:text-black">Continue to payment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
