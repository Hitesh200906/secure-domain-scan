import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { isSuperAdmin } from "@/lib/auth-helpers";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Console — Nexus Security" }, { name: "robots", content: "noindex" }] }),
  component: AdminGate,
});

function AdminGate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const allowed = isSuperAdmin(user);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
    } else if (!allowed) {
      navigate({ to: "/", replace: true });
    }
  }, [loading, user, allowed, navigate]);

  if (loading || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return <Outlet />;
}
