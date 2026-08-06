import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Rocket } from "lucide-react";

export type ComingSoonInfo = { title: string; description: string };

export function ComingSoonDialog({
  info,
  onClose,
}: {
  info: ComingSoonInfo | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!info} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md border-white/10 bg-[#07080B]">
        <DialogHeader>
          <div className="mb-3 inline-flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            <Rocket className="size-5 text-primary" />
          </div>
          <DialogTitle className="text-left text-xl tracking-tight">{info?.title}</DialogTitle>
          <DialogDescription className="text-left text-sm leading-relaxed text-muted-foreground">
            {info?.description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.1]"
          >
            Got it
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const COMING_SOON = {
  nexefy: {
    title: "Nexefy is launching soon",
    description:
      "The full Nexefy business platform — storefronts, communities and creator rewards — is in final preparation. For now, Nexefy Security is live and fully available.",
  },
  marketplace: {
    title: "Marketplace — launching soon",
    description:
      "The Nexefy Marketplace, where creators launch branded storefronts and sell products, is coming shortly. We'll announce the opening date soon.",
  },
  rewards: {
    title: "Nexefy Rewards — launching soon",
    description:
      "Nexefy Rewards will let creators earn from the content they publish. The programme is being finalised and will open soon.",
  },
} satisfies Record<string, ComingSoonInfo>;
