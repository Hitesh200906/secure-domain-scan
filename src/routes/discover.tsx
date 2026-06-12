import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Flame, Users, Star, Eye, ChevronLeft, ChevronRight, BadgeCheck,
  TrendingUp, Cpu, Briefcase, Sparkles, HeartHandshake, Palette, Sparkle, Store as StoreIcon, Loader2,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { supabase } from "@/integrations/supabase/client";
import type { Store } from "@/lib/business";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Nexus" },
      { name: "description", content: "Discover top communities, tools, and creators on Nexus." },
    ],
  }),
  component: DiscoverPage,
});

type Card = {
  id: string;
  title: string;
  owner: string;
  description: string;
  gradient: string;
  emoji: string;
  members: string;
  views: string;
  rating?: number;
  reviews?: number;
  launched: string;
  verified?: boolean;
  badge?: string;
  category: string;
  href: string;
};

const CATEGORIES = [
  { key: "all", label: "All", icon: Sparkles },
  { key: "Trading", label: "Trading & investing", icon: TrendingUp },
  { key: "Tech", label: "Tech, AI & coding", icon: Cpu },
  { key: "Business", label: "Business coaching", icon: Briefcase },
  { key: "Creator", label: "Creator economy", icon: Sparkle },
  { key: "Faith", label: "Faith & mindset", icon: HeartHandshake },
  { key: "Design", label: "Web design agency", icon: Palette },
] as const;

