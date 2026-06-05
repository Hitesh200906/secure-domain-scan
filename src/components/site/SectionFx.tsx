import { motion } from "framer-motion";
import cube3d from "@/assets/3d-cube.png";
import hex3d from "@/assets/3d-hex.png";
import sphere3d from "@/assets/3d-sphere.png";
import lock3d from "@/assets/3d-lock.png";
import torus3d from "@/assets/3d-torus.png";
import pyramid3d from "@/assets/3d-pyramid.png";
import bgGrid from "@/assets/bg-grid-space.jpg";
import bgCircuit from "@/assets/bg-circuit.jpg";

export const float3dAssets = {
  cube: cube3d,
  hex: hex3d,
  sphere: sphere3d,
  lock: lock3d,
  torus: torus3d,
  pyramid: pyramid3d,
};

export type Float3DKey = keyof typeof float3dAssets;

export function Float3D({
  shape,
  className = "",
  rotate = [-15, 15],
  duration = 12,
  yRange = [0, -24],
}: {
  shape: Float3DKey;
  className?: string;
  rotate?: [number, number];
  duration?: number;
  yRange?: [number, number];
}) {
  return (
    <motion.img
      src={float3dAssets[shape]}
      alt=""
      aria-hidden
      loading="lazy"
      className={`pointer-events-none absolute select-none drop-shadow-[0_0_30px_oklch(0.86_0.16_200_/0.45)] ${className}`}
      animate={{ y: yRange, rotate, scale: [1, 1.06, 1] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
    />
  );
}

export function SectionBackdrop({
  variant = "grid",
  opacity = 0.18,
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
