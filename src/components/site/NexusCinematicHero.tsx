import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { ModeToggle } from "./ModeToggle";
import marketplaceAsset from "@/assets/marketplace-world.png.asset.json";

/* ================================================================
   HERO — black space, twinkling stars, marketplace showcase image.
   ================================================================ */

type Star = { x: number; y: number; r: number; base: number; amp: number; speed: number; phase: number };

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number | null>(null);
  const density = useMemo(() => 0.00022, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0, height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const seed = () => {
      const count = Math.floor(width * height * density);
      const arr: Star[] = new Array(count);
      for (let i = 0; i < count; i++) {
        const r = Math.random();
        const size = r < 0.85 ? Math.random() * 0.6 + 0.2 : Math.random() * 1.1 + 0.6;
        arr[i] = {
          x: Math.random() * width,
          y: Math.random() * height,
          r: size,
          base: Math.random() * 0.5 + 0.25,
          amp: Math.random() * 0.45 + 0.15,
          speed: Math.random() * 1.2 + 0.4,
          phase: Math.random() * Math.PI * 2,
        };
      }
      starsRef.current = arr;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const twinkle = s.base + Math.sin(t * s.speed + s.phase) * s.amp;
        const alpha = Math.max(0.05, Math.min(1, twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [density]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

export function NexusCinematicHero() {
  return (
    <section className="relative w-full overflow-hidden bg-black pt-24 sm:pt-28 pb-10 sm:pb-14 min-h-[100svh]">
      <StarField />

      {/* Marketplace showcase */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 sm:px-6 min-h-[calc(100svh-9rem)]">
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full flex justify-center"
          >
            {/* soft glow behind */}
            <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
              <div className="size-[70%] rounded-full bg-sky-500/20 blur-[120px]" />
            </div>
            <motion.img
              src={marketplaceAsset.url}
              alt="Marketplace"
              className="w-full max-w-[900px] h-auto object-contain drop-shadow-[0_20px_60px_rgba(56,189,248,0.35)] select-none"
              draggable={false}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 sm:mt-8 text-center text-3xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.04em] text-white"
          >
            Marketplace
          </motion.h2>
        </div>

        <div className="mt-auto flex justify-center pb-2 sm:pb-4">
          <ModeToggle />
        </div>
      </div>
    </section>
  );
}
