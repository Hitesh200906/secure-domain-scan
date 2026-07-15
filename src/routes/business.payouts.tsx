import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Btn, EmptyState } from "@/components/business/primitives";
import { Wallet, Download, Building2, Bitcoin, FileText } from "lucide-react";

export const Route = createFileRoute("/business/payouts")({ component: PayoutsPage });

function PayoutsPage() {
  return (
    <div>
      <PageHeader
        title="Payouts"
        description="Balance, withdrawals, tax documents, and payment methods."
        actions={<Btn variant="primary" size="sm"><Download className="size-3.5" />Withdraw</Btn>}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
        <Panel className="p-5 col-span-1 lg:col-span-2">
          <div className="text-[11px] uppercase tracking-widest text-neutral-500">Available balance</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-white tracking-tight">$0.00</span>
            <span className="text-[12px] text-neutral-500">USD</span>
          </div>
          <div className="mt-4 flex items-center gap-6 text-[12px]">
            <div><div className="text-neutral-500">Pending</div><div className="text-white font-medium mt-0.5">$0.00</div></div>
            <div><div className="text-neutral-500">In transit</div><div className="text-white font-medium mt-0.5">$0.00</div></div>
            <div><div className="text-neutral-500">Lifetime</div><div className="text-white font-medium mt-0.5">$0.00</div></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="text-[11px] uppercase tracking-widest text-neutral-500">Payment methods</div>
          <div className="mt-3 space-y-2">
            <button className="w-full flex items-center gap-3 rounded-lg border border-dashed border-white/10 px-3 py-2.5 text-[13px] text-neutral-400 hover:bg-white/[0.03]"><Building2 className="size-4 text-emerald-400" />Add bank account</button>
            <button className="w-full flex items-center gap-3 rounded-lg border border-dashed border-white/10 px-3 py-2.5 text-[13px] text-neutral-400 hover:bg-white/[0.03]"><Bitcoin className="size-4 text-orange-400" />Add crypto wallet</button>
          </div>
        </Panel>
      </div>
      <Panel>
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <div className="text-[13px] font-medium">Recent payouts</div>
          <Btn variant="ghost" size="sm"><FileText className="size-3.5" />Tax docs</Btn>
        </div>
        <EmptyState icon={Wallet} accent="text-emerald-400" title="No payouts yet" description="Withdrawals appear here with status, invoice, and receipts once your first sale is settled." />
      </Panel>
    </div>
  );
}
