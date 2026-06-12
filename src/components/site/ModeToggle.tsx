import { motion } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";
import { useAppMode } from "@/lib/app-mode";

export function ModeToggle({ size = "lg" }: { size?: "lg" | "md" }) {
  const { mode, setMode } = useAppMode();
  const pad = size === "lg" ? "px-3 sm:px-6 py-2.5 sm:py-3 text-[12px] sm:text-sm" : "px-3 sm:px-4 py-2 text-[11px] sm:text-xs";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="inline-flex items-center gap-1.5 rounded-full glass p-1.5 border border-white/10"
    >
      <button
        onClick={() => setMode("nexus")}
        className={`relative inline-flex items-center gap-2 rounded-full ${pad} font-medium transition-all ${
          mode === "nexus"
            ? "bg-white text-black shadow-[0_0_30px_-6px_rgba(255,255,255,0.5)]"
            : "text-muted-foreground hover:text-white"
        }`}
      >
        <Sparkles className="size-3.5 sm:size-4 shrink-0" />
        <span className="whitespace-nowrap"><span className="hidden xs:inline">Switch to </span>Nexus</span>
      </button>
      <button
        onClick={() => setMode("security")}
        className={`relative inline-flex items-center gap-2 rounded-full ${pad} font-medium transition-all ${
          mode === "security"
            ? "bg-gradient-to-r from-cyan-400 to-teal-500 text-black shadow-[0_0_30px_-6px_oklch(0.86_0.16_200_/0.7)]"
            : "text-muted-foreground hover:text-white"
        }`}
      >
        <ShieldCheck className="size-3.5 sm:size-4 shrink-0" />
        <span className="whitespace-nowrap"><span className="hidden xs:inline">Switch to Nexus </span>Security</span>
      </button>
    </motion.div>
  );
}
