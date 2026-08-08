import { useState } from "react";
import { ArrowRight, Check, Crown, Gift, Lock, Rocket, ShieldCheck, Star, Zap } from "lucide-react";
import cardAsset from "@/assets/power-card.png.asset.json";
import c1 from "@/assets/crystal-1.png.asset.json";
import c2 from "@/assets/crystal-2.png.asset.json";
import c3 from "@/assets/crystal-3.png.asset.json";
import c4 from "@/assets/crystal-4.png.asset.json";

const PACKS = [
  { amount: 250, tag: "MOST POPULAR", label: "Starter", icon: Zap, img: c1.url },
  { amount: 1000, tag: "POPULAR", label: "Boost", icon: Rocket, img: c2.url },
  { amount: 2500, tag: "BEST VALUE", label: "Pro", icon: Star, img: c3.url },
  { amount: 5000, tag: "MAX POWER", label: "Ultimate", icon: Crown, img: c4.url },
];

const MARKS = [100, 500, 1000, 2500, 5000];

export default function CreditsAmount({
  onContinue,
  onClose,
}: {
  onContinue?: (credits: number) => void;
  onClose?: () => void;
}) {
  const [credits, setCredits] = useState(1250);
  const [manual, setManual] = useState("");

  const bonus = Math.floor(credits * 0.1);

  const setValue = (v: number) => {
    setCredits(v);
    setManual("");
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#050505]">
      <div className="mx-auto flex min-h-full w-full max-w-[1320px] flex-col px-3 py-4 sm:px-12 sm:py-9">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-full max-w-[130px] sm:max-w-[240px]">
            <div className="text-[15px] font-semibold leading-none tabular-nums text-white sm:text-[24px]">
              02 <span className="text-[#4B5563]">/ 02</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
              <span className="h-[3px] rounded-full bg-white/12" />
              <span className="h-[3px] rounded-full bg-white" />
            </div>
          </div>
          <button
            onClick={() => onClose?.()}
            className="flex items-center gap-1.5 text-[10px] text-[#D1D5DB] transition hover:text-white sm:gap-2.5 sm:text-[14px]"
          >
            <Lock className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]" strokeWidth={1.6} />
            Rates locked at checkout
          </button>
        </div>

        <div className="grid flex-1 grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] gap-3 py-4 sm:gap-8 sm:py-6 lg:gap-12">
          {/* Left */}
          <div className="flex h-full flex-col">
            <h1 className="text-[17px] font-bold leading-[1.06] tracking-tight text-white sm:text-[36px] lg:text-[46px]">
              How many
              <br /> credits do you
              <br /> want?
            </h1>
            <div className="relative my-3 flex flex-1 items-center sm:my-6">
              <img
                src={cardAsset.url}
                alt="Black Power Credits card on volcanic rock"
                width={1024}
                height={1024}
                loading="lazy"
                className="w-full max-w-[460px] select-none"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] border border-white/10 bg-white/[0.03] sm:h-12 sm:w-12 sm:rounded-[14px]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#D1D5DB] sm:h-5 sm:w-5" strokeWidth={1.6} />
              </span>
              <p className="text-[10px] leading-snug text-[#D1D5DB] sm:text-[15px]">
                Secure payments,
                <br />
                always protected.
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-2.5 sm:gap-5">
            {/* Packs */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-4">
              {PACKS.map((p) => {
                const active = credits === p.amount;
                const Icon = p.icon;
                return (
                  <button
                    key={p.amount}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setValue(p.amount)}
                    className={`relative flex flex-col items-center rounded-[10px] border px-1 pb-2 pt-1.5 transition sm:rounded-[18px] sm:px-3 sm:pb-4 sm:pt-3 ${
                      active
                        ? "border-transparent bg-[#DCE3FF]"
                        : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div className="flex w-full items-center justify-center">
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[6px] font-semibold tracking-wide sm:px-3 sm:py-1 sm:text-[10px] ${
                          active ? "bg-[#0A0A0A] text-white" : "bg-white/[0.06] text-[#D1D5DB]"
                        }`}
                      >
                        {p.tag}
                      </span>
                      {active && (
                        <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0A0A0A] sm:right-3 sm:top-3 sm:h-6 sm:w-6">
                          <Check className="h-2 w-2 text-white sm:h-3.5 sm:w-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <img
                      src={p.img}
                      alt=""
                      width={512}
                      height={512}
                      loading="lazy"
                      className="mt-1.5 h-[34px] w-[34px] select-none object-contain sm:mt-3 sm:h-[86px] sm:w-[86px]"
                    />
                    <div
                      className={`mt-1 text-[13px] font-semibold tabular-nums sm:mt-2 sm:text-[26px] ${active ? "text-[#0A0A0A]" : "text-white"}`}
                    >
                      {p.amount}
                    </div>
                    <div className={`text-[7px] sm:text-[13px] ${active ? "text-[#374151]" : "text-[#9CA3AF]"}`}>Power Credits</div>
                    <span
                      className={`mt-1.5 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[7px] sm:mt-3 sm:gap-2 sm:px-4 sm:py-1.5 sm:text-[13px] ${
                        active ? "bg-white text-[#0A0A0A]" : "bg-white/[0.05] text-[#E5E7EB]"
                      }`}
                    >
                      <Icon className="h-2 w-2 sm:h-3.5 sm:w-3.5" /> {p.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom */}
            <div className="grid grid-cols-2 rounded-[12px] border border-white/[0.08] bg-white/[0.015] sm:rounded-[20px]">
              <div className="border-r border-white/[0.08] p-2.5 sm:p-6">
                <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.14em] text-[#9CA3AF] sm:gap-2 sm:text-[12px] sm:tracking-[0.18em]">
                  Custom amount <Zap className="h-2.5 w-2.5 text-[#93A5FF] sm:h-3.5 sm:w-3.5" />
                </div>
                <div className="mt-3 sm:mt-8">
                  <div className="flex justify-between px-0.5 text-[8px] tabular-nums text-[#8A8F98] sm:px-1 sm:text-[12px]">
                    {MARKS.map((m) => (
                      <button key={m} type="button" onClick={() => setValue(m)} className="transition hover:text-white">
                        {m}
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={5000}
                    step={50}
                    value={credits}
                    aria-label="Power Credits amount"
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-white sm:mt-3 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white sm:[&::-webkit-slider-thumb]:h-5 sm:[&::-webkit-slider-thumb]:w-5"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-6">
                  <div className="text-[20px] font-semibold leading-none tabular-nums text-white sm:text-[38px]">{credits}</div>
                  <div className="mt-1 text-[9px] text-[#9CA3AF] sm:text-[14px]">Power Credits</div>
                </div>
              </div>

              <div className="p-2.5 sm:p-6">
                <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.14em] text-[#9CA3AF] sm:gap-2 sm:text-[12px] sm:tracking-[0.18em]">
                  Enter manually <Zap className="h-2.5 w-2.5 text-[#93A5FF] sm:h-3.5 sm:w-3.5" />
                </div>
                <div className="mt-2 flex items-center gap-1.5 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-2 py-2 sm:mt-4 sm:gap-3 sm:rounded-[14px] sm:px-5 sm:py-4">
                  <input
                    value={manual}
                    inputMode="numeric"
                    aria-label="Enter Power Credits manually"
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setManual(raw);
                      if (raw) setCredits(Math.min(100000, Math.max(100, Number(raw))));
                    }}
                    placeholder="e.g. 1500"
                    className="w-full min-w-0 bg-transparent text-[10px] text-white placeholder:text-[#6B7280] outline-none sm:text-[16px]"
                  />
                  <span className="hidden whitespace-nowrap text-[14px] text-[#9CA3AF] sm:inline">Power Credits</span>
                  <Zap className="h-3 w-3 shrink-0 text-[#93A5FF] sm:h-4 sm:w-4" />
                </div>
                <p className="mt-2 text-[8px] text-[#9CA3AF] sm:mt-3 sm:text-[13px]">Minimum 100 Power Credits</p>
                <div className="mt-2 flex gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.02] p-2 sm:mt-4 sm:gap-3 sm:rounded-[14px] sm:p-4">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[7px] bg-white/[0.05] sm:h-9 sm:w-9 sm:rounded-[10px]">
                    <Zap className="h-2.5 w-2.5 text-[#93A5FF] sm:h-4 sm:w-4" />
                  </span>
                  <p className="text-[8px] leading-snug text-[#D1D5DB] sm:text-[13px]">
                    Power Credits unlock premium features, advanced scans, and exclusive tools.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 items-center gap-2 rounded-[12px] border border-white/[0.08] bg-white/[0.015] px-2.5 py-2.5 sm:gap-4 sm:rounded-[20px] sm:px-6 sm:py-5">
              <div className="flex items-center gap-1.5 sm:gap-4">
                <span className="hidden h-11 w-11 items-center justify-center rounded-full bg-white/[0.05] sm:flex">
                  <Zap className="h-5 w-5 text-[#D1D5DB]" />
                </span>
                <div className="min-w-0">
                  <div className="text-[8px] text-[#9CA3AF] sm:text-[13px]">You will receive</div>
                  <div className="text-[10px] font-medium text-white sm:text-[17px]">{credits} Power Credits</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 border-l border-white/[0.08] pl-2 sm:gap-4 sm:pl-6">
                <Gift className="hidden h-7 w-7 text-[#C7B9FF] sm:block" strokeWidth={1.5} />
                <div className="min-w-0">
                  <div className="text-[8px] text-[#9CA3AF] sm:text-[13px]">Bonus</div>
                  <div className="text-[9px] text-[#34D399] sm:text-[15px]">+{bonus} (10%)</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[8px] text-[#9CA3AF] sm:text-[13px]">Total Power Credits</div>
                <div className="text-[14px] font-semibold tabular-nums text-white sm:text-[26px]">{credits + bonus}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onContinue?.(credits + bonus)}
              className="flex w-full items-center gap-2 rounded-[12px] bg-gradient-to-r from-[#1E40AF] via-[#1D4ED8] to-[#2563EB] px-3 py-3 text-[13px] font-medium text-white transition hover:brightness-110 sm:gap-3 sm:rounded-[16px] sm:px-7 sm:py-5 sm:text-[18px]"
            >
              <span className="flex-1 text-center">Continue to payment</span>
              <ArrowRight className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
