import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Store } from "@/lib/business";
import {
  Home as HomeIcon, Plus, BadgeCheck, Loader2,
  Users, Package, Star,
  MessagesSquare, Megaphone, MessageCircle,
  BookOpen, HelpCircle, Info, Eye, Trash2, X, Check, Search,
  Download, Calendar, Rocket, Sparkles,
  Globe, Youtube, Instagram, Music2, Bell, Settings, Share2, ArrowRight,
  Activity, Clock, ShieldCheck, TrendingUp, Twitter,
} from "lucide-react";
import {
  APP_CATALOG, APP_MAP, type AppKey, type StoreApp,
  getInstalledApps, installApp, uninstallApp, setAppEnabled,
} from "@/lib/store-apps";
import { AppContent, AppHeader } from "@/components/store/AppContent";
import { toast } from "sonner";

type ActiveView = "home" | { kind: "app"; key: AppKey };

// Tokens
const BG = "#050505";
const SIDEBAR_BG = "#070707";
const CARD = "#0B0B0B";
const HOVER = "#111111";
const SELECTED = "#000000";
const BORDER = "rgba(255,255,255,0.06)";
const BORDER_SOFT = "rgba(255,255,255,0.05)";
const TEXT = "#FFFFFF";
const SEC = "#A1A1AA";
const MUTED = "#71717A";
const BLUE = "#3B82F6";
const BLUE_DARK = "#1D4ED8";

type NavKey = "home" | AppKey;
const NAV: { key: NavKey; label: string; Icon: any; badge?: number }[] = [
  { key: "home", label: "Home", Icon: HomeIcon },
  { key: "chat", label: "Chat", Icon: MessagesSquare },
  { key: "announcements", label: "Announcements", Icon: Megaphone, badge: 2 },
  { key: "forum", label: "Forum", Icon: MessageCircle },
  { key: "resources", label: "Resources", Icon: BookOpen },
  { key: "downloads" as any, label: "Downloads", Icon: Download },
  { key: "events" as any, label: "Events", Icon: Calendar },
  { key: "faq", label: "FAQ", Icon: HelpCircle },
  { key: "reviews", label: "Reviews", Icon: Star },
  { key: "about", label: "About", Icon: Info },
];

