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
      <div className="mx-auto flex min-h-full w-full max-w-[1320px] flex-col px-6 py-8 sm:px-12 sm:py-10">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-4">
          <div className="w-full max-w-[330px]">
            <div className="text-[26px] font-semibold leading-none tabular-nums text-white">
              01 <span className="text-[#4B5563]">/ 04</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              <span className="h-[3px] rounded-full bg-[#2563EB]" />
              <span className="h-[3px] rounded-full bg-white/12" />
              <span className="h-[3px] rounded-full bg-white/12" />
              <span className="h-[3px] rounded-full bg-white/12" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2.5 text-[15px] text-[#D1D5DB] transition hover:text-white"
          >
            <Lock className="h-[18px] w-[18px]" strokeWidth={1.6} />
            Rates locked at checkout
          </button>
        </div>

        {/* Body */}
        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-2 lg:gap-16">
          {/* Left */}
          <div className="flex h-full flex-col">
            <h1 className="text-[42px] font-bold leading-[1.05] tracking-tight text-white sm:text-[52px]">
              Select currency
            </h1>
            <p className="mt-4 max-w-[320px] text-[17px] leading-snug text-[#9CA3AF]">
              Choose the currency you want to use for buying credits.
            </p>

            <div className="relative my-4 flex flex-1 items-center justify-center">
              <img
                src={globeAsset.url}
                alt="Globe surrounded by world banknotes"
                width={1024}
                height={1024}
                loading="lazy"
                className="w-full max-w-[520px] select-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <ShieldCheck className="h-8 w-8 text-[#2563EB]" strokeWidth={1.6} />
              <p className="text-[15px] leading-snug text-[#D1D5DB]">
                Secure payments,
                <br />
                always protected.
              </p>
            </div>
          </div>

          {/* Right */}
          <div>
            <div className="rounded-[22px] border border-white/[0.09] bg-white/[0.012] p-4 sm:p-5">
              <div className="flex items-center gap-3 rounded-[14px] border border-white/[0.08] bg-white/[0.03] px-5 py-4">
                <Search className="h-5 w-5 text-[#6B7280]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search currency"
                  className="w-full bg-transparent text-[16px] text-white placeholder:text-[#8A8F98] outline-none"
                />
              </div>

              <div className="mt-6 px-1 text-[12px] uppercase tracking-[0.22em] text-[#8A8F98]">Popular</div>

              <div className="mt-3 space-y-3">
                {list.map((c) => {
                  const active = c.code === selected.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => setSelected(c)}
                      className={`flex w-full items-center gap-4 rounded-[14px] border px-4 py-3.5 text-left transition ${
                        active
                          ? "border-[#93A5FF] bg-[#C3CCFF] shadow-[0_0_0_1px_rgba(147,165,255,0.35)]"
                          : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
                      }`}
                    >
                      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/10 text-2xl leading-none">
                        {c.flag}
                      </span>
                      <span
                        className={`flex-1 text-[17px] font-medium ${active ? "text-[#0A0A0A]" : "text-[#E5E7EB]"}`}
                      >
                        {c.name}
                      </span>
                      <span className={`text-[16px] tabular-nums ${active ? "text-[#111827]" : "text-[#9CA3AF]"}`}>
                        {c.code}
                      </span>
                      {active && (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D4ED8]">
                          <Check className="h-4 w-4 text-white" strokeWidth={3} />
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
              className="mt-6 flex w-full items-center gap-3 rounded-[16px] bg-gradient-to-r from-[#1E40AF] via-[#1D4ED8] to-[#2563EB] px-7 py-5 text-[18px] font-medium text-white transition hover:brightness-110"
            >
              <span className="flex-1 text-center">Continue</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
