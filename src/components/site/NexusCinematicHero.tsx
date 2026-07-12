import { motion } from "framer-motion";
import { ModeToggle } from "./ModeToggle";
import marketplaceAsset from "@/assets/marketplace-world.png.asset.json";
import heroBgAsset from "@/assets/hero-bg.png.asset.json";

/* ================================================================
   HERO — pure black space, twinkling stars, 5 floating "worlds"
   with animated labels + descriptions. Marketplace is live;
   4 more slots are ready for the upcoming images.
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

/* -------------------- Animated label -------------------- */
function WorldLabel({ text, accent }: { text: string; accent: string }) {
  return (
    <div className="relative inline-flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative"
      >
        <h3
          className="relative whitespace-nowrap text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[0.18em] uppercase text-white"
          style={{
            textShadow: `0 0 24px ${accent}80, 0 0 60px ${accent}40`,
          }}
        >
          {text.split("").map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              animate={{ y: [0, -2, 0] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: i * 0.05,
                ease: "easeInOut",
              }}
            >
              {ch === " " ? "\u00A0" : ch}
            </motion.span>
          ))}
        </h3>
        {/* animated underline */}
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -bottom-2 left-0 right-0 mx-auto h-px origin-center"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            boxShadow: `0 0 12px ${accent}`,
          }}
        />
        {/* shimmer sweep */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <motion.span
            className="absolute inset-y-0 w-1/3 -skew-x-12"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}55, transparent)`,
            }}
            animate={{ x: ["-120%", "260%"] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
          />
        </span>
      </motion.div>
    </div>
  );
}

/* -------------------- World card -------------------- */
type World = {
  key: string;
  label: string;
  description: string;
  image?: string;
  accent: string;
  delay: number;
};

function WorldCard({ w }: { w: World }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.1, delay: w.delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col items-center text-center"
    >
      {/* image area */}
      <div className="relative w-full aspect-[4/3] flex items-center justify-center">
        {w.image ? (
          <motion.img
            src={w.image}
            alt={w.label}
            draggable={false}
            className="max-h-full max-w-full object-contain select-none"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: w.delay }}
          />
        ) : (
          <div
            className="flex h-[70%] w-[70%] items-center justify-center rounded-3xl border border-dashed"
            style={{ borderColor: `${w.accent}55`, background: `${w.accent}0a` }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Coming soon</span>
          </div>
        )}
      </div>

      {/* label */}
      <div className="mt-4 sm:mt-6">
        <WorldLabel text={w.label} accent={w.accent} />
      </div>

      {/* description */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: w.delay + 0.6 }}
        className="mt-4 max-w-xs text-sm sm:text-base text-white/60 leading-relaxed"
      >
        {w.description}
      </motion.p>
    </motion.div>
  );
}

/* -------------------- Hero -------------------- */
const WORLDS: World[] = [
  {
    key: "marketplace",
    label: "Marketplace",
    description:
      "Buy, sell, create and scale — a living marketplace built for internet-native businesses.",
    image: marketplaceAsset.url,
    accent: "#38bdf8",
    delay: 0,
  },
  {
    key: "communities",
    label: "Communities",
    description: "Bring your people together in interconnected, always-on communities.",
    accent: "#a78bfa",
    delay: 0.1,
  },
  {
    key: "business",
    label: "Business",
    description: "Analytics, orders and revenue — everything you need to run the operation.",
    accent: "#facc15",
    delay: 0.2,
  },
];

export function NexusCinematicHero() {
  return (
    <section className="relative w-full overflow-hidden bg-black pt-24 sm:pt-28 pb-16 sm:pb-20">
      <StarField />

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col px-4 sm:px-6">
        {/* Row of 5 worlds */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-14">
          {WORLDS.map((w) => (
            <WorldCard key={w.key} w={w} />
          ))}
        </div>

        {/* Switch buttons */}
        <div className="mt-16 sm:mt-24 flex justify-center">
          <ModeToggle />
        </div>
      </div>
    </section>
  );
}
