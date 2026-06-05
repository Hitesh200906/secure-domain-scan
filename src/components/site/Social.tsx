import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Instagram, Facebook, Twitter, ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { SectionHeader } from "./Features";
import { SectionBackdrop } from "./SectionFx";

type Social = {
  name: string;
  handle: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  followers: string;
  gradient: string;
  glow: string;
  ring: string;
};

const socials: Social[] = [
  {
    name: "Instagram",
    handle: "@nexussecurity",
    href: "https://instagram.com",
    icon: Instagram,
    followers: "128K followers",
    gradient: "from-[#d62976]/40 via-[#fa7e1e]/20 to-transparent",
    glow: "shadow-[0_0_40px_-12px_rgba(214,41,118,0.4)]",
    ring: "ring-[#d62976]/30",
  },
  {
    name: "Facebook",
    handle: "/nexussecurity",
    href: "https://facebook.com",
    icon: Facebook,
    followers: "94K followers",
    gradient: "from-[#1877f2]/40 via-[#1877f2]/15 to-transparent",
    glow: "shadow-[0_0_40px_-12px_rgba(24,119,242,0.4)]",
    ring: "ring-[#1877f2]/30",
  },
  {
    name: "Twitter",
    handle: "@nexussec",
    href: "https://twitter.com",
    icon: Twitter,
    followers: "212K followers",
    gradient: "from-[#1da1f2]/40 via-[#1da1f2]/15 to-transparent",
    glow: "shadow-[0_0_40px_-12px_rgba(29,161,242,0.4)]",
    ring: "ring-[#1da1f2]/30",
  },
];

function SocialCard({ s, index }: { s: Social; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16 });
  const sy = useSpring(y, { stiffness: 220, damping: 16 });
  const rotateX = useTransform(sy, [-60, 60], [18, -18]);
  const rotateY = useTransform(sx, [-60, 60], [-18, 18]);

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

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
        onMouseMove={handleMove}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`relative block rounded-3xl p-px bg-gradient-to-br ${s.gradient} ${s.glow} transition-shadow duration-500 hover:shadow-[0_0_90px_-8px_rgba(255,255,255,0.25)]`}
      >
        <div
          className="relative rounded-[calc(theme(borderRadius.3xl)-1px)] bg-[oklch(0.06_0.008_220)] p-8 overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* floating orbs */}
          <motion.div
            aria-hidden
            className={`absolute -top-12 -right-12 size-40 rounded-full bg-gradient-to-br ${s.gradient} opacity-30 blur-2xl`}
            animate={{ scale: [1, 1.15, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{ transform: "translateZ(20px)" }}
          />
          <motion.div
            aria-hidden
            className={`absolute -bottom-16 -left-10 size-44 rounded-full bg-gradient-to-tr ${s.gradient} opacity-20 blur-2xl`}
            animate={{ scale: [1.1, 1, 1.1], rotate: [0, -90, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative flex items-start justify-between" style={{ transform: "translateZ(50px)" }}>
            <motion.div
              whileHover={{ rotateY: 360, scale: 1.1 }}
              transition={{ duration: 0.8 }}
              className={`size-16 rounded-2xl bg-gradient-to-br ${s.gradient} grid place-items-center ring-2 ${s.ring} ring-offset-2 ring-offset-black/60`}
            >
              <s.icon className="size-8 text-white" strokeWidth={2} />
            </motion.div>
            <motion.div
              whileHover={{ x: 4, y: -4 }}
              className="size-10 rounded-full glass grid place-items-center text-white"
            >
              <ArrowUpRight className="size-4" />
            </motion.div>
          </div>

          <div className="relative mt-10" style={{ transform: "translateZ(40px)" }}>
            <div className="text-2xl font-semibold tracking-tight text-white">
              {s.name}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{s.handle}</div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {s.followers}
              </span>
              <span className="text-xs font-medium text-white/80 group-hover:text-white">
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
