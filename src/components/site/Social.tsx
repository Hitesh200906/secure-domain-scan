import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { SectionHeader } from "./Features";
import { SectionBackdrop } from "./SectionFx";
import bgIg from "@/assets/social-ig.jpg";
import bgFb from "@/assets/social-fb.jpg";
import bgTw from "@/assets/social-tw.jpg";

// Brand icons with official colors
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <defs>
      <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-grad)" />
    <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="1.8" />
    <circle cx="17.5" cy="6.5" r="1.2" fill="#fff" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#1877F2"
      d="M24 12a12 12 0 1 0-13.875 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.313 0 2.686.234 2.686.234v2.953h-1.513c-1.491 0-1.956.925-1.956 1.875V12h3.328l-.532 3.47h-2.796v8.384A12.003 12.003 0 0 0 24 12Z"
    />
    <path
      fill="#fff"
      d="m16.671 15.47.532-3.47h-3.328V9.75c0-.95.465-1.875 1.956-1.875h1.513V4.922s-1.373-.234-2.686-.234c-2.741 0-4.533 1.661-4.533 4.668V12H7.078v3.47h3.047v8.384a12.09 12.09 0 0 0 3.75 0V15.47h2.796Z"
    />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <rect width="24" height="24" rx="4" fill="#000" />
    <path
      fill="#fff"
      d="M17.53 5h2.41l-5.27 6.02L21 19h-4.86l-3.8-4.97L7.97 19H5.55l5.64-6.44L5 5h4.98l3.43 4.54L17.53 5Zm-.85 12.55h1.34L8.4 6.36H6.97l9.71 11.19Z"
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
  },
  {
    name: "Facebook",
    handle: "/nexussecurity",
    href: "https://facebook.com",
    icon: FacebookIcon,
    followers: "94K followers",
    bg: bgFb,
    accent: "#1877F2",
  },
  {
    name: "X",
    handle: "@nexussec",
    href: "https://x.com",
    icon: XIcon,
    followers: "212K followers",
    bg: bgTw,
    accent: "#ffffff",
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
              <s.icon className="size-6 text-white" strokeWidth={1.8} />
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
