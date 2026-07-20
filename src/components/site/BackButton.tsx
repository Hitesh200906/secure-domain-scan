import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function BackButton({
  label = "Back",
  fallback = "/",
  className = "",
}: {
  label?: string;
  fallback?: string;
  className?: string;
}) {
  const router = useRouter();
  const onClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: fallback as any });
    }
  };
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-full pl-2 pr-4 py-1.5 text-[13px] font-medium text-neutral-300 hover:text-white transition ${className}`}
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
      aria-label={label}
    >
      <span
        className="grid place-items-center size-6 rounded-full transition group-hover:-translate-x-0.5"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <ArrowLeft className="size-3.5" />
      </span>
      <span>{label}</span>
    </button>
  );
}