export function StoreLayout({
  store, isOwner, viewerId, onJoin,
}: {
  store: Store;
  isOwner: boolean;
  viewerId: string | null;
  onJoin?: () => void;
}) {
  const [apps, setApps] = useState<StoreApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ActiveView>("home");
  const [showAdd, setShowAdd] = useState(false);
  const [manage, setManage] = useState(false);

  const reload = async () => {
    setLoading(true);
    setApps(await getInstalledApps(store.id));
    setLoading(false);
  };
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [store.id]);

  const enabledApps = useMemo(() => apps.filter(a => a.enabled), [apps]);
  const installedKeys = new Set(apps.map(a => a.app_key));
  const enabledKeys = new Set(enabledApps.map(a => a.app_key));
  const available = APP_CATALOG.filter(a => !installedKeys.has(a.key));

  const handleInstall = async (key: AppKey) => {
    const { error } = await installApp(store.id, key, apps.length);
    if (error) { toast.error(error.message); return; }
    toast.success(`${APP_MAP[key].name} installed`);
    await reload();
  };
  const handleUninstall = async (id: string, name: string) => {
    const { error } = await uninstallApp(id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${name} removed`);
    await reload();
  };
  const toggleEnabled = async (a: StoreApp) => {
    const { error } = await setAppEnabled(a.id, !a.enabled);
    if (error) { toast.error(error.message); return; }
    await reload();
  };

  const isActive = (k: NavKey) =>
    (k === "home" && active === "home") ||
    (typeof active !== "string" && active.kind === "app" && active.key === (k as AppKey));

  return (
    <div
      className="-m-4 sm:-m-6 lg:-m-8 min-h-[calc(100vh-5rem)] flex"
      style={{ background: BG, color: TEXT }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp8 { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
        .anim-fade { animation: fadeIn .22s ease both }
        .anim-slide { animation: slideUp8 .32s ease both }
        .anim-1 { animation-delay: .04s }
        .anim-2 { animation-delay: .08s }
        .anim-3 { animation-delay: .12s }
        .anim-4 { animation-delay: .16s }
        .t-220 { transition: transform .22s ease, background-color .22s ease, border-color .22s ease, color .22s ease }
        .lift:hover { transform: translateY(-2px) }
      `}</style>

      {/* LEFT SIDEBAR (sticky, non-scroll) */}
      <aside
        className="hidden lg:flex shrink-0 flex-col"
        style={{
          width: 290,
          background: SIDEBAR_BG,
          borderRight: `1px solid ${BORDER_SOFT}`,
          padding: 24,
          position: "sticky",
          top: 72,
          height: "calc(100vh - 72px)",
          alignSelf: "flex-start",
        }}
      >
        {/* STORE IDENTITY — flat, no card */}
        <div className="anim-fade flex flex-col items-center text-center">
          <div
            className="shrink-0 overflow-hidden"
            style={{ width: 68, height: 68, borderRadius: 18, background: HOVER, border: `1px solid ${BORDER_SOFT}` }}
          >
            {store.logo_url
              ? <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full grid place-items-center text-2xl font-bold">{store.name[0]?.toUpperCase()}</div>}
          </div>
          <div className="mt-3 flex items-center gap-1.5 min-w-0 max-w-full">
            <div className="truncate font-bold" style={{ fontSize: 18, color: TEXT, letterSpacing: -0.3 }}>{store.name}</div>
            {store.verified && <BadgeCheck className="size-4 shrink-0" style={{ color: BLUE }} />}
          </div>
          {isOwner ? (
            <Link
              to="/business"
              className="mt-4 w-full t-220 text-xs font-medium inline-flex items-center justify-center"
              style={{
                background: "transparent",
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "9px 12px",
                color: SEC,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Store Dashboard
            </Link>
          ) : (
            <button
              className="mt-4 w-full t-220 text-xs font-medium"
              style={{
                background: "transparent",
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "9px 12px",
                color: SEC,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              View Store
            </button>
          )}
        </div>

        {/* NAV */}
        <nav className="mt-6 flex-1 overflow-y-auto -mx-1 px-1" style={{ scrollbarWidth: "thin" }}>
          <div className="space-y-1.5">
            {loading && (
              <div className="px-3 py-2 text-xs flex items-center gap-2" style={{ color: MUTED }}>
                <Loader2 className="size-3 animate-spin" /> Loading…
              </div>
            )}
            {!loading && NAV.map(({ key, label, Icon, badge }) => {
              const asApp = key !== "home";
              const app = asApp ? apps.find(a => a.app_key === key) : undefined;
              const installed = key === "home" || installedKeys.has(key as AppKey) || key === "downloads" || key === "events";
              if (!installed && !manage) return null;
              const selected = isActive(key);
              return (
                <div key={key} className="group flex items-center" style={{ borderRadius: 14, background: selected ? SELECTED : "transparent", position: "relative" }}>
                  {selected && (
                    <span style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 3, background: BLUE, borderRadius: 2 }} />
                  )}
                  <button
                    onClick={() => {
                      if (key === "home") setActive("home");
                      else if (installed && key !== "downloads" && key !== "events") setActive({ kind: "app", key: key as AppKey });
                    }}
                    className="flex-1 flex items-center gap-3 t-220 text-left"
                    style={{
                      height: 48,
                      borderRadius: 14,
                      padding: "0 16px",
                      color: selected ? TEXT : SEC,
                      opacity: app && !app.enabled ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => { if (!selected) (e.currentTarget.parentElement as HTMLElement).style.background = HOVER; }}
                    onMouseLeave={(e) => { if (!selected) (e.currentTarget.parentElement as HTMLElement).style.background = "transparent"; }}
                  >
                    <Icon className="size-[18px]" />
                    <span className="text-sm font-medium flex-1 truncate">{label}</span>
                    {badge !== undefined && !manage && (
                      <span className="text-[10px] font-semibold rounded-full px-1.5 py-0.5"
                        style={{ background: "rgba(59,130,246,0.16)", color: "#93b4ff" }}>
                        {badge}
                      </span>
                    )}
                  </button>
                  {manage && isOwner && app && (
                    <div className="flex items-center gap-1 pr-2">
                      <button onClick={() => toggleEnabled(app)} title={app.enabled ? "Disable" : "Enable"} className="size-7 grid place-items-center rounded-md hover:bg-white/5">
                        <Eye className="size-3.5" style={{ color: app.enabled ? SEC : MUTED }} />
                      </button>
                      <button onClick={() => handleUninstall(app.id, APP_MAP[key as AppKey].name)} title="Remove" className="size-7 grid place-items-center rounded-md hover:bg-rose-500/10">
                        <Trash2 className="size-3.5" style={{ color: "#fb7185" }} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* ADD FEATURE */}
        {isOwner && (
          <div className="pt-4 space-y-2">
            <button
              onClick={() => setShowAdd(true)}
              className="w-full flex items-center justify-center gap-2 t-220 text-sm font-medium"
              style={{
                border: `1px solid rgba(255,255,255,0.08)`,
                height: 54,
                borderRadius: 16,
                color: SEC,
                background: "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#101010")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Plus className="size-4" /> Add Feature
            </button>
            {apps.length > 0 && (
              <button
                onClick={() => setManage(m => !m)}
                className="w-full text-center text-[11px] py-1"
                style={{ color: MUTED }}
              >
                {manage ? "Done managing" : "Manage features"}
              </button>
            )}
          </div>
        )}
      </aside>

      {/* CENTER SCROLL COLUMN + RIGHT RAIL */}
      <div className="flex-1 min-w-0 flex">
        <main className="flex-1 min-w-0" style={{ padding: 36 }}>
          <div style={{ maxWidth: 900, marginInline: "auto" }}>
            {active === "home"
              ? <HomeOverview store={store} isOwner={isOwner} viewerId={viewerId} onJoin={onJoin} enabledKeys={enabledKeys} onOpenApp={(k) => setActive({ kind: "app", key: k })} />
              : (
                <div className="anim-slide">
                  <div className="mb-4"><AppHeader appKey={(active as any).key} /></div>
                  <AppContent appKey={(active as any).key} store={store} isOwner={isOwner} />
                </div>
              )}
          </div>
        </main>

        {active === "home" && (
          <aside
            className="hidden xl:flex shrink-0 flex-col"
            style={{
              width: 320,
              borderLeft: `1px solid ${BORDER_SOFT}`,
              background: BG,
              padding: 24,
              gap: 16,
            }}
          >
            <RightRail store={store} />
          </aside>
        )}
      </div>

      {showAdd && isOwner && (
        <AddAppModal
          available={available}
          installedCount={apps.length}
          onClose={() => setShowAdd(false)}
          onInstall={async (k) => { await handleInstall(k); }}
        />
      )}
    </div>
  );
}

/* ---------------- CENTER ---------------- */

function HomeOverview({
  store, isOwner, viewerId, onJoin, enabledKeys, onOpenApp,
}: {
  store: Store;
  isOwner: boolean;
  viewerId: string | null;
  onJoin?: () => void;
  enabledKeys: Set<AppKey>;
  onOpenApp: (k: AppKey) => void;
}) {
  const initial = (store.name[0] ?? "S").toUpperCase();
  const memberCount = store.member_count ?? 1;

  const quick: { key: string; label: string; sub: string; Icon: any; appKey?: AppKey }[] = [
    { key: "chat", label: "Chat", sub: "Talk with members", Icon: MessagesSquare, appKey: "chat" },
    { key: "ann", label: "Announcements", sub: "Latest updates", Icon: Megaphone, appKey: "announcements" },
    { key: "dl", label: "Downloads", sub: "Files & assets", Icon: Download },
    { key: "res", label: "Resources", sub: "Tools & guides", Icon: BookOpen, appKey: "resources" },
    { key: "forum", label: "Forum", sub: "Join discussions", Icon: MessageCircle, appKey: "forum" },
    { key: "faq", label: "FAQ", sub: "Get answers", Icon: HelpCircle, appKey: "faq" },
    { key: "ev", label: "Events", sub: "Upcoming meetups", Icon: Calendar },
    { key: "rev", label: "Reviews", sub: "Member feedback", Icon: Star, appKey: "reviews" },
  ];

  return (
    <div className="anim-fade">
      {/* BANNER — art only, no text */}
      <div
        className="relative overflow-hidden anim-slide"
        style={{ height: 260, borderRadius: 24, border: `1px solid ${BORDER}` }}
      >
        {store.banner_url ? (
          <img src={store.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <CinematicArt />
        )}
      </div>

      {/* STORE HEADER — flat, no card */}
      <div className="mt-6 flex flex-wrap items-center gap-5 anim-slide anim-1">
        <div
          className="shrink-0 overflow-hidden"
          style={{ width: 96, height: 96, borderRadius: 24, border: `1px solid ${BORDER}`, background: CARD }}
        >
          {store.logo_url
            ? <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full grid place-items-center text-3xl font-bold">{initial}</div>}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate font-bold tracking-tight" style={{ fontSize: 30, color: TEXT }}>{store.name}</h1>
            {store.verified && <BadgeCheck className="size-5 shrink-0" style={{ color: BLUE }} />}
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "rgba(59,130,246,0.14)", color: "#93b4ff" }}
            >
              {store.category ?? "Business"}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-x-3 gap-y-1 text-xs flex-wrap" style={{ color: MUTED }}>
            <span>Created by <span style={{ color: SEC }}>@{store.slug}</span></span>
            <span>•</span>
            <span className="inline-flex items-center gap-1"><Users className="size-3" /> {memberCount.toLocaleString()} members</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1"><Package className="size-3" /> 3 products</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1"><Star className="size-3" /> 4.9 (128)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconBtn title="Share"><Share2 className="size-4" /></IconBtn>
          <IconBtn title="Notifications"><Bell className="size-4" /></IconBtn>
          {isOwner ? (
            <Link to="/business/store/edit" className="grid place-items-center t-220"
              style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${BORDER}`, color: SEC }}
              title="Settings"
            >
              <Settings className="size-4" />
            </Link>
          ) : <IconBtn title="Settings"><Settings className="size-4" /></IconBtn>}
          {!isOwner ? (
            <button
              onClick={onJoin}
              disabled={!viewerId}
              className="t-220 font-medium disabled:opacity-50"
              style={{ background: BLUE, color: TEXT, padding: "10px 18px", borderRadius: 12, fontSize: 14 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BLUE_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}
            >
              Join Store
            </button>
          ) : (
            <Link to="/business/store/edit" className="t-220 font-medium"
              style={{ background: BLUE, color: TEXT, padding: "10px 18px", borderRadius: 12, fontSize: 14 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BLUE_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}
            >
              Edit Store
            </Link>
          )}
        </div>
      </div>

      {/* WELCOME CARD */}
      <div
        className="mt-8 anim-slide anim-2 relative overflow-hidden"
        style={{ background: "#090909", borderRadius: 22, padding: 32, border: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center gap-8 flex-wrap">
          <div className="min-w-0 flex-1">
            <h2 className="font-bold tracking-tight" style={{ fontSize: 34, color: TEXT, letterSpacing: -0.5 }}>
              Welcome to {store.name}
            </h2>
            <p className="mt-3 text-sm leading-relaxed max-w-lg" style={{ color: SEC }}>
              A calm, focused space for the community. Explore resources, join the conversation, and keep up with everything new — all in one place.
            </p>
            <div className="mt-6 flex items-center gap-2 flex-wrap">
              {!isOwner ? (
                <button
                  onClick={onJoin}
                  disabled={!viewerId}
                  className="t-220 font-medium disabled:opacity-50"
                  style={{ background: BLUE, color: TEXT, padding: "10px 18px", borderRadius: 12, fontSize: 14 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = BLUE_DARK)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}
                >
                  Join Community
                </button>
              ) : null}
              <button
                className="t-220 font-medium"
                style={{ background: "transparent", border: `1px solid ${BORDER}`, color: SEC, padding: "10px 18px", borderRadius: 12, fontSize: 14 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Learn More
              </button>
            </div>
          </div>
          {/* Minimal illustration */}
          <div className="shrink-0" style={{ width: 200, height: 140 }}>
            <MinimalIllustration />
          </div>
        </div>
      </div>

      {/* QUICK ACCESS */}
      <div className="mt-10 anim-slide anim-3">
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="font-semibold tracking-tight" style={{ fontSize: 18, color: TEXT }}>Quick Access</h3>
          <span className="text-xs" style={{ color: MUTED }}>Jump to a section</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quick.map(({ key, label, sub, Icon, appKey }) => (
            <button
              key={key}
              onClick={() => appKey && enabledKeys.has(appKey) && onOpenApp(appKey)}
              className="group text-left t-220"
              style={{ background: CARD, borderRadius: 18, padding: 22, border: `1px solid ${BORDER}` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = HOVER; e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = CARD; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="grid place-items-center"
                  style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}` }}
                >
                  <Icon className="size-[18px]" style={{ color: SEC }} />
                </div>
                <ArrowRight className="size-4 opacity-0 group-hover:opacity-100 t-220" style={{ color: SEC }} />
              </div>
              <div className="mt-4 text-sm font-semibold" style={{ color: TEXT }}>{label}</div>
              <div className="mt-1 text-[12px]" style={{ color: MUTED }}>{sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* LATEST UPDATES */}
      <div className="mt-12 anim-slide anim-4">
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="font-semibold tracking-tight" style={{ fontSize: 18, color: TEXT }}>Latest Updates</h3>
          <button className="text-xs" style={{ color: MUTED }}>View all</button>
        </div>
        <div className="relative pl-7">
          <div className="absolute left-[10px] top-2 bottom-2 w-px" style={{ background: BORDER }} />
          <TimelineItem Icon={Megaphone} tag="Announcement" title={`Welcome to ${store.name}`} desc="A short note to help you get oriented and make the most of the space." date="2d ago" author="Founder" pinned />
          <TimelineItem Icon={BookOpen} tag="Resource" title="Starter pack (2025)" desc="Essential tools and guides curated for members starting out." date="5d ago" author="Team" />
          <TimelineItem Icon={Calendar} tag="Event" title="Community office hours" desc="Weekly Thursdays — bring questions, we'll cover live." date="1w ago" author="Host" />
          <TimelineItem Icon={Package} tag="Product Release" title="New product live" desc="Fresh drop for members. Check the store to grab it." date="2w ago" author="Store" />
          <TimelineItem Icon={Rocket} tag="Changelog" title="v1.4 improvements" desc="Faster search, cleaner threads, better mobile spacing." date="3w ago" author="Engineering" />
        </div>
      </div>

      <div className="h-16" />
    </div>
  );
}

function TimelineItem({
  Icon, tag, title, desc, date, author, pinned,
}: {
  Icon: any; tag: string; title: string; desc: string; date: string; author: string; pinned?: boolean;
}) {
  return (
    <div className="relative py-3">
      <div
        className="absolute -left-7 top-5 grid place-items-center"
        style={{ width: 20, height: 20, borderRadius: 999, background: BG, border: `1px solid ${BORDER}` }}
      >
        <div style={{ width: 6, height: 6, borderRadius: 999, background: BLUE }} />
      </div>
      <div
        className="t-220"
        style={{ background: CARD, borderRadius: 16, padding: 16, border: `1px solid ${BORDER}` }}
        onMouseEnter={(e) => (e.currentTarget.style.background = HOVER)}
        onMouseLeave={(e) => (e.currentTarget.style.background = CARD)}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 grid place-items-center" style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}` }}>
            <Icon className="size-4" style={{ color: SEC }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] rounded-md px-1.5 py-0.5 border" style={{ borderColor: BORDER, color: SEC }}>{tag}</span>
              {pinned && <span className="text-[10px] rounded-md px-1.5 py-0.5" style={{ background: "rgba(59,130,246,0.14)", color: "#93b4ff" }}>Pinned</span>}
              <span className="text-[11px] ml-auto" style={{ color: MUTED }}>{date}</span>
            </div>
            <div className="mt-1.5 font-semibold text-sm" style={{ color: TEXT }}>{title}</div>
            <div className="mt-0.5 text-xs" style={{ color: SEC }}>{desc}</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="size-5 rounded-full" style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})` }} />
              <span className="text-[11px]" style={{ color: MUTED }}>{author}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- RIGHT RAIL ---------------- */

function RightRail({ store }: { store: Store }) {
  return (
    <div className="space-y-4">
      <RailCard title="About Store">
        <RailRow label="Owner" value={`@${store.slug}`} />
        <RailRow label="Created" value="Jan 2025" />
        <RailRow label="Category" value={store.category ?? "Business"} />
        <RailRow label="Members" value={(store.member_count ?? 1).toLocaleString()} />
        <RailRow label="Products" value="3" />
        <RailRow label="Rating" value="4.9" />
        {store.description && (
          <p className="text-[12px] leading-relaxed pt-2" style={{ color: SEC, borderTop: `1px solid ${BORDER}` }}>{store.description}</p>
        )}
      </RailCard>

      <RailCard title="Community Status">
        <Progress label="Members Online" value={72} display="42 online" Icon={Activity} />
        <Progress label="Community Health" value={92} display="Excellent" Icon={ShieldCheck} />
        <Progress label="Avg. Response" value={85} display="< 1h" Icon={Clock} />
        <Progress label="Activity Score" value={68} display="High" Icon={TrendingUp} />
      </RailCard>

      <RailCard title="Social">
        <div className="flex items-center gap-2 flex-wrap">
          <SocialDot Icon={MessagesSquare} label="Discord" />
          <SocialDot Icon={Twitter} label="X" />
          <SocialDot Icon={Instagram} label="Instagram" />
          <SocialDot Icon={Music2} label="TikTok" />
          <SocialDot Icon={Globe} label="Website" />
          <SocialDot Icon={Youtube} label="YouTube" />
        </div>
      </RailCard>

      <RailCard title="Top Members">
        <div className="space-y-2.5">
          {[
            { name: "Owner", role: "Founder" },
            { name: "Alex", role: "Admin" },
            { name: "Jordan", role: "Moderator" },
            { name: "Sam", role: "Top Creator" },
          ].map((m, i) => (
            <div key={m.name} className="flex items-center gap-3">
              <div className="size-8 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, hsl(${i * 60},60%,45%), hsl(${i * 60 + 30},60%,30%))` }} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium" style={{ color: TEXT }}>{m.name}</div>
                <div className="text-[11px]" style={{ color: MUTED }}>{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </RailCard>

      <RailCard title="Featured Product">
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          <div className="h-24" style={{ background: `linear-gradient(135deg, ${BLUE_DARK}, #0a1633)` }} />
          <div className="p-3">
            <div className="text-sm font-semibold" style={{ color: TEXT }}>Starter Pack (2025)</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: "#93b4ff" }}>Free</span>
              <span className="text-[11px] inline-flex items-center gap-1" style={{ color: MUTED }}>
                <Download className="size-3" /> 1.2k
              </span>
            </div>
          </div>
        </div>
      </RailCard>
    </div>
  );
}

function RailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: CARD, borderRadius: 20, padding: 20, border: `1px solid ${BORDER}` }}>
      <div className="text-xs mb-3 font-medium uppercase tracking-wider" style={{ color: MUTED, fontSize: 10, letterSpacing: 1 }}>{title}</div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}
function RailRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div style={{ color: SEC }}>{label}</div>
      <div className="font-medium" style={{ color: TEXT }}>{value}</div>
    </div>
  );
}
function Progress({ label, value, display, Icon }: { label: string; value: number; display: string; Icon: any }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="inline-flex items-center gap-1.5" style={{ color: SEC }}>
          <Icon className="size-3.5" style={{ color: MUTED }} /> {label}
        </span>
        <span className="font-medium" style={{ color: TEXT }}>{display}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div style={{ width: `${value}%`, height: "100%", background: BLUE, borderRadius: 999 }} />
      </div>
    </div>
  );
}
function SocialDot({ Icon, label }: { Icon: any; label?: string }) {
  return (
    <button
      title={label}
      className="grid place-items-center t-220"
      style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${BORDER}`, background: "transparent", color: SEC }}
      onMouseEnter={(e) => (e.currentTarget.style.background = HOVER)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon className="size-4" />
    </button>
  );
}

function IconBtn({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <button title={title} className="grid place-items-center t-220"
      style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${BORDER}`, color: SEC, background: "transparent" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = HOVER)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );
}

