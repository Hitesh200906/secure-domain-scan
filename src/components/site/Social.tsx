import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { SectionHeader } from "./Features";
import { SectionBackdrop } from "./SectionFx";
import bgIg from "@/assets/social-ig.jpg";
import bgFb from "@/assets/social-fb.jpg";
import bgTw from "@/assets/social-tw.jpg";
import logoIg from "@/assets/logo-instagram.png";
import logoFb from "@/assets/logo-facebook.png";
import logoX from "@/assets/logo-x.png";

type Social = {
  name: string;
  handle: string;
  href: string;
  logo: string;
  followers: string;
  bg: string;
  accent: string;
};

const socials: Social[] = [
  {
    name: "Instagram",
    handle: "@nexussecurity",
    href: "https://instagram.com",
    logo: logoIg,
    followers: "128K followers",
    bg: bgIg,
    accent: "#e1306c",
  },
  {
    name: "Facebook",
    handle: "/nexussecurity",
    href: "https://facebook.com",
    logo: logoFb,
    followers: "94K followers",
    bg: bgFb,
    accent: "#1877F2",
  },
  {
    name: "X",
    handle: "@nexussec",
    href: "https://x.com",
    logo: logoX,
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
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${s.bg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/95" />

        <div
          className="absolute top-0 left-0 right-0 h-px opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)` }}
        />

        <div className="relative p-8 min-h-[260px] flex flex-col justify-between" style={{ transformStyle: "preserve-3d" }}>
          <div className="flex items-start justify-between" style={{ transform: "translateZ(40px)" }}>
            <motion.div
              whileHover={{ rotateY: 360 }}
              transition={{ duration: 0.8 }}
              className="size-14 rounded-2xl overflow-hidden border border-white/15 shadow-lg bg-black"
            >
              <img
                src={s.logo}
                alt={`${s.name} logo`}
                width={56}
                height={56}
                loading="lazy"
                className="size-full object-cover"
              />
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
