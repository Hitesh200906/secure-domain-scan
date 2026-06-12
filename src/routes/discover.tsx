import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Search, Flame, Users, Star, Eye, ChevronLeft, ChevronRight, BadgeCheck,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Nexus Security" },
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
};

type Section = {
  title: string;
  subtitle: string;
  cards: Card[];
};

const SECTIONS: Section[] = [
  {
    title: "Trading & investing",
    subtitle: "Stocks, options, futures, crypto signals and live trading floors",
    cards: [
      { id: "t1", title: "Apex Trading Floor", owner: "Apex Capital", description: "Daily live calls, options flow, and the strongest community of profitable traders on the internet.", gradient: "from-amber-500 via-orange-600 to-rose-600", emoji: "📈", members: "12.4k", views: "320k", rating: 4.9, reviews: 824, launched: "Launched 1y ago", verified: true, badge: "LIVE" },
      { id: "t2", title: "Sniper Bet Picks", owner: "Sharp Tips", description: "AI-vetted sports betting picks with verified ROI. Daily slips delivered before tip-off.", gradient: "from-emerald-500 via-teal-600 to-cyan-700", emoji: "🎯", members: "5.6k", views: "84k", rating: 4.7, reviews: 312, launched: "Launched 8mo ago" },
      { id: "t3", title: "Crypto Alpha Hub", owner: "ChainLabs", description: "On-chain analytics, presale alpha and a private chat of degens who actually print.", gradient: "from-orange-500 via-yellow-500 to-amber-600", emoji: "₿", members: "8.9k", views: "213k", rating: 4.8, reviews: 491, launched: "Launched 2y ago", verified: true },
    ],
  },
  {
    title: "Tech, AI & coding",
    subtitle: "Code your first app, build AI agents, or earn cloud certifications from pros",
    cards: [
      { id: "a1", title: "WhopFlow", owner: "Kevin", description: "After seeing too many fake AI agencies pushing overpriced fluff with no substance, I decided to build this.", gradient: "from-sky-600 via-blue-700 to-indigo-800", emoji: "🚗", members: "13.6k", views: "79.9k", rating: 4.6, reviews: 77, launched: "Launched 1y ago" },
      { id: "a2", title: "FatihMakes Academy", owner: "Fatih", description: "World's best voice assistant on your computer that improves day by day. Join the community from Instagram to Whop.", gradient: "from-violet-700 via-purple-800 to-indigo-900", emoji: "🎙️", members: "2.7k", views: "36.7k", rating: 5.0, reviews: 17, launched: "Launched 3mo ago" },
      { id: "a3", title: "AI Agent Academy", owner: "Androo", description: "Learn to build, deploy, and scale AI agents that automate real business workflows. From zero to shipping.", gradient: "from-fuchsia-600 via-pink-600 to-rose-700", emoji: "🤖", members: "1.2k", views: "29.9k", rating: 5.0, reviews: 18, launched: "Launched 1mo ago", badge: "NEW" },
    ],
  },
  {
    title: "Business coaching",
    subtitle: "Step-by-step playbooks to launch and scale your online business from zero",
    cards: [
      { id: "b1", title: "Drop Service Accelerator", owner: "Parker Jay Smith", description: "I've built this course from my own experiences in service businesses. I've condensed years of work into 8 weeks.", gradient: "from-zinc-700 via-slate-800 to-zinc-900", emoji: "📦", members: "305", views: "4.1k", rating: 5.0, reviews: 2, launched: "Launched 1y ago" },
      { id: "b2", title: "Cleaning Business University", owner: "Anthony Hartzog", description: "We've built a successful remote cleaning business without ever picking up a mop. Our students follow the exact playbook.", gradient: "from-blue-600 via-sky-700 to-cyan-800", emoji: "🧼", members: "2.8k", views: "1.5k", rating: 5.0, reviews: 3, launched: "Launched 1y ago", badge: "HOT" },
      { id: "b3", title: "Elite Clean Academy", owner: "Amar", description: "The premier solution for building a profitable cleaning business from scratch within 30 days flat.", gradient: "from-neutral-800 via-zinc-900 to-black", emoji: "🧽", members: "73", views: "735", rating: 5.0, reviews: 20, launched: "Launched 1y ago" },
    ],
  },
  {
    title: "Creator economy",
    subtitle: "Build an audience, monetize content, and run your media company solo",
    cards: [
      { id: "c1", title: "ClipForge", owner: "Marcus Lee", description: "Short-form editing playbook used by creators with 100M+ views. Templates, hooks, and viral scripts inside.", gradient: "from-purple-700 via-violet-800 to-fuchsia-900", emoji: "🎬", members: "4.2k", views: "98k", rating: 4.8, reviews: 156, launched: "Launched 6mo ago" },
      { id: "c2", title: "The Creator Desk", owner: "Sofia Reyes", description: "A private studio of full-time creators sharing brand deals, rate sheets, and what's actually working this week.", gradient: "from-rose-600 via-pink-700 to-red-800", emoji: "✨", members: "1.9k", views: "42k", rating: 4.9, reviews: 89, launched: "Launched 4mo ago", verified: true },
      { id: "c3", title: "Butterfly Effect", owner: "Naomi", description: "From 0 to 1M followers playbook with weekly group calls and personal feedback on your content.", gradient: "from-indigo-700 via-blue-800 to-slate-900", emoji: "🦋", members: "2.1k", views: "67k", rating: 4.7, reviews: 134, launched: "Launched 9mo ago" },
    ],
  },
  {
    title: "Faith & mindset",
    subtitle: "Grow with communities focused on dating, mindset, faith, and personal growth",
    cards: [
      { id: "f1", title: "The Forge", owner: "Christian Coalition", description: "Iron sharpens iron. A men's brotherhood built on accountability, discipline and Proverbs 27:17.", gradient: "from-stone-700 via-neutral-800 to-zinc-900", emoji: "⚒️", members: "1.2k", views: "18k", rating: 4.9, reviews: 67, launched: "Launched 7mo ago" },
      { id: "f2", title: "Glory Carriers", owner: "Pastor Daniel", description: "Awakening a new generation of glory carriers through worship, prayer, and prophetic teaching.", gradient: "from-amber-600 via-yellow-700 to-orange-800", emoji: "🔥", members: "3.4k", views: "54k", rating: 5.0, reviews: 201, launched: "Launched 1y ago", verified: true },
      { id: "f3", title: "The Holy Cabin", owner: "Brother Eli", description: "Quiet retreats for the soul. Daily devotionals, scripture study, and a community that prays for you.", gradient: "from-slate-800 via-zinc-900 to-neutral-950", emoji: "✝️", members: "890", views: "12k", rating: 4.8, reviews: 45, launched: "Launched 5mo ago" },
    ],
  },
  {
    title: "Web design agency",
    subtitle: "Get viral clips, UGC videos, design, branding, photography, and creative production done for you",
    cards: [
      { id: "w1", title: "Convert Sail", owner: "Studio Sail", description: "Done-for-you landing pages that convert. We've built sites generating $50M+ for our clients.", gradient: "from-blue-500 via-cyan-600 to-sky-700", emoji: "⛵", members: "412", views: "9.8k", rating: 4.9, reviews: 28, launched: "Launched 8mo ago" },
      { id: "w2", title: "MotionViz", owner: "Viz Collective", description: "Premium motion design and 3D visualizations for product launches that demand attention.", gradient: "from-red-700 via-rose-800 to-pink-900", emoji: "🎨", members: "287", views: "6.4k", rating: 4.8, reviews: 19, launched: "Launched 1y ago" },
      { id: "w3", title: "Technologiv", owner: "Karan Mehta", description: "Full-service agency: LLC setup, Stripe + Wise integration, branding, and ongoing support for new founders.", gradient: "from-amber-700 via-orange-800 to-red-900", emoji: "💼", members: "654", views: "21k", rating: 4.9, reviews: 92, launched: "Launched 2y ago", verified: true },
    ],
  },
];

