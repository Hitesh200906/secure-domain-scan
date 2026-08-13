import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import statsImage from "@/assets/by-the-numbers-v2.png.asset.json";

function PhysicsParticles({ count = 28 }: { count?: number }) {
  const particles = useRef(
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1.5 + Math.random() * 2.5,
      duration: 12 + Math.random() * 18,
      delay: Math.random() * -20,
      opacity: 0.12 + Math.random() * 0.18,
    }))
  ).current;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            filter: "blur(0.5px)",
          }}
          animate={{
            y: ["-20%", "120%", "-20%"],
            x: ["0%", `${Math.sin(p.id) * 10}%`, "0%"],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function FloatingOrb({ className }: { className?: string }) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full bg-cyan-500/10 blur-3xl ${className}`}
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const ySpring = useSpring(y, { stiffness: 80, damping: 20 });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.02, 1, 1.02]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="relative w-full overflow-hidden bg-black">
      <FloatingOrb className="left-[10%] top-[15%] h-40 w-40 sm:h-64 sm:w-64" />
      <FloatingOrb className="right-[15%] bottom-[10%] h-32 w-32 sm:h-48 sm:w-48" />

      <PhysicsParticles count={32} />

      <motion.div
        style={{ y: ySpring, scale, opacity }}
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-7xl px-4 sm:px-6"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src={statsImage.url}
            alt="By the numbers"
            loading="lazy"
            className="block w-full h-auto"
          />
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-30" aria-hidden />
    </section>
  );
}
