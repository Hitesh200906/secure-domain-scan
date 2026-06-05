import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { SectionHeader } from "./Features";
import { SectionBackdrop } from "./SectionFx";
import bgIg from "@/assets/social-ig.jpg";
import bgFb from "@/assets/social-fb.jpg";
import bgTw from "@/assets/social-tw.jpg";

// Brand glyphs in white — the container box carries the brand color.
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="#fff" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="#fff" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.2" fill="#fff" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#fff"
      d="M15.12 8.5h2.13V5.1c-.37-.05-1.63-.16-3.1-.16-3.07 0-5.17 1.93-5.17 5.48V13H6.07v3.8h2.91V24h3.57v-7.2h2.79l.44-3.8h-3.23v-2.2c0-1.1.3-1.85 1.57-1.85Z"
    />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#fff"
      d="M17.53 4h2.41l-5.27 6.02L21 19h-4.86l-3.8-4.97L7.97 19H5.55l5.64-6.44L5 4h4.98l3.43 4.54L17.53 4Zm-.85 13.55h1.34L8.4 5.36H6.97l9.71 12.19Z"
    />
  </svg>
);


type Social = {
  name: string;
  handle: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  followers: string;
  bg: string;
  accent: string;
  iconBg: string;
};


const socials: Social[] = [
  {
    name: "Instagram",
    handle: "@nexussecurity",
    href: "https://instagram.com",
    icon: InstagramIcon,
    followers: "128K followers",
    bg: bgIg,
    accent: "#e1306c",
    iconBg: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
  },
  {
    name: "Facebook",
    handle: "/nexussecurity",
    href: "https://facebook.com",
    icon: FacebookIcon,
    followers: "94K followers",
    bg: bgFb,
    accent: "#1877F2",
    iconBg: "#1877F2",
  },
  {
    name: "X",
    handle: "@nexussec",
    href: "https://x.com",
    icon: XIcon,
    followers: "212K followers",
    bg: bgTw,
    accent: "#ffffff",
    iconBg: "#000000",
  },
];


function SocialCard({ s, index }: { s: Social; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16 });
  const sy = useSpring(y, { stiffness: 220, damping: 16 });
  const rotateX = useTransform(sy, [-60, 60], [10, -10]);
  const rotateY = useTransform(sx, [-60, 60], [-10, 10]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{ perspective: 1200 }}
    >
      <motion.a
        ref={ref}
        href={s.href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={(e) => {
          const rect = ref.current?.getBoundingClientRect();
          if (!rect) return;
          x.set(e.clientX - rect.left - rect.width / 2);
          y.set(e.clientY - rect.top - rect.height / 2);
        }}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative block rounded-3xl overflow-hidden border border-white/10 hover:border-white/25 transition-colors duration-500"
      >
        {/* dark background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${s.bg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/95" />

        {/* thin top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)` }}
        />

        <div className="relative p-8 min-h-[260px] flex flex-col justify-between" style={{ transformStyle: "preserve-3d" }}>
          <div className="flex items-start justify-between" style={{ transform: "translateZ(40px)" }}>
            <motion.div
              whileHover={{ rotateY: 360 }}
              transition={{ duration: 0.8 }}
              className="size-14 rounded-2xl grid place-items-center border border-white/15 bg-white/[0.04] backdrop-blur"
            >
              <s.icon className="size-7" />
            </motion.div>
            <div className="size-9 rounded-full grid place-items-center border border-white/15 bg-white/[0.04] text-white/80 group-hover:bg-white/10 transition">
              <ArrowUpRight className="size-4" />
            </div>
          </div>

          <div style={{ transform: "translateZ(30px)" }}>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
              {s.name}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {s.handle}
            </div>
            <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs text-white/50">{s.followers}</span>
              <span
                className="text-xs font-medium"
                style={{ color: s.accent }}
              >
                Follow →
              </span>
            </div>
          </div>
        </div>
      </motion.a>
    </motion.div>
  );
}

export function Social() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <SectionBackdrop variant="grid" opacity={0.1} />
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Community"
          title="Join us on social"
          description="Follow Nexus Security for live threat intel, research drops, and behind-the-scenes from our red team."
        />
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {socials.map((s, i) => (
            <SocialCard key={s.name} s={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
