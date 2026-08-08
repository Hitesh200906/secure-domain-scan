import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck, Pencil, CircleUserRound, Copy, Coins, Crown, Database, Key, KeyRound, LifeBuoy,
  Loader2, LogOut, MessageSquare, MessagesSquare, Monitor, Send, ShieldHalf, ShieldCheck, Smartphone,
  Trash2, User2, ChevronRight, AlertTriangle, Zap, Clock, Headphones, ShoppingCart, ArrowRight,
  Briefcase, Building2, Mail, Save, Fingerprint,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api-client";
import { uploadStoreAsset } from "@/lib/uploads";
import { useAuth } from "@/hooks/use-auth";
import creditsWallet from "@/assets/credits-wallet.png.asset.json";
import creditsGift from "@/assets/credits-gift.png.asset.json";
import CreditsCheckout from "@/components/credits/CreditsCheckout";
import CreditsAmount from "@/components/credits/CreditsAmount";
import { useAdmin } from "@/hooks/use-admin";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { BackButton } from "@/components/site/BackButton";
import { GoogleLogo, GithubLogo, EmailProviderLogo, IdCardLogo, ClockLogo, PlanLogo } from "@/components/profile/BrandIcons";

function providerLogo(provider?: string) {
  const p = (provider ?? "email").toLowerCase();
  if (p === "google") return <GoogleLogo />;
  if (p === "github") return <GithubLogo />;
  return <EmailProviderLogo />;
}
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

const NAV: { key: Tab; label: string; icon: typeof User2; hint: string; tint: string; soon?: boolean }[] = [
  { key: "general", label: "General", icon: CircleUserRound, hint: "Profile and account info", tint: "text-[#4d7cff]" },
  { key: "security", label: "Security", icon: ShieldHalf, hint: "Password and sessions", tint: "text-[#4d7cff]" },
  { key: "credits", label: "Credits", icon: Database, hint: "Balance and top-ups", tint: "text-[#4d7cff]" },
  { key: "tickets", label: "Tickets", icon: MessagesSquare, hint: "Support and requests", tint: "text-emerald-400" },
  { key: "api", label: "API Keys", icon: KeyRound, hint: "Integrations and access", tint: "text-amber-400", soon: true },
];





