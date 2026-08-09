import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck, Pencil, CircleUserRound, Copy, Coins, Crown, Database, Key, KeyRound, LifeBuoy,
  Loader2, LogOut, MessageSquare, MessagesSquare, Monitor, Send, ShieldHalf, ShieldCheck, Smartphone,
  Trash2, User2, ChevronRight, AlertTriangle, Zap, Clock, Headphones, ShoppingCart, ArrowRight,
  Briefcase, Building2, Mail, Save, Fingerprint, Menu, X, CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api-client";
import { deleteMyAccount } from "@/lib/account.functions";

import { uploadStoreAsset } from "@/lib/uploads";
import { useAuth } from "@/hooks/use-auth";
import creditsWallet from "@/assets/credits-wallet.png.asset.json";
import creditsGift from "@/assets/credits-gift.png.asset.json";
import CreditsCheckout from "@/components/credits/CreditsCheckout";
import CreditsAmount from "@/components/credits/CreditsAmount";
import { loadRazorpay, openRazorpay, type RazorpayResult } from "@/lib/razorpay-checkout";
import PaymentStatus, { type PaymentPhase } from "@/components/credits/PaymentStatus";
import {
  createCreditsOrder as createOrder,
  verifyCreditsPayment as verifyPayment,
  reconcileCreditsPayments as reconcilePayments,
} from "@/lib/razorpay.functions";
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
  const [navOpen, setNavOpen] = useState(false);

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

  const closeTicket = async (t: Ticket) => {
    try {
      const { ok } = await api.closeTicket(t.id);
      if (!ok) { toast.error("This ticket is already closed"); return; }
      setTickets((list) => list.map((x) => (x.id === t.id ? { ...x, status: "closed" } : x)));
      setActiveTicket((cur) => (cur && cur.id === t.id ? { ...cur, status: "closed" } : cur));
      toast.success("Ticket closed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not close ticket");
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

  const removeAccount = async () => {
    setDeleting(true);
    try {
      await deleteMyAccount();
      await supabase.auth.signOut();
      toast.success("Your account has been permanently deleted");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete account");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };


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


      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-10">
        {/* Mobile top bar with menu */}
        <div className="md:hidden mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/70 px-3 py-2 backdrop-blur">
          <button onClick={() => setNavOpen(true)} aria-label="Open account menu"
            className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-2.5 py-1.5 text-xs text-neutral-200">
            <Menu className="size-4" /> Menu
          </button>
          <div className="truncate text-sm font-semibold capitalize">{tab === "api" ? "API keys" : tab}</div>
        </div>

        {navOpen && <div className="fixed inset-0 z-[70] bg-black/70 md:hidden" onClick={() => setNavOpen(false)} />}

        <div className="grid md:grid-cols-[minmax(250px,23%)_1fr] gap-4 lg:gap-6 items-start">
          {/* ---------- Left rail — single unified panel ---------- */}
          <aside className={`overflow-y-auto rounded-2xl border border-white/10 flex flex-col fixed inset-y-0 left-0 z-[80] w-[84%] max-w-[320px] rounded-l-none transition-transform duration-300 md:transition-none md:static md:z-auto md:w-auto md:max-w-none md:rounded-2xl md:translate-x-0 md:overflow-hidden md:sticky md:top-6 md:min-h-[calc(100vh-3rem)] ${navOpen ? "translate-x-0" : "-translate-x-full"}`}>

            <img src={textureImg} alt="" aria-hidden="true" loading="lazy" width={1280} height={640}
              className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-black/90" />

            <div className="relative flex flex-col flex-1 p-4">
              {/* Back + title */}
              <div className="flex items-center justify-between gap-2">
                <BackButton label="Back" fallback="/" />
                <button onClick={() => setNavOpen(false)} aria-label="Close menu"
                  className="md:hidden rounded-lg border border-white/12 p-1.5 text-neutral-300"><X className="size-4" /></button>
              </div>
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
              <nav className="block space-y-1.5">
                {NAV.map((n) => {
                  const active = tab === n.key;
                  const count = n.key === "tickets" ? tickets.length : n.key === "credits" ? profile.credits : 0;
                  return (
                    <button key={n.key} onClick={() => { if (n.soon) { apiKeysNotice(); return; } setTab(n.key); setNavOpen(false); }}
                      className={`group relative w-full flex items-center gap-2.5 overflow-hidden rounded-xl border px-3 py-1.5 text-left transition hover:border-white/25 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] ${
                        active ? "border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]" : "border-transparent"
                      }`}>


                      <span className="relative size-7 rounded-lg grid place-items-center shrink-0">
                        <n.icon className={`size-4 ${n.key === "security" ? "text-white" : n.tint} transition ${active ? "" : "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100"}`} />
                      </span>
                      <span className={`relative min-w-0 flex-1 block text-sm whitespace-nowrap ${active ? "text-white" : "text-neutral-200"}`}>{n.label}</span>
                      {n.soon && <span className="relative inline text-[9px] uppercase tracking-[0.14em] rounded-full border border-white/12 px-1.5 py-0.5 text-[#9CA3AF]">Soon</span>}
                      {!n.soon && count > 0 && <span className="relative inline text-[10px] rounded-full bg-white/[0.06] px-1.5 py-0.5 text-neutral-300 tabular-nums">{count}</span>}

                    </button>
                  );
                })}

                {user && (
                  <>
                    <div className="my-2 h-px bg-white/10" />
                    <button onClick={signOut}
                      className="group relative w-full flex items-center gap-2.5 overflow-hidden rounded-xl border border-transparent px-3 py-1.5 text-left transition hover:border-white/25 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]">
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
                  <button onClick={() => setConfirmDelete(true)} disabled={deleting}
                    className="mt-3 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-xs inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-white/25 transition disabled:opacity-60">
                    {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5 text-red-500" />} Delete account
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
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[10px] text-muted-foreground/70">{new Date(t.created_at).toLocaleString()}</span>
                            <span className="flex items-center gap-1.5">
                              {t.status !== "closed" && (
                                <span role="button" tabIndex={0}
                                  onClick={(e) => { e.stopPropagation(); closeTicket(t); }}
                                  onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); closeTicket(t); } }}
                                  className="text-[10px] rounded-full border border-white/15 bg-black px-2 py-0.5 text-neutral-300 inline-flex items-center gap-1 hover:border-white/35 hover:text-white">
                                  <CheckCircle2 className="size-3 text-[#2563EB]" /> Close
                                </span>
                              )}
                              <span className="text-[10px] rounded-full border border-white/15 bg-black px-2 py-0.5 text-neutral-300 inline-flex items-center gap-1">
                                View <ChevronRight className="size-3" />
                              </span>
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-white">{activeTicket ? activeTicket.subject : "Conversation"}</div>
                        <div className="mt-1 text-[11px] text-[#9CA3AF]">{activeTicket ? `Ticket #${activeTicket.id.slice(0, 8)} · ${activeTicket.status.replace("_", " ")}` : "Pick a ticket to view the thread."}</div>
                      </div>
                      {activeTicket && activeTicket.status !== "closed" && (
                        <button onClick={() => closeTicket(activeTicket)}
                          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-2.5 py-1.5 text-[11px] text-neutral-200 transition hover:border-white/30 hover:text-white">
                          <CheckCircle2 className="size-3.5 text-[#2563EB]" /> Close ticket
                        </button>
                      )}
                    </div>
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

                <TwoFactorBlock />

                <div className="my-5 h-px bg-white/10" />

                <div className="text-base font-semibold text-white">Active sessions</div>
                <p className="mt-1 text-xs text-[#9CA3AF]">Devices currently signed in to this account.</p>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black p-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg ring-1 ring-white/10 bg-black grid place-items-center"><Monitor className="size-4 text-[#2563EB]" /></div>
                    <div>
                      <div className="text-sm flex items-center gap-2">This device <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/10 text-muted-foreground">CURRENT</span></div>
                      <div className="text-[11px] text-muted-foreground">
                        Signed in {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "recently"}
                      </div>
                    </div>
                  </div>
                  <ShieldCheck className="size-4 text-[#2563EB]" />
                </div>
                <button
                  onClick={async () => {
                    const { error } = await supabase.auth.signOut({ scope: "global" });
                    if (error) { toast.error(error.message); return; }
                    toast.success("Signed out on all devices");
                    navigate({ to: "/" });
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]">
                  <LogOut className="size-4" /> Sign out of all devices
                </button>
              </SectionShell>
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete account confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/80 p-4" onClick={() => setConfirmDelete(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="size-9 rounded-lg border border-white/10 bg-black grid place-items-center"><AlertTriangle className="size-4 text-red-500" /></span>
              <div className="text-lg font-semibold text-white">Delete account</div>
            </div>
            <p className="mt-3 text-sm text-[#9CA3AF]">
              This permanently removes your profile, credits, scans, reports and support history. This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(false)} className="rounded-xl border border-white/12 px-4 py-2 text-sm text-neutral-200 transition hover:border-white/30">Cancel</button>
              <button onClick={removeAccount} disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-60">
                {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Two-factor authentication (TOTP) ---------------- */

type Factor = { id: string; status: string; friendly_name?: string };

function TwoFactorBlock() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(((data?.totp ?? []) as Factor[]).filter((f) => f.status === "verified"));
  };
  useEffect(() => { void load(); }, []);

  const start = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${Date.now()}` });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setEnrolling({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verify = async () => {
    if (!enrolling || code.trim().length < 6) { toast.error("Enter the 6-digit code"); return; }
    setBusy(true);
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: enrolling.id });
    if (chErr) { setBusy(false); toast.error(chErr.message); return; }
    const { error } = await supabase.auth.mfa.verify({ factorId: enrolling.id, challengeId: ch.id, code: code.trim() });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setEnrolling(null); setCode("");
    toast.success("Two-factor authentication enabled");
    void load();
  };

  const disable = async (id: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) { toast.error(error.message); return; }
    toast.success("Two-factor authentication disabled");
    void load();
  };

  const active = factors[0];

  return (
    <>
      <div className="text-base font-semibold text-white">Two-factor authentication</div>
      <p className="mt-1 text-xs text-[#9CA3AF]">Protect your account with an additional layer.</p>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black p-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg ring-1 ring-white/10 bg-black grid place-items-center"><Smartphone className="size-4 text-[#2563EB]" /></div>
          <div>
            <div className="text-sm">Authenticator app</div>
            <div className="text-[11px] text-muted-foreground">{active ? "Enabled" : "Not configured"}</div>
          </div>
        </div>
        {active ? (
          <button onClick={() => disable(active.id)} className="rounded-lg border border-white/12 px-3 py-1.5 text-xs text-neutral-200 transition hover:border-white/30">Disable</button>
        ) : (
          <button onClick={start} disabled={busy}
            className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-60">
            {busy ? "Working…" : "Enable"}
          </button>
        )}
      </div>

      {enrolling && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black p-4">
          <div className="text-sm text-white">Scan this QR code with your authenticator app</div>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            <img src={enrolling.qr} alt="Two-factor QR code" className="size-40 rounded-lg bg-white p-2" />
            <div className="flex-1">
              <div className="text-[11px] text-muted-foreground">Or enter this setup key manually</div>
              <div className="mt-1 break-all font-mono text-xs text-[#D1D5DB]">{enrolling.secret}</div>
              <div className="mt-3 flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric" placeholder="123456"
                  className="w-32 rounded-lg border border-white/12 bg-black px-3 py-2 text-sm tracking-[0.3em] text-white outline-none focus:border-[#2563EB]" />
                <button onClick={verify} disabled={busy}
                  className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-60">Verify</button>
                <button onClick={() => { setEnrolling(null); setCode(""); }} className="rounded-lg border border-white/12 px-3 py-2 text-sm text-neutral-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState<number>(1000);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<PaymentPhase>("idle");
  const [payMsg, setPayMsg] = useState<string>();
  const [credited, setCredited] = useState<number>();
  const lastResult = useRef<RazorpayResult | null>(null);

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

  // Safety net: if a previous payment succeeded but the browser lost the
  // callback, settle it as soon as the credits page loads.
  useEffect(() => {
    void (async () => {
      try {
        const r = await reconcilePayments({ data: undefined });
        if (r.credited > 0) {
          if (typeof r.balance === "number") setBal(r.balance);
          toast.success(`${r.credited.toLocaleString()} credits added to your balance`);
          void loadTx();
        }
      } catch { /* silent */ }
    })();
  }, []);

  const finishSuccess = (newBalance: number, added: number) => {
    setBal(newBalance);
    setCredited(added);
    setPhase("success");
    void loadTx();
    setTimeout(() => {
      setPhase("idle");
      setOpen(false);
      setStep(1);
    }, 2500);
  };

  const runVerify = async (res: RazorpayResult) => {
    setPhase("verifying");
    try {
      const settled = await verifyPayment({ data: res });
      finishSuccess(settled.balance, settled.credited);
    } catch {
      // Signature/verify path failed — try the server-side reconciliation.
      try {
        const r = await reconcilePayments({ data: undefined });
        if (r.credited > 0) {
          finishSuccess(r.balance ?? bal, r.credited);
          return;
        }
      } catch { /* fall through */ }
      setPayMsg("Payment verification failed. Contact support if you were charged.");
      setPhase("error");
    }
  };

  const pay = async (credits: number) => {
    if (busy) return;
    if (!credits || credits < 1) { toast.error("Minimum 1 credit"); return; }
    setBusy(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Payment window could not be loaded");
      const order = await createOrder({ data: { credits, currency } });
      const res = await openRazorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        orderId: order.order_id,
        description: `${credits.toLocaleString()} Power Credits`,
      });
      lastResult.current = res;
      await runVerify(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      if (msg !== "Payment cancelled") toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const retryVerify = () => {
    if (lastResult.current) void runVerify(lastResult.current);
    else setPhase("idle");
  };

  const buy = () => void pay(amount);


  const visible = showAll ? txs : txs.slice(0, 5);

  return (
    <div className="w-full min-w-0 space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Credits <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
          </h2>
          <p className="mt-1 text-xs text-[#9CA3AF] sm:text-sm">Manage your credits and transactions.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-sm text-white">
          <Coins className="h-4 w-4 text-white" />
          1 Credit = $1.00
        </div>
      </div>

      {/* Balance */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
        <div className="flex items-center justify-between gap-3 p-4 sm:flex-row sm:p-7">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#9CA3AF] sm:text-[11px]">Available balance</div>
            <div className="mt-1 text-3xl font-semibold tabular-nums text-white sm:mt-2 sm:text-6xl">{bal.toLocaleString()}</div>
            <div className="mt-0.5 text-sm text-[#D1D5DB] sm:mt-1 sm:text-lg">Credits</div>
            <button
              onClick={() => setOpen(true)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-3.5 py-2 text-[12px] font-medium text-white transition hover:bg-[#1D4ED8] sm:mt-5 sm:gap-3 sm:rounded-xl sm:px-5 sm:py-3 sm:text-[15px]"
            >
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Buy Credits
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
          <img
            src={creditsWallet.url}
            alt="Credits wallet with coins"
            className="w-[42%] max-w-[320px] shrink-0 self-center sm:w-[46%]"
            loading="lazy"
          />
        </div>
      </div>

      {/* Benefits — 2 x 2 */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex items-start gap-2.5 bg-black p-3 sm:gap-4 sm:p-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] sm:h-11 sm:w-11 sm:rounded-xl">
              <b.icon className="h-4 w-4 text-[#3B82F6] sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-white sm:text-[15px]">{b.title}</div>
              <p className="mt-0.5 text-[11px] leading-snug text-[#9CA3AF] sm:mt-1 sm:text-sm sm:leading-relaxed">{b.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="min-w-0 rounded-2xl border border-white/10 bg-black p-3.5 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-white sm:text-lg">Recent Transactions</h3>
          {txs.length > 5 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex shrink-0 items-center gap-1.5 text-xs text-[#3B82F6] hover:text-[#60A5FA] sm:gap-2 sm:text-sm"
            >
              {showAll ? "Show less" : "View All"} <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 min-w-0 sm:mt-4">
          <table className="w-full table-fixed text-[11px] sm:text-sm">
            <thead>
              <tr className="text-[9px] uppercase tracking-[0.1em] text-[#6B7280] sm:text-[11px] sm:tracking-[0.14em]">
                <th className="w-[34%] pb-2 text-left font-normal sm:w-auto sm:pb-3">Date</th>
                <th className="pb-2 text-left font-normal sm:pb-3">Description</th>
                <th className="w-[22%] pb-2 text-left font-normal sm:w-auto sm:pb-3">Credits</th>
                <th className="hidden pb-3 text-left font-normal sm:table-cell">Balance</th>
                <th className="hidden pb-3 text-left font-normal sm:table-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id} className="border-t border-white/[0.06]">
                  <td className="py-2 pr-2 text-[#D1D5DB] sm:py-3">
                    {new Date(t.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    <span className="ml-1.5 text-[#9CA3AF] sm:ml-2">
                      {new Date(t.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>
                  <td className="truncate py-2 pr-2 text-[#E5E7EB] sm:py-3">{t.description}</td>
                  <td className={`py-2 tabular-nums sm:py-3 ${t.credits >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                    {t.credits >= 0 ? `+${t.credits.toLocaleString()}` : t.credits.toLocaleString()}
                  </td>
                  <td className="hidden py-3 tabular-nums text-[#E5E7EB] sm:table-cell">{t.balance_after.toLocaleString()}</td>
                  <td className="hidden py-3 sm:table-cell">
                    <span className="inline-flex items-center gap-2 text-[#D1D5DB]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
              {txs.length === 0 && (
                <tr className="border-t border-white/[0.06]">
                  <td colSpan={5} className="py-5 text-center text-[11px] text-[#6B7280] sm:py-6 sm:text-sm">No transactions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Need more credits */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black p-3.5 sm:gap-4 sm:p-5">
        <img src={creditsGift.url} alt="Gift box" className="h-12 w-12 shrink-0 object-contain sm:h-20 sm:w-20" loading="lazy" />
        <div className="min-w-0 flex-1 text-left">
          <div className="text-[14px] font-semibold text-white sm:text-lg">Need more credits?</div>
          <p className="mt-0.5 text-[11px] leading-snug text-[#9CA3AF] sm:mt-1 sm:text-sm">Top up your balance and keep using all features without interruption.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-[12px] font-medium text-white transition hover:bg-[#1D4ED8] sm:gap-3 sm:rounded-xl sm:px-6 sm:py-3 sm:text-[15px]"
        >
          Buy <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>


      <PaymentStatus
        phase={phase}
        credited={credited}
        balance={bal}
        message={payMsg}
        onRetry={retryVerify}
        onClose={() => { setPhase("idle"); setOpen(false); setStep(1); }}
      />

      {/* Full-page checkout */}
      {open && step === 1 && (
        <CreditsCheckout
          onClose={() => setOpen(false)}
          onContinue={(c) => {
            setCurrency(c.code);
            setStep(2);
          }}
        />
      )}
      {open && step === 2 && (
        <CreditsAmount
          onClose={() => {
            setOpen(false);
            setStep(1);
          }}
          onContinue={(base) => void pay(base)}
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
