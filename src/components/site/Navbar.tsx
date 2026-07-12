import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard, Lock, MessageSquare, Store as StoreIcon } from "lucide-react";
import nexusLogo from "@/assets/nexus-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { MessagesDrawer } from "@/components/site/MessagesDrawer";
import { StoresDrawer } from "@/components/site/StoresDrawer";
import { useAppMode } from "@/lib/app-mode";


const baseLinks = [
  { to: "/", label: "Features" },
  { to: "/discover", label: "Discover" },
] as const;


export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [storesOpen, setStoresOpen] = useState(false);
  const { user, isAdmin: admin, role } = useAdmin();
  const { mode } = useAppMode();
  const navigate = useNavigate();
  const links = [
    ...baseLinks,
    mode === "security"
      ? { to: "/dashboard" as const, label: "Dashboard" }
      : { to: "/business" as const, label: "Business" },
  ];

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

  const openMessages = () => {
    setMsgOpen(true);
    setOpen(false);
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 bg-black transition-all duration-300 ${scrolled ? "py-2 border-b border-white/10" : "py-4"}`}>
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className={`flex items-center justify-between rounded-2xl px-3 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-xl border border-white/10 shadow-lg" : "bg-transparent border border-transparent"}`}>
          <Link to="/" className="flex items-center gap-2 group">
            <img src={nexusLogo} alt="Nexefy" width={28} height={28} className="size-7 object-contain" />
            <span className="text-[15px] font-semibold tracking-tight text-white">
              Nexefy
            </span>
          </Link>


          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to}
                className="px-3.5 py-2 text-[13px] text-muted-foreground hover:text-white transition rounded-lg"
                activeProps={{ className: "text-white" }} activeOptions={{ exact: true }}>
                {l.label}
              </Link>
            ))}
            {user && (
              <>
                <button
                  onClick={() => setStoresOpen(true)}
                  className="px-3.5 py-2 text-[13px] text-muted-foreground hover:text-white transition rounded-lg"
                >
                  Stores
                </button>
                <button
                  onClick={openMessages}
                  className="px-3.5 py-2 text-[13px] text-muted-foreground hover:text-white transition rounded-lg"
                >
                  Messages
                </button>
              </>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="size-9 rounded-full glass grid place-items-center text-sm font-medium hover:border-white/20 transition">
                  {(user.email || "?")[0].toUpperCase()}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-11 w-64 rounded-2xl p-2 text-sm bg-black/95 backdrop-blur-xl border border-white/10 shadow-2xl">
                    <div className="px-3 py-2 text-xs text-muted-foreground truncate flex items-center gap-2">
                      <span className="truncate flex-1">{user.email}</span>
                    </div>
                    {role && role !== "user" && (
                      <div className="px-3 pb-2"><RoleBadge role={role} /></div>
                    )}

                    {mode === "security" && (
                      <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.05]">
                        <LayoutDashboard className="size-4" /> Dashboard
                      </Link>
                    )}
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
          <div className="md:hidden mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-white rounded-lg">
                {l.label}
              </Link>
            ))}
            {user && (
              <>
                <button
                  onClick={() => { setStoresOpen(true); setOpen(false); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-white rounded-lg"
                >
                  <StoreIcon className="size-4" /> Stores
                </button>
                <button
                  onClick={openMessages}
                  className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-white rounded-lg"
                >
                  <MessageSquare className="size-4" /> Messages
                </button>
                {mode === "security" && (
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-white rounded-lg">
                    <LayoutDashboard className="size-4" /> Dashboard
                  </Link>
                )}
                <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-white rounded-lg">
                  <UserIcon className="size-4" /> Profile
                </Link>
                {admin && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-white rounded-lg">
                    <Lock className="size-4" /> Admin Console
                  </Link>
                )}
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

      <MessagesDrawer open={msgOpen} onClose={() => setMsgOpen(false)} />
      <StoresDrawer open={storesOpen} onClose={() => setStoresOpen(false)} />
    </header>
  );
}
