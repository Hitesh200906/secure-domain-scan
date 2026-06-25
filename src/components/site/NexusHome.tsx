import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Compass, Flame, Users, TrendingUp, Sparkles, Store, Rocket,
  MessageCircle, Star, ArrowRight, Zap, Globe2, Crown, Coins, Shield,
} from "lucide-react";
import { TownhallFeed } from "./TownhallFeed";
import { NexusCinematicHero, type Phase } from "./NexusCinematicHero";
import { useAppMode } from "@/lib/app-mode";
import nexusLogo from "@/assets/nexus-logo.png";



const categories = [
  { icon: Rocket, label: "Startups", count: "2.4k" },
  { icon: Crown, label: "Premium", count: "1.1k" },
  { icon: Coins, label: "Trading", count: "3.8k" },
  { icon: Sparkles, label: "AI Tools", count: "5.2k" },
  { icon: Flame, label: "Trending", count: "12k" },
  { icon: Globe2, label: "Global", count: "9.6k" },
];

const featuredCommunities = [
  { name: "ClipForge", desc: "Short-form video creators", members: "12.4k", color: "from-cyan-500 to-blue-600", price: "Free" },
  { name: "Drop Forge", desc: "E-commerce launchpad", members: "8.1k", color: "from-orange-500 to-red-600", price: "$29/mo" },
  { name: "AI Builders", desc: "Build with the latest models", members: "24.7k", color: "from-violet-500 to-fuchsia-600", price: "Free" },
  { name: "Trader's Edge", desc: "Stock & crypto signals", members: "6.3k", color: "from-emerald-500 to-teal-600", price: "$49/mo" },
  { name: "Design Lab", desc: "UI/UX masterclasses", members: "9.8k", color: "from-pink-500 to-rose-600", price: "$19/mo" },
  { name: "Code Camp", desc: "Full-stack bootcamp", members: "15.2k", color: "from-indigo-500 to-purple-600", price: "$39/mo" },
];

const creators = [
  { name: "Steven Schwartz", handle: "Creator of Nexus AI", followers: "94k" },
  { name: "Tiana Reyes", handle: "Creator of Nexus University", followers: "62k" },
  { name: "Evan Stanfield", handle: "Creator of Clipping Culture", followers: "48k" },
  { name: "QTT", handle: "Creator of Rocket Labs", followers: "37k" },
  { name: "APP Builder", handle: "Creator of App Studio", followers: "29k" },
  { name: "Laura Egocheaga", handle: "Creator of Viral Growth", followers: "55k" },
];

