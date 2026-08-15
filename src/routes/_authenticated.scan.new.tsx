import { createFileRoute } from "@tanstack/react-router";
import scanFormPreview from "@/assets/scan-form-preview.png.asset.json";

export const Route = createFileRoute("/_authenticated/scan/new")({
  head: () => ({
    meta: [
      { title: "New Scan — Nexefy Security" },
      { name: "description", content: "Submit a new AI-powered website security scan request." },
      { property: "og:title", content: "New Scan — Nexefy Security" },
      { property: "og:description", content: "Submit a new AI-powered website security scan request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanNewPage,
});

function ScanNewPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8 sm:py-12">
      <img
        src={scanFormPreview.url}
        alt="New scan form preview"
        className="w-full max-w-4xl h-auto rounded-2xl border border-white/10"
      />
    </div>
  );
}
