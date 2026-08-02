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
        <img
          src={securityCardAsset.url}
          alt="Nexefy Security dashboard showing AI scan radar, security score and vulnerability stats"
          className="block h-auto w-full"
        />
      </motion.div>
    </motion.div>
  );
}
