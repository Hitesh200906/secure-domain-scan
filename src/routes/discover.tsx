import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Search, Mic, Sparkles, Flame, Rocket, Star, Bot, Server, Palette, Briefcase,
  Gamepad2, Clapperboard, ShieldCheck, BadgeCheck, Users, ArrowUpRight, Circle,
  Cpu, GraduationCap, Wallet, Code2, Store as StoreIcon, Network, Loader2,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import heroBg from "@/assets/hero-bg.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import type { Store } from "@/lib/business";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Nexefy" },
      { name: "description", content: "Discover premium communities, creators, AI tools, digital products and businesses built for the next generation on Nexefy." },
      { property: "og:title", content: "Discover — Nexefy" },
      { property: "og:description", content: "Explore thousands of premium communities, creators, AI tools and internet businesses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiscoverPage,
});

/* ────────────────────────────── data ────────────────────────────── */

type Card = {
  id: string;
  title: string;
  owner: string;
  description: string;
  gradient: string;
  emoji: string;
  members: string;
  rating?: number;
  category: string;
  tags?: string[];
  verified?: boolean;
  href: string;
  height?: number; // for masonry
};

const QUICK_FILTERS = [
  { key: "trending", label: "Trending", icon: Flame },
  { key: "new", label: "New", icon: Rocket },
  { key: "popular", label: "Popular", icon: Star },
  { key: "ai", label: "AI", icon: Bot },
  { key: "saas", label: "SaaS", icon: Server },
  { key: "design", label: "Design", icon: Palette },
  { key: "business", label: "Business", icon: Briefcase },
  { key: "gaming", label: "Gaming", icon: Gamepad2 },
  { key: "creators", label: "Creators", icon: Clapperboard },
  { key: "security", label: "Security", icon: ShieldCheck },
] as const;

const COLLECTIONS: { title: string; sub: string; gradient: string; emoji: string; count: number }[] = [
  { title: "AI Tools",         sub: "Agents, copilots, models",          gradient: "from-indigo-600 via-blue-700 to-cyan-600", emoji: "🤖", count: 128 },
  { title: "Creator Economy",  sub: "Studios, editors, playbooks",       gradient: "from-fuchsia-600 via-purple-700 to-indigo-800", emoji: "✨", count: 94 },
  { title: "Cyber Security",   sub: "Scanners, hardening, audits",       gradient: "from-cyan-500 via-sky-700 to-indigo-900", emoji: "🛡️", count: 62 },
  { title: "Web Development",  sub: "Templates, stacks, agencies",       gradient: "from-blue-500 via-indigo-700 to-purple-800", emoji: "💻", count: 210 },
  { title: "Business",         sub: "Playbooks, coaching, ops",          gradient: "from-amber-500 via-orange-600 to-rose-700", emoji: "💼", count: 156 },
  { title: "Crypto",           sub: "On-chain alpha & research",         gradient: "from-orange-500 via-amber-600 to-yellow-500", emoji: "₿",  count: 88 },
  { title: "Startups",         sub: "Founders, growth, fundraising",     gradient: "from-emerald-500 via-teal-600 to-cyan-700", emoji: "🚀", count: 71 },
];

