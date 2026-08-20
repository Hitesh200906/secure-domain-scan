import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/scan/")({
  head: () => ({
    meta: [
      { title: "Plans — Nexefy Security" },
      { name: "description", content: "Choose a security plan to begin monitoring your assets." },
      { property: "og:title", content: "Plans — Nexefy Security" },
      { property: "og:description", content: "Choose a security plan to begin monitoring your assets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanRedirect,
});

function ScanRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/pricing", replace: true });
  }, [navigate]);
  return null;
}
