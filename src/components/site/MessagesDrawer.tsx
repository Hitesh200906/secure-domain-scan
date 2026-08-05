import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, Search, SquarePen, Maximize2, MessageSquare, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  name?: string | null;
};

type Tab = "all" | "unread" | "requests";

export function MessagesDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api
      .listTickets()
      .then((r) => setTickets((r.tickets as Ticket[]) ?? []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = tickets.filter((t) => {
    if (tab === "unread" && t.status === "closed") return false;
    if (tab === "requests" && t.status !== "open") return false;
    if (q && !t.subject.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <aside
        className={`fixed right-0 top-0 z-[70] h-full w-full sm:w-[420px] bg-[#0a0a0a] border-l border-white/10 shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Messages</h2>
          <div className="flex items-center gap-1">
            <Link
              to="/profile"
              onClick={onClose}
              className="size-9 grid place-items-center rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition"
              aria-label="Expand"
            >
              <Maximize2 className="size-4" />
            </Link>
            <button
              onClick={onClose}
              className="size-9 grid place-items-center rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 size-8 grid place-items-center rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition" aria-label="New">
              <SquarePen className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 pt-4 pb-2">
          <button
            onClick={() => setTab("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${tab === "all" ? "bg-white text-black" : "border border-white/10 text-muted-foreground hover:text-white"}`}
          >
            All
          </button>
          <button
            onClick={() => setTab("unread")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${tab === "unread" ? "bg-white text-black" : "border border-white/10 text-muted-foreground hover:text-white"}`}
          >
            Unread
          </button>
          <button
            onClick={() => setTab("requests")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${tab === "requests" ? "bg-white text-black" : "border border-white/10 text-muted-foreground hover:text-white"}`}
          >
            <span className="size-1.5 rounded-full bg-primary" />
            Requests
            {tickets.filter((t) => t.status === "open").length > 0 && (
              <span className="text-[11px] opacity-70">{tickets.filter((t) => t.status === "open").length}</span>
            )}
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-180px)] pb-6">
          {loading ? (
            <div className="grid place-items-center py-12 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <MessageSquare className="size-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <Link
                to="/contact"
                onClick={onClose}
                className="inline-block mt-4 text-xs text-primary hover:underline"
              >
                Start a conversation
              </Link>
            </div>
          ) : (
            <ul>
              {filtered.map((t) => (
                <li key={t.id}>
                  <Link
                    to="/profile"
                    search={{ tab: "tickets" }}
                    onClick={onClose}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.04] transition border-b border-white/[0.04]"
                  >
                    <div className="size-11 shrink-0 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 grid place-items-center text-sm font-semibold text-white">
                      {(t.name || t.subject || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-white truncate">{t.subject}</p>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {new Date(t.created_at).toLocaleDateString(undefined, { month: "numeric", day: "numeric" })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{t.message}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
