import { createFileRoute } from "@tanstack/react-router";
import { ReportsPanel } from "@/components/admin/security/ReportsPanel";

export const Route = createFileRoute("/admin/reports")({ component: ReportsPanel });
