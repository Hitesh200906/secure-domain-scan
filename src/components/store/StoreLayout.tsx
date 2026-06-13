import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Store } from "@/lib/business";
import {
  Home as HomeIcon, LayoutDashboard, Plus, Bell, Search, Link2, Users,
  Edit3, BadgeCheck, Eye, Trash2, GripVertical, X, Check, Loader2,
  MapPin, Instagram, Image as ImageIcon, Smile, BarChart3 as PollIcon,
  DollarSign, Video, UserPlus, MoreHorizontal,
} from "lucide-react";
import {
  APP_CATALOG, APP_MAP, type AppKey, type StoreApp,
  getInstalledApps, installApp, uninstallApp, setAppEnabled,
} from "@/lib/store-apps";
import { AppContent, AppHeader } from "@/components/store/AppContent";
import { toast } from "sonner";

type ActiveView = "home" | { kind: "app"; key: AppKey };

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

  const theme = store.theme_color ?? "#7c3aed";
  const accent = store.accent_color ?? "#22d3ee";

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-[calc(100vh-5rem)] bg-background flex">
      {/* Left store sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/10 bg-black/30 flex flex-col">
        <div className="p-3 border-b border-white/10 flex items-center gap-2">
          <div className="size-9 rounded-xl overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${theme}, ${accent})` }}>
            {store.logo_url ? <img src={store.logo_url} alt={store.name} className="size-full object-cover" /> : <div className="size-full grid place-items-center text-sm font-bold text-white">{store.name[0]?.toUpperCase()}</div>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">{store.name}</div>
            <div className="text-[11px] text-muted-foreground truncate">/{store.slug}</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <SideItem icon={HomeIcon} active={active === "home"} onClick={() => setActive("home")}>Home</SideItem>
          {isOwner && (
            <Link to="/business" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition">
              <LayoutDashboard className="size-4" /> Dashboard
            </Link>
          )}

          <div className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground/70 flex items-center justify-between">
            <span>Apps</span>
            {isOwner && apps.length > 0 && (
              <button onClick={() => setManage(m => !m)} className="text-[10px] hover:text-foreground">
                {manage ? "Done" : "Manage"}
              </button>
            )}
          </div>

          {loading ? (
            <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="size-3 animate-spin" /> Loading…</div>
          ) : (
            <>
              {(manage ? apps : enabledApps).map((a) => {
                const def = APP_MAP[a.app_key];
                if (!def) return null;
                const Icon = def.icon;
                const isActive = typeof active !== "string" && active.kind === "app" && active.key === a.app_key;
                return (
                  <div key={a.id} className={`group flex items-center rounded-xl ${isActive ? "bg-white/[0.08]" : "hover:bg-white/5"} transition`}>
                    <button
                      onClick={() => setActive({ kind: "app", key: a.app_key })}
                      className={`flex-1 flex items-center gap-3 px-3 py-2 text-sm ${isActive ? "text-foreground" : "text-muted-foreground"} ${!a.enabled ? "opacity-50" : ""} text-left`}
                    >
                      {manage && <GripVertical className="size-3 text-muted-foreground/40" />}
                      <img src={def.logo} alt="" loading="lazy" width={24} height={24} className="size-6 rounded-lg object-contain shrink-0" />
                      <span className="truncate flex-1">{def.name}</span>
                    </button>
                    {manage && isOwner && (
                      <div className="flex items-center gap-1 pr-2">
                        <button onClick={() => toggleEnabled(a)} title={a.enabled ? "Disable" : "Enable"} className="size-7 grid place-items-center rounded-md hover:bg-white/10">
                          {a.enabled ? <Eye className="size-3.5 text-muted-foreground" /> : <Eye className="size-3.5 text-muted-foreground/40" />}
                        </button>
                        <button onClick={() => handleUninstall(a.id, def.name)} title="Remove" className="size-7 grid place-items-center rounded-md hover:bg-rose-500/15 text-rose-400">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {isOwner && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="w-full mt-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition border border-dashed border-white/10"
                >
                  <span className="size-6 rounded-lg grid place-items-center bg-white/5"><Plus className="size-3.5" /></span>
                  Add app
                </button>
              )}
            </>
          )}
        </nav>
      </aside>

      {/* Right content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 sm:px-6 sticky top-20 bg-background/95 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            {active === "home" ? (
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme}, ${accent})` }}>
                  {store.logo_url ? <img src={store.logo_url} alt="" className="size-full object-cover" /> : null}
                </div>
                <div className="font-semibold">{store.name}</div>
                {store.verified && <BadgeCheck className="size-4 text-sky-400" />}
              </div>
            ) : (
              <AppHeader appKey={(active as any).key} />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <IconBtn title="Search"><Search className="size-4" /></IconBtn>
            <IconBtn title="Share"><Link2 className="size-4" /></IconBtn>
            <IconBtn title="Members"><Users className="size-4" /></IconBtn>
            <IconBtn title="Notifications"><Bell className="size-4" /></IconBtn>
            {isOwner ? (
              <Link to="/business/store/edit" className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold">
                <Edit3 className="size-3.5" /> Edit
              </Link>
            ) : (
              <button onClick={onJoin} disabled={!viewerId} className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-white text-black px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
                <Plus className="size-3.5" /> Join
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {active === "home"
            ? <HomeOverview store={store} apps={enabledApps} onOpenApp={(k) => setActive({ kind: "app", key: k })} />
            : <AppContent appKey={(active as any).key} store={store} isOwner={isOwner} />}
        </main>
      </div>

      {/* Add app modal */}
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
    <button onClick={onClick} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${active ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}>
      <Icon className="size-4" /> {children}
    </button>
  );
}

