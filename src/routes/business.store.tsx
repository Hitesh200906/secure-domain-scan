import { useStore } from "@/lib/store-context";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/business";
import { getStoreProducts } from "@/lib/business";
import {
  BadgeCheck, MapPin, Instagram, Github, Linkedin, Twitter, Globe,
  UserPlus, Bell, MoreHorizontal, Plus, Home as HomeIcon,
  MessagesSquare, LayoutGrid, Package, Info, Image as ImageIcon, Smile, Send,
  ExternalLink, Settings,
} from "lucide-react";

export const Route = createFileRoute("/business/store")({ component: StoreInterior });

type Tab = "home" | "chats" | "apps" | "products" | "about";

function StoreInterior() {
  const store = useStore();
  const [tab, setTab] = useState<Tab>("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [ownerName, setOwnerName] = useState<string>("");

  useEffect(() => {
    getStoreProducts(store.id).then(setProducts);
    supabase.from("profiles").select("full_name").eq("id", store.owner_id).maybeSingle()
      .then(({ data }) => setOwnerName(((data as any)?.full_name as string) ?? ""));
  }, [store.id, store.owner_id]);

  const theme = store.theme_color ?? "#7c3aed";
  const accent = store.accent_color ?? "#22d3ee";
  const socials = (store.social_links ?? {}) as Record<string, string>;
  const tagline = (store as any).tagline ?? store.description ?? "";

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-[calc(100vh-5rem)] bg-background">
      {/* Banner */}
      <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden">
        {store.banner_url ? (
          <img src={store.banner_url} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${theme}, ${accent})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      {/* Header row */}
      <div className="px-4 sm:px-8 -mt-12 sm:-mt-14 relative">
        <div className="flex items-end justify-between gap-4">
          <div className="size-24 sm:size-28 rounded-3xl ring-4 ring-background overflow-hidden shrink-0 shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${theme}, ${accent})` }}>
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="size-full object-cover" />
            ) : (
              <div className="size-full grid place-items-center text-3xl font-bold text-white">
                {store.name[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-1">
            <IconBtn title="Invite"><UserPlus className="size-4" /></IconBtn>
            <IconBtn title="Notifications"><Bell className="size-4" /></IconBtn>
            <IconBtn title="More"><MoreHorizontal className="size-4" /></IconBtn>
            <Link
              to="/business/store/edit"
              className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition"
            >
              <Settings className="size-3.5" /> Edit
            </Link>
          </div>
        </div>

        {/* Identity */}
        <div className="mt-5">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{store.name}</h1>
            {store.verified && <BadgeCheck className="size-6 text-sky-400" />}
          </div>
          {tagline && (
            <p className="mt-2 text-base text-foreground/85 max-w-3xl">{tagline}</p>
          )}

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" /> Location hidden
            </span>
            <Dot />
            <div className="flex items-center gap-2">
              {socials.instagram && <SocialMini href={socials.instagram}><Instagram className="size-4" /></SocialMini>}
              {socials.x && <SocialMini href={socials.x}><Twitter className="size-4" /></SocialMini>}
              {socials.github && <SocialMini href={socials.github}><Github className="size-4" /></SocialMini>}
              {socials.linkedin && <SocialMini href={socials.linkedin}><Linkedin className="size-4" /></SocialMini>}
              {store.website_url && (
                <SocialMini href={store.website_url}><Globe className="size-4" /></SocialMini>
              )}
            </div>
            {(ownerName || true) && (
              <>
                <Dot />
                <span className="inline-flex items-center gap-2">
                  Created by
                  <span className="inline-flex items-center gap-1.5 text-foreground">
                    <span className="size-5 rounded-full bg-gradient-to-br from-primary to-cyan-400 inline-block" />
                    {ownerName || "you"}
                  </span>
                </span>
              </>
            )}
          </div>

          <div className="mt-3 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{store.member_count ?? 1}</span> members
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-7 border-b border-white/[0.08] flex items-center gap-1 sm:gap-3 overflow-x-auto scrollbar-thin">
          <TabBtn active={tab === "home"} onClick={() => setTab("home")} icon={HomeIcon}>Home</TabBtn>
          <TabBtn active={tab === "chats"} onClick={() => setTab("chats")} icon={MessagesSquare}>Chats</TabBtn>
          <TabBtn active={tab === "apps"} onClick={() => setTab("apps")} icon={LayoutGrid}>Apps</TabBtn>
          <TabBtn active={tab === "products"} onClick={() => setTab("products")} icon={Package}>Products</TabBtn>
          <TabBtn active={tab === "about"} onClick={() => setTab("about")} icon={Info}>About</TabBtn>
        </div>
      </div>

      {/* Tab body */}
      <div className="px-4 sm:px-8 py-8 pb-24">
        {tab === "home" && <HomeTab />}
        {tab === "chats" && <EmptyTab icon={MessagesSquare} title="No chats yet" sub="Start a conversation with your members." />}
        {tab === "apps" && <EmptyTab icon={LayoutGrid} title="No apps installed" sub="Extend your store with apps." />}
        {tab === "products" && <ProductsTab products={products} />}
        {tab === "about" && <AboutTab description={store.description} skills={store.skills} />}
      </div>
    </div>
  );
}

function Dot() {
  return <span className="inline-block size-1 rounded-full bg-muted-foreground/50" />;
}

function SocialMini({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer"
      className="size-7 grid place-items-center rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition">
      {children}
    </a>
  );
}

function IconBtn({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <button title={title} className="size-9 grid place-items-center rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-foreground transition">
      {children}
    </button>
  );
}

function TabBtn({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: any; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-medium transition whitespace-nowrap ${
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="size-4" />
      {children}
      {active && <span className="absolute left-3 right-3 -bottom-px h-0.5 rounded-full bg-primary" />}
    </button>
  );
}

function HomeTab() {
  return (
    <div className="max-w-3xl">
      {/* Composer */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-full bg-gradient-to-br from-primary to-cyan-400 shrink-0" />
          <input
            placeholder="What's on your mind?"
            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground/70 py-2"
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-muted-foreground">
            <button className="size-8 grid place-items-center rounded-full hover:bg-white/5"><ImageIcon className="size-4" /></button>
            <button className="size-8 grid place-items-center rounded-full hover:bg-white/5"><Smile className="size-4" /></button>
            <button className="size-8 grid place-items-center rounded-full hover:bg-white/5"><Plus className="size-4" /></button>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-1.5 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition">
            <Send className="size-3.5" /> Post
          </button>
        </div>
      </div>

      {/* Empty feed */}
      <div className="mt-10 text-center text-sm text-muted-foreground">
        <div className="mx-auto size-12 rounded-full bg-white/[0.04] grid place-items-center mb-3">
          <MessagesSquare className="size-5 text-muted-foreground" />
        </div>
        No posts yet — be the first to share something with your community.
      </div>
    </div>
  );
}

function ProductsTab({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="max-w-2xl">
        <EmptyTab
          icon={Package}
          title="No products yet"
          sub="Add your first product to start selling."
          action={<Link to="/business/products" className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition"><Plus className="size-3.5" /> Add product</Link>}
        />
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p) => (
        <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.product_type}</div>
          <div className="mt-1 font-semibold">{p.name}</div>
          {p.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{p.description}</p>}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-lg font-semibold">${Number(p.price).toFixed(2)}</div>
            <div className="text-[11px] text-muted-foreground">{p.billing_type.replace("_", " ")}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AboutTab({ description, skills }: { description: string | null; skills: string[] | null }) {
  return (
    <div className="max-w-3xl space-y-6">
      {description ? (
        <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">{description}</p>
      ) : (
        <p className="text-sm text-muted-foreground">No description yet.</p>
      )}
      {skills && skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s} className="text-xs rounded-full bg-white/[0.06] border border-white/10 px-3 py-1.5">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyTab({ icon: Icon, title, sub, action }: { icon: any; title: string; sub: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
      <div className="mx-auto size-12 rounded-full bg-white/[0.04] grid place-items-center mb-3">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{sub}</div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
