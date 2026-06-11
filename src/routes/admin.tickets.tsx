import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, Section, Badge } from "@/components/admin/AdminShell";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { Send } from "lucide-react";

export const Route = createFileRoute("/admin/tickets")({ component: TicketsPage });

type Ticket = { id: string; name: string; email: string; subject: string; message: string; status: string; priority: string; created_at: string; user_id: string | null };
type Msg = { id: string; author_type: string; author_name: string | null; body: string; created_at: string };

const STATUSES = ["open", "in_progress", "waiting_for_user", "resolved", "closed"];
const PRIORITIES = ["low", "normal", "high", "urgent"];

function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<Ticket | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [reply, setReply] = useState("");

  const load = async () => {
    try {
      const { tickets } = await api.admin.listTickets();
      setTickets((tickets ?? []) as Ticket[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!active) return;
    api.admin.ticketMessages(active.id)
      .then(({ messages }) => setMsgs((messages ?? []) as Msg[]))
      .catch(() => setMsgs([]));
  }, [active]);

  const send = async () => {
    if (!active || !reply.trim()) return;
    const body = reply.trim();
    setReply("");
    try {
      await api.admin.replyTicket(active.id, body);
      await logAudit("ticket.reply", { type: "ticket", id: active.id });
      const { messages } = await api.admin.ticketMessages(active.id);
      setMsgs((messages ?? []) as Msg[]);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const updateTicket = async (_patch: Partial<Ticket>, _action: string) => {
    // Note: ticket status/priority updates would go through a PATCH /api/admin/tickets/:id
    // endpoint. The backend doesn't expose that yet — flag in migration report.
    toast.info("Ticket status/priority editing requires PATCH /api/admin/tickets/:id");
  };

  const filtered = tickets.filter((t) => filter === "all" || t.status === filter);

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: tickets.filter((t) => t.status === s).length }), { all: tickets.length } as Record<string, number>);

  return (
    <AdminShell title="Support Center" description="Tickets from the contact form, dashboard, and email channels.">
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {["all", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition ${filter === s ? "bg-primary text-primary-foreground border-primary" : "glass"}`}>
            {s.replace("_", " ")} <span className="opacity-60 ml-1">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-4">
        <Section title="Inbox">
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.map((t) => (
              <button key={t.id} onClick={() => setActive(t)} className={`w-full text-left p-3 rounded-xl border transition ${active?.id === t.id ? "border-primary/40 bg-primary/5" : "border-white/5 hover:border-white/15"}`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium truncate">{t.subject}</span>
                  <Badge tone={t.priority === "urgent" ? "danger" : t.priority === "high" ? "warn" : "neutral"}>{t.priority}</Badge>
                </div>
                <div className="text-[11px] text-muted-foreground truncate">{t.name} · {t.email}</div>
                <div className="text-[11px] mt-1 text-muted-foreground line-clamp-2">{t.message}</div>
                <div className="flex items-center justify-between mt-2">
                  <Badge tone={t.status === "resolved" || t.status === "closed" ? "ok" : "info"}>{t.status.replace("_", " ")}</Badge>
                  <span className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <div className="text-xs text-muted-foreground py-8 text-center">No tickets.</div>}
          </div>
        </Section>

        <Section title={active ? active.subject : "Select a ticket"}>
          {!active ? (
            <div className="text-sm text-muted-foreground py-16 text-center">Pick a ticket from the inbox to view the conversation.</div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <select value={active.status} onChange={(e) => updateTicket({ status: e.target.value }, "ticket.status")} className="text-xs glass rounded-lg px-2 py-1.5">
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
                <select value={active.priority} onChange={(e) => updateTicket({ priority: e.target.value }, "ticket.priority")} className="text-xs glass rounded-lg px-2 py-1.5">
                  {PRIORITIES.map((p) => <option key={p} value={p}>Priority: {p}</option>)}
                </select>
                <span className="text-[11px] text-muted-foreground ml-auto">{active.name} · {active.email}</span>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                <Message who={active.name} side="user" body={active.message} when={active.created_at} />
                {msgs.map((m) => (
                  <Message key={m.id} who={m.author_name || m.author_type} side={m.author_type === "admin" ? "admin" : "user"} body={m.body} when={m.created_at} />
                ))}
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/5">
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply…" rows={2}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm resize-none" />
                <button onClick={send} className="self-end bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5">
                  <Send className="size-3.5" /> Send
                </button>
              </div>
            </div>
          )}
        </Section>
      </div>
    </AdminShell>
  );
}

function Message({ who, side, body, when }: { who: string; side: "user" | "admin"; body: string; when: string }) {
  return (
    <div className={`flex ${side === "admin" ? "justify-end" : ""}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${side === "admin" ? "bg-primary/10 border border-primary/20" : "glass"}`}>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">{who} · {new Date(when).toLocaleString()}</div>
        <div className="text-sm whitespace-pre-wrap">{body}</div>
      </div>
    </div>
  );
}
