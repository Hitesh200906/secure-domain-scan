import { motion } from "framer-motion";
import { Bug, AlertCircle, ShieldCheck } from "lucide-react";
import { T, AnimatedNumber } from "./NexusCinematicHero";

const points = [6, 10, 16, 13, 8, 11, 18, 24, 21, 17, 20, 26, 30];
const w = 520;
const h = 200;
const max = 34;
const path = points
  .map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - (p / max) * h;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  })
  .join(" ");

export function SecurityCard() {
  const score = 72;
  const r = 26;
  const c = 2 * Math.PI * r;

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.35 }}
      className="relative w-full max-w-full px-2 py-8 sm:px-6 sm:py-10 lg:pl-8 lg:pr-4"
      style={{ perspective: "1400px" }}
    >
      <motion.div
        animate={{ y: [0, -10, 0], rotateY: [-11, -7, -11], rotateX: [6, 4, 6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-[22px] overflow-hidden backdrop-blur-xl origin-center"
        style={{
          transformStyle: "preserve-3d",
          background: "linear-gradient(160deg, #0A0B0F 0%, #000000 100%)",
          border: `1px solid ${T.border}`,
          boxShadow:
            "0 50px 110px -40px rgba(0,0,0,1), -24px 24px 60px -40px rgba(79,107,255,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 px-4 pt-4 pb-4">
          {/* Radar */}
          <div>
            <div className="relative mx-auto aspect-square w-full max-w-[150px]">
              <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
                <defs>
                  <linearGradient id="secSweep" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4F6BFF" stopOpacity="0" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
                {[92, 68, 44, 20].map((rad) => (
                  <circle key={rad} cx="100" cy="100" r={rad} fill="none" stroke="rgba(255,255,255,0.08)" />
                ))}
                <line x1="8" x2="192" y1="100" y2="100" stroke="rgba(255,255,255,0.08)" />
                <line x1="100" x2="100" y1="8" y2="192" stroke="rgba(255,255,255,0.08)" />
                <motion.g
                  style={{ originX: "100px", originY: "100px" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                >
                  <path d="M100,100 L192,100 A92,92 0 0,0 165,35 Z" fill="url(#secSweep)" />
                </motion.g>
                {[
                  { x: 70, y: 62, d: 0.2 },
                  { x: 138, y: 122, d: 0.9 },
                  { x: 62, y: 128, d: 1.5 },
                  { x: 118, y: 148, d: 2.1 },
                ].map((p) => (
                  <motion.circle
                    key={`${p.x}-${p.y}`}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#6D7BFF"
                    animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.25, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, delay: p.d, ease: "easeInOut" }}
                  />
                ))}
              </svg>
            </div>

            <div className="mt-3 flex items-center gap-2.5">
              <motion.span
                className="grid size-8 shrink-0 place-items-center rounded-full"
                style={{ background: "rgba(124,58,237,0.12)", border: `1px solid ${T.border}` }}
                animate={{ boxShadow: ["0 0 0 0 rgba(124,58,237,0.35)", "0 0 0 8px rgba(124,58,237,0)"] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              >
                <ShieldCheck className="size-4" style={{ color: "#8B5CF6" }} />
              </motion.span>
              <div className="min-w-0">
                <div className="text-[12px] font-medium" style={{ color: T.text }}>AI Scan Active</div>
                <div className="truncate text-[10px]" style={{ color: T.text2 }}>Scanning for vulnerabilities…</div>
              </div>
            </div>
          </div>

          {/* Graph + tiles */}
          <div className="min-w-0">
            <svg viewBox={`0 0 ${w} ${h}`} className="h-[92px] w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="secLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
                <linearGradient id="secFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <line key={i} x1={(i * w) / 5} x2={(i * w) / 5} y1="0" y2={h} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 6" />
              ))}
              <motion.path
                d={`${path} L${w},${h} L0,${h} Z`}
                fill="url(#secFill)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 1.2 }}
              />
              <motion.path
                d={path}
                fill="none"
                stroke="url(#secLine)"
                strokeWidth={3}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, delay: 0.5, ease: "easeOut" }}
              />
              <motion.circle
                cx={w}
                cy={h - (points[points.length - 1] / max) * h}
                r={7}
                fill="#A855F7"
                animate={{ scale: [1, 1.35, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, delay: 2.2 }}
              />
            </svg>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {/* score ring */}
              <div className="rounded-xl px-2 py-2.5 text-center" style={{ border: `1px solid ${T.border}` }}>
                <div className="relative mx-auto size-[62px]">
                  <svg viewBox="0 0 64 64" className="size-full -rotate-90">
                    <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                    <motion.circle
                      cx="32" cy="32" r={r} fill="none" stroke="url(#secLine)" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={c}
                      initial={{ strokeDashoffset: c }}
                      animate={{ strokeDashoffset: c - (score / 100) * c }}
                      transition={{ duration: 1.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-[13px] font-semibold" style={{ color: T.text }}>
                    <AnimatedNumber value={score} suffix="%" delay={0.8} />
                  </div>
                </div>
                <div className="mt-1.5 text-[9.5px]" style={{ color: T.text2 }}>Security Score</div>
              </div>

              {/* bars */}
              <div className="rounded-xl px-2.5 py-3" style={{ border: `1px solid ${T.border}` }}>
                {[
                  { v: 12, pct: 55, color: "#7C3AED" },
                  { v: 24, pct: 78, color: "#2563EB" },
                  { v: 3, pct: 14, color: "#EF4444" },
                ].map((b, i) => (
                  <div key={b.v} className="flex items-center gap-1.5 py-1.5">
                    <span className="size-1.5 shrink-0 rounded-full" style={{ background: b.color }} />
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: b.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${b.pct}%` }}
                        transition={{ duration: 1.2, delay: 0.9 + i * 0.15, ease: "easeOut" }}
                      />
                    </div>
                    <span className="w-[16px] text-right text-[10px]" style={{ color: T.text }}>{b.v}</span>
                  </div>
                ))}
              </div>

              {/* protection */}
              <div className="grid place-items-center rounded-xl px-2 py-2.5 text-center" style={{ border: `1px solid ${T.border}` }}>
                <motion.div
                  animate={{ scale: [1, 1.08, 1], filter: ["drop-shadow(0 0 0px #7C3AED)", "drop-shadow(0 0 8px #7C3AED)", "drop-shadow(0 0 0px #7C3AED)"] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ShieldCheck className="size-7" style={{ color: "#8B5CF6" }} />
                </motion.div>
                <div className="mt-1.5 text-[9.5px]" style={{ color: T.text2 }}>Protection Status</div>
                <div className="text-[10px] font-medium" style={{ color: "#6D7BFF" }}>Secure</div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom strip */}
        <div
          className="mx-4 mb-4 flex items-center gap-4 rounded-xl px-3.5 py-3"
          style={{ border: `1px solid ${T.border}` }}
        >
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Bug className="size-5" style={{ color: "#8B5CF6" }} />
            </motion.span>
            <div>
              <div className="text-[10px]" style={{ color: T.text2 }}>Vulnerabilities Found</div>
              <div className="text-[18px] font-semibold" style={{ color: "#8B5CF6" }}>
                <AnimatedNumber value={12} delay={1} />
              </div>
            </div>
          </div>

          <div className="h-8 w-px" style={{ background: T.border }} />

          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <AlertCircle className="size-5" style={{ color: "#EF4444" }} />
            </motion.span>
            <div>
              <div className="text-[10px]" style={{ color: T.text2 }}>Critical Issues</div>
              <div className="text-[18px] font-semibold" style={{ color: "#EF4444" }}>
                <AnimatedNumber value={3} delay={1.2} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
