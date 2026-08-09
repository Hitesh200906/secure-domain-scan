import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export type PaymentPhase = "idle" | "verifying" | "success" | "error";

export default function PaymentStatus({
  phase,
  credited,
  balance,
  message,
  onRetry,
  onClose,
}: {
  phase: PaymentPhase;
  credited?: number;
  balance?: number;
  message?: string;
  onRetry?: () => void;
  onClose?: () => void;
}) {
  if (phase === "idle") return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black p-6 text-center">
        {phase === "verifying" && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#2563EB]" />
            <div className="mt-4 text-lg font-semibold text-white">Verifying payment…</div>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              Please don&apos;t close this window. We&apos;re confirming your transaction securely.
            </p>
          </>
        )}

        {phase === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-[#22C55E]" />
            <div className="mt-4 text-lg font-semibold text-white">Payment successful</div>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              {credited ? `${credited.toLocaleString()} credits added to your account.` : "Credits added to your account."}
            </p>
            {typeof balance === "number" && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#6B7280]">New balance</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums text-white">{balance.toLocaleString()}</div>
              </div>
            )}
            <p className="mt-4 text-xs text-[#6B7280]">Returning to your credits…</p>
          </>
        )}

        {phase === "error" && (
          <>
            <XCircle className="mx-auto h-10 w-10 text-[#EF4444]" />
            <div className="mt-4 text-lg font-semibold text-white">Payment verification failed</div>
            <p className="mt-1 text-sm text-[#9CA3AF]">{message ?? "Please try again or contact support."}</p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={onRetry}
                className="flex-1 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
              >
                Retry verification
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/[0.04]"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