function ProfilePage() {
  const { user } = useAuth();
  const { role } = useAdmin();
  const navigate = useNavigate();
  const search = Route.useSearch();

  const initialTab = ((search.tab as Tab) ?? "general");
  const [tab, setTab] = useState<Tab>(initialTab === "api" ? "general" : initialTab);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const apiKeysNotice = () =>
    toast.message("API keys are under construction", {
      description: "Programmatic access to Nexefy Security is not launched yet. We're finalising key issuance, scoping and rotation — it will be available in your account soon.",
    });

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
              <div className="rounded-[26px] border border-white/10 bg-black p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">General</h2>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
                </div>
                <p className="mt-1 text-xs text-[#9CA3AF]">Your identity across Nexefy Security reports and notifications.</p>

                <div className="my-4 h-px bg-white/10" />

                <div className="text-base font-semibold text-white">Account information</div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <IconField label="Full name" icon={<User2 className="size-4 text-[#9CA3AF]" />} placeholder="Your name"
                    value={profile.full_name} onChange={(v) => setProfile({ ...profile, full_name: v })} />
                  <IconField label="Role / Title" icon={<Briefcase className="size-4 text-[#9CA3AF]" />} placeholder="e.g. Security Analyst"
                    value={profile.role_title} onChange={(v) => setProfile({ ...profile, role_title: v })} />
                  <IconField label="Company" icon={<Building2 className="size-4 text-[#9CA3AF]" />} placeholder="e.g. Nexefy Security"
                    value={profile.company} onChange={(v) => setProfile({ ...profile, company: v })} />
                  <IconField label="Email" icon={<Mail className="size-4 text-[#9CA3AF]" />} placeholder="you@example.com"
                    value={user?.email ?? ""} readOnly />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <button onClick={save} disabled={saving || !user}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-60">
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save changes
                  </button>
                  <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                    <ShieldCheck className="size-4 text-[#2563EB]" />
                    Protected with industry-standard encryption.
                  </div>
                </div>

                <div className="my-4 h-px bg-white/10" />

                <div className="text-base font-semibold text-white">Account details</div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <DetailRow
                    icon={<IdCardLogo />}
                    label="User ID"
                    value={user ? `${user.id.slice(0, 8)}…` : "—"}
                    onClick={() => { if (user) { navigator.clipboard.writeText(user.id); toast.success("User ID copied"); } }}
                  />
                  <DetailRow
                    icon={providerLogo(user?.app_metadata?.provider)}
                    label="Auth provider"
                    value={user ? (user.app_metadata?.provider ?? "email") : "—"}
                    onClick={() => toast.message("Sign-in method", { description: `You signed in with ${user?.app_metadata?.provider ?? "email"}.` })}
                  />
                  <DetailRow
                    icon={<ClockLogo />}
                    label="Last sign-in"
                    value={user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                    onClick={() => toast.message("Last sign-in", { description: user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "No record" })}
                  />
                  <DetailRow
                    icon={<PlanLogo />}
                    label="Plan"
                    badge={profile.plan}
                    onClick={() => navigate({ to: "/pricing" })}
                  />
                </div>
              </div>
            )}



            {tab === "credits" && <CreditsSection balance={profile.credits} />}



            {tab === "tickets" && (
              <SectionShell title="Support tickets" desc="Every conversation you've had with the Nexefy team.">
                <div className="grid xl:grid-cols-[320px_1fr] gap-4">
                  <div className="rounded-xl border border-white/10 bg-black p-3">
                    <div className="text-sm font-medium text-white">Your tickets</div>
                    <div className="mt-1 text-[11px] text-[#9CA3AF]">{tickets.length ? `${tickets.length} conversation${tickets.length === 1 ? "" : "s"}.` : "Open a request from Contact."}</div>
                    <div className="mt-3 space-y-2 max-h-[460px] overflow-y-auto">
                      {tickets.length === 0 && (
                        <div className="text-center py-10">
                          <LifeBuoy className="size-8 mx-auto text-[#2563EB]" />
                          <div className="mt-3 text-sm">No tickets yet</div>
                          <Link to="/contact" className="mt-4 inline-flex rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#1D4ED8]">Open a ticket</Link>
                        </div>
                      )}
                      {tickets.map((t) => (
                        <button key={t.id} onClick={() => setActiveTicket(t)}
                          className={`w-full text-left p-3 rounded-xl border bg-black transition ${activeTicket?.id === t.id ? "border-[#2563EB]" : "border-white/8 hover:border-white/20"}`}>
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
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black p-3">
                    <div className="text-sm font-medium text-white">{activeTicket ? activeTicket.subject : "Conversation"}</div>
                    <div className="mt-1 text-[11px] text-[#9CA3AF]">{activeTicket ? `Ticket #${activeTicket.id.slice(0, 8)} · ${activeTicket.status.replace("_", " ")}` : "Pick a ticket to view the thread."}</div>
                    {!activeTicket ? (
                      <div className="text-center py-16 text-sm text-muted-foreground">
                        <MessageSquare className="size-8 mx-auto mb-3 text-[#2563EB]" />
                        Select a ticket on the left.
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-col h-[460px]">
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
                            className="flex-1 bg-black border border-white/12 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#2563EB]" />
                          <button onClick={sendTicketReply} disabled={!ticketReply.trim()}
                            className="self-end rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-medium text-white inline-flex items-center gap-1.5 transition hover:bg-[#1D4ED8] disabled:opacity-50">
                            <Send className="size-3.5" /> Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </SectionShell>
            )}

            {tab === "security" && (
              <SectionShell title="Security" desc="Credentials, two-factor and active sessions for this account.">
                <PasswordBlock />

                <div className="my-5 h-px bg-white/10" />

                <div className="text-base font-semibold text-white">Two-factor authentication</div>
                <p className="mt-1 text-xs text-[#9CA3AF]">Protect your account with an additional layer.</p>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black p-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg ring-1 ring-white/10 bg-black grid place-items-center"><Smartphone className="size-4 text-[#2563EB]" /></div>
                    <div>
                      <div className="text-sm">Authenticator app</div>
                      <div className="text-[11px] text-muted-foreground">Not configured</div>
                    </div>
                  </div>
                  <button onClick={() => toast.message("Two-factor authentication", { description: "Authenticator setup is coming soon." })}
                    className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#1D4ED8]">Enable</button>
                </div>

                <div className="my-5 h-px bg-white/10" />

                <div className="text-base font-semibold text-white">Active sessions</div>
                <p className="mt-1 text-xs text-[#9CA3AF]">Devices currently signed in to this account.</p>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black p-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg ring-1 ring-white/10 bg-black grid place-items-center"><Monitor className="size-4 text-[#2563EB]" /></div>
                    <div>
                      <div className="text-sm flex items-center gap-2">This device <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/10 text-muted-foreground">CURRENT</span></div>
                      <div className="text-[11px] text-muted-foreground">Active now</div>
                    </div>
                  </div>
                  <ShieldCheck className="size-4 text-[#2563EB]" />
                </div>
              </SectionShell>
            )}

            {tab === "api" && (
              <SectionShell title="API keys" desc="Integrate Nexefy Security scans into your own stack.">
                <div className="rounded-xl border border-white/10 bg-black p-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg ring-1 ring-white/10 bg-black grid place-items-center"><Key className="size-4 text-[#2563EB]" /></div>
                      <div>
                        <div className="text-sm">Production key</div>
                        <div className="text-[11px] text-muted-foreground font-mono">nxs_live_••••••••••••3f8a</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => { navigator.clipboard.writeText("nxs_live_xxxxx"); toast.success("Copied"); }} className="text-xs text-muted-foreground hover:text-white inline-flex items-center gap-1"><Copy className="size-3 text-[#2563EB]" /> Copy</button>
                      <button onClick={() => toast.message("Revoke key", { description: "Key rotation is coming soon." })} className="text-xs text-destructive hover:underline">Revoke</button>
                    </div>
                  </div>
                </div>
                <button onClick={() => toast.message("Generate key", { description: "New key generation is coming soon." })}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]">
                  <Key className="size-4" /> Generate new key
                </button>
              </SectionShell>
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

function SectionShell({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-black p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">{title}</h2>
        <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
      </div>
      <p className="mt-1 text-xs text-[#9CA3AF]">{desc}</p>
      <div className="my-4 h-px bg-white/10" />
      {children}
    </div>
  );
}

function PasswordBlock() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);

  const update = async () => {
    if (next.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setCurrent(""); setNext("");
    toast.success("Password updated");
  };

  return (
    <>
      <div className="text-base font-semibold text-white">Password</div>
      <p className="mt-1 text-xs text-[#9CA3AF]">Change your password regularly to keep your account secure.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <IconField label="Current password" icon={<KeyRound className="size-4 text-[#9CA3AF]" />} type="password"
          placeholder="••••••••" value={current} onChange={setCurrent} />
        <IconField label="New password" icon={<KeyRound className="size-4 text-[#9CA3AF]" />} type="password"
          placeholder="At least 8 characters" value={next} onChange={setNext} />
      </div>
      <button onClick={update} disabled={busy || !next}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-60">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldHalf className="size-4" />} Update password
      </button>
    </>
  );
}

function IconField({ label, icon, value, onChange, readOnly, placeholder, type }: {
  label: string; icon: React.ReactNode; value: string;
  onChange?: (v: string) => void; readOnly?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF]">{label}</div>
      <div className="mt-1.5 flex items-center gap-2.5 rounded-lg border border-white/12 bg-black px-3 py-2.5 transition focus-within:border-[#2563EB]">
        {icon}
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-transparent text-sm text-white placeholder:text-[#6B7280] outline-none read-only:text-[#D1D5DB]"
        />
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, badge, onClick }: {
  icon: React.ReactNode; label: string; value?: string; badge?: string; onClick?: () => void;
}) {
  return (
    <button onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-lg border border-white/8 bg-black px-3 py-2.5 text-left transition hover:border-white/20 hover:bg-white/[0.03]">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-black ring-1 ring-white/10">{icon}</span>
      <span className="flex-1 truncate text-sm text-white">{label}</span>
      {badge
        ? <span className="rounded-md border border-[#22D3EE]/40 px-2 py-0.5 text-xs capitalize text-[#22D3EE]">{badge}</span>
        : <span className="truncate text-xs text-[#D1D5DB]">{value}</span>}
      <ChevronRight className="size-4 shrink-0 text-[#6B7280] transition group-hover:text-white" />
    </button>
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

/* ---------------- Credits ---------------- */

type CreditTx = {
  id: string;
  description: string;
  credits: number;
  balance_after: number;
  status: string;
  created_at: string;
};

const BENEFITS = [
  { icon: Zap, title: "Instant Top-Up", body: "Add credits to your account in seconds." },
  { icon: ShieldCheck, title: "Safe & Secure", body: "Your payments and data are protected with industry-standard security." },
  { icon: Clock, title: "No Expiry", body: "Use your credits anytime, anywhere. They never expire." },
  { icon: Headphones, title: "Dedicated Support", body: "Our support team is available 24/7 to help you with anything." },
];

const PRESETS = [500, 1000, 2000, 5000] as const;

function CreditsSection({ balance }: { balance: number }) {
  const [bal, setBal] = useState(balance);
  const [txs, setTxs] = useState<CreditTx[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState<number>(1000);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setBal(balance); }, [balance]);

  const loadTx = async () => {
    const { data } = await supabase
      .from("credit_transactions")
      .select("id, description, credits, balance_after, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    setTxs((data as CreditTx[]) ?? []);
  };

  useEffect(() => { void loadTx(); }, []);

  const buy = async () => {
    if (!amount || amount < 1) { toast.error("Enter a valid credit amount"); return; }
    setBusy(true);
    const { data, error } = await supabase.rpc("purchase_credits", { _credits: amount });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setBal(Number(data ?? bal + amount));
    setOpen(false);
    toast.success(`${amount.toLocaleString()} credits added to your balance`);
    void loadTx();
  };

  const visible = showAll ? txs : txs.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-white">
            Credits <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
          </h2>
          <p className="mt-1 text-sm text-[#9CA3AF]">Manage your credits and transactions.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-sm text-white">
          <Coins className="h-4 w-4 text-white" />
          1 Credit = $1.00
        </div>
      </div>

      {/* Balance */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#9CA3AF]">Available balance</div>
            <div className="mt-2 text-5xl font-semibold tabular-nums text-white sm:text-6xl">{bal.toLocaleString()}</div>
            <div className="mt-1 text-lg text-[#D1D5DB]">Credits</div>
            <button
              onClick={() => setOpen(true)}
              className="mt-5 inline-flex items-center gap-3 rounded-xl bg-[#2563EB] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#1D4ED8]"
            >
              <ShoppingCart className="h-4 w-4" />
              Buy Credits
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <img
            src={creditsWallet.url}
            alt="Credits wallet with coins"
            className="w-full max-w-[320px] self-center sm:w-[46%]"
            loading="lazy"
          />
        </div>
      </div>

      {/* Benefits — 2 x 2 */}
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex items-start gap-4 bg-black p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
              <b.icon className="h-5 w-5 text-[#3B82F6]" />
            </div>
            <div>
              <div className="text-[15px] font-medium text-white">{b.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-[#9CA3AF]">{b.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="rounded-2xl border border-white/10 bg-black p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          {txs.length > 5 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex items-center gap-2 text-sm text-[#3B82F6] hover:text-[#60A5FA]"
            >
              {showAll ? "Show less" : "View All"} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.14em] text-[#6B7280]">
                <th className="pb-3 text-left font-normal">Date</th>
                <th className="pb-3 text-left font-normal">Description</th>
                <th className="pb-3 text-left font-normal">Credits</th>
                <th className="pb-3 text-left font-normal">Balance</th>
                <th className="pb-3 text-left font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id} className="border-t border-white/[0.06]">
                  <td className="py-3 text-[#D1D5DB]">
                    {new Date(t.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    <span className="ml-2 text-[#9CA3AF]">
                      {new Date(t.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>
                  <td className="py-3 text-[#E5E7EB]">{t.description}</td>
                  <td className={`py-3 tabular-nums ${t.credits >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                    {t.credits >= 0 ? `+${t.credits.toLocaleString()}` : t.credits.toLocaleString()}
                  </td>
                  <td className="py-3 tabular-nums text-[#E5E7EB]">{t.balance_after.toLocaleString()}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-2 text-[#D1D5DB]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
              {txs.length === 0 && (
                <tr className="border-t border-white/[0.06]">
                  <td colSpan={5} className="py-6 text-center text-[#6B7280]">No transactions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Need more credits */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-black p-5 sm:flex-row">
        <img src={creditsGift.url} alt="Gift box" className="h-20 w-20 object-contain" loading="lazy" />
        <div className="flex-1 text-center sm:text-left">
          <div className="text-lg font-semibold text-white">Need more credits?</div>
          <p className="mt-1 text-sm text-[#9CA3AF]">Top up your balance and keep using all features without interruption.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-3 rounded-xl bg-[#2563EB] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#1D4ED8]"
        >
          Buy Credits <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Full-page checkout */}
      {open && step === 1 && (
        <CreditsCheckout onClose={() => setOpen(false)} onContinue={() => setStep(2)} />
      )}
      {open && step === 2 && (
        <CreditsAmount
          onClose={() => {
            setOpen(false);
            setStep(1);
          }}
          onContinue={async (total) => {
            const { data, error } = await supabase.rpc("purchase_credits", { _credits: total });
            if (error) { toast.error(error.message); return; }
            setBal(Number(data ?? bal + total));
            setOpen(false);
            setStep(1);
            toast.success(`${total.toLocaleString()} credits added to your balance`);
            void loadTx();
          }}
        />
      )}

      {/* Buy dialog */}
      {false && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-black p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-semibold text-white">Buy Credits</div>
            <p className="mt-1 text-sm text-[#9CA3AF]">1 Credit = $1.00</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={`rounded-xl border px-4 py-3 text-sm transition ${
                    amount === p ? "border-[#2563EB] bg-[#2563EB]/15 text-white" : "border-white/10 text-[#D1D5DB] hover:border-white/25"
                  }`}
                >
                  {p.toLocaleString()} credits
                </button>
              ))}
            </div>

            <div className="mt-3">
              <label className="text-[11px] uppercase tracking-[0.14em] text-[#6B7280]">Custom amount</label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-white outline-none focus:border-white/25"
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-[#9CA3AF]">Total</span>
              <span className="tabular-nums text-white">${amount.toLocaleString()}.00</span>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm text-[#D1D5DB] hover:border-white/25"
              >
                Cancel
              </button>
              <button
                onClick={buy}
                disabled={busy}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
