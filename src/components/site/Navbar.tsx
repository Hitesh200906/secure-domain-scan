import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, ShieldCheck, X, LogOut, User as UserIcon, LayoutDashboard, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { RoleBadge } from "@/components/ui/RoleBadge";


const publicLinks = [
  { to: "/", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/contact", label: "Contact" },
] as const;

const authLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin: admin, role } = useAdmin();
  const navigate = useNavigate();
  const links = [...publicLinks, ...(user ? authLinks : [])];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate({ to: "/" });
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`flex items-center justify-between rounded-2xl px-4 sm:px-6 py-3 transition-all duration-300 ${scrolled ? "glass-strong" : "bg-transparent border border-transparent"}`}>
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="relative">
              <ShieldCheck className="size-5 text-primary" strokeWidth={2.2} />
              <div className="absolute inset-0 blur-md bg-primary/40 -z-10 group-hover:bg-primary/60 transition" />
            </div>
            <span className="text-[13px] font-semibold tracking-[0.2em] text-white">
              NEXUS<span className="text-muted-foreground ml-1.5">SECURITY</span>
            </span>
            {role && role !== "user" && <RoleBadge role={role} />}
          </Link>


          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to}
                className="px-3.5 py-2 text-[13px] text-muted-foreground hover:text-white transition rounded-lg"
                activeProps={{ className: "text-white" }} activeOptions={{ exact: true }}>
                {l.label}
              </Link>
            ))}
            {admin && (
              <Link to="/admin" className="px-3.5 py-2 text-[13px] text-muted-foreground hover:text-white transition rounded-lg inline-flex items-center gap-1.5" activeProps={{ className: "text-white" }}>
                <Lock className="size-3.5" /> Admin
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="size-9 rounded-full glass grid place-items-center text-sm font-medium hover:border-white/20 transition">
                  {(user.email || "?")[0].toUpperCase()}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-11 w-64 glass-strong rounded-2xl p-2 text-sm">
                    <div className="px-3 py-2 text-xs text-muted-foreground truncate flex items-center gap-2">
                      <span className="truncate flex-1">{user.email}</span>
                    </div>
                    {role && role !== "user" && (
                      <div className="px-3 pb-2"><RoleBadge role={role} /></div>
                    )}

                    <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.05]">
                      <LayoutDashboard className="size-4" /> Dashboard
                    </Link>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.05]">
                      <UserIcon className="size-4" /> Profile
                    </Link>
                    {admin && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.05]">
                        <Lock className="size-4" /> Admin Console
                      </Link>
                    )}
                    <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.05] text-destructive">
                      <LogOut className="size-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-[13px] text-muted-foreground hover:text-white transition">Login</Link>
                <Link to="/signup" className="relative inline-flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-2 text-[13px] font-medium hover:bg-primary transition-all duration-300">
                  Sign Up
                  <span className="text-base leading-none">→</span>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden mt-2 glass-strong rounded-2xl p-4 space-y-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-white rounded-lg">
                {l.label}
              </Link>
            ))}
            {admin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-white rounded-lg">Admin Console</Link>
            )}
            <div className="pt-2 mt-2 border-t border-white/10 flex flex-col gap-2">
              {user ? (
                <button onClick={signOut} className="text-center rounded-full glass px-4 py-2.5 text-sm">Sign out</button>
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
