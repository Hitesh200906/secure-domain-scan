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
      <div className="mx-auto flex min-h-full w-full max-w-[1320px] flex-col px-5 py-7 sm:px-12 sm:py-9">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-4">
          <div className="w-full max-w-[240px]">
            <div className="text-[24px] font-semibold leading-none tabular-nums text-white">
              02 <span className="text-[#4B5563]">/ 02</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <span className="h-[3px] rounded-full bg-white/12" />
              <span className="h-[3px] rounded-full bg-white" />
            </div>
          </div>
          <button
            onClick={() => onClose?.()}
            className="flex items-center gap-2.5 text-[14px] text-[#D1D5DB] transition hover:text-white"
          >
            <Lock className="h-[18px] w-[18px]" strokeWidth={1.6} />
            Rates locked at checkout
          </button>
        </div>

        <div className="grid flex-1 gap-8 py-6 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-12">
          {/* Left */}
          <div className="flex h-full flex-col">
            <h1 className="text-[36px] font-bold leading-[1.06] tracking-tight text-white sm:text-[46px]">
              How many
              <br /> credits do you
              <br /> want?
            </h1>
            <div className="relative my-6 flex flex-1 items-center">
              <img
                src={cardAsset.url}
                alt="Black Power Credits card on volcanic rock"
                width={1024}
                height={1024}
                loading="lazy"
                className="w-full max-w-[460px] select-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.03]">
                <ShieldCheck className="h-5 w-5 text-[#D1D5DB]" strokeWidth={1.6} />
              </span>
              <p className="text-[15px] leading-snug text-[#D1D5DB]">
                Secure payments,
                <br />
                always protected.
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-5">
            {/* Packs */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {PACKS.map((p) => {
                const active = credits === p.amount;
                const Icon = p.icon;
                return (
                  <button
                    key={p.amount}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setValue(p.amount)}
                    className={`relative flex flex-col items-center rounded-[18px] border px-3 pb-4 pt-3 transition ${
                      active
                        ? "border-transparent bg-[#DCE3FF]"
                        : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div className="flex w-full items-center justify-center">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide ${
                          active ? "bg-[#0A0A0A] text-white" : "bg-white/[0.06] text-[#D1D5DB]"
                        }`}
                      >
                        {p.tag}
                      </span>
                      {active && (
                        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#0A0A0A]">
                          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <img
                      src={p.img}
                      alt=""
                      width={512}
                      height={512}
                      loading="lazy"
                      className="mt-3 h-[86px] w-[86px] select-none object-contain"
                    />
                    <div
                      className={`mt-2 text-[26px] font-semibold tabular-nums ${active ? "text-[#0A0A0A]" : "text-white"}`}
                    >
                      {p.amount}
                    </div>
                    <div className={`text-[13px] ${active ? "text-[#374151]" : "text-[#9CA3AF]"}`}>Power Credits</div>
                    <span
                      className={`mt-3 flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] ${
                        active ? "bg-white text-[#0A0A0A]" : "bg-white/[0.05] text-[#E5E7EB]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" /> {p.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom */}
            <div className="grid rounded-[20px] border border-white/[0.08] bg-white/[0.015] lg:grid-cols-2">
              <div className="border-b border-white/[0.08] p-6 lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-[#9CA3AF]">
                  Custom amount <Zap className="h-3.5 w-3.5 text-[#93A5FF]" />
                </div>
                <div className="mt-8">
                  <div className="flex justify-between px-1 text-[12px] tabular-nums text-[#8A8F98]">
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
                    className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-white [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>
                <div className="mt-6 text-center">
                  <div className="text-[38px] font-semibold leading-none tabular-nums text-white">{credits}</div>
                  <div className="mt-1 text-[14px] text-[#9CA3AF]">Power Credits</div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-[#9CA3AF]">
                  Enter manually <Zap className="h-3.5 w-3.5 text-[#93A5FF]" />
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-[14px] border border-white/[0.08] bg-white/[0.03] px-5 py-4">
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
                    className="w-full bg-transparent text-[16px] text-white placeholder:text-[#6B7280] outline-none"
                  />
                  <span className="whitespace-nowrap text-[14px] text-[#9CA3AF]">Power Credits</span>
                  <Zap className="h-4 w-4 text-[#93A5FF]" />
                </div>
                <p className="mt-3 text-[13px] text-[#9CA3AF]">Minimum 100 Power Credits</p>
                <div className="mt-4 flex gap-3 rounded-[14px] border border-white/[0.08] bg-white/[0.02] p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.05]">
                    <Zap className="h-4 w-4 text-[#93A5FF]" />
                  </span>
                  <p className="text-[13px] leading-snug text-[#D1D5DB]">
                    Power Credits unlock premium features, advanced scans, and exclusive tools.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="grid items-center gap-4 rounded-[20px] border border-white/[0.08] bg-white/[0.015] px-6 py-5 sm:grid-cols-3">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.05]">
                  <Zap className="h-5 w-5 text-[#D1D5DB]" />
                </span>
                <div>
                  <div className="text-[13px] text-[#9CA3AF]">You will receive</div>
                  <div className="text-[17px] font-medium text-white">{credits} Power Credits</div>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:border-l sm:border-white/[0.08] sm:pl-6">
                <Gift className="h-7 w-7 text-[#C7B9FF]" strokeWidth={1.5} />
                <div>
                  <div className="text-[13px] text-[#9CA3AF]">Bonus</div>
                  <div className="text-[15px] text-[#34D399]">+{bonus} Power Credits (10%)</div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-[13px] text-[#9CA3AF]">Total Power Credits</div>
                <div className="text-[26px] font-semibold tabular-nums text-white">{credits + bonus}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onContinue?.(credits + bonus)}
              className="flex w-full items-center gap-3 rounded-[16px] bg-gradient-to-r from-[#1E40AF] via-[#1D4ED8] to-[#2563EB] px-7 py-5 text-[18px] font-medium text-white transition hover:brightness-110"
            >
              <span className="flex-1 text-center">Continue to payment</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
