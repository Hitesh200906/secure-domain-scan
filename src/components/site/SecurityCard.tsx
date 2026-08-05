import { motion } from "framer-motion";
import { T, AnimatedNumber } from "./NexusCinematicHero";

export function SecurityCard() {
  const points = [22, 19, 24, 17, 20, 14, 16, 11, 13, 9, 10, 7, 8, 5, 4];
  const w = 520,
    h = 260;
  const max = 26;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / max) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.35 }}
      className="relative w-full max-w-full px-0 py-1 sm:px-6 sm:py-10 lg:pl-8 lg:pr-4"
      style={{ perspective: "1400px" }}
    >
      <motion.div
        animate={{ y: [0, -10, 0], rotateY: [-11, -7, -11], rotateX: [6, 4, 6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-[14px] sm:rounded-[22px] overflow-hidden backdrop-blur-xl origin-center"
        style={{
          transformStyle: "preserve-3d",
          background: "linear-gradient(160deg, #0A0B0F 0%, #000000 100%)",
          border: `1px solid ${T.border}`,
          boxShadow:
            "0 50px 110px -40px rgba(0,0,0,1), -24px 24px 60px -40px rgba(79,107,255,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex justify-end px-2 pt-1 sm:px-4 sm:pt-4">
          <div
            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-md sm:rounded-lg px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[10px]"
            style={{ border: `1px solid ${T.border}`, color: T.text2 }}
          >
            Last 30 Days
            <span className="text-[7px] sm:text-[9px]">▾</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-2 sm:gap-4 px-2 pb-1.5 sm:px-4 sm:pb-5 pt-0.5 sm:pt-1">
          <div>
            <div className="text-[7.5px] sm:text-[10.5px]" style={{ color: T.text2 }}>Security Score</div>
            <div className="mt-0 sm:mt-1 text-[13px] sm:text-[26px] font-semibold tracking-[-0.02em]" style={{ color: T.text }}>
              <AnimatedNumber value={92} suffix="/100" />
            </div>
            <div className="mt-0.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 sm:px-1.5 text-[8px] sm:text-[10px] font-medium"
                style={{ background: "rgba(16,185,129,0.12)", color: "#34D399" }}
              >
                ↑ <AnimatedNumber value={8.4} decimals={1} suffix="%" />
              </span>
              <span className="hidden sm:inline text-[10px]" style={{ color: T.text2 }}>vs last scan</span>
            </div>

            <div className="hidden sm:block my-1 sm:my-3.5 h-px w-full" style={{ background: T.border }} />

            <div className="hidden sm:block text-[7.5px] sm:text-[10px]" style={{ color: T.text3 }}>Findings</div>
            <ul className="hidden sm:block mt-0.5 sm:mt-2 space-y-0.5 sm:space-y-1.5">
              {[
                { label: "Critical", value: 3, dot: "#EF4444" },
                { label: "Medium", value: 9, dot: "#F59E0B" },
                { label: "Low", value: 21, dot: "#06B6D4" },
              ].map((r, i) => (
                <motion.li
                  key={r.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + i * 0.12 }}
                  className="flex items-center justify-between gap-2 sm:gap-3 text-[8.5px] sm:text-[11px]"
                >
                  <span className="inline-flex items-center gap-1 sm:gap-1.5" style={{ color: T.text2 }}>
                    <span className="size-1 sm:size-1.5 rounded-full" style={{ background: r.dot }} />
                    {r.label}
                  </span>
                  <span style={{ color: T.text }}>
                    <AnimatedNumber value={r.value} delay={0.7 + i * 0.12} />
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <div className="flex gap-1 sm:gap-1.5">
              <div className="flex flex-col justify-between py-0.5 text-[6px] sm:text-[8.5px]" style={{ color: T.text3 }}>
                {["24", "18", "12", "6", "0"].map((t) => <span key={t}>{t}</span>)}
              </div>
              <div className="relative flex-1">
                <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[34px] sm:h-[140px]" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="secLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#22D3EE" />
                    </linearGradient>
                    <linearGradient id="secFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line key={i} x1="0" x2={w} y1={(i * h) / 4} y2={(i * h) / 4}
                      stroke="rgba(255,255,255,0.06)" strokeDasharray="4 6" />
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
                    transition={{ duration: 1.8, delay: 0.6, ease: "easeOut" }}
                  />
                  <motion.circle
                    cx={w}
                    cy={h - (points[points.length - 1] / max) * h}
                    r={6}
                    fill="#22D3EE"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.4, 1], opacity: 1 }}
                    transition={{ duration: 0.6, delay: 2.3 }}
                  />
                </svg>
                <div className="mt-1 sm:mt-1.5 hidden sm:flex justify-between text-[6px] sm:text-[8.5px]" style={{ color: T.text3 }}>
                  {["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Now"].map((d) => <span key={d}>{d}</span>)}
                </div>

                <div className="mt-1 sm:mt-3 hidden sm:block space-y-1 sm:space-y-2">
                  {[
                    { label: "Threats blocked", value: 1482, pct: 88, color: "#2563EB" },
                    { label: "Scans completed", value: 214, pct: 64, color: "#22D3EE" },
                  ].map((b, i) => (
                    <div key={b.label}>
                      <div className="flex items-center justify-between text-[7px] sm:text-[9.5px]" style={{ color: T.text2 }}>
                        <span>{b.label}</span>
                        <span style={{ color: T.text }}>
                          <AnimatedNumber value={b.value} delay={1 + i * 0.15} />
                        </span>
                      </div>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: b.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${b.pct}%` }}
                          transition={{ duration: 1.4, delay: 1 + i * 0.15, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