function IconBtn({ children, title }: { children: React.ReactNode; title?: string }) {
  return <button title={title} className="size-9 grid place-items-center rounded-full hover:bg-white/[0.08] text-muted-foreground hover:text-foreground transition">{children}</button>;
}

function HomeOverview({ store, apps, onOpenApp }: { store: Store; apps: StoreApp[]; onOpenApp: (k: AppKey) => void }) {
  const theme = store.theme_color ?? "#7c3aed";
  const accent = store.accent_color ?? "#22d3ee";
  const [tab, setTab] = useState<"home" | "chats" | "apps" | "products" | "about">("home");
  const [post, setPost] = useState("");

  const TABS: { key: typeof tab; label: string }[] = [
    { key: "home", label: "Home" },
    { key: "chats", label: "Chats" },
    { key: "apps", label: "Apps" },
    { key: "products", label: "Products" },
    { key: "about", label: "About" },
  ];

  return (
    <div className="-mx-6 sm:-mx-8 -mt-6 sm:-mt-8">
      {/* Banner */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        {store.banner_url
          ? <img src={store.banner_url} alt="" className="absolute inset-0 size-full object-cover" />
          : <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${theme}, ${accent})` }} />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="px-6 sm:px-10 max-w-5xl">
        {/* Logo overlapping banner */}
        <div className="-mt-16 mb-5">
          <div className="size-28 rounded-3xl ring-4 ring-background overflow-hidden shadow-2xl" style={{ background: `linear-gradient(135deg, ${theme}, ${accent})` }}>
            {store.logo_url
              ? <img src={store.logo_url} alt={store.name} className="size-full object-cover" />
              : <div className="size-full grid place-items-center text-3xl font-bold text-white">{store.name[0]?.toUpperCase()}</div>}
          </div>
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {store.name}
              {store.verified && <BadgeCheck className="size-6 text-sky-400" />}
            </h1>
            {store.description && <p className="mt-2 text-muted-foreground max-w-2xl">{store.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <IconBtn title="Invite"><UserPlus className="size-4" /></IconBtn>
            <IconBtn title="Notifications"><Bell className="size-4" /></IconBtn>
            <IconBtn title="More"><MoreHorizontal className="size-4" /></IconBtn>
            <button className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold">
              Add team <Plus className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" /> Location hidden</span>
          <span className="opacity-50">•</span>
          <a className="inline-flex items-center hover:text-foreground" href="#"><Instagram className="size-4" /></a>
          <a className="inline-flex items-center hover:text-foreground text-xs font-semibold" href="#">TikTok</a>
          <span className="opacity-50">•</span>
          <span className="inline-flex items-center gap-1.5">
            Created by
            <span className="size-5 rounded-full overflow-hidden inline-block" style={{ background: `linear-gradient(135deg, ${theme}, ${accent})` }} />
            <span className="text-foreground font-medium">owner</span>
          </span>
        </div>

        <div className="mt-3 text-sm">
          <span className="font-semibold">{store.member_count ?? 1}</span>{" "}
          <span className="text-muted-foreground">member{(store.member_count ?? 1) === 1 ? "" : "s"}</span>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-white/10 flex items-center gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3 text-sm font-medium relative transition ${tab === t.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.label}
              {tab === t.key && <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="py-6">
          {tab === "home" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, ${theme}, ${accent})` }} />
                  <input
                    value={post}
                    onChange={e => setPost(e.target.value)}
                    placeholder="What's on your mind?"
                    className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground py-2"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sky-400">
                    <ComposerBtn><ImageIcon className="size-5" /></ComposerBtn>
                    <ComposerBtn><span className="size-5 grid place-items-center text-[9px] font-bold tracking-wider border-[1.75px] border-current rounded-[5px] leading-none">GIF</span></ComposerBtn>
                    <ComposerBtn><Smile className="size-5" /></ComposerBtn>
                    <ComposerBtn><PollIcon className="size-5" /></ComposerBtn>
                    <ComposerBtn><DollarSign className="size-5" /></ComposerBtn>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 text-rose-400 px-3 py-1.5 text-xs font-semibold">
                      <Video className="size-3.5" /> Go live
                    </button>
                    <button disabled={!post.trim()} className="rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm font-semibold disabled:opacity-50">
                      Post
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2 w-1/3 bg-white/10 rounded" />
                    <div className="h-2 w-1/5 bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "chats" && <EmptyTab label="Chats" />}

          {tab === "apps" && (
            apps.length === 0 ? <EmptyTab label="Apps" /> : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {apps.map(a => {
                  const def = APP_MAP[a.app_key];
                  if (!def) return null;
                  return (
                    <button key={a.id} onClick={() => onOpenApp(a.app_key)} className="text-left rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition p-4 flex items-center gap-3">
                      <img src={def.logo} alt="" loading="lazy" width={40} height={40} className="size-10 rounded-xl object-contain shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{def.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{def.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          )}

          {tab === "products" && <EmptyTab label="Products" />}
          {tab === "about" && (
            <p className="text-muted-foreground">{store.description || "No description yet."}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ComposerBtn({ children }: { children: React.ReactNode }) {
  return <button className="size-9 grid place-items-center rounded-full hover:bg-white/[0.06] transition">{children}</button>;
}

function EmptyTab({ label }: { label: string }) {
  return <div className="py-16 text-center text-sm text-muted-foreground">No {label.toLowerCase()} yet.</div>;
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
            <div className="text-xl font-semibold">App store</div>
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
          {filtered.map((def) => {
            return (
              <div key={def.key} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <img src={def.logo} alt="" loading="lazy" width={40} height={40} className="size-10 rounded-xl object-contain shrink-0" />
                  <button
                    disabled={busy === def.key}
                    onClick={async () => { setBusy(def.key); await onInstall(def.key); setBusy(null); }}
                    className="rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-50"
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
            );
          })}
        </div>
        <div className="p-3 border-t border-white/10 text-[11px] text-muted-foreground text-center">
          {installedCount} app{installedCount === 1 ? "" : "s"} installed
        </div>
      </div>
    </div>
  );
}
