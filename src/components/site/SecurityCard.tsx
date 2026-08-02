import { motion } from "framer-motion";
import { T } from "./NexusCinematicHero";
import securityCardAsset from "@/assets/security-dashboard-card.png.asset.json";

export function SecurityCard() {
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
          background: "#000000",
          border: `1px solid ${T.border}`,
          boxShadow:
            "0 50px 110px -40px rgba(0,0,0,1), -24px 24px 60px -40px rgba(79,107,255,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="relative">
          <img
            src={securityCardAsset.url}
            alt="Nexefy Security dashboard showing AI scan radar, security score and vulnerability stats"
            className="block h-auto w-full"
          />

          {/* Radar sweep over the radar circle (top-left) */}
          <div
            className="pointer-events-none absolute overflow-hidden rounded-full"
            style={{ left: "8%", top: "13%", width: "27%", aspectRatio: "1 / 1" }}
          >
            <motion.div
              className="h-full w-full rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(124,58,237,0.40), rgba(79,107,255,0.10) 40deg, transparent 100deg, transparent 360deg)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Tracer running along the top-right line graph */}
          <div
            className="pointer-events-none absolute overflow-hidden"
            style={{ left: "40%", right: "6%", top: "14%", height: "24%" }}
          >
            <motion.div
              className="absolute top-0 h-full w-[2px]"
              style={{ background: "rgba(255,255,255,0.35)" }}
              animate={{ x: ["0%", "2400%"] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Gentle drift across the bottom wave graph */}
          <div
            className="pointer-events-none absolute overflow-hidden"
            style={{ left: "44%", right: "6%", bottom: "12%", height: "18%" }}
          >
            <motion.div
              className="absolute inset-y-0 w-1/4"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(124,58,237,0.28), transparent)",
              }}
              animate={{ x: ["-100%", "400%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
          </div>

        </div>
      </motion.div>

    </motion.div>
  );
}
