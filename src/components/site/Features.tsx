import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Brain,
  ShieldCheck,
  FileSearch,
  Network,
  Cloud,
  Radar,
} from "lucide-react";
import { useRef } from "react";
import featuresHero from "@/assets/features-hero.jpg";
import cube3d from "@/assets/3d-cube.png";
import hex3d from "@/assets/3d-hex.png";
import sphere3d from "@/assets/3d-sphere.png";
import lock3d from "@/assets/3d-lock.png";

const features = [
  {
    icon: Brain,
    title: "AI Vulnerability Detection",
    desc: "Models trained on millions of CVEs surface unknown attack paths and zero-day patterns in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "OWASP Security Assessment",
    desc: "Full OWASP Top 10 coverage with deep checks for injection, auth, and broken access control flaws.",
  },
  {
    icon: FileSearch,
    title: "Penetration Testing Reports",
    desc: "Executive-grade reports with reproducible steps, evidence and CVSS-scored remediation paths.",
  },
  {
    icon: Network,
    title: "API Security Analysis",
    desc: "Schema-aware fuzzing for REST, GraphQL and gRPC. BOLA, rate limit and auth flow validation.",
  },
  {
    icon: Cloud,
    title: "Cloud Infrastructure Audits",
    desc: "AWS, GCP and Azure misconfiguration analysis mapped to CIS benchmarks and best practices.",
  },
  {
    icon: Radar,
    title: "Real-Time Threat Intelligence",
    desc: "Live feeds from 40+ sources continuously correlated with your exposed surface and assets.",
  },
];

function Tilt3DCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });
  const rotateX = useTransform(sy, [-50, 50], [10, -10]);
  const rotateY = useTransform(sx, [-50, 50], [-10, 10]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FloatingObject({
  src,
  className,
  rotate,
  duration,
  yRange,
}: {
  src: string;
  className?: string;
  rotate: [number, number];
  duration: number;
  yRange: [number, number];
}) {
  return (
    <motion.img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      className={`pointer-events-none absolute select-none drop-shadow-[0_0_30px_oklch(0.86_0.16_200_/0.5)] ${className ?? ""}`}
      animate={{ y: yRange, rotate, scale: [1, 1.05, 1] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
    />
  );
}

export function Features() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Animated 3D hero visual */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.img
          src={featuresHero}
          alt=""
          aria-hidden
          width={1920}
          height={1080}
          loading="lazy"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] max-w-none opacity-25 mix-blend-screen"
          animate={{ y: [0, -20, 0], rotateZ: [0, 1.5, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
      </div>

      {/* Floating 3D objects scattered across the section */}
      <FloatingObject
        src={cube3d}
        className="top-[8%] left-[3%] w-28 sm:w-36 opacity-70"
        rotate={[-12, 12]}
        duration={9}
        yRange={[0, -28]}
      />
      <FloatingObject
        src={hex3d}
        className="top-[22%] right-[4%] w-32 sm:w-44 opacity-80"
        rotate={[15, -15]}
        duration={11}
        yRange={[0, 22]}
      />
      <FloatingObject
        src={sphere3d}
        className="top-[58%] left-[2%] w-36 sm:w-48 opacity-60"
        rotate={[-20, 20]}
        duration={14}
        yRange={[0, -34]}
      />
      <FloatingObject
        src={lock3d}
        className="bottom-[8%] right-[6%] w-28 sm:w-36 opacity-75"
        rotate={[18, -10]}
        duration={10}
        yRange={[0, -22]}
      />
      <FloatingObject
        src={hex3d}
        className="bottom-[28%] left-[42%] w-20 sm:w-28 opacity-40"
        rotate={[-25, 25]}
        duration={16}
        yRange={[0, 18]}
      />


      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Capabilities"
          title="Security infrastructure, reimagined"
          description="A complete platform that combines AI reasoning with battle-tested security methodology to keep your stack protected."
        />

        <div
          className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{ perspective: 1200 }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20, rotateX: -8 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.07 }}
            >
              <Tilt3DCard className="group relative h-full rounded-2xl glass p-8 lg:p-10 transition will-change-transform hover:border-primary/30">
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), oklch(0.86 0.16 200 / 0.12), transparent 40%)",
                  }}
                />
                <div
                  className="relative"
                  style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
                >
                  <motion.div
                    whileHover={{ rotateY: 360 }}
                    transition={{ duration: 0.8 }}
                    className="inline-flex items-center justify-center size-12 rounded-xl glass text-primary shadow-[0_0_30px_-6px_oklch(0.86_0.16_200_/0.5)]"
                  >
                    <f.icon className="size-5" strokeWidth={1.6} />
                  </motion.div>
                  <h3 className="mt-6 text-lg font-medium text-white tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </Tilt3DCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </div>
      )}
      <h2 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-[-0.03em] text-gradient">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
