import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * Callback used by the external AI scanner to file a finished report.
 * The report lands under the requesting user automatically — no admin step.
 */
const Payload = z.object({
  scan_id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  summary: z.string().max(5000).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  score: z.number().int().min(0).max(100).optional(),
  findings: z.unknown().optional(),
  status: z.enum(["completed", "failed"]).default("completed"),
});

export const Route = createFileRoute("/api/public/scanner-report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["SCANNER_CALLBACK_SECRET"];
        if (!secret || request.headers.get("x-scanner-secret") !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        const parsed = Payload.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Invalid payload", { status: 400 });
        const p = parsed.data;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: scan } = await supabaseAdmin
          .from("scan_requests")
          .select("id, user_id, target_url")
          .eq("id", p.scan_id)
          .maybeSingle();
        if (!scan) return new Response("Unknown scan", { status: 404 });
        const s = scan as { id: string; user_id: string; target_url: string };

        const findings = Array.isArray(p.findings) ? p.findings : [];

        if (p.status === "completed") {
          await supabaseAdmin.from("reports").insert({
            scan_id: s.id,
            user_id: s.user_id,
            title: p.title ?? `Security report — ${s.target_url}`,
            summary: p.summary ?? null,
            severity: p.severity ?? null,
            findings: findings as never,
          } as never);
        }

        await supabaseAdmin
          .from("scan_requests")
          .update({
            status: p.status,
            score: p.score ?? null,
            findings_count: findings.length,
          } as never)
          .eq("id", s.id);

        await supabaseAdmin.from("notifications").insert({
          user_id: s.user_id,
          title: p.status === "completed" ? "Your security report is ready" : "Your scan could not be completed",
          body:
            p.status === "completed"
              ? `The scan for ${s.target_url} is complete. Open your dashboard to read the full report.`
              : `We could not complete the scan for ${s.target_url}.`,
          link: "/dashboard",
        } as never);

        return Response.json({ ok: true });
      },
    },
  },
});
