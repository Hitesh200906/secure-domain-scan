import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import bgGrid from "@/assets/bg-grid-space.jpg";
import bgCircuit from "@/assets/bg-circuit.jpg";

export function SectionBackdrop({
  variant = "grid",
  opacity = 0.1,
}: {
  variant?: "grid" | "circuit";
  opacity?: number;
}) {
  const src = variant === "grid" ? bgGrid : bgCircuit;
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.img
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
        style={{ opacity }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background" />
    </div>
  );
}

export function Tilt3DBox({
  children,
  className = "",
  intensity = 10,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });
  const rotateX = useTransform(sy, [-50, 50], [intensity, -intensity]);
  const rotateY = useTransform(sx, [-50, 50], [-intensity, intensity]);

  return (
    <motion.div
      ref={ref}
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
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
