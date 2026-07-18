import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Store } from "@/lib/business";
import {
  Home as HomeIcon, Plus, BadgeCheck, Loader2,
  Users, Package, Star,
  MessagesSquare, Megaphone, MessageCircle,
  BookOpen, HelpCircle, Info, Eye, Trash2, GripVertical, X, Check, Search,
  Hash, Download, Calendar, Map, Rocket, Sparkles,
  Globe, Youtube, Instagram, Music2, ArrowUpRight, Activity, Clock, ShieldCheck,
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
const CARD = "#0B0B0B";
const BORDER = "rgba(255,255,255,0.06)";
const HOVER = "rgba(255,255,255,0.03)";
const TEXT = "#FFFFFF";
const SEC = "#A1A1AA";
const MUTED = "#71717A";
const ACCENT = "#3B6EFF"; // subtle blue accent

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

  const NAV: { key: AppKey; label: string; Icon: any; badge?: number }[] = [
    { key: "chat", label: "Chat", Icon: MessagesSquare },
    { key: "announcements", label: "Announcements", Icon: Megaphone, badge: 2 },
    { key: "forum", label: "Forum", Icon: MessageCircle },
    { key: "resources", label: "Resources", Icon: BookOpen },
    { key: "faq", label: "FAQ", Icon: HelpCircle },
    { key: "reviews", label: "Reviews", Icon: Star },
    { key: "about", label: "About", Icon: Info },
  ];
  const enabledKeys = new Set(enabledApps.map(a => a.app_key));

  return (
    <div
      className="-m-4 sm:-m-6 lg:-m-8 min-h-[calc(100vh-5rem)] flex fade-in-page"
      style={{ background: BG, color: TEXT }}
    >
      <style>{`
        @keyframes fadeInPage { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
        .fade-in-page { animation: fadeInPage .35s ease both }
        .slide-up { animation: slideUp .45s ease both }
        .slide-up-1 { animation-delay: .04s }
        .slide-up-2 { animation-delay: .08s }
        .slide-up-3 { animation-delay: .12s }
        .slide-up-4 { animation-delay: .16s }
        .lift { transition: transform .2s ease, background-color .2s ease, border-color .2s ease }
        .lift:hover { transform: translateY(-2px) }
      `}</style>

      {/* LEFT COLUMN */}
      <aside
        className="hidden lg:flex w-[280px] shrink-0 flex-col border-r"
        style={{ borderColor: BORDER, background: BG }}
      >
        {/* Identity panel */}
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div
              className="size-12 rounded-2xl overflow-hidden shrink-0 border"
              style={{ borderColor: BORDER, background: CARD }}
            >
              {store.logo_url
                ? <img src={store.logo_url} alt={store.name} className="size-full object-cover" />
                : <div className="size-full grid place-items-center text-lg font-semibold" style={{ color: TEXT }}>{store.name[0]?.toUpperCase()}</div>}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-1.5">
                <div className="font-medium truncate" style={{ color: TEXT }}>{store.name}</div>
                {store.verified && <BadgeCheck className="size-4 shrink-0" style={{ color: ACCENT }} />}
              </div>
              <div className="text-xs mt-0.5" style={{ color: MUTED }}>@{store.slug}</div>
            </div>
          </div>

          {store.description && (
            <p className="mt-4 text-[13px] leading-relaxed line-clamp-3" style={{ color: SEC }}>
              {store.description}
            </p>
          )}

          <div className="mt-5 grid grid-cols-3 gap-2">
            <MiniStat label="Members" value={(store.member_count ?? 1).toLocaleString()} />
            <MiniStat label="Rating" value="4.9" />
            <MiniStat label="Products" value="3" />
          </div>

          {store.category && (
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] border"
                style={{ borderColor: BORDER, color: SEC, background: CARD }}>
                {store.category}
              </span>
            </div>
          )}
        </div>

        <div className="h-px mx-6" style={{ background: BORDER }} />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <SideItem icon={HomeIcon} active={active === "home"} onClick={() => setActive("home")}>Home</SideItem>

          {loading ? (
            <div className="px-3 py-2 text-xs flex items-center gap-2" style={{ color: MUTED }}>
              <Loader2 className="size-3 animate-spin" /> Loading…
            </div>
          ) : (
            NAV.map(({ key, label, Icon, badge }) => {
              const installed = installedKeys.has(key) || enabledKeys.has(key);
              const isActive = typeof active !== "string" && active.kind === "app" && active.key === key;
              if (!installed && !manage) return null;
              const app = apps.find(a => a.app_key === key);
              return (
                <div key={key} className="group flex items-center rounded-xl lift"
                  style={{ background: isActive ? "rgba(255,255,255,0.04)" : "transparent" }}
                >
                  <button
                    onClick={() => installed && setActive({ kind: "app", key })}
                    className="flex-1 flex items-center gap-3 px-3 py-2 text-sm text-left"
                    style={{ color: isActive ? TEXT : SEC, opacity: app && !app.enabled ? 0.5 : 1 }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget.parentElement as HTMLElement).style.background = HOVER; }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget.parentElement as HTMLElement).style.background = "transparent"; }}
                  >
                    {manage && app && <GripVertical className="size-3" style={{ color: MUTED }} />}
                    <Icon className="size-4" />
                    <span className="truncate flex-1">{label}</span>
                    {badge !== undefined && !manage && installed && (
                      <span className="text-[10px] font-medium rounded-full px-1.5 py-0.5"
                        style={{ background: "rgba(59,110,255,0.14)", color: "#93b4ff" }}>
                        {badge}
                      </span>
                    )}
                  </button>
                  {manage && isOwner && app && (
                    <div className="flex items-center gap-1 pr-2">
                      <button onClick={() => toggleEnabled(app)} title={app.enabled ? "Disable" : "Enable"} className="size-7 grid place-items-center rounded-md hover:bg-white/5">
                        <Eye className="size-3.5" style={{ color: app.enabled ? SEC : MUTED }} />
                      </button>
                      <button onClick={() => handleUninstall(app.id, APP_MAP[key].name)} title="Remove" className="size-7 grid place-items-center rounded-md hover:bg-rose-500/10">
                        <Trash2 className="size-3.5" style={{ color: "#fb7185" }} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        {isOwner && (
          <div className="p-4 space-y-2 border-t" style={{ borderColor: BORDER }}>
            <button
              onClick={() => setShowAdd(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm lift"
              style={{ border: `1px solid ${BORDER}`, color: SEC, background: "transparent" }}
            >
              <Plus className="size-3.5" /> Add Feature
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

      {/* CENTER + RIGHT */}
      <div className="flex-1 min-w-0 flex">
        <main className="flex-1 min-w-0 overflow-y-auto">
          {active === "home"
            ? <HomeOverview store={store} isOwner={isOwner} viewerId={viewerId} onJoin={onJoin} onOpenApp={(k) => setActive({ kind: "app", key: k })} enabledKeys={enabledKeys} />
            : (
              <div className="p-8 max-w-5xl slide-up">
                <div className="mb-4"><AppHeader appKey={(active as any).key} /></div>
                <AppContent appKey={(active as any).key} store={store} isOwner={isOwner} />
              </div>
            )}
        </main>

        {active === "home" && (
          <aside
            className="hidden xl:flex w-[320px] shrink-0 flex-col border-l overflow-y-auto"
            style={{ borderColor: BORDER, background: BG }}
          >
            <RightRail store={store} isOwner={isOwner} viewerId={viewerId} onJoin={onJoin} />
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-2.5 py-2 border" style={{ borderColor: BORDER, background: CARD }}>
      <div className="text-[11px]" style={{ color: MUTED }}>{label}</div>
      <div className="text-sm font-medium mt-0.5" style={{ color: TEXT }}>{value}</div>
    </div>
  );
}

function SideItem({ icon: Icon, active, onClick, children }: { icon: any; active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm lift"
      style={{
        background: active ? "rgba(255,255,255,0.04)" : "transparent",
        color: active ? TEXT : SEC,
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = HOVER; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <Icon className="size-4" /> {children}
    </button>
  );
}

function HomeOverview({
  store, isOwner, viewerId, onJoin, onOpenApp, enabledKeys,
}: {
  store: Store;
  isOwner: boolean;
  viewerId: string | null;
  onJoin?: () => void;
  onOpenApp: (k: AppKey) => void;
  enabledKeys: Set<AppKey>;
}) {
  const initial = (store.name[0] ?? "S").toUpperCase();
  const memberCount = store.member_count ?? 1;

  const quick: { key: string; label: string; sub: string; Icon: any; appKey?: AppKey }[] = [
    { key: "chat", label: "Chat", sub: "Talk with members", Icon: MessagesSquare, appKey: "chat" },
    { key: "ann", label: "Announcements", sub: "Latest updates", Icon: Megaphone, appKey: "announcements" },
    { key: "res", label: "Resources", sub: "Tools & files", Icon: BookOpen, appKey: "resources" },
    { key: "dl", label: "Downloads", sub: "Grab the files", Icon: Download },
    { key: "faq", label: "FAQ", sub: "Get answers", Icon: HelpCircle, appKey: "faq" },
    { key: "forum", label: "Forum", sub: "Join discussion", Icon: MessageCircle, appKey: "forum" },
    { key: "rev", label: "Reviews", sub: "What members say", Icon: Star, appKey: "reviews" },
    { key: "ev", label: "Events", sub: "Upcoming meetups", Icon: Calendar },
    { key: "road", label: "Roadmap", sub: "What's coming", Icon: Map },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-10 py-8">
      {/* HERO BANNER */}
      <div
        className="relative rounded-[18px] overflow-hidden border slide-up"
        style={{ borderColor: BORDER, background: CARD, height: 260 }}
      >
        {store.banner_url ? (
          <img src={store.banner_url} alt="" className="absolute inset-0 size-full object-cover opacity-60" />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 800px 400px at 50% 120%, rgba(59,110,255,0.18) 0%, rgba(0,0,0,0) 60%), linear-gradient(180deg, rgba(11,11,11,0.2) 0%, rgba(5,5,5,0.9) 100%)",
          }}
        />
        {/* subtle grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="p" width="42" height="42" patternUnits="userSpaceOnUse">
              <path d="M 42 0 L 0 0 0 42" fill="none" stroke="white" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#p)" />
        </svg>
      </div>

      {/* IDENTITY ROW — flat on background, no card */}
      <div className="mt-6 flex flex-wrap items-center gap-5 slide-up slide-up-1">
        <div
          className="size-20 rounded-2xl overflow-hidden shrink-0 border"
          style={{ borderColor: BORDER, background: CARD }}
        >
          {store.logo_url
            ? <img src={store.logo_url} alt={store.name} className="size-full object-cover" />
            : <div className="size-full grid place-items-center text-2xl font-semibold">{initial}</div>}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight truncate" style={{ color: TEXT }}>{store.name}</h1>
            {store.verified && <BadgeCheck className="size-5" style={{ color: ACCENT }} />}
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
          {!isOwner ? (
            <button
              onClick={onJoin}
              disabled={!viewerId}
              className="rounded-xl px-4 py-2 text-sm font-medium lift disabled:opacity-50"
              style={{ background: "#1e3a8a", color: TEXT }}
            >
              Join Community
            </button>
          ) : (
            <Link
              to="/business/store/edit"
              className="rounded-xl px-4 py-2 text-sm font-medium lift"
              style={{ background: "#1e3a8a", color: TEXT }}
            >
              Edit store
            </Link>
          )}
          <button
            className="rounded-xl px-4 py-2 text-sm lift"
            style={{ border: `1px solid ${BORDER}`, color: SEC, background: "transparent" }}
          >
            Learn More
          </button>
        </div>
      </div>

      {/* WELCOME CARD */}
      <div
        className="mt-8 rounded-[18px] border p-8 slide-up slide-up-2"
        style={{ borderColor: BORDER, background: CARD }}
      >
        <div className="flex items-start gap-4">
          <div
            className="size-11 rounded-xl grid place-items-center shrink-0 border"
            style={{ borderColor: BORDER, background: "rgba(59,110,255,0.08)" }}
          >
            <Sparkles className="size-5" style={{ color: "#93b4ff" }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xl font-semibold tracking-tight" style={{ color: TEXT }}>
              Welcome to {store.name}
            </div>
            <p className="mt-2 text-sm leading-relaxed max-w-xl" style={{ color: SEC }}>
              A quiet, focused space for the community. Explore resources, join the conversation, and stay in the loop with everything new.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {!isOwner ? (
                <button
                  onClick={onJoin}
                  disabled={!viewerId}
                  className="rounded-xl px-4 py-2 text-sm font-medium lift disabled:opacity-50"
                  style={{ background: "#1e3a8a", color: TEXT }}
                >
                  Join Community
                </button>
              ) : null}
              <button
                className="rounded-xl px-4 py-2 text-sm lift"
                style={{ border: `1px solid ${BORDER}`, color: SEC, background: "transparent" }}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACCESS */}
      <div className="mt-10 slide-up slide-up-3">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium" style={{ color: TEXT }}>Quick access</div>
          <div className="text-xs" style={{ color: MUTED }}>Jump to a section</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {quick.map(({ key, label, sub, Icon, appKey }) => (
            <button
              key={key}
              onClick={() => appKey && enabledKeys.has(appKey) && onOpenApp(appKey)}
              className="text-left rounded-[18px] border p-4 lift group"
              style={{ borderColor: BORDER, background: CARD }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = CARD)}
            >
              <div
                className="size-9 rounded-lg grid place-items-center mb-3 border transition-transform"
                style={{ borderColor: BORDER, background: "rgba(255,255,255,0.02)" }}
              >
                <Icon className="size-4" style={{ color: SEC }} />
              </div>
              <div className="text-sm font-medium" style={{ color: TEXT }}>{label}</div>
              <div className="text-[11px] mt-0.5" style={{ color: MUTED }}>{sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* LATEST UPDATES — TIMELINE */}
      <div className="mt-12 slide-up slide-up-4">
        <div className="flex items-center justify-between mb-5">
          <div className="text-sm font-medium" style={{ color: TEXT }}>Latest updates</div>
          <button className="text-xs" style={{ color: MUTED }}>View all</button>
        </div>
        <div className="relative pl-6">
          <div className="absolute left-2 top-1 bottom-1 w-px" style={{ background: BORDER }} />
          <TimelineItem
            Icon={Megaphone}
            tag="Announcement"
            title={`Welcome to ${store.name}`}
            desc="A short note to help you get oriented and make the most of the space."
            date="2d ago"
            author="Founder"
            pinned
          />
          <TimelineItem
            Icon={BookOpen}
            tag="Resource"
            title="Starter pack (2025)"
            desc="Essential tools and guides curated for members starting out."
            date="5d ago"
            author="Team"
          />
          <TimelineItem
            Icon={Calendar}
            tag="Event"
            title="Community office hours"
            desc="Weekly Thursdays. Bring your questions, we'll cover live."
            date="1w ago"
            author="Host"
          />
          <TimelineItem
            Icon={Rocket}
            tag="Release"
            title="v1.4 improvements"
            desc="Faster search, cleaner threads, better mobile spacing."
            date="2w ago"
            author="Engineering"
          />
        </div>
      </div>

      <div className="h-12" />
    </div>
  );
}

function TimelineItem({
  Icon, tag, title, desc, date, author, pinned,
}: {
  Icon: any; tag: string; title: string; desc: string; date: string; author: string; pinned?: boolean;
}) {
  return (
    <div className="relative py-4">
      <div
        className="absolute -left-6 top-5 size-4 rounded-full border grid place-items-center"
        style={{ borderColor: BORDER, background: BG }}
      >
        <div className="size-1.5 rounded-full" style={{ background: ACCENT }} />
      </div>
      <div className="rounded-[18px] border p-4 lift" style={{ borderColor: BORDER, background: CARD }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = CARD)}
      >
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg grid place-items-center shrink-0 border"
            style={{ borderColor: BORDER, background: "rgba(255,255,255,0.02)" }}>
            <Icon className="size-4" style={{ color: SEC }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] rounded-md px-1.5 py-0.5 border" style={{ borderColor: BORDER, color: SEC }}>{tag}</span>
              {pinned && <span className="text-[10px] rounded-md px-1.5 py-0.5" style={{ background: "rgba(59,110,255,0.12)", color: "#93b4ff" }}>Pinned</span>}
              <span className="text-[11px] ml-auto" style={{ color: MUTED }}>{date}</span>
            </div>
            <div className="mt-1.5 font-medium text-sm" style={{ color: TEXT }}>{title}</div>
            <div className="mt-0.5 text-xs" style={{ color: SEC }}>{desc}</div>
            <div className="mt-2 text-[11px]" style={{ color: MUTED }}>By {author}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RightRail({
  store, isOwner, viewerId, onJoin,
}: {
  store: Store; isOwner: boolean; viewerId: string | null; onJoin?: () => void;
}) {
  void isOwner; void viewerId; void onJoin;
  return (
    <div className="p-6 space-y-4">
      {/* Store overview */}
      <RailCard title="Store Overview">
        <RailRow label="Members" value={(store.member_count ?? 1).toLocaleString()} />
        <RailRow label="Products" value="3" />
        <RailRow label="Reviews" value="128" />
        <RailRow label="Owner" value={`@${store.slug}`} />
        <RailRow label="Created" value="Jan 2025" />
        <RailRow label="Category" value={store.category ?? "General"} />
        <RailRow label="Status" value={
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400" /> Active
          </span>
        } />
      </RailCard>

      {/* Community status */}
      <RailCard title="Community Status">
        <RailRow label={<span className="inline-flex items-center gap-2"><Activity className="size-3.5" style={{ color: MUTED }} /> Online</span>} value="42 members" />
        <RailRow label={<span className="inline-flex items-center gap-2"><Clock className="size-3.5" style={{ color: MUTED }} /> Response</span>} value="< 1h avg" />
        <RailRow label={<span className="inline-flex items-center gap-2"><ShieldCheck className="size-3.5" style={{ color: MUTED }} /> Health</span>} value={
          <span style={{ color: "#93b4ff" }}>Excellent</span>
        } />
      </RailCard>

      {/* Social */}
      <RailCard title="Social">
        <div className="flex items-center gap-2 flex-wrap">
          <SocialDot Icon={MessagesSquare} />
          <SocialDot Icon={ArrowUpRight} label="X" />
          <SocialDot Icon={Youtube} />
          <SocialDot Icon={Instagram} />
          <SocialDot Icon={Music2} />
          <SocialDot Icon={Globe} />
        </div>
      </RailCard>
    </div>
  );
}

function RailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] border p-5" style={{ borderColor: BORDER, background: CARD }}>
      <div className="text-xs mb-3" style={{ color: MUTED }}>{title}</div>
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
function SocialDot({ Icon, label }: { Icon: any; label?: string }) {
  return (
    <button
      title={label}
      className="size-9 rounded-full grid place-items-center border lift"
      style={{ borderColor: BORDER, background: "transparent", color: SEC }}
      onMouseEnter={(e) => (e.currentTarget.style.background = HOVER)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon className="size-4" />
    </button>
  );
}

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
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl max-h-[85vh] rounded-[18px] border shadow-2xl flex flex-col overflow-hidden"
        style={{ borderColor: BORDER, background: BG }}
      >
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: BORDER }}>
          <div>
            <div className="text-lg font-semibold" style={{ color: TEXT }}>Add a feature</div>
            <div className="text-xs mt-0.5" style={{ color: MUTED }}>Extend your store with prebuilt apps</div>
          </div>
          <button onClick={onClose} className="size-9 grid place-items-center rounded-full hover:bg-white/5"><X className="size-4" /></button>
        </div>
        <div className="p-5 border-b" style={{ borderColor: BORDER }}>
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
            <div key={def.key} className="rounded-[18px] border p-4 flex flex-col"
              style={{ borderColor: BORDER, background: CARD }}
            >
              <div className="flex items-start justify-between gap-3">
                <img src={def.logo} alt="" loading="lazy" width={40} height={40} className="size-10 rounded-xl object-contain shrink-0" />
                <button
                  disabled={busy === def.key}
                  onClick={async () => { setBusy(def.key); await onInstall(def.key); setBusy(null); }}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1 disabled:opacity-50"
                  style={{ background: "#1e3a8a", color: TEXT }}
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
        <div className="p-3 border-t text-[11px] text-center" style={{ borderColor: BORDER, color: MUTED }}>
          {installedCount} app{installedCount === 1 ? "" : "s"} installed
        </div>
      </div>
    </div>
  );
}
