import { createFileRoute } from "@tanstack/react-router";
import { ScansPanel } from "@/components/admin/security/ScansPanel";

export const Route = createFileRoute("/admin/scans")({ component: ScansPanel });
