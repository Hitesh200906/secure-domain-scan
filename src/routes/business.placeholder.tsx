import { createFileRoute, useRouterState } from "@tanstack/react-router";

function Placeholder() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const name = path.split("/").pop() ?? "Page";
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold capitalize">{name}</h1>
      <p className="text-sm text-muted-foreground">Coming soon — this section is on the roadmap.</p>
      <div className="glass rounded-2xl p-12 text-center text-sm text-muted-foreground mt-6">
        We're shipping this next. Your data and design will appear here.
      </div>
    </div>
  );
}

export const Route = createFileRoute("/business/placeholder")({ component: Placeholder });
