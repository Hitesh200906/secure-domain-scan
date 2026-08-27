import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { readCapturedVerifyTokens } from "@/lib/scan-verify-capture";
import { confirmEmailVerificationLink } from "@/lib/scan-verification.functions";
import nexefyLogo from "@/assets/nexefy-logo.png";

export const Route = createFileRoute("/scan/verify")({
  ssr: false,
  validateSearch: z.object({ id: z.string().uuid().optional() }),
  head: () => ({
    meta: [
      { title: "Confirm your business email — Nexefy Security" },
      { name: "description", content: "Confirm the business email used for your Nexefy security scan request." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const { id } = Route.useSearch();
  const confirm = useServerFn(confirmEmailVerificationLink);
  const [state, setState] = useState<"working" | "done" | "error">("working");
  const [message, setMessage] = useState("Confirming your email…");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) {
        setState("error");
        setMessage("This confirmation link is incomplete.");
        return;
      }
      // Tokens were lifted out of the URL before the Supabase client could
      // consume them, so the requester stays signed in as themselves.
      const tokens = readCapturedVerifyTokens();
      try {
        await confirm({ data: { scan_id: id, ...tokens } });
        if (cancelled) return;
        setState("done");
        setMessage("Email confirmed. You can close this tab and continue your scan request.");
      } catch (e) {
        if (cancelled) return;
        setState("error");
        setMessage(e instanceof Error ? e.message : "We couldn't confirm this link.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, confirm]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-5">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <img src={nexefyLogo} alt="Nexefy" className="mx-auto size-8 object-contain" />
        <div className="mt-6 flex justify-center">
          {state === "working" && <Loader2 className="size-7 animate-spin text-white" />}
          {state === "done" && <CheckCircle2 className="size-7 text-emerald-400" />}
          {state === "error" && <XCircle className="size-7 text-red-400" />}
        </div>
        <h1 className="mt-4 text-xl font-medium text-white">
          {state === "done" ? "Email verified" : state === "error" ? "Verification failed" : "Verifying…"}
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">{message}</p>
        <Link to="/" className="mt-6 inline-block text-[12px] text-white/70 hover:text-white">
          Back to Nexefy
        </Link>
      </div>
    </div>
  );
}