function DiscoverPage() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const sections = query
    ? SECTIONS.map((s) => ({
        ...s,
        cards: s.cards.filter(
          (c) =>
            c.title.toLowerCase().includes(query) ||
            c.owner.toLowerCase().includes(query) ||
            c.description.toLowerCase().includes(query)
        ),
      })).filter((s) => s.cards.length > 0)
    : SECTIONS;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 sm:pt-28 pb-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          {/* Hero */}
          <section className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] uppercase tracking-widest text-muted-foreground">
              <Flame className="size-3 text-primary" /> Discover
            </div>
            <h1 className="mt-4 text-3xl sm:text-5xl font-medium tracking-tight">
              Find your next <span className="text-gradient-accent">obsession</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl">
              Explore thousands of communities, tools, and creators across every category.
            </p>

            <div className="mt-6 max-w-xl relative">
              <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search communities, creators, tools…"
                className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20"
              />
            </div>
          </section>

          {sections.length === 0 ? (
            <div className="text-center py-32 text-sm text-muted-foreground">
              No results for "{q}". Try a different search.
            </div>
          ) : (
            sections.map((s) => <Row key={s.title} section={s} />)
          )}
        </div>
      </main>
    </div>
  );
}

function Row({ section }: { section: Section }) {
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
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight truncate">{section.title}</h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{section.subtitle}</p>
        </div>
        <div className="hidden sm:flex shrink-0 items-center gap-2">
          <button
            onClick={() => scrollBy(-1)}
            className="size-9 grid place-items-center rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="size-9 grid place-items-center rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {section.cards.map((c) => (
          <BigCard key={c.id} c={c} />
        ))}
      </div>
    </section>
  );
}

function BigCard({ c }: { c: Card }) {
  return (
    <Link
      to="/discover"
      className="group snap-start shrink-0 w-[88%] sm:w-[420px] lg:w-[460px] overflow-hidden rounded-2xl border border-white/[0.08] hover:border-white/20 bg-[oklch(0.06_0.008_220)] transition"
    >
      {/* Cover */}
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
      </div>

      {/* Body */}
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
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3" /> {c.views}
            </span>
          </div>
          <span className="opacity-70">{c.launched}</span>
        </div>
      </div>
    </Link>
  );
}
