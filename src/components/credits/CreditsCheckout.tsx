import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Check, Lock, Search, ShieldCheck } from "lucide-react";
import globeAsset from "@/assets/currency-globe.png.asset.json";

export type Currency = { code: string; name: string; flag: string };

const POPULAR: Currency[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
];

const MORE: Currency[] = [
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
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
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#050505]">
      <div className="mx-auto flex min-h-full w-full max-w-[1320px] flex-col px-3 py-4 sm:px-12 sm:py-10">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-full max-w-[140px] sm:max-w-[330px]">
            <div className="text-[15px] font-semibold leading-none tabular-nums text-white sm:text-[26px]">
              01 <span className="text-[#4B5563]">/ 02</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
              <span className="h-[3px] rounded-full bg-[#2563EB]" />
              <span className="h-[3px] rounded-full bg-white/12" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-[10px] text-[#D1D5DB] transition hover:text-white sm:gap-2.5 sm:text-[15px]"
          >
            <Lock className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]" strokeWidth={1.6} />
            Rates locked at checkout
          </button>
        </div>

        {/* Body — same two-column structure on every screen */}
        <div className="grid flex-1 grid-cols-2 items-center gap-4 py-4 sm:gap-10 sm:py-8 lg:gap-16">
          {/* Left */}
          <div className="flex h-full flex-col">
            <h1 className="text-[20px] font-bold leading-[1.05] tracking-tight text-white sm:text-[42px] lg:text-[52px]">
              Select currency
            </h1>
            <p className="mt-1.5 max-w-[320px] text-[11px] leading-snug text-[#9CA3AF] sm:mt-4 sm:text-[17px]">
              Choose the currency you want to use for buying credits.
            </p>

            <div className="relative my-3 flex flex-1 items-center justify-center sm:my-4">
              <img
                src={globeAsset.url}
                alt="Globe surrounded by world banknotes"
                width={1024}
                height={1024}
                loading="lazy"
                className="w-full max-w-[520px] select-none"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#2563EB] sm:h-8 sm:w-8" strokeWidth={1.6} />
              <p className="text-[10px] leading-snug text-[#D1D5DB] sm:text-[15px]">
                Secure payments,
                <br />
                always protected.
              </p>
            </div>
          </div>

          {/* Right */}
          <div>
            <div className="rounded-[14px] border border-white/[0.09] bg-white/[0.012] p-2 sm:rounded-[22px] sm:p-5">
              <div className="flex items-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 sm:gap-3 sm:rounded-[14px] sm:px-5 sm:py-4">
                <Search className="h-3.5 w-3.5 shrink-0 text-[#6B7280] sm:h-5 sm:w-5" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search currency"
                  className="w-full min-w-0 bg-transparent text-[11px] text-white placeholder:text-[#8A8F98] outline-none sm:text-[16px]"
                />
              </div>

              <div className="mt-3 px-1 text-[9px] uppercase tracking-[0.18em] text-[#8A8F98] sm:mt-6 sm:text-[12px] sm:tracking-[0.22em]">Popular</div>

              <div className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-3">
                {list.map((c) => {
                  const active = c.code === selected.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => setSelected(c)}
                      className={`flex w-full items-center gap-2 rounded-[10px] border px-2 py-2 text-left transition sm:gap-4 sm:rounded-[14px] sm:px-4 sm:py-3.5 ${
                        active
                          ? "border-[#93A5FF] bg-[#C3CCFF] shadow-[0_0_0_1px_rgba(147,165,255,0.35)]"
                          : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
                      }`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-[13px] leading-none sm:h-10 sm:w-10 sm:text-2xl">
                        {c.flag}
                      </span>
                      <span
                        className={`min-w-0 flex-1 truncate text-[11px] font-medium sm:text-[17px] ${active ? "text-[#0A0A0A]" : "text-[#E5E7EB]"}`}
                      >
                        {c.name}
                      </span>
                      <span className={`text-[10px] tabular-nums sm:text-[16px] ${active ? "text-[#111827]" : "text-[#9CA3AF]"}`}>
                        {c.code}
                      </span>
                      {active && (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1D4ED8] sm:h-7 sm:w-7">
                          <Check className="h-2.5 w-2.5 text-white sm:h-4 sm:w-4" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
                {list.length === 0 && (
                  <div className="py-4 text-center text-[11px] text-[#6B7280] sm:py-6 sm:text-sm">No currency found.</div>
                )}
              </div>

              {!query && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-2 flex w-full items-center justify-center py-1 text-[#6B7280] transition hover:text-white sm:mt-3"
                  aria-label={expanded ? "Show less" : "Show more currencies"}
                >
                  <ChevronDown className={`h-4 w-4 transition-transform sm:h-5 sm:w-5 ${expanded ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>

            <button
              onClick={() => onContinue(selected)}
              className="mt-3 flex w-full items-center gap-2 rounded-[12px] bg-gradient-to-r from-[#1E40AF] via-[#1D4ED8] to-[#2563EB] px-3 py-3 text-[13px] font-medium text-white transition hover:brightness-110 sm:mt-6 sm:gap-3 sm:rounded-[16px] sm:px-7 sm:py-5 sm:text-[18px]"
            >
              <span className="flex-1 text-center">Continue</span>
              <ArrowRight className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