const CURATED: Card[] = [
  { id: "t1", category: "Trading", href: "/discover", title: "Apex Trading Floor", owner: "Apex Capital", description: "Daily live calls, options flow, and the strongest community of profitable traders on the internet.", gradient: "from-amber-500 via-orange-600 to-rose-600", emoji: "📈", members: "12.4k", views: "320k", rating: 4.9, reviews: 824, launched: "Launched 1y ago", verified: true, badge: "LIVE" },
  { id: "t2", category: "Trading", href: "/discover", title: "Sniper Bet Picks", owner: "Sharp Tips", description: "AI-vetted sports betting picks with verified ROI. Daily slips delivered before tip-off.", gradient: "from-emerald-500 via-teal-600 to-cyan-700", emoji: "🎯", members: "5.6k", views: "84k", rating: 4.7, reviews: 312, launched: "Launched 8mo ago" },
  { id: "t3", category: "Trading", href: "/discover", title: "Crypto Alpha Hub", owner: "ChainLabs", description: "On-chain analytics, presale alpha and a private chat of degens who actually print.", gradient: "from-orange-500 via-yellow-500 to-amber-600", emoji: "₿", members: "8.9k", views: "213k", rating: 4.8, reviews: 491, launched: "Launched 2y ago", verified: true },
  { id: "a1", category: "Tech", href: "/discover", title: "WhopFlow", owner: "Kevin", description: "After seeing too many fake AI agencies pushing overpriced fluff with no substance, I decided to build this.", gradient: "from-sky-600 via-blue-700 to-indigo-800", emoji: "🚗", members: "13.6k", views: "79.9k", rating: 4.6, reviews: 77, launched: "Launched 1y ago" },
  { id: "a2", category: "Tech", href: "/discover", title: "FatihMakes Academy", owner: "Fatih", description: "World's best voice assistant on your computer that improves day by day.", gradient: "from-violet-700 via-purple-800 to-indigo-900", emoji: "🎙️", members: "2.7k", views: "36.7k", rating: 5.0, reviews: 17, launched: "Launched 3mo ago" },
  { id: "a3", category: "Tech", href: "/discover", title: "AI Agent Academy", owner: "Androo", description: "Learn to build, deploy, and scale AI agents that automate real business workflows.", gradient: "from-fuchsia-600 via-pink-600 to-rose-700", emoji: "🤖", members: "1.2k", views: "29.9k", rating: 5.0, reviews: 18, launched: "Launched 1mo ago", badge: "NEW" },
  { id: "b1", category: "Business", href: "/discover", title: "Drop Service Accelerator", owner: "Parker Jay Smith", description: "Years of service business experience condensed into an 8-week playbook.", gradient: "from-zinc-700 via-slate-800 to-zinc-900", emoji: "📦", members: "305", views: "4.1k", rating: 5.0, reviews: 2, launched: "Launched 1y ago" },
  { id: "b2", category: "Business", href: "/discover", title: "Cleaning Business University", owner: "Anthony Hartzog", description: "Build a successful remote cleaning business without ever picking up a mop.", gradient: "from-blue-600 via-sky-700 to-cyan-800", emoji: "🧼", members: "2.8k", views: "1.5k", rating: 5.0, reviews: 3, launched: "Launched 1y ago", badge: "HOT" },
  { id: "b3", category: "Business", href: "/discover", title: "Elite Clean Academy", owner: "Amar", description: "Build a profitable cleaning business from scratch within 30 days flat.", gradient: "from-neutral-800 via-zinc-900 to-black", emoji: "🧽", members: "73", views: "735", rating: 5.0, reviews: 20, launched: "Launched 1y ago" },
  { id: "c1", category: "Creator", href: "/discover", title: "ClipForge", owner: "Marcus Lee", description: "Short-form editing playbook used by creators with 100M+ views.", gradient: "from-purple-700 via-violet-800 to-fuchsia-900", emoji: "🎬", members: "4.2k", views: "98k", rating: 4.8, reviews: 156, launched: "Launched 6mo ago" },
  { id: "c2", category: "Creator", href: "/discover", title: "The Creator Desk", owner: "Sofia Reyes", description: "A private studio of full-time creators sharing brand deals and rate sheets.", gradient: "from-rose-600 via-pink-700 to-red-800", emoji: "✨", members: "1.9k", views: "42k", rating: 4.9, reviews: 89, launched: "Launched 4mo ago", verified: true },
  { id: "c3", category: "Creator", href: "/discover", title: "Butterfly Effect", owner: "Naomi", description: "From 0 to 1M followers playbook with weekly group calls and feedback.", gradient: "from-indigo-700 via-blue-800 to-slate-900", emoji: "🦋", members: "2.1k", views: "67k", rating: 4.7, reviews: 134, launched: "Launched 9mo ago" },
  { id: "f1", category: "Faith", href: "/discover", title: "The Forge", owner: "Christian Coalition", description: "Iron sharpens iron. A men's brotherhood built on accountability and discipline.", gradient: "from-stone-700 via-neutral-800 to-zinc-900", emoji: "⚒️", members: "1.2k", views: "18k", rating: 4.9, reviews: 67, launched: "Launched 7mo ago" },
  { id: "f2", category: "Faith", href: "/discover", title: "Glory Carriers", owner: "Pastor Daniel", description: "Awakening a new generation through worship, prayer, and prophetic teaching.", gradient: "from-amber-600 via-yellow-700 to-orange-800", emoji: "🔥", members: "3.4k", views: "54k", rating: 5.0, reviews: 201, launched: "Launched 1y ago", verified: true },
  { id: "f3", category: "Faith", href: "/discover", title: "The Holy Cabin", owner: "Brother Eli", description: "Quiet retreats for the soul. Daily devotionals and scripture study.", gradient: "from-slate-800 via-zinc-900 to-neutral-950", emoji: "✝️", members: "890", views: "12k", rating: 4.8, reviews: 45, launched: "Launched 5mo ago" },
  { id: "w1", category: "Design", href: "/discover", title: "Convert Sail", owner: "Studio Sail", description: "Done-for-you landing pages that have generated $50M+ for our clients.", gradient: "from-blue-500 via-cyan-600 to-sky-700", emoji: "⛵", members: "412", views: "9.8k", rating: 4.9, reviews: 28, launched: "Launched 8mo ago" },
  { id: "w2", category: "Design", href: "/discover", title: "MotionViz", owner: "Viz Collective", description: "Premium motion design and 3D visualizations for product launches.", gradient: "from-red-700 via-rose-800 to-pink-900", emoji: "🎨", members: "287", views: "6.4k", rating: 4.8, reviews: 19, launched: "Launched 1y ago" },
  { id: "w3", category: "Design", href: "/discover", title: "Technologiv", owner: "Karan Mehta", description: "Full-service agency: LLC setup, Stripe integration, branding, and ongoing support.", gradient: "from-amber-700 via-orange-800 to-red-900", emoji: "💼", members: "654", views: "21k", rating: 4.9, reviews: 92, launched: "Launched 2y ago", verified: true },
];

const GRADIENTS = [
  "from-violet-600 via-fuchsia-700 to-pink-700",
  "from-emerald-500 via-teal-600 to-cyan-700",
  "from-amber-500 via-orange-600 to-rose-600",
  "from-sky-600 via-blue-700 to-indigo-800",
  "from-rose-600 via-pink-700 to-red-800",
  "from-purple-700 via-violet-800 to-fuchsia-900",
];

