import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminGate } from "@/components/admin/AdminShell";
import { PricingPanel } from "@/components/admin/security/PricingPanel";

export const Route = createFileRoute("/admin/pricing")({
  component: () => (
    <SuperAdminGate>
      <PricingPanel />
    </SuperAdminGate>
  ),
});