const TRENDING: Card[] = [
  { id: "t1", title: "Apex Trading Floor",     owner: "Apex Capital",   description: "Daily live calls, options flow, and the strongest community of profitable traders on the internet.", gradient: "from-amber-500 via-orange-600 to-rose-600",   emoji: "📈", members: "12.4k", rating: 4.9, category: "Trading",  tags: ["Live", "Options", "Signals"], verified: true, href: "/discover", height: 380 },
  { id: "t2", title: "WhopFlow",               owner: "Kevin",          description: "Battle-tested AI agency stack: SOPs, prompts and client acquisition funnels.",                     gradient: "from-sky-600 via-blue-700 to-indigo-800",     emoji: "🌊", members: "13.6k", rating: 4.6, category: "AI",       tags: ["Agents", "Automation"], href: "/discover", height: 300 },
  { id: "t3", title: "Crypto Alpha Hub",       owner: "ChainLabs",      description: "On-chain analytics, presale alpha and a private chat of degens who actually print.",              gradient: "from-orange-500 via-yellow-500 to-amber-600", emoji: "₿",  members: "8.9k",  rating: 4.8, category: "Crypto",   tags: ["On-chain", "Alpha"], verified: true, href: "/discover", height: 420 },
  { id: "t4", title: "AI Agent Academy",       owner: "Androo",         description: "Learn to build, deploy and scale AI agents that automate real business workflows.",              gradient: "from-fuchsia-600 via-pink-600 to-rose-700",   emoji: "🤖", members: "1.2k",  rating: 5.0, category: "AI",       tags: ["Course", "Agents"], href: "/discover", height: 340 },
  { id: "t5", title: "ClipForge",              owner: "Marcus Lee",     description: "Short-form editing playbook used by creators with 100M+ views.",                                 gradient: "from-purple-700 via-violet-800 to-fuchsia-900",emoji: "🎬", members: "4.2k",  rating: 4.8, category: "Creators", tags: ["Editing"], href: "/discover", height: 280 },
  { id: "t6", title: "Convert Sail",           owner: "Studio Sail",    description: "Done-for-you landing pages that generated $50M+ for clients.",                                    gradient: "from-blue-500 via-cyan-600 to-sky-700",       emoji: "⛵", members: "412",   rating: 4.9, category: "Design",   tags: ["Landing", "CRO"], href: "/discover", height: 360 },
  { id: "t7", title: "The Forge",              owner: "Christian Coalition", description: "Iron sharpens iron. A men's brotherhood built on discipline.",                            gradient: "from-stone-700 via-neutral-800 to-zinc-900",  emoji: "⚒️", members: "1.2k",  rating: 4.9, category: "Community",tags: ["Brotherhood"], href: "/discover", height: 320 },
  { id: "t8", title: "MotionViz",              owner: "Viz Collective", description: "Premium motion design and 3D visualizations for product launches.",                              gradient: "from-red-700 via-rose-800 to-pink-900",       emoji: "🎨", members: "287",   rating: 4.8, category: "Design",   tags: ["3D", "Motion"], href: "/discover", height: 400 },
  { id: "t9", title: "Elite Clean Academy",    owner: "Amar",           description: "Build a profitable cleaning business from scratch within 30 days flat.",                        gradient: "from-neutral-800 via-zinc-900 to-black",       emoji: "🧽", members: "73",    rating: 5.0, category: "Business", tags: ["Playbook"], href: "/discover", height: 300 },
];

const CATEGORY_CIRCLES = [
  { key: "Marketplace", icon: StoreIcon,     gradient: "from-blue-500 to-cyan-500" },
  { key: "Communities", icon: Users,         gradient: "from-fuchsia-500 to-purple-600" },
  { key: "AI",          icon: Bot,           gradient: "from-indigo-500 to-blue-600" },
  { key: "Security",    icon: ShieldCheck,   gradient: "from-cyan-500 to-sky-600" },
  { key: "Business",    icon: Briefcase,     gradient: "from-amber-500 to-orange-600" },
  { key: "Education",   icon: GraduationCap, gradient: "from-emerald-500 to-teal-600" },
  { key: "Gaming",      icon: Gamepad2,      gradient: "from-pink-500 to-rose-600" },
  { key: "Finance",     icon: Wallet,        gradient: "from-yellow-500 to-amber-600" },
  { key: "Design",      icon: Palette,       gradient: "from-purple-500 to-fuchsia-600" },
  { key: "Development", icon: Code2,         gradient: "from-sky-500 to-indigo-600" },
];

const LIVE_TEMPLATES = [
  { icon: Rocket,     text: "launched a product",     color: "text-cyan-400" },
  { icon: Users,      text: "joined a community",     color: "text-fuchsia-400" },
  { icon: Sparkles,   text: "created a new store",    color: "text-blue-400" },
  { icon: BadgeCheck, text: "was verified",           color: "text-emerald-400" },
  { icon: Flame,      text: "hit a sales milestone",  color: "text-orange-400" },
];
const LIVE_NAMES = ["Kai", "Nova", "Iris", "Mira", "Zed", "Rune", "Ari", "Sasha", "Leo", "Juno", "Ren", "Vex"];

const GRADIENTS = [
  "from-violet-600 via-fuchsia-700 to-pink-700",
  "from-emerald-500 via-teal-600 to-cyan-700",
  "from-sky-600 via-blue-700 to-indigo-800",
  "from-rose-600 via-pink-700 to-red-800",
];

