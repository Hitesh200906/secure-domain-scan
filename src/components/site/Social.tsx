import { motion } from "framer-motion";
import { ArrowUpRight, Users, BarChart3, Zap } from "lucide-react";
import { SectionHeader } from "./Features";
import { SectionBackdrop } from "./SectionFx";
import bgIg from "@/assets/social-ig-dark.jpg";
import bgFb from "@/assets/social-fb-dark.jpg";
import bgX from "@/assets/social-x-new.jpg";
import logoIg from "@/assets/logo-instagram.jpg";
import logoFb from "@/assets/logo-facebook.jpg";
import logoX from "@/assets/logo-x.jpg";

type Social = {
  name: string;
  handle: string;
  href: string;
  logo: string;
  followers: string;
  posts: string;
  engagement: string;
  tagline: string;
  bg: string;
  accent: string;
  glow: string;
};

const socials: Social[] = [
  {
    name: "Instagram",
    handle: "@nexussecurity",
    href: "https://instagram.com",
    logo: logoIg,
    followers: "128K",
    posts: "1.2K",
    engagement: "8.4%",
    tagline: "Threat intel reels & security visuals",
    bg: bgIg,
    accent: "#e1306c",
    glow: "rgba(225,48,108,0.35)",
  },
  {
    name: "Facebook",
    handle: "/nexussecurity",
    href: "https://facebook.com",
    logo: logoFb,
    followers: "94K",
    posts: "860",
    engagement: "6.1%",
    tagline: "Community alerts & live Q&A sessions",
    bg: bgFb,
    accent: "#1877F2",
    glow: "rgba(24,119,242,0.35)",
  },
  {
    name: "X",
    handle: "@nexussec",
    href: "https://x.com",
    logo: logoX,
    followers: "212K",
    posts: "5.8K",
    engagement: "11.2%",
    tagline: "Real-time CVE drops & research threads",
    bg: bgX,
    accent: "#ffffff",
    glow: "rgba(255,255,255,0.22)",
  },
];

function SocialCard({ s, index }: { s: Social; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
    >
      <a
        href={s.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block rounded-3xl overflow-hidden border border-white/10 hover:border-white/25 transition-colors duration-500"
      >
        {/* Visual header */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={s.bg}
            alt={`${s.name} dark themed artwork`}
            width={1024}
            height={768}
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[oklch(0.05_0.008_220)]" />
          <div
            className="absolute -inset-x-10 -top-24 h-40 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: `radial-gradient(closest-side, ${s.glow}, transparent)` }}
          />
          <div className="absolute top-4 right-4 size-9 rounded-full grid place-items-center border border-white/15 bg-black/40 backdrop-blur text-white/80 group-hover:bg-white/15 transition">
            <ArrowUpRight className="size-4" />
          </div>
        </div>

        {/* Floating logo */}
        <div className="absolute top-48 left-7 -translate-y-1/2 z-10">
          <div
            className="size-16 rounded-2xl overflow-hidden border-2 shadow-2xl bg-black"
            style={{ borderColor: s.accent, boxShadow: `0 8px 30px -6px ${s.glow}` }}
          >
            <img src={s.logo} alt={`${s.name} logo`} width={64} height={64} loading="lazy" className="size-full object-cover" />
          </div>
        </div>

        {/* Body */}
        <div className="relative bg-[oklch(0.05_0.008_220)] px-7 pt-12 pb-7">
          <div
            className="absolute top-0 left-0 right-0 h-px opacity-50"
            style={{ background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)` }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">{s.name}</span>
              <span className="size-1 rounded-full" style={{ background: s.accent }} />
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: s.accent }}>Verified</span>
            </div>
            <div className="mt-1.5 text-2xl font-semibold tracking-tight text-white">{s.handle}</div>
            <p className="mt-2 text-xs text-white/50 leading-relaxed">{s.tagline}</p>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { icon: Users, label: "Followers", value: s.followers },
                { icon: BarChart3, label: "Posts", value: s.posts },
                { icon: Zap, label: "Engage", value: s.engagement },
              ].map((st) => (
                <div key={st.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-center">
                  <st.icon className="size-3 mx-auto mb-1 text-white/35" />
                  <div className="text-sm font-semibold text-white">{st.value}</div>
                  <div className="text-[9px] uppercase tracking-[0.15em] text-white/35">{st.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs text-white/40">Live threat updates</span>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-1.5 border transition-all duration-300 group-hover:gap-2.5"
                style={{ color: s.accent, borderColor: `${s.accent}40`, background: `${s.accent}12` }}
              >
                Follow <span aria-hidden>→</span>
              </span>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

export function Social() {
  return (
    <section className="relative py-16 sm:py-32 overflow-hidden">
      <SectionBackdrop variant="grid" opacity={0.1} />
      {/* Ambient accent glows */}
      <div className="pointer-events-none absolute top-1/3 left-0 size-96 rounded-full blur-[140px] opacity-20 bg-[#e1306c]" />
      <div className="pointer-events-none absolute bottom-0 right-0 size-96 rounded-full blur-[140px] opacity-15 bg-[#1877F2]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Community"
          title="Join us on social"
          description="Follow Nexefy Security for live threat intel, research drops, and behind-the-scenes from our red team."
        />
        <div className="mt-10 sm:mt-16 grid md:grid-cols-3 gap-5 sm:gap-6">
          {socials.map((s, i) => (
            <SocialCard key={s.name} s={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
