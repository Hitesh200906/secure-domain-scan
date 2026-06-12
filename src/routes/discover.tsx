import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, TrendingUp, Sparkles, Flame, Users, Star, ArrowUpRight,
  Briefcase, GraduationCap, Bitcoin, Trophy, Palette, Code2, Dumbbell,
  Music, Camera, Gamepad2, Megaphone, Brain,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Nexus Security" },
      { name: "description", content: "Discover top security tools, communities, and creators on Nexus." },
    ],
  }),
  component: DiscoverPage,
});

type Listing = {
  id: string;
  title: string;
  owner: string;
  category: string;
  price: string;
  members: number;
  rating: number;
  gradient: string;
  emoji: string;
  badge?: "trending" | "new" | "hot";
};

const CATEGORIES = [
  { key: "all", label: "All", icon: Sparkles },
  { key: "trading", label: "Trading", icon: TrendingUp },
  { key: "crypto", label: "Crypto", icon: Bitcoin },
  { key: "business", label: "Business", icon: Briefcase },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "sports", label: "Sports Betting", icon: Trophy },
  { key: "design", label: "Design", icon: Palette },
  { key: "tech", label: "Tech", icon: Code2 },
  { key: "fitness", label: "Fitness", icon: Dumbbell },
  { key: "music", label: "Music", icon: Music },
  { key: "photo", label: "Photography", icon: Camera },
  { key: "gaming", label: "Gaming", icon: Gamepad2 },
  { key: "marketing", label: "Marketing", icon: Megaphone },
  { key: "ai", label: "AI", icon: Brain },
] as const;

const LISTINGS: Listing[] = [
  { id: "1", title: "Apex Trading Floor", owner: "Apex Capital", category: "trading", price: "$99/mo", members: 12480, rating: 4.9, gradient: "from-amber-500 to-rose-500", emoji: "📈", badge: "trending" },
  { id: "2", title: "Crypto Alpha Hub", owner: "ChainLabs", category: "crypto", price: "$49/mo", members: 8932, rating: 4.8, gradient: "from-orange-500 to-yellow-500", emoji: "₿", badge: "hot" },
  { id: "3", title: "Sniper Bet Picks", owner: "Sharp Tips", category: "sports", price: "$29/mo", members: 5641, rating: 4.7, gradient: "from-emerald-500 to-teal-500", emoji: "🏆" },
  { id: "4", title: "Builders Den", owner: "Indie Hackers", category: "business", price: "$19/mo", members: 14203, rating: 4.9, gradient: "from-violet-500 to-purple-600", emoji: "🚀", badge: "trending" },
  { id: "5", title: "AI Engineers Guild", owner: "PromptHQ", category: "ai", price: "$39/mo", members: 9874, rating: 4.9, gradient: "from-cyan-500 to-blue-600", emoji: "🤖", badge: "new" },
  { id: "6", title: "Design Mafia", owner: "Pixel Cartel", category: "design", price: "$25/mo", members: 6720, rating: 4.8, gradient: "from-pink-500 to-fuchsia-500", emoji: "🎨" },
  { id: "7", title: "Code School Pro", owner: "DevAcademy", category: "education", price: "$59/mo", members: 18402, rating: 4.9, gradient: "from-indigo-500 to-blue-500", emoji: "💻", badge: "hot" },
  { id: "8", title: "Iron Lift Coaching", owner: "Strength Lab", category: "fitness", price: "$35/mo", members: 4321, rating: 4.7, gradient: "from-red-500 to-orange-500", emoji: "💪" },
  { id: "9", title: "Beatmakers Lounge", owner: "Studio Nine", category: "music", price: "$15/mo", members: 7820, rating: 4.6, gradient: "from-purple-500 to-pink-500", emoji: "🎧" },
  { id: "10", title: "Frame Society", owner: "Lens Co.", category: "photo", price: "$22/mo", members: 3290, rating: 4.8, gradient: "from-stone-500 to-zinc-600", emoji: "📷" },
  { id: "11", title: "Tilted Esports", owner: "Pro Stack", category: "gaming", price: "Free", members: 24190, rating: 4.9, gradient: "from-green-500 to-emerald-600", emoji: "🎮", badge: "trending" },
  { id: "12", title: "Growth Engine", owner: "AdHackers", category: "marketing", price: "$79/mo", members: 5910, rating: 4.8, gradient: "from-blue-500 to-cyan-500", emoji: "📣" },
];