function storeToCard(s: Store): Card {
  const idx = Math.abs(s.id.charCodeAt(0) + s.id.charCodeAt(1)) % GRADIENTS.length;
  return {
    id: s.id,
    title: s.name,
    owner: s.name,
    description: s.description || "A new community on Nexefy. Tap to explore.",
    gradient: GRADIENTS[idx],
    emoji: s.name[0]?.toUpperCase() || "★",
    members: String(s.member_count ?? 0),
    category: s.category || "Community",
    verified: s.verified,
    href: `/${s.slug}`,
  };
}

/* ────────────────────────────── page ────────────────────────────── */

function DiscoverPage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string>("trending");
  const [userStores, setUserStores] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("stores").select("*").order("created_at", { ascending: false }).limit(60);
      setUserStores(((data as Store[]) ?? []).map(storeToCard));
      setLoading(false);
    })();
  }, []);

  const allTrending = useMemo(() => {
    const merged = [...userStores.map((c, i) => ({ ...c, height: 280 + (i % 4) * 40 })), ...TRENDING];
    if (!q.trim()) return merged;
    const s = q.toLowerCase();
    return merged.filter(c => c.title.toLowerCase().includes(s) || c.description.toLowerCase().includes(s) || c.category.toLowerCase().includes(s));
  }, [userStores, q]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F8FAFC] overflow-x-hidden">
      <AmbientBackdrop />
      <Navbar />

      <main className="relative">
        <Hero q={q} setQ={setQ} />
        <QuickFilters active={active} onChange={setActive} />
        <FeaturedCollection />
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 mt-24 items-stretch">
          <TrendingMasonry cards={allTrending} loading={loading} />
          <LiveActivity />
        </div>
        <CreatorSpotlight />
        <CategoryCircles />
        <RecommendedRow cards={allTrending.slice(0, 8)} />
        <div className="h-32" />
      </main>
    </div>
  );
}

/* ────────────────────────── ambient bg ─────────────────────────── */