function storeToCard(s: Store): Card {
  const idx = Math.abs(s.id.charCodeAt(0) + s.id.charCodeAt(1)) % GRADIENTS.length;
  const gradient = s.theme_color && s.accent_color
    ? `from-[${s.theme_color}] to-[${s.accent_color}]`
    : GRADIENTS[idx];
  const cat = s.category || "All";
  const launchedDays = Math.max(1, Math.floor((Date.now() - new Date(s.created_at).getTime()) / 86400000));
  const launched = launchedDays < 30 ? `Launched ${launchedDays}d ago` : launchedDays < 365 ? `Launched ${Math.floor(launchedDays/30)}mo ago` : `Launched ${Math.floor(launchedDays/365)}y ago`;
  return {
    id: s.id,
    title: s.name,
    owner: s.name,
    description: s.description || "A new community on Nexus. Tap to explore products and join.",
    gradient,
    emoji: s.name[0]?.toUpperCase() || "★",
    members: String(s.member_count ?? 0),
    views: "—",
    launched,
    verified: s.verified,
    badge: launchedDays < 14 ? "NEW" : undefined,
    category: cat,
    href: `/${s.slug}`,
  };
}

function DiscoverPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [userStores, setUserStores] = useState<Card[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("stores")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(60);
      setUserStores(((data as Store[]) ?? []).map(storeToCard));
      setLoadingStores(false);
    })();
  }, []);

  const allCards = useMemo(() => [...userStores, ...CURATED], [userStores]);

  const query = q.trim().toLowerCase();
  const filtered = useMemo(() => allCards.filter((c) => {
    if (cat !== "all" && c.category !== cat) return false;
    if (!query) return true;
    return (
      c.title.toLowerCase().includes(query) ||
      c.owner.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    );
  }), [allCards, cat, query]);

  const grouped = useMemo(() => {
    if (cat !== "all" || query) return [{ title: cat === "all" ? "Results" : CATEGORIES.find(c=>c.key===cat)?.label || cat, cards: filtered }];
    const out: { title: string; cards: Card[] }[] = [];
    if (userStores.length) out.push({ title: "Fresh from Nexus creators", cards: userStores });
    for (const c of CATEGORIES.slice(1)) {
      const cards = CURATED.filter((x) => x.category === c.key);
      if (cards.length) out.push({ title: c.label, cards });
    }
    return out;
  }, [cat, query, filtered, userStores]);

  const featured = allCards[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 sm:pt-28 pb-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          {/* Hero — centered */}
          <section className="mb-10 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] uppercase tracking-widest text-muted-foreground">
              <Flame className="size-3 text-primary" /> Discover
            </div>
            <h1 className="mt-4 text-3xl sm:text-5xl font-medium tracking-tight">
              Find your next <span className="text-gradient-accent">obsession</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl">
              Explore thousands of communities, tools, and creators across every category.
            </p>

            <div className="mt-6 w-full max-w-xl relative">
              <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search communities, creators, tools…"
                className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20"
              />
            </div>
          </section>

          {/* Category slider */}
          <CategoryStrip active={cat} onChange={setCat} />

          {/* Featured banner */}
          {featured && cat === "all" && !query && (
            <FeaturedBanner c={featured} />
          )}

          {/* Stats */}
          <div className="mt-8 mb-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Communities" value={String(allCards.length)} />
            <Stat label="Creators" value={String(new Set(allCards.map(c=>c.owner)).size)} />
            <Stat label="Categories" value={String(CATEGORIES.length - 1)} />
            <Stat label="Live now" value={String(allCards.filter(c=>c.badge==="LIVE").length || 3)} />
          </div>

          {loadingStores && userStores.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground inline-flex items-center justify-center gap-2 w-full">
              <Loader2 className="size-3 animate-spin" /> Loading fresh stores…
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-32 text-sm text-muted-foreground">
              {query ? `No results for "${q}".` : "Nothing here yet."}
            </div>
          ) : (
            grouped.map((s) => <Row key={s.title} title={s.title} cards={s.cards} />)
          )}
        </div>
      </main>
    </div>
  );
}

