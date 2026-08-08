import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Check, Lock, Search, Shield } from "lucide-react";

export type Currency = { code: string; name: string; flag: string };

const POPULAR: Currency[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
];

const MORE: Currency[] = [
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷" },
];

export default function CreditsCheckout({
  onContinue,
  onClose,
}: {
  onContinue: (currency: Currency) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Currency>(POPULAR[0]);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const list = useMemo(() => {
    const base = expanded || query ? [...POPULAR, ...MORE] : POPULAR;
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [query, expanded]);

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-black">
      <div className="mx-auto flex min-h-full w-full max-w-[1180px] flex-col px-5 py-7 sm:px-10 sm:py-9">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-4">
          <div className="w-full max-w-[320px]">
            <div className="text-lg font-medium tabular-nums text-white">
              01 <span className="text-[#4B5563]">/ 04</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2.5">
              <span className="h-[3px] rounded-full bg-[#2563EB]" />
              <span className="h-[3px] rounded-full bg-white/10" />
              <span className="h-[3px] rounded-full bg-white/10" />
              <span className="h-[3px] rounded-full bg-white/10" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2.5 text-sm text-[#D1D5DB] transition hover:text-white"
          >
            <Lock className="h-[18px] w-[18px]" />
            Rates locked at checkout
          </button>
        </div>

        {/* Body */}
        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Select currency</h1>
            <p className="mt-4 max-w-[300px] text-[15px] leading-relaxed text-[#9CA3AF]">
              Choose the currency you want to use for buying credits.
            </p>
            <div className="mt-10 hidden items-center gap-4 lg:flex">
              <Shield className="h-7 w-7 text-[#9CA3AF]" strokeWidth={1.5} />
              <p className="text-sm leading-relaxed text-[#9CA3AF]">
                Secure payments,
                <br />
                always protected.
              </p>
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-4 sm:p-5">
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3.5">
                <Search className="h-[18px] w-[18px] text-[#6B7280]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search currency"
                  className="w-full bg-transparent text-[15px] text-white placeholder:text-[#6B7280] outline-none"
                />
              </div>

              <div className="mt-5 px-1 text-[11px] uppercase tracking-[0.18em] text-[#6B7280]">Popular</div>

              <div className="mt-3 space-y-2.5">
                {list.map((c) => {
                  const active = c.code === selected.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => setSelected(c)}
                      className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition ${
                        active
                          ? "border-[#2563EB] bg-[#2563EB]/[0.08]"
                          : "border-white/[0.07] bg-white/[0.02] hover:border-white/20"
                      }`}
                    >
                      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/5 text-xl leading-none">
                        {c.flag}
                      </span>
                      <span className={`flex-1 text-[15px] ${active ? "text-white" : "text-[#E5E7EB]"}`}>{c.name}</span>
                      <span className={`text-[15px] tabular-nums ${active ? "text-white" : "text-[#9CA3AF]"}`}>
                        {c.code}
                      </span>
                      {active && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB]">
                          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
                {list.length === 0 && (
                  <div className="py-6 text-center text-sm text-[#6B7280]">No currency found.</div>
                )}
              </div>

              {!query && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-3 flex w-full items-center justify-center py-1 text-[#6B7280] transition hover:text-white"
                  aria-label={expanded ? "Show less" : "Show more currencies"}
                >
                  <ChevronDown className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>

            <button
              onClick={() => onContinue(selected)}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1D4ED8] px-6 py-4 text-[16px] font-medium text-white transition hover:bg-[#1E40AF]"
            >
              <span className="flex-1 text-center">Continue</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="mt-8 flex items-center gap-4 lg:hidden">
              <Shield className="h-7 w-7 text-[#9CA3AF]" strokeWidth={1.5} />
              <p className="text-sm leading-relaxed text-[#9CA3AF]">Secure payments, always protected.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
