import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Console — Nexus Security" }, { name: "robots", content: "noindex" }] }),
  component: () => <Outlet />,
});
