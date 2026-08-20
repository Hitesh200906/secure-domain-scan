import { Link } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/** Gates a page behind an account, with a clean sign-in / sign-up prompt. */
export function RequireAuth({ children, title = "Sign in to continue", desc }: { children: React.ReactNode; title?: string; desc?: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-black">
        <Loader2 className="size-6 animate-spin text-white/50" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-black px-5">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0c] p-8 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <Lock className="size-5 text-white/70" />
          </div>
          <h1 className="mt-5 text-xl font-medium tracking-tight text-white">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {desc ?? "You need a Nexefy account to access this area. Log in or create one — it only takes a moment."}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className="flex-1 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]">
              Log in
            </Link>
            <Link to="/signup" className="flex-1 rounded-xl border border-white/12 px-5 py-3 text-sm text-white/85 transition hover:text-white">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