/* ---------------- ART ---------------- */

function CinematicArt() {
  return (
    <div className="absolute inset-0" style={{ background: "#040509" }}>
      {/* purple horizon */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 900px 260px at 50% 100%, rgba(93,52,220,0.35) 0%, rgba(59,130,246,0.15) 30%, rgba(0,0,0,0) 65%)",
      }} />
      {/* blue atmosphere */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 700px 300px at 50% 60%, rgba(59,130,246,0.14) 0%, rgba(0,0,0,0) 60%)",
      }} />
      {/* planet */}
      <div style={{
        position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)",
        width: 140, height: 140, borderRadius: 999,
        background: "radial-gradient(circle at 35% 35%, #1b2547 0%, #0a0f22 55%, #05070f 100%)",
        boxShadow: "inset -20px -12px 40px rgba(0,0,0,0.7), 0 0 60px rgba(59,130,246,0.10)",
      }} />
      {/* mountains */}
      <svg viewBox="0 0 900 260" preserveAspectRatio="none" className="absolute bottom-0 inset-x-0 w-full" style={{ height: 140 }}>
        <path d="M0,260 L90,150 L170,190 L280,110 L380,170 L470,120 L570,180 L680,140 L790,190 L900,150 L900,260 Z" fill="rgba(255,255,255,0.05)" />
        <path d="M0,260 L70,190 L180,210 L280,150 L400,200 L510,170 L620,210 L720,180 L830,210 L900,190 L900,260 Z" fill="rgba(255,255,255,0.035)" />
        <path d="M0,260 L120,220 L240,235 L380,205 L520,225 L660,215 L800,230 L900,220 L900,260 Z" fill="rgba(0,0,0,0.5)" />
      </svg>
      {/* vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
      }} />
    </div>
  );
}

function MinimalIllustration() {
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#3B82F6" stopOpacity="0.6" />
          <stop offset="1" stopColor="#1D4ED8" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <circle cx="150" cy="70" r="42" fill="none" stroke="rgba(255,255,255,0.06)" />
      <circle cx="150" cy="70" r="28" fill="none" stroke="rgba(59,130,246,0.35)" />
      <circle cx="150" cy="70" r="14" fill="url(#g1)" />
      <rect x="20" y="40" width="70" height="8" rx="4" fill="rgba(255,255,255,0.08)" />
      <rect x="20" y="58" width="50" height="8" rx="4" fill="rgba(255,255,255,0.05)" />
      <rect x="20" y="76" width="60" height="8" rx="4" fill="rgba(255,255,255,0.05)" />
      <circle cx="122" cy="30" r="3" fill="#3B82F6" />
      <circle cx="180" cy="115" r="3" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}

/* ---------------- ADD APP MODAL ---------------- */

function AddAppModal({
  available, installedCount, onClose, onInstall,
}: {
  available: typeof APP_CATALOG;
  installedCount: number;
  onClose: () => void;
  onInstall: (k: AppKey) => Promise<void>;
}) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<AppKey | null>(null);
  const filtered = available.filter(a => a.name.toLowerCase().includes(q.toLowerCase()) || a.description.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
        style={{ borderRadius: 22, border: `1px solid ${BORDER}`, background: BG }}
      >
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div>
            <div className="text-lg font-semibold" style={{ color: TEXT }}>Add a feature</div>
            <div className="text-xs mt-0.5" style={{ color: MUTED }}>Extend your store with prebuilt apps</div>
          </div>
          <button onClick={onClose} className="size-9 grid place-items-center rounded-full hover:bg-white/5"><X className="size-4" /></button>
        </div>
        <div className="p-5" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: MUTED }} />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search apps…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXT }} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-sm py-10" style={{ color: MUTED }}>
              {available.length === 0 ? "All apps already installed." : "No apps match your search."}
            </div>
          )}
          {filtered.map((def) => (
            <div key={def.key} className="flex flex-col p-4"
              style={{ borderRadius: 18, border: `1px solid ${BORDER}`, background: CARD }}
            >
              <div className="flex items-start justify-between gap-3">
                <img src={def.logo} alt="" loading="lazy" width={40} height={40} className="size-10 rounded-xl object-contain shrink-0" />
                <button
                  disabled={busy === def.key}
                  onClick={async () => { setBusy(def.key); await onInstall(def.key); setBusy(null); }}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1 disabled:opacity-50"
                  style={{ background: BLUE, color: TEXT }}
                >
                  {busy === def.key ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                  Add
                </button>
              </div>
              <div className="mt-3 font-medium flex items-center gap-2" style={{ color: TEXT }}>
                {def.name}
                {def.default && <span className="text-[9px] rounded-full px-1.5 py-0.5 flex items-center gap-0.5"
                  style={{ background: "rgba(16,185,129,0.12)", color: "#6ee7b7" }}>
                  <Check className="size-2.5" /> Default
                </span>}
              </div>
              <div className="text-xs mt-1 line-clamp-2" style={{ color: SEC }}>{def.description}</div>
            </div>
          ))}
        </div>
        <div className="p-3 text-[11px] text-center" style={{ borderTop: `1px solid ${BORDER}`, color: MUTED }}>
          {installedCount} app{installedCount === 1 ? "" : "s"} installed
        </div>
      </div>
    </div>
  );
}

/* placate lint */
export const __ = { Sparkles };