function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050505]">
      {/* radial blue glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full opacity-60"
        style={{ background: "radial-gradient(closest-side, rgba(59,130,246,0.28), transparent 70%)" }} />
      {/* purple ambient */}
      <div className="absolute top-[40%] -left-40 w-[800px] h-[800px] rounded-full opacity-50"
        style={{ background: "radial-gradient(closest-side, rgba(124,58,237,0.22), transparent 70%)" }} />
      <div className="absolute bottom-0 right-0 w-[900px] h-[900px] rounded-full opacity-40"
        style={{ background: "radial-gradient(closest-side, rgba(6,182,212,0.18), transparent 70%)" }} />
      {/* subtle grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />
      <Particles />
    </div>
  );
}

function Particles() {
  const dots = useMemo(() => Array.from({ length: 28 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    d: 8 + Math.random() * 14,
    delay: Math.random() * 6,
    size: 1 + Math.random() * 1.5,
  })), []);
  return (
    <>
      {dots.map(d => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-white/60"
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, filter: "blur(0.5px)" }}
          animate={{ y: [-6, 6, -6], opacity: [0.25, 0.9, 0.25] }}
          transition={{ duration: d.d, repeat: Infinity, ease: "easeInOut", delay: d.delay }}
        />
      ))}
    </>
  );
}

/* ─────────────────────────────── hero ──────────────────────────── */

function Hero({ q, setQ }: { q: string; setQ: (s: string) => void }) {
  return (
    <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-20">
      {/* blurred city bg */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroBg.url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(24px) saturate(120%)",
            opacity: 0.35,
            transform: "scale(1.1)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/40 to-[#050505]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(59,130,246,0.35), transparent 70%)" }} />
        {/* floating glass reflections */}
        <FloatingReflections />
      </div>

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70"
        >
          <Sparkles className="size-3 text-[#06B6D4]" /> Discover
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.02]"
          style={{
            backgroundImage: "linear-gradient(180deg, #ffffff 0%, #cfe1ff 55%, #7fb0ff 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Discover the future of
          <br />
          internet business
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-6 text-base sm:text-lg text-white/60 max-w-2xl mx-auto"
        >
          Explore thousands of premium communities, creators, AI tools, digital products
          and businesses built for the next generation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="mt-10 mx-auto max-w-2xl"
        >
          <SearchBar q={q} setQ={setQ} />
        </motion.div>
      </div>
    </section>
  );
}

function FloatingReflections() {
  const shards = useMemo(() => [
    { x: 8,  y: 22, w: 260, h: 90,  r: -12, delay: 0 },
    { x: 78, y: 18, w: 180, h: 70,  r: 10,  delay: 1.2 },
    { x: 62, y: 68, w: 240, h: 80,  r: -6,  delay: 2.4 },
    { x: 12, y: 74, w: 200, h: 60,  r: 8,   delay: 3.6 },
  ], []);
  return (
    <>
      {shards.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-2xl border border-white/10"
          style={{
            left: `${s.x}%`, top: `${s.y}%`, width: s.w, height: s.h,
            transform: `rotate(${s.r}deg)`,
            background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
            backdropFilter: "blur(10px)",
          }}
          animate={{ y: [-8, 8, -8], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10 + i, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        />
      ))}
    </>
  );
}

function SearchBar({ q, setQ }: { q: string; setQ: (s: string) => void }) {
  return (
    <div
      className="group relative flex items-center gap-2 rounded-[18px] border border-white/15 bg-white/[0.04] backdrop-blur-xl px-3 sm:px-4 py-2.5 sm:py-3"
    >
      <Search className="size-5 text-white/70 ml-1" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search communities, creators, AI tools, products..."
        className="flex-1 bg-transparent text-[15px] sm:text-base text-white placeholder:text-white/40 focus:outline-none py-1.5"
      />
      <button className="hidden sm:grid size-9 place-items-center rounded-full text-white/60 hover:text-white hover:bg-white/[0.06] transition" aria-label="Voice search">
        <Mic className="size-4" />
      </button>
      <button className="grid size-9 place-items-center rounded-full text-white/70 hover:text-white hover:bg-white/[0.06] transition" aria-label="AI search">
        <Sparkles className="size-4" />
      </button>
    </div>
  );
}


/* ────────────────────────── quick filters ─────────────────────── */

function QuickFilters({ active, onChange }: { active: string; onChange: (k: string) => void }) {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 -mt-4">
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2">
        {QUICK_FILTERS.map((f, i) => {
          const Icon = f.icon;
          const on = active === f.key;
          return (
            <motion.button
              key={f.key}
              onClick={() => onChange(f.key)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.02 * i, duration: 0.5 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 1.02 }}
              className={`snap-start shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs backdrop-blur-xl transition-colors ${
                on
                  ? "border-[#3B82F6]/60 bg-[#3B82F6]/15 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:border-white/25 hover:bg-white/[0.06]"
              }`}
            >
              <Icon className="size-3.5" /> {f.label}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────── featured collection ──────────────────── */

function FeaturedCollection() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 mt-16">
      <SectionHeader eyebrow="Featured" title="Handpicked collections" sub="Curated worlds from across the Nexefy universe." />
      <div className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 pb-3">
        {COLLECTIONS.map((c, i) => (
          <FeaturedCard key={c.title} c={c} i={i} />
        ))}
      </div>
    </section>
  );
}

function FeaturedCard({ c, i }: { c: (typeof COLLECTIONS)[number]; i: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0); const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-40, 40], [8, -8]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [-40, 40], [-8, 8]), { stiffness: 180, damping: 18 });

  return (
    <motion.a
      ref={ref}
      href="#"
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect(); if (!r) return;
        mx.set(e.clientX - r.left - r.width / 2);
        my.set(e.clientY - r.top - r.height / 2);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: 0.05 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d", perspective: 1000 }}
      className="group snap-start shrink-0 w-[300px] sm:w-[360px] h-[420px] rounded-3xl overflow-hidden relative border border-white/10 bg-[#0A0F1C]"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient}`} />
      <div className="absolute inset-0 opacity-[0.15]"
        style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <div className="absolute inset-0 grid place-items-center text-[140px] opacity-90 group-hover:scale-110 transition-transform duration-[900ms] ease-out">
        {c.emoji}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 top-0 p-5 flex items-start justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] rounded-full border border-white/20 bg-white/10 backdrop-blur px-2.5 py-1 text-white/90">
          Collection
        </span>
        <span className="text-[10px] rounded-full bg-black/40 border border-white/15 backdrop-blur px-2.5 py-1 text-white/80">{c.count}+</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6">
        <h3 className="text-2xl font-semibold tracking-tight text-white">{c.title}</h3>
        <p className="mt-1 text-sm text-white/70">{c.sub}</p>
        <div className="mt-4 inline-flex items-center gap-2 text-xs text-white/80">
          Explore <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition"
        style={{ boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.35), 0 30px 80px -30px rgba(59,130,246,0.45)" }} />
    </motion.a>
  );
}

/* ─────────────────────────── trending ──────────────────────────── */

function TrendingMasonry({ cards, loading }: { cards: Card[]; loading: boolean }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Trending Now</h2>
        <button className="text-sm text-white/60 hover:text-white transition">View all</button>
      </div>
      {loading && cards.length === 0 ? (
        <div className="py-16 text-center text-xs text-white/50 inline-flex items-center justify-center gap-2 w-full">
          <Loader2 className="size-3 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {cards.slice(0, 6).map((c, i) => (
            <TrendingCard key={c.id} c={c} i={i} />
          ))}
        </div>
      )}
    </section>
  );
}

function TrendingCard({ c, i }: { c: Card; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: (i % 4) * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link
        to={c.href as never}
        className="flex flex-col h-full rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0A0F1C] hover:border-white/25 hover:shadow-[0_20px_60px_-20px_rgba(59,130,246,0.35)] transition"
      >
        <div className={`relative overflow-hidden bg-gradient-to-br ${c.gradient} aspect-[4/3]`}>
          <div className="absolute inset-0 grid place-items-center text-7xl opacity-90 group-hover:scale-110 transition-transform duration-[900ms] ease-out">
            {c.emoji}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-black/60 backdrop-blur border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider font-medium text-white/90">
            {c.verified && <Star className="size-2.5 fill-white text-white" />}
            {c.category}
          </div>
          <div className={`absolute -bottom-4 left-4 size-9 rounded-full bg-gradient-to-br ${c.gradient} grid place-items-center text-xs font-semibold ring-2 ring-[#0A0F1C]`}>
            {c.owner[0]?.toUpperCase()}
          </div>
        </div>

        <div className="flex flex-col flex-1 p-4 pt-6">
          <h3 className="text-[15px] font-semibold text-white truncate">{c.title}</h3>
          <div className="text-[11px] text-white/50 mt-0.5">by {c.owner}</div>
          <p className="mt-2.5 text-[13px] text-white/60 line-clamp-2 leading-relaxed">{c.description}</p>

          <div className="mt-auto pt-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-[11px] text-white/60 min-w-0">
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <span className="text-white font-semibold text-[12px]">{c.members}</span> Members
              </span>
              {c.rating && (
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  {c.rating} <Star className="size-3 fill-amber-300 text-amber-300" />
                </span>
              )}
            </div>
            <span className="rounded-lg bg-white/[0.06] border border-white/10 text-white px-3 py-1.5 text-[11px] font-semibold group-hover:bg-white group-hover:text-black transition">
              Join
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────── live activity ─────────────────────── */

function LiveActivity() {
  const [events, setEvents] = useState(() => Array.from({ length: 6 }).map((_, i) => makeEvent(i)));
  useEffect(() => {
    const t = setInterval(() => {
      setEvents(prev => [makeEvent(Date.now()), ...prev].slice(0, 8));
    }, 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <aside className="hidden lg:block h-full">
      <div className="h-full flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            <div className="text-sm font-medium">Live activity</div>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/40">real-time</div>
        </div>
        <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
          {events.map(ev => {
            const Icon = ev.icon;
            return (
              <motion.div
                key={ev.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 hover:bg-white/[0.05] transition"
              >
                <div className={`grid size-8 place-items-center rounded-lg bg-white/[0.06] ${ev.color}`}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-white truncate">
                    <span className="font-medium">{ev.name}</span>{" "}
                    <span className="text-white/60">{ev.text}</span>
                  </div>
                  <div className="text-[10px] text-white/40 mt-0.5">just now</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function makeEvent(seed: number) {
  const t = LIVE_TEMPLATES[Math.abs(seed) % LIVE_TEMPLATES.length];
  const n = LIVE_NAMES[Math.abs(seed * 3 + 7) % LIVE_NAMES.length];
  return { id: `${seed}-${Math.random()}`, name: n, ...t };
}

/* ────────────────────── creator spotlight ─────────────────────── */

function CreatorSpotlight() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 mt-28">
      <SectionHeader eyebrow="Creator spotlight" title="Meet this week's featured builder" sub="A creator shipping at the frontier." />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0F1C]"
      >
        {/* animated border */}
        <div className="pointer-events-none absolute inset-0 rounded-[28px]"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, rgba(59,130,246,0.55) 60deg, transparent 120deg, transparent 240deg, rgba(124,58,237,0.55) 300deg, transparent 360deg)",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor" as unknown as string,
            maskComposite: "exclude",
            padding: 1,
            animation: "spin 8s linear infinite",
          }}
        />
        <div className="grid md:grid-cols-[1.4fr_1fr]">
          <div className="relative h-72 md:h-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-blue-800 to-purple-900" />
            <div className="absolute inset-0 grid place-items-center text-[170px] opacity-90">🛰️</div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="size-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-2xl ring-2 ring-white/20">A</div>
                <BadgeCheck className="absolute -bottom-1 -right-1 size-5 text-sky-400 bg-[#0A0F1C] rounded-full" />
              </div>
              <div>
                <div className="text-lg font-semibold">Aurora Studios</div>
                <div className="text-xs text-white/60">Building the AI-native creator OS</div>
              </div>
            </div>
            <p className="mt-5 text-sm text-white/70 leading-relaxed">
              Shipping premium AI templates, curated agent packs and a private studio of full-time builders. Weekly drops, monthly demos, permanent alpha.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat n="42.1k" l="Followers" />
              <Stat n="17" l="Products" />
              <Stat n="6" l="Communities" />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button className="rounded-full bg-white text-black px-5 py-2.5 text-sm font-semibold hover:bg-[#3B82F6] hover:text-white transition">Follow</button>
              <button className="rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-sm text-white hover:bg-white/[0.06] transition">View profile</button>
            </div>
          </div>
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className="text-lg font-semibold">{n}</div>
      <div className="text-[10px] uppercase tracking-widest text-white/50">{l}</div>
    </div>
  );
}

/* ────────────────────── category circles ──────────────────────── */

function CategoryCircles() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 mt-28">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="mb-10 text-left"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/70">
          Explore
        </div>
        <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">Discover by category</h2>
        <p className="mt-3 text-base sm:text-lg text-white/55">Every world, one tap away.</p>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
        {CATEGORY_CIRCLES.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.button
              key={c.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.04, duration: 0.6 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group relative flex flex-col items-center justify-center gap-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition p-6 sm:p-8 aspect-square"
            >
              <div className="relative grid place-items-center">
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition bg-gradient-to-br ${c.gradient}`} />
                <Icon className="relative size-14 sm:size-16 text-[#3B82F6]" strokeWidth={1.5} />
              </div>
              <div className="text-base sm:text-lg font-semibold text-white/90 group-hover:text-white transition">{c.key}</div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────── recommended ──────────────────────────── */

function RecommendedRow({ cards }: { cards: Card[] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 mt-28">
      <SectionHeader
        eyebrow="For you"
        title="Recommended by Nexefy AI"
        sub="Personalized picks based on what's moving now."
      />
      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 pb-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.04, duration: 0.6 }}
            whileHover={{ y: -4 }}
            className="snap-start shrink-0 w-[280px] rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 hover:border-white/25 transition"
          >
            <div className={`relative h-36 rounded-xl overflow-hidden bg-gradient-to-br ${c.gradient}`}>
              <div className="absolute inset-0 grid place-items-center text-6xl opacity-90">{c.emoji}</div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded-full border border-white/20 bg-black/30 backdrop-blur px-2 py-0.5 text-white/90">
                <Cpu className="size-3" /> AI pick
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <div className="text-sm font-semibold truncate">{c.title}</div>
              {c.verified && <BadgeCheck className="size-3.5 text-sky-400 shrink-0" />}
            </div>
            <div className="text-[11px] text-white/60 truncate">by {c.owner}</div>
            <p className="mt-2 text-xs text-white/60 line-clamp-2">{c.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-white/50 inline-flex items-center gap-1"><Users className="size-3" /> {c.members}</span>
              <Link to={c.href as never} className="text-[11px] text-[#06B6D4] hover:text-white transition inline-flex items-center gap-1">
                Open <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────── section header ──────────────────────── */

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7 }}
      className="mb-8 flex items-end justify-between gap-4"
    >
      <div>
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/50">
          <Network className="size-3 text-[#3B82F6]" /> {eyebrow}
        </div>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2>
        {sub && <p className="mt-1 text-sm text-white/55">{sub}</p>}
      </div>
    </motion.div>
  );
}