function DiscoverPage() {
  const [active, setActive] = useState<string>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return LISTINGS.filter((l) => {
      if (active !== "all" && l.category !== active) return false;
      if (q && !l.title.toLowerCase().includes(q.toLowerCase()) && !l.owner.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [active, q]);

  const featured = LISTINGS.filter((l) => l.badge === "trending").slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 sm:pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Hero */}
          <section className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] uppercase tracking-widest text-muted-foreground">
              <Flame className="size-3 text-primary" /> Discover
            </div>
            <h1 className="mt-4 text-3xl sm:text-5xl font-medium tracking-tight">
              Find your next <span className="text-gradient-accent">community</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Explore thousands of communities, tools, and creators across every category.
            </p>

            <div className="mt-6 max-w-xl mx-auto relative">
              <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search communities, creators, tools…"
                className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20"
              />
            </div>
          </section>

          {/* Categories */}
          <section className="mb-10">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActive(c.key)}
                  className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
                    active === c.key
                      ? "bg-white text-black"
                      : "border border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
                  }`}
                >
                  <c.icon className="size-3.5" />
                  {c.label}
                </button>
              ))}
            </div>
          </section>

          {/* Featured banner */}
          {active === "all" && !q && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" /> Trending now
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featured.map((l) => (
                  <FeaturedCard key={l.id} l={l} />
                ))}
              </div>
            </section>
          )}

          {/* Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">
                {active === "all" ? "All communities" : CATEGORIES.find((c) => c.key === active)?.label}
                <span className="ml-2 text-xs text-muted-foreground">({filtered.length})</span>
              </h2>
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-sm text-muted-foreground">No results for your search.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((l) => (
                  <ListingCard key={l.id} l={l} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function FeaturedCard({ l }: { l: Listing }) {
  return (
    <Link
      to="/discover"
      className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/20 transition"
    >
      <div className={`h-40 bg-gradient-to-br ${l.gradient} relative`}>
        <div className="absolute inset-0 grid place-items-center text-6xl opacity-90">{l.emoji}</div>
        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-black/40 backdrop-blur px-2 py-1 rounded-full text-white">
          <Flame className="size-3 inline -mt-0.5 mr-1 text-amber-300" /> Trending
        </span>
      </div>
      <div className="p-4 bg-[oklch(0.05_0.008_220)]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">{l.title}</div>
            <div className="text-xs text-muted-foreground truncate">by {l.owner}</div>
          </div>
          <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-white shrink-0 transition" />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Users className="size-3" /> {l.members.toLocaleString()}
          </span>
          <span className="text-primary font-medium">{l.price}</span>
        </div>
      </div>
    </Link>
  );
}

function ListingCard({ l }: { l: Listing }) {
  return (
    <Link
      to="/discover"
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] hover:border-white/20 bg-white/[0.02] transition"
    >
      <div className={`h-28 bg-gradient-to-br ${l.gradient} relative`}>
        <div className="absolute inset-0 grid place-items-center text-4xl opacity-90">{l.emoji}</div>
        {l.badge && (
          <span className="absolute top-2 left-2 text-[10px] uppercase tracking-widest bg-black/40 backdrop-blur px-2 py-0.5 rounded-full text-white">
            {l.badge}
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate">{l.title}</div>
            <div className="text-[11px] text-muted-foreground truncate">by {l.owner}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Users className="size-3" /> {l.members.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Star className="size-3 text-amber-400 fill-amber-400" /> {l.rating}
          </span>
          <span className="text-primary font-medium">{l.price}</span>
        </div>
      </div>
    </Link>
  );
}
