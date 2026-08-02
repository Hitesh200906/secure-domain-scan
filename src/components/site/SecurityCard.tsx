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

          {/* Radar sweep glow over the radar circle (top-left area) */}
          <motion.div
            className="pointer-events-none absolute"
            style={{ left: "8%", top: "13%", width: "27%", aspectRatio: "1 / 1" }}
          >
            <motion.div
              className="h-full w-full rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(124,58,237,0.45), rgba(79,107,255,0.12) 45deg, transparent 110deg, transparent 360deg)",
                mixBlendMode: "screen",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: "0 0 60px 6px rgba(79,107,255,0.25) inset" }}
              animate={{ opacity: [0.25, 0.7, 0.25] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Vertical scan line sweeping across the whole card */}
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-[18%]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(79,107,255,0.16), rgba(124,58,237,0.10), transparent)",
              mixBlendMode: "screen",
            }}
            animate={{ x: ["-20%", "560%"] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
          />

          {/* Diagonal glass shimmer */}
          <motion.div
            className="pointer-events-none absolute inset-y-[-40%] w-[26%] rotate-12"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
              mixBlendMode: "screen",
            }}
            animate={{ x: ["-40%", "480%"] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.4 }}
          />

          {/* Breathing glow on the security score ring (center) */}
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{
              left: "40%",
              top: "41%",
              width: "12%",
              aspectRatio: "1 / 1",
              background: "radial-gradient(circle, rgba(79,107,255,0.35), transparent 70%)",
              mixBlendMode: "screen",
            }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.9, 1.08, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Pulsing shield status glow (right tile) */}
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{
              left: "79%",
              top: "43%",
              width: "10%",
              aspectRatio: "1 / 1",
              background: "radial-gradient(circle, rgba(124,58,237,0.40), transparent 70%)",
              mixBlendMode: "screen",
            }}
            animate={{ opacity: [0.15, 0.75, 0.15], scale: [0.85, 1.12, 0.85] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />

          {/* Wave field shimmer at the bottom strip */}
          <motion.div
            className="pointer-events-none absolute"
            style={{
              left: "44%",
              right: "6%",
              bottom: "13%",
              height: "16%",
              background:
                "linear-gradient(90deg, rgba(79,107,255,0.18), rgba(124,58,237,0.22), rgba(79,107,255,0.18))",
              filter: "blur(14px)",
              mixBlendMode: "screen",
            }}
            animate={{ opacity: [0.25, 0.65, 0.25] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Ambient edge glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[22px]"
            style={{ boxShadow: "inset 0 0 80px rgba(79,107,255,0.12)" }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

    </motion.div>
  );
}
