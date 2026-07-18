import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Store } from "@/lib/business";
import {
  Home as HomeIcon, Plus, BadgeCheck, Loader2, TrendingUp,
  Share2, MoreHorizontal, Users, Package, Star,
  ArrowRight, MessagesSquare, Megaphone, MessageCircle,
  BookOpen, HelpCircle, Info, Eye, Trash2, GripVertical, X, Check, Search,
  Hash,
} from "lucide-react";
import {
  APP_CATALOG, APP_MAP, type AppKey, type StoreApp,
  getInstalledApps, installApp, uninstallApp, setAppEnabled,
} from "@/lib/store-apps";
import { AppContent, AppHeader } from "@/components/store/AppContent";
import { toast } from "sonner";

type ActiveView = "home" | { kind: "app"; key: AppKey };

// Brand gradient used across site (nav / signup / logo)
const BRAND_GRADIENT = "linear-gradient(135deg, #5A24B8 0%, #4730D8 45%, #1F55F5 100%)";
const BRAND_GRADIENT_H = "linear-gradient(90deg, #5A24B8 0%, #4730D8 42%, #1F55F5 100%)";

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

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-[calc(100vh-5rem)] bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r border-white/[0.06] bg-black/40 flex flex-col">
        <div className="p-5">
          {/* Store card */}
          <div className="flex items-start gap-3">
            <div
              className="size-14 rounded-2xl overflow-hidden shrink-0 ring-1 ring-white/10"
              style={{ background: BRAND_GRADIENT }}
            >
              {store.logo_url
                ? <img src={store.logo_url} alt={store.name} className="size-full object-cover" />
                : <div className="size-full grid place-items-center text-xl font-bold text-white">{store.name[0]?.toUpperCase()}</div>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <div className="font-semibold truncate">{store.name}</div>
                {store.verified && <BadgeCheck className="size-4 text-sky-400 shrink-0" />}
              </div>
              <div className="text-xs text-muted-foreground truncate">@{store.slug}</div>
            </div>
          </div>

          {store.description && (
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {store.description}
            </p>
          )}

          {isOwner && (
            <Link
              to="/business"
              className="mt-4 w-full inline-flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition"
            >
              <span>View analytics</span>
              <TrendingUp className="size-3.5 text-muted-foreground" />
            </Link>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
          <SideItem icon={HomeIcon} active={active === "home"} onClick={() => setActive("home")}>Home</SideItem>

          {loading ? (
            <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="size-3 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              {(manage ? apps : enabledApps).map((a) => {
                const def = APP_MAP[a.app_key];
                if (!def) return null;
                const isActive = typeof active !== "string" && active.kind === "app" && active.key === a.app_key;
                const badge = a.app_key === "announcements" ? 2 : undefined;
                return (
                  <div key={a.id} className={`group flex items-center rounded-xl ${isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"} transition`}>
                    <button
                      onClick={() => setActive({ kind: "app", key: a.app_key })}
                      className={`flex-1 flex items-center gap-3 px-3 py-2 text-sm ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"} ${!a.enabled ? "opacity-50" : ""} text-left`}
                    >
                      {manage && <GripVertical className="size-3 text-muted-foreground/40" />}
                      <AppIcon appKey={a.app_key} />
                      <span className="truncate flex-1">{def.name}</span>
                      {badge !== undefined && !manage && (
                        <span
                          className="ml-auto text-[10px] font-semibold rounded-full px-1.5 py-0.5 text-white"
                          style={{ background: BRAND_GRADIENT_H }}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                    {manage && isOwner && (
                      <div className="flex items-center gap-1 pr-2">
                        <button onClick={() => toggleEnabled(a)} title={a.enabled ? "Disable" : "Enable"} className="size-7 grid place-items-center rounded-md hover:bg-white/10">
                          <Eye className={`size-3.5 ${a.enabled ? "text-muted-foreground" : "text-muted-foreground/40"}`} />
                        </button>
                        <button onClick={() => handleUninstall(a.id, def.name)} title="Remove" className="size-7 grid place-items-center rounded-md hover:bg-rose-500/15 text-rose-400">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {isOwner && (
            <div className="pt-3 space-y-2">
              <button
                onClick={() => setShowAdd(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition border border-dashed border-white/15 hover:border-white/25"
                style={{ borderColor: "rgba(90,36,184,0.35)" }}
              >
                <Plus className="size-3.5" />
                <span>Add feature</span>
              </button>
              {apps.length > 0 && (
                <button
                  onClick={() => setManage(m => !m)}
                  className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground py-1"
                >
                  {manage ? "Done managing" : "Manage features"}
                </button>
              )}
            </div>
          )}
        </nav>

        {/* Footer status */}
        <div className="p-4 border-t border-white/[0.06] text-[11px] text-muted-foreground space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Community is active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span>Avg. response time &lt; 1h</span>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 overflow-y-auto">
          {active === "home"
            ? <HomeOverview store={store} apps={enabledApps} isOwner={isOwner} viewerId={viewerId} onJoin={onJoin} onOpenApp={(k) => setActive({ kind: "app", key: k })} />
            : (
              <div className="p-6 sm:p-8">
                <div className="mb-4"><AppHeader appKey={(active as any).key} /></div>
                <AppContent appKey={(active as any).key} store={store} isOwner={isOwner} />
              </div>
            )}
        </main>
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

function SideItem({ icon: Icon, active, onClick, children }: { icon: any; active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${active ? "bg-white/[0.06] text-foreground" : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"}`}
    >
      <Icon className="size-4" /> {children}
    </button>
  );
}

function AppIcon({ appKey }: { appKey: AppKey }) {
  const map: Partial<Record<AppKey, any>> = {
    chat: MessagesSquare,
    announcements: Megaphone,
    forum: MessageCircle,
    resources: BookOpen,
    faq: HelpCircle,
    reviews: Star,
    about: Info,
  };
  const Icon = map[appKey] ?? Hash;
  return <Icon className="size-4" />;
}

function HomeOverview({
  store, apps, isOwner, viewerId, onJoin, onOpenApp,
}: {
  store: Store;
  apps: StoreApp[];
  isOwner: boolean;
  viewerId: string | null;
  onJoin?: () => void;
  onOpenApp: (k: AppKey) => void;
}) {
  const initial = (store.name[0] ?? "S").toUpperCase();
  const memberCount = store.member_count ?? 1;
  const productCount = 3; // demo placeholder — real count wired elsewhere
  const rating = 4.9;
  const reviews = 128;

  const has = (k: AppKey) => apps.some(a => a.app_key === k);
  const quickAccess: { key: AppKey; label: string; sub: string; Icon: any }[] = [
    { key: "chat", label: "Start chat", sub: "Talk with members", Icon: MessagesSquare },
    { key: "announcements", label: "Latest update", sub: "See what's new", Icon: Megaphone },
    { key: "resources", label: "Resources", sub: "Tools & files", Icon: BookOpen },
    { key: "faq", label: "FAQ", sub: "Get answers", Icon: HelpCircle },
    { key: "forum", label: "Community", sub: "Join the discussion", Icon: Hash },
  ].filter(q => has(q.key) || ["chat","announcements","resources","faq","forum"].includes(q.key));

  return (
    <div className="p-6 sm:p-8 max-w-6xl">
      {/* Banner with glowing logo */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.06]">
        <div
          className="h-56 sm:h-72 relative"
          style={{
            background:
              "radial-gradient(ellipse at 50% 65%, rgba(71,48,216,0.35) 0%, rgba(31,85,245,0.15) 30%, rgba(0,0,0,0) 65%), #0a0a0f",
          }}
        >
          {/* faint mountain silhouette */}
          <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="absolute bottom-0 inset-x-0 w-full h-24 opacity-40">
            <path d="M0,200 L120,120 L200,150 L320,80 L420,130 L520,90 L640,140 L760,100 L800,120 L800,200 Z" fill="rgba(255,255,255,0.04)" />
            <path d="M0,200 L80,150 L180,170 L280,110 L400,160 L500,130 L620,170 L720,140 L800,160 L800,200 Z" fill="rgba(255,255,255,0.03)" />
          </svg>
          {/* central logo halo */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative">
              <div
                className="absolute inset-0 -m-8 rounded-full blur-3xl opacity-70"
                style={{ background: BRAND_GRADIENT }}
              />
              <div
                className="relative size-24 sm:size-28 rounded-2xl overflow-hidden ring-1 ring-white/15 shadow-2xl grid place-items-center text-3xl font-bold text-white"
                style={{ background: BRAND_GRADIENT }}
              >
                {store.logo_url
                  ? <img src={store.logo_url} alt={store.name} className="size-full object-cover" />
                  : initial}
              </div>
            </div>
          </div>
          {/* arch line */}
          <div
            className="absolute left-1/2 top-6 -translate-x-1/2 size-72 rounded-full border border-white/10"
            style={{ borderColor: "rgba(71,48,216,0.35)" }}
          />
        </div>
      </div>

      {/* Identity row */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div
          className="size-20 rounded-2xl overflow-hidden ring-1 ring-white/10 shrink-0 grid place-items-center text-2xl font-bold text-white"
          style={{ background: BRAND_GRADIENT }}
        >
          {store.logo_url
            ? <img src={store.logo_url} alt={store.name} className="size-full object-cover" />
            : initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold truncate">{store.name}</h1>
            {store.verified && <BadgeCheck className="size-5 text-sky-400" />}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span>@{store.slug}</span>
            <span className="opacity-40">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Package className="size-3.5" /> Created by
              <span
                className="size-4 rounded-full ring-1 ring-white/10"
                style={{ background: BRAND_GRADIENT }}
              />
              <span className="text-foreground font-medium">owner</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconBtn title="Share"><Share2 className="size-4" /></IconBtn>
          <IconBtn title="More"><MoreHorizontal className="size-4" /></IconBtn>
          {!isOwner && (
            <button
              onClick={onJoin}
              disabled={!viewerId}
              className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition hover:-translate-y-0.5"
              style={{
                background: BRAND_GRADIENT_H,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.08), 0 6px 16px rgba(0,0,0,.35), 0 0 18px rgba(47,96,255,.18)",
              }}
            >
              Join store
            </button>
          )}
          {isOwner && (
            <Link
              to="/business/store/edit"
              className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              style={{
                background: BRAND_GRADIENT_H,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.08), 0 6px 16px rgba(0,0,0,.35), 0 0 18px rgba(47,96,255,.18)",
              }}
            >
              Edit store
            </Link>
          )}
        </div>
      </div>

      {/* Meta chips */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <Chip><Users className="size-3.5 text-muted-foreground" /> <span className="font-semibold">{memberCount.toLocaleString()}</span> <span className="text-muted-foreground">Members</span></Chip>
        <Chip><Package className="size-3.5 text-muted-foreground" /> <span className="font-semibold">{productCount}</span> <span className="text-muted-foreground">Products</span></Chip>
        <Chip><Star className="size-3.5 text-amber-400 fill-amber-400" /> <span className="font-semibold">{rating}</span> <span className="text-muted-foreground">({reviews} reviews)</span></Chip>
      </div>

      {/* Welcome card */}
      <div
        className="mt-6 rounded-2xl border p-5 sm:p-6 flex items-center gap-5 flex-wrap"
        style={{
          borderColor: "rgba(90,36,184,0.25)",
          background:
            "linear-gradient(90deg, rgba(90,36,184,0.10) 0%, rgba(31,85,245,0.05) 100%)",
        }}
      >
        <div
          className="size-14 rounded-2xl grid place-items-center shrink-0 ring-1 ring-white/10"
          style={{ background: BRAND_GRADIENT }}
        >
          <Users className="size-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold">Welcome to {store.name}</div>
          <div className="text-sm text-muted-foreground mt-1">
            Get access to exclusive content, resources and a community that helps you grow faster.
          </div>
        </div>
        <button
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          style={{
            background: BRAND_GRADIENT_H,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.08), 0 4px 12px rgba(31,85,245,.25)",
          }}
        >
          Start here <ArrowRight className="size-4" />
        </button>
      </div>

      {/* Quick access */}
      <div className="mt-8">
        <div className="text-sm font-semibold mb-3">Quick access</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickAccess.map(({ key, label, sub, Icon }) => (
            <button
              key={key}
              onClick={() => onOpenApp(key)}
              className="text-left rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition p-4 group"
            >
              <div
                className="size-9 rounded-xl grid place-items-center mb-3 ring-1 ring-white/10 group-hover:scale-105 transition"
                style={{ background: "rgba(71,48,216,0.15)" }}
              >
                <Icon className="size-4 text-white/90" />
              </div>
              <div className="text-sm font-semibold">{label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent updates */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">Recent updates</div>
          <button className="text-xs text-muted-foreground hover:text-foreground">View all</button>
        </div>
        <div className="space-y-2">
          <UpdateRow
            tag="Announcement"
            tagColor="rgba(90,36,184,0.20)"
            title={`Welcome to ${store.name}! 🚀`}
            desc="Read this to get started and make the most out of the community."
            time="2d ago"
            Icon={Megaphone}
          />
          <UpdateRow
            tag="Resource"
            tagColor="rgba(31,85,245,0.18)"
            title="Starter Pack (2025)"
            desc="All the essential tools and guides to start your journey."
            time="5d ago"
            Icon={BookOpen}
            badge="Free"
          />
        </div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs">
      {children}
    </span>
  );
}

function IconBtn({ children, title }: { children: React.ReactNode; title?: string }) {
  return <button title={title} className="size-9 grid place-items-center rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition">{children}</button>;
}

function UpdateRow({
  tag, tagColor, title, desc, time, Icon, badge,
}: {
  tag: string; tagColor: string; title: string; desc: string; time: string; Icon: any; badge?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-start gap-4 hover:bg-white/[0.04] transition">
      <div
        className="size-11 rounded-xl grid place-items-center shrink-0 ring-1 ring-white/10"
        style={{ background: tagColor }}
      >
        <Icon className="size-5 text-white/90" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[10px] uppercase tracking-wider font-semibold rounded-md px-1.5 py-0.5 text-white/90"
            style={{ background: tagColor }}
          >
            {tag}
          </span>
        </div>
        <div className="font-semibold text-sm flex items-center gap-2">
          {title}
          {badge && <span className="text-[10px] rounded-md px-1.5 py-0.5 bg-sky-500/15 text-sky-300 font-semibold">{badge}</span>}
        </div>
        <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{desc}</div>
      </div>
      <div className="text-[11px] text-muted-foreground shrink-0">{time}</div>
    </div>
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
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl max-h-[85vh] rounded-3xl border border-white/10 bg-background shadow-2xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Add a feature</div>
            <div className="text-xs text-muted-foreground mt-0.5">Extend your store with prebuilt apps</div>
          </div>
          <button onClick={onClose} className="size-9 grid place-items-center rounded-full hover:bg-white/5"><X className="size-4" /></button>
        </div>
        <div className="p-5 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search apps…" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 outline-none text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-sm text-muted-foreground py-10">
              {available.length === 0 ? "All apps already installed." : "No apps match your search."}
            </div>
          )}
          {filtered.map((def) => (
            <div key={def.key} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <img src={def.logo} alt="" loading="lazy" width={40} height={40} className="size-10 rounded-xl object-contain shrink-0" />
                <button
                  disabled={busy === def.key}
                  onClick={async () => { setBusy(def.key); await onInstall(def.key); setBusy(null); }}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-50 text-white"
                  style={{ background: BRAND_GRADIENT_H }}
                >
                  {busy === def.key ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                  Add
                </button>
              </div>
              <div className="mt-3 font-semibold flex items-center gap-2">
                {def.name}
                {def.default && <span className="text-[9px] uppercase tracking-wider rounded-full bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 flex items-center gap-0.5"><Check className="size-2.5" /> Default</span>}
              </div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{def.description}</div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-white/10 text-[11px] text-muted-foreground text-center">
          {installedCount} app{installedCount === 1 ? "" : "s"} installed
        </div>
      </div>
    </div>
  );
}