function CategoryStrip({ active, onChange }: { active: string; onChange: (k: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="relative -mx-4 sm:mx-0 mb-6">
      <div ref={ref} className="flex gap-2 overflow-x-auto scrollbar-hide px-4 sm:px-0 snap-x">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const on = active === c.key;
          return (
            <button
              key={c.key}
              onClick={() => onChange(c.key)}
              className={`snap-start shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition ${
                on ? "bg-white text-black border-white" : "border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
              }`}
            >
              <Icon className="size-3.5" /> {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function FeaturedBanner({ c }: { c: Card }) {
  return (
    <Link to={c.href as never} className={`mb-10 block relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${c.gradient}`}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative p-6 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
        <div className="size-16 sm:size-20 rounded-2xl bg-white/15 backdrop-blur grid place-items-center text-3xl sm:text-4xl shrink-0">{c.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-white/80 mb-2 inline-flex items-center gap-2">
            <Flame className="size-3" /> Featured
          </div>
          <h2 className="text-xl sm:text-3xl font-semibold text-white flex items-center gap-2">
            <span className="truncate">{c.title}</span> {c.verified && <BadgeCheck className="size-5 text-white shrink-0" />}
          </h2>
          <p className="mt-2 text-sm text-white/85 max-w-2xl line-clamp-2">{c.description}</p>
          <div className="mt-3 flex flex-wrap gap-3 sm:gap-4 text-xs text-white/80">
            <span className="inline-flex items-center gap-1"><Users className="size-3" /> {c.members} members</span>
            {c.rating && <span className="inline-flex items-center gap-1"><Star className="size-3 fill-amber-300 text-amber-300" /> {c.rating}</span>}
            <span>{c.launched}</span>
          </div>
        </div>
        <span className="rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium shrink-0">Explore →</span>
      </div>
    </Link>
  );
}

function Row({ title, cards }: { title: string; cards: Card[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.9), behavior: "smooth" });
  };

  return (
    <section className="mb-14">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight truncate">{title}</h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{cards.length} {cards.length === 1 ? "community" : "communities"}</p>
        </div>
        <div className="hidden sm:flex shrink-0 items-center gap-2">
          <button onClick={() => scrollBy(-1)} className="size-9 grid place-items-center rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition" aria-label="Scroll left">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => scrollBy(1)} className="size-9 grid place-items-center rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition" aria-label="Scroll right">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div ref={scroller} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {cards.map((c) => <BigCard key={c.id} c={c} />)}
      </div>
    </section>
  );
}

function BigCard({ c }: { c: Card }) {
  return (
    <Link
      to={c.href as never}
      className="group snap-start shrink-0 w-[88%] sm:w-[420px] lg:w-[460px] overflow-hidden rounded-2xl border border-white/[0.08] hover:border-white/20 bg-[oklch(0.06_0.008_220)] transition"
    >
      <div className={`relative h-56 bg-gradient-to-br ${c.gradient} overflow-hidden`}>
        <div className="absolute inset-0 grid place-items-center text-7xl opacity-90 group-hover:scale-105 transition-transform duration-500">
          {c.emoji}
        </div>
        {c.badge && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white px-2 py-1 rounded-md">
            {c.badge === "LIVE" && <span className="size-1.5 rounded-full bg-white animate-pulse" />}
            {c.badge}
          </span>
        )}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-medium bg-black/40 backdrop-blur text-white px-2 py-1 rounded-md">
          <StoreIcon className="size-3" /> {c.category}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className={`size-11 rounded-xl bg-gradient-to-br ${c.gradient} grid place-items-center text-xl shrink-0`}>
            {c.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <div className="text-base font-semibold text-white truncate">{c.title}</div>
              {c.verified && <BadgeCheck className="size-4 text-sky-400 shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-4 rounded-full bg-white/10 grid place-items-center text-[9px]">
                {c.owner.charAt(0)}
              </span>
              by {c.owner}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{c.description}</p>

        <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-4">
            {c.rating && (
              <span className="inline-flex items-center gap-1">
                <Star className="size-3 text-amber-400 fill-amber-400" />
                {c.rating.toFixed(1)} {c.reviews && <span className="opacity-70">({c.reviews})</span>}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Users className="size-3" /> {c.members}
            </span>
            {c.views !== "—" && (
              <span className="inline-flex items-center gap-1">
                <Eye className="size-3" /> {c.views}
              </span>
            )}
          </div>
          <span className="opacity-70">{c.launched}</span>
        </div>
      </div>
    </Link>
  );
}