export function NexusHome() {
  const { mode, setMode } = useAppMode();
  const [phase, setPhase] = useState<Phase>("galaxy");

  const textShown   = phase === "text" || phase === "buttons" || phase === "living";
  const btnsShown   = phase === "buttons" || phase === "living";
  const introActive = phase !== "living";

  return (
    <div className="relative">
      {/* HERO - cinematic split-screen */}
      <section className="relative min-h-[92svh] flex items-center overflow-hidden pt-24 sm:pt-28 pb-12 sm:pb-16 bg-black">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 -left-32 size-[520px] rounded-full bg-[oklch(0.86_0.16_200_/0.10)] blur-[140px]" />
          <div className="absolute bottom-0 right-0 size-[480px] rounded-full bg-[oklch(0.55_0.20_280_/0.10)] blur-[140px]" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* LEFT — Copy */}
          <div className="lg:col-span-5 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: textShown ? 1 : 0, y: textShown ? 0 : 8 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs text-muted-foreground"
            >
              <img src={nexusLogo} alt="" className="size-3.5" />
              <span className="tracking-[0.18em] uppercase">Welcome to Nexus</span>
            </motion.div>

            {/* Apple-style blur→focus reveal */}
            <motion.h1
              initial={{ opacity: 0, y: 18, filter: "blur(18px)" }}
              animate={
                textShown
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 18, filter: "blur(18px)" }
              }
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 pb-2 text-[40px] leading-[1.05] sm:text-5xl lg:text-[58px] xl:text-[72px] font-semibold tracking-[-0.035em] sm:leading-[1.02] text-gradient"
            >
              The home of
              <br />
              internet bu
              <span id="nexus-guardian-anchor" className="relative inline-block">
                ss
                {/* Guardian sit anchor — perches on top of the "ss" */}
                <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-cyan-300/70 blur-[2px]" aria-hidden />
              </span>
              iness.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14, filter: "blur(12px)" }}
              animate={
                textShown
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 14, filter: "blur(12px)" }
              }
              transition={{ duration: 1.0, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 sm:mt-7 max-w-xl mx-auto lg:mx-0 text-sm sm:text-lg text-muted-foreground leading-relaxed"
            >
              Discover thousands of communities, courses, and digital products — or launch your own
              store in minutes. One platform, infinite possibilities.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={btnsShown ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.05 }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <button
                onClick={() => setMode("nexus")}
                className={`group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition will-change-transform ${
                  mode === "nexus"
                    ? "bg-white text-black shadow-[0_10px_40px_-10px_rgba(255,255,255,0.55)]"
                    : "glass text-white hover:bg-white/10"
                }`}
              >
                <Sparkles className="size-4" />
                Switch to Nexus
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => setMode("security")}
                className={`group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition will-change-transform ${
                  mode === "security"
                    ? "bg-white text-black shadow-[0_10px_40px_-10px_rgba(34,211,238,0.55)]"
                    : "glass text-white hover:bg-white/10"
                }`}
              >
                <Shield className="size-4" />
                Switch to Nexus Security
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: btnsShown ? 1 : 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="mt-10 sm:mt-12 grid grid-cols-4 gap-4 sm:gap-6 max-w-md mx-auto lg:mx-0"
            >
              {[
                { v: "50k+", l: "Creators" },
                { v: "$120M", l: "Paid" },
                { v: "2.1M", l: "Members" },
                { v: "180+", l: "Countries" },
              ].map((s) => (
                <div key={s.l} className="text-center lg:text-left">
                  <div className="text-lg sm:text-2xl font-semibold tracking-tight text-white">{s.v}</div>
                  <div className="mt-1 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — Cinematic universe */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0 }}
            className="lg:col-span-7 relative h-[440px] sm:h-[560px] lg:h-[640px]"
          >
            <NexusCinematicHero onPhaseChange={setPhase} />
          </motion.div>
        </div>

        {/* Intro skip affordance — only visible during the 6s intro */}
        {introActive && (
          <button
            onClick={() => {
              sessionStorage.setItem("nexus_intro_seen", "true");
              setPhase("living");
            }}
            className="absolute bottom-5 right-5 z-10 rounded-full glass px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/70 hover:text-white"
          >
            Skip intro
          </button>
        )}
      </section>



      {/* TOWNHALL FEED */}
      <TownhallFeed />

      {/* CATEGORIES */}
      <section className="relative py-14 sm:py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between mb-7 sm:mb-10 gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <Compass className="size-3" /> Browse
              </div>
              <h2 className="mt-4 text-2xl sm:text-4xl font-semibold tracking-tight text-white">
                Explore by category
              </h2>
            </div>
            <Link to="/discover" className="hidden sm:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white shrink-0">
              See all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl glass p-4 sm:p-5 hover:border-white/20 transition cursor-pointer"
              >
                <c.icon className="size-5 text-primary group-hover:scale-110 transition" />
                <div className="mt-3 text-sm font-medium text-white">{c.label}</div>
                <div className="text-xs text-muted-foreground">{c.count} stores</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COMMUNITIES */}
      <section className="relative py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between mb-7 sm:mb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <Flame className="size-3" /> Trending now
              </div>
              <h2 className="mt-4 text-2xl sm:text-4xl font-semibold tracking-tight text-white">
                Featured communities
              </h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {featuredCommunities.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group relative rounded-2xl overflow-hidden glass hover:border-white/20 transition cursor-pointer"
              >
                <div className={`h-32 bg-gradient-to-br ${c.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
                  <div className="absolute top-3 right-3 rounded-full bg-black/40 backdrop-blur px-2.5 py-1 text-[11px] text-white font-medium">
                    {c.price}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`size-11 -mt-10 rounded-xl bg-gradient-to-br ${c.color} border-4 border-background grid place-items-center text-white font-semibold`}>
                      {c.name[0]}
                    </div>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-white">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">{c.desc}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="size-3.5" /> {c.members} members
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition">
                      Join <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR CREATORS */}
      <section className="relative py-14 sm:py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between mb-7 sm:mb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <Star className="size-3" /> Top creators
              </div>
              <h2 className="mt-4 text-2xl sm:text-4xl font-semibold tracking-tight text-white">
                Popular users
              </h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {creators.map((u, i) => (
              <motion.div
                key={u.name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 rounded-2xl glass p-4 hover:border-white/20 transition"
              >
                <div className="size-12 rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center text-white font-semibold">
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{u.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.handle}</div>
                </div>
                <button className="rounded-full bg-white text-black px-3.5 py-1.5 text-xs font-medium hover:bg-primary transition">
                  Follow
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-14 sm:py-20 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <Zap className="size-3" /> How it works
            </div>
            <h2 className="mt-4 text-2xl sm:text-4xl font-semibold tracking-tight text-gradient">
              Launch in three steps
            </h2>
          </div>
          <div className="mt-10 sm:mt-12 grid sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              { icon: Store, title: "Create your store", desc: "Set up your branded storefront in under 2 minutes. No code required." },
              { icon: MessageCircle, title: "Build community", desc: "Chat, forums, courses, drops — everything your audience needs in one place." },
              { icon: TrendingUp, title: "Grow & earn", desc: "Get discovered by millions of buyers. Keep 95% of every sale, instantly." },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl glass p-6 sm:p-7"
              >
                <div className="inline-flex items-center justify-center size-11 rounded-xl glass text-primary">
                  <s.icon className="size-5" />
                </div>
                <div className="mt-5 text-xs font-mono text-muted-foreground">0{i + 1}</div>
                <h3 className="mt-1 text-lg font-medium text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="relative rounded-3xl overflow-hidden p-px bg-gradient-to-b from-primary/40 via-secondary/20 to-transparent">
            <div className="relative rounded-[calc(theme(borderRadius.3xl)-1px)] bg-[oklch(0.05_0.008_220)] p-8 sm:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 hero-gradient opacity-60" />
              <div className="relative">
                <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-gradient">
                  Start your business today
                </h2>
                <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                  Join 50,000+ creators building their internet business on Nexus.
                </p>
                <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/business"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-medium hover:shadow-[0_0_40px_-4px_rgba(255,255,255,0.5)] transition"
                  >
                    Start a business <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    to="/discover"
                    className="inline-flex items-center justify-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium text-white"
                  >
                    Explore stores
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
