import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard, Lock } from "lucide-react";
import nexusLogo from "@/assets/nexefy-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { useAppMode } from "@/lib/app-mode";


const baseLinks = [
  { to: "/", label: "Features" },
  { to: "/pricing", label: "Plans" },
  { to: "/contact", label: "Contact" },
] as const;


export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, isAdmin: admin } = useAdmin();
  const { mode } = useAppMode();
  const navigate = useNavigate();
  const links = [
    ...baseLinks,
    ...(mode === "security" ? [{ to: "/dashboard" as const, label: "Dashboard" }] : []),
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const beginAdminLogin = () => {
    try {
      sessionStorage.removeItem("nexefy_admin_google_verified");
      sessionStorage.removeItem("nexus_admin_unlocked");
    } catch {
      /* ignore */
    }
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 py-2 sm:py-4 transition-colors duration-300 ${scrolled ? "bg-transparent" : "bg-black/30"}`}>
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className={`flex items-center justify-between rounded-xl sm:rounded-2xl px-2.5 sm:px-6 bg-black/30 backdrop-blur-xl transition-all duration-300 ${scrolled ? "py-1 sm:py-2 border border-white/10 shadow-lg" : "py-1.5 sm:py-3 border border-transparent"}`}>
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={nexusLogo}
              alt="Nexefy"
              className="block size-5 sm:size-7 object-contain"
              style={{
                filter:
                  "drop-shadow(0 0 8px rgba(37,99,235,.45)) drop-shadow(0 0 14px rgba(31,85,245,.25))",
              }}
            />
            <span className="sr-only">Nexefy</span>
          </Link>


          <nav className="flex items-center gap-0.5 md:gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to}
                className={`${l.to === "/dashboard" ? "hidden md:inline-flex" : ""} px-1.5 py-1.5 text-[11px] md:px-3.5 md:py-2 md:text-[13px] text-muted-foreground hover:text-white transition rounded-lg`}
                activeProps={{ className: "text-white" }} activeOptions={{ exact: true }}>
                {l.label}
              </Link>
            ))}

          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/admin"
              onClick={beginAdminLogin}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] text-muted-foreground hover:text-white border border-white/10 transition"
            >
              <Lock className="size-3.5" /> Admin Console
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" search={{ tab: undefined }} aria-label="Profile" className="size-9 rounded-full glass grid place-items-center text-sm font-medium hover:border-white/20 transition">
                  {(user.email || "?")[0].toUpperCase()}
                </Link>
                <button onClick={signOut} aria-label="Sign out" className="size-9 rounded-full glass grid place-items-center text-muted-foreground hover:text-red-500 transition-colors">
                  <LogOut className="size-4" />
                </button>

              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-[13px] text-muted-foreground hover:text-white transition">Login</Link>
                <Link
                  to="/signup"
                  className="group relative inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-[13px] font-medium text-[#F8FAFC] overflow-hidden transition-all duration-300 hover:-translate-y-0.5 border border-white/10"
                  style={{
                    background: "#000000",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,.06), 0 6px 16px rgba(0,0,0,.45)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 0 1px 0 rgba(255,255,255,.10), 0 10px 22px rgba(0,0,0,.55)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 0 1px 0 rgba(255,255,255,.06), 0 6px 16px rgba(0,0,0,.45)";
                  }}
                >
                  <span className="relative">Sign Up</span>
                  <span className="relative text-lg font-light leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>


              </>
            )}
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-1">
            <Link
              to="/admin"
              onClick={() => { beginAdminLogin(); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-white rounded-lg"
            >
              <Lock className="size-4" /> Admin Console
            </Link>
            {user && (
              <>
                {mode === "security" && (
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-white rounded-lg">
                    <LayoutDashboard className="size-4" /> Dashboard
                  </Link>
                )}

                <Link to="/profile" search={{ tab: undefined }} onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-white rounded-lg">
                  <UserIcon className="size-4" /> Profile
                </Link>
              </>
            )}
            <div className="pt-2 mt-2 border-t border-white/10 flex flex-col gap-2">
              {user ? (
                <button onClick={signOut} className="text-center rounded-full glass px-4 py-2.5 text-sm flex items-center justify-center gap-2">
                  <LogOut className="size-4" /> Sign out
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-2.5 text-sm text-muted-foreground hover:text-white rounded-lg">Login</Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="text-center rounded-full bg-white text-black px-4 py-2.5 text-sm font-medium">Sign Up →</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

    </header>
  );
}
