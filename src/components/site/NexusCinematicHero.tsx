import { motion } from "framer-motion";
import {
  Search,
  Bell,
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Users,
  MessagesSquare,
  BarChart3,
  Shield,
  Zap,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  UserPlus,
  Activity,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAppMode } from "@/lib/app-mode";

/* ---------- Design tokens (scoped to hero) ---------- */
const T = {
  bg: "#0A0A0B",
  bg2: "#111214",
  card: "#17181C",
  cardHi: "#1D1F24",
  border: "#2A2D35",
  divider: "#23252B",
  text: "#F7F8FA",
  text2: "#A3A8B3",
  text3: "#7A7F89",
  blue: "#4F6BFF",
  purple: "#7C5CFF",
  success: "#22C55E",
};

export function NexusCinematicHero() {
  const { setMode } = useAppMode();

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: T.bg }}
    >
      {/* Ambient background */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 78% 40%, rgba(79,107,255,0.10) 0%, rgba(124,92,255,0.06) 40%, rgba(0,0,0,0) 75%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8 pt-24 sm:pt-28 pb-20 sm:pb-28">
        <div className="grid lg:grid-cols-[45%_55%] gap-12 lg:gap-16 items-center min-h-[680px]">
          {/* LEFT */}
          <HeroCopy onNexefy={() => setMode("nexus")} onSecurity={() => setMode("security")} />

          {/* RIGHT */}
          <div className="relative w-full">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* LEFT SIDE                                                           */
/* ------------------------------------------------------------------ */
function HeroCopy({ onNexefy, onSecurity }: { onNexefy: () => void; onSecurity: () => void }) {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px]"
        style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text2 }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: T.blue, boxShadow: `0 0 8px ${T.blue}` }}
        />
        All-in-One Business Platform
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.08 }}
        className="mt-8 font-semibold tracking-[-0.05em] leading-[0.92] text-[64px] sm:text-[88px] lg:text-[104px]"
        style={{ color: T.text }}
      >
        <span className="block">Build.</span>
        <span className="block">Sell.</span>
        <span className="block">Scale.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="mt-7 max-w-[460px] text-[16px] sm:text-[17px] leading-relaxed"
        style={{ color: T.text2 }}
      >
        Nexefy is the operating system for modern internet business — where
        creators, brands and communities launch, manage and scale everything
        from a single elegant platform.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-3"
      >
        <button
          onClick={onNexefy}
          className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(135deg, ${T.blue} 0%, ${T.purple} 100%)`,
            boxShadow: "0 10px 30px -12px rgba(79,107,255,0.55)",
          }}
        >
          <Sparkles className="size-4" />
          Switch to Nexefy
          <ArrowUpRight className="size-4 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>

        <button
          onClick={onSecurity}
          className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-medium transition-all duration-200"
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            color: T.text,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.blue)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}
        >
          <ShieldCheck className="size-4" style={{ color: T.text2 }} />
          Switch to Nexefy Security
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.55 }}
        className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12.5px]"
        style={{ color: T.text3 }}
      >
        <span className="uppercase tracking-[0.14em]" style={{ color: T.text3 }}>
          Trusted by
        </span>
        {["Creators", "Businesses", "Communities", "Startups"].map((k) => (
          <span key={k} className="inline-flex items-center gap-2">
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: T.text3 }}
            />
            {k}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RIGHT SIDE — Dashboard mockup                                       */
/* ------------------------------------------------------------------ */
function DashboardMockup() {
  return (
    <div className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px]">
      {/* Subtle ambient blue puddle */}
      <div
        aria-hidden
        className="absolute -inset-8"
        style={{
          background:
            "radial-gradient(50% 40% at 55% 55%, rgba(79,107,255,0.12) 0%, rgba(124,92,255,0.05) 50%, transparent 80%)",
          filter: "blur(20px)",
        }}
      />

      {/* Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateX: 8, rotateY: -6 }}
        animate={{ opacity: 1, y: [0, -3, 0], rotateX: 4, rotateY: -6 }}
        transition={{
          opacity: { duration: 0.9, delay: 0.2 },
          rotateX: { duration: 0.9, delay: 0.2 },
          rotateY: { duration: 0.9, delay: 0.2 },
          y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center",
        }}
        className="absolute inset-0 mx-auto"
      >
        <div
          className="relative w-full h-full rounded-[28px] overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${T.bg2} 0%, ${T.card} 100%)`,
            border: `1px solid ${T.border}`,
            boxShadow:
              "0 40px 80px -30px rgba(0,0,0,0.75), 0 20px 40px -20px rgba(79,107,255,0.12)",
          }}
        >
          <TopNav />
          <div className="grid grid-cols-[172px_1fr] h-[calc(100%-52px)]">
            <Sidebar />
            <MainContent />
          </div>
        </div>
      </motion.div>

      {/* Floating cards */}
      <FloatCard
        className="absolute -left-4 top-[8%] w-[210px] hidden md:block"
        delay={0}
      >
        <MiniHeader icon={<Store className="size-3.5" style={{ color: T.blue }} />} title="Marketplace" />
        <MiniRow label="Products" value="1,284" />
        <MiniRow label="Revenue" value="$42.8k" />
        <Sparkline color={T.blue} />
      </FloatCard>

      <FloatCard
        className="absolute -left-2 bottom-[10%] w-[210px] hidden md:block"
        delay={1.2}
      >
        <MiniHeader icon={<Users className="size-3.5" style={{ color: T.purple }} />} title="Communities" />
        <MiniRow label="Members" value="18,402" />
        <MiniRow label="Active" value="6,120" />
        <MiniRow label="Growth" value="+12.4%" valueColor={T.success} />
      </FloatCard>

      <FloatCard
        className="absolute -right-2 top-[10%] w-[210px] hidden md:block"
        delay={0.6}
      >
        <MiniHeader icon={<Shield className="size-3.5" style={{ color: T.blue }} />} title="Security" />
        <MiniRow label="Status" value="Protected" valueColor={T.success} />
        <MiniRow label="Uptime" value="99.99%" />
        <div className="mt-2 flex items-center gap-2 text-[11px]" style={{ color: T.text3 }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: T.success, boxShadow: `0 0 8px ${T.success}` }} />
          All systems verified
        </div>
      </FloatCard>

      <FloatCard
        className="absolute -right-4 bottom-[12%] w-[220px] hidden md:block"
        delay={1.8}
      >
        <MiniHeader icon={<BarChart3 className="size-3.5" style={{ color: T.purple }} />} title="Analytics" />
        <MiniRow label="Traffic" value="248.9k" />
        <MiniRow label="Conversion" value="4.82%" />
        <Sparkline color={T.purple} />
      </FloatCard>
    </div>
  );
}

/* ---------- Dashboard parts ---------- */
function TopNav() {
  return (
    <div
      className="flex items-center gap-3 px-4 h-[52px]"
      style={{ borderBottom: `1px solid ${T.divider}` }}
    >
      <div className="flex items-center gap-2">
        <div
          className="grid place-items-center h-6 w-6 rounded-md"
          style={{
            background: `linear-gradient(135deg, ${T.blue}, ${T.purple})`,
          }}
        >
          <span className="text-white text-[10px] font-bold">N</span>
        </div>
        <span className="text-[12.5px] font-semibold" style={{ color: T.text }}>
          Nexefy
        </span>
      </div>

      <div
        className="ml-4 flex-1 max-w-[280px] flex items-center gap-2 h-8 rounded-lg px-3"
        style={{ background: T.bg2, border: `1px solid ${T.divider}` }}
      >
        <Search className="size-3.5" style={{ color: T.text3 }} />
        <span className="text-[11.5px]" style={{ color: T.text3 }}>
          Search products, orders, members…
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div
          className="grid place-items-center h-8 w-8 rounded-lg relative"
          style={{ background: T.bg2, border: `1px solid ${T.divider}` }}
        >
          <Bell className="size-3.5" style={{ color: T.text2 }} />
          <span
            className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
            style={{ background: T.blue }}
          />
        </div>
        <div
          className="h-8 w-8 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${T.purple}, ${T.blue})`,
            border: `1px solid ${T.border}`,
          }}
        />
      </div>
    </div>
  );
}

function Sidebar() {
  const items = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Store, label: "Marketplace" },
    { icon: Package, label: "Products" },
    { icon: ShoppingCart, label: "Orders" },
    { icon: Users, label: "Members" },
    { icon: MessagesSquare, label: "Communities" },
    { icon: BarChart3, label: "Analytics" },
    { icon: MessagesSquare, label: "Messages" },
    { icon: Shield, label: "Security" },
    { icon: Zap, label: "Automations" },
    { icon: Settings, label: "Settings" },
  ];
  return (
    <div
      className="py-3 px-2 overflow-hidden"
      style={{ borderRight: `1px solid ${T.divider}`, background: T.bg2 }}
    >
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11.5px] mb-0.5 relative"
          style={{
            background: it.active ? T.cardHi : "transparent",
            color: it.active ? T.text : T.text2,
          }}
        >
          {it.active && (
            <span
              className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full"
              style={{ background: T.blue }}
            />
          )}
          <it.icon className="size-3.5" style={{ color: it.active ? T.blue : T.text3 }} />
          {it.label}
        </div>
      ))}
    </div>
  );
}

function MainContent() {
  return (
    <div className="p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[13px] font-semibold" style={{ color: T.text }}>Dashboard</div>
          <div className="text-[10.5px]" style={{ color: T.text3 }}>Overview · Last 30 days</div>
        </div>
        <div className="flex items-center gap-1.5">
          {["7d", "30d", "90d"].map((r, i) => (
            <span
              key={r}
              className="text-[10px] px-2 py-1 rounded-md"
              style={{
                background: i === 1 ? T.cardHi : "transparent",
                color: i === 1 ? T.text : T.text3,
                border: `1px solid ${i === 1 ? T.border : "transparent"}`,
              }}
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-2">
        <KPI icon={DollarSign} title="Revenue" value="$128,450" trend="+12.5%" up color={T.blue} />
        <KPI icon={ShoppingCart} title="Orders" value="3,842" trend="+8.2%" up color={T.purple} />
        <KPI icon={UserPlus} title="Members" value="18,402" trend="+24.1%" up color={T.blue} />
        <KPI icon={TrendingUp} title="Growth" value="6.8%" trend="-1.2%" up={false} color={T.purple} />
      </div>

      {/* Chart + right column */}
      <div className="mt-3 grid grid-cols-[1.6fr_1fr] gap-2">
        <RevenueChart />
        <div className="space-y-2">
          <SideCard title="Top Products">
            {[
              ["Founders Pass", "$18.2k"],
              ["Growth Course", "$9.4k"],
              ["Community Pro", "$6.1k"],
            ].map(([n, v]) => (
              <SideRow key={n} name={n} value={v} />
            ))}
          </SideCard>
          <SideCard title="Recent Orders">
            {[
              ["#8241 · Ava", "$249"],
              ["#8240 · Leo", "$89"],
              ["#8239 · Nora", "$1,200"],
            ].map(([n, v]) => (
              <SideRow key={n} name={n} value={v} muted />
            ))}
          </SideCard>
        </div>
      </div>

      {/* Metrics strip */}
      <div className="mt-3 grid grid-cols-5 gap-2">
        {[
          ["Conversion", "4.82%"],
          ["Traffic", "248.9k"],
          ["Subscriptions", "2,140"],
          ["Monthly Growth", "+12.4%"],
          ["Retention", "94%"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="rounded-lg px-2.5 py-2"
            style={{ background: T.bg2, border: `1px solid ${T.divider}` }}
          >
            <div className="text-[9.5px] uppercase tracking-wider" style={{ color: T.text3 }}>{k}</div>
            <div className="text-[12px] font-semibold mt-0.5" style={{ color: T.text }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KPI({
  icon: Icon,
  title,
  value,
  trend,
  up,
  color,
}: {
  icon: typeof DollarSign;
  title: string;
  value: string;
  trend: string;
  up: boolean;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-2.5"
      style={{ background: T.card, border: `1px solid ${T.divider}` }}
    >
      <div className="flex items-center justify-between">
        <div
          className="grid place-items-center h-6 w-6 rounded-md"
          style={{ background: `${color}18`, border: `1px solid ${color}33` }}
        >
          <Icon className="size-3" style={{ color }} />
        </div>
        <span
          className="inline-flex items-center gap-0.5 text-[9.5px] px-1.5 py-0.5 rounded"
          style={{
            color: up ? T.success : "#ef4444",
            background: up ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
          }}
        >
          {up ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
          {trend}
        </span>
      </div>
      <div className="text-[10px] mt-2" style={{ color: T.text3 }}>{title}</div>
      <div className="text-[15px] font-semibold mt-0.5" style={{ color: T.text }}>{value}</div>
      <MiniSpark color={color} />
    </div>
  );
}

function MiniSpark({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 24" className="w-full h-4 mt-1" preserveAspectRatio="none">
      <path
        d="M0,18 L12,14 L24,16 L36,10 L48,12 L60,7 L72,9 L84,5 L100,3"
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RevenueChart() {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: T.card, border: `1px solid ${T.divider}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-[10.5px]" style={{ color: T.text3 }}>Revenue</div>
          <div className="text-[14px] font-semibold" style={{ color: T.text }}>$128,450</div>
        </div>
        <div className="flex items-center gap-3 text-[9.5px]" style={{ color: T.text2 }}>
          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: T.blue }} /> This month</span>
          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: T.purple }} /> Last month</span>
        </div>
      </div>
      <svg viewBox="0 0 320 130" className="w-full h-[130px]" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={T.blue} stopOpacity="0.25" />
            <stop offset="100%" stopColor={T.blue} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 26, 52, 78, 104, 130].map((y) => (
          <line key={y} x1="0" x2="320" y1={y} y2={y} stroke={T.divider} strokeWidth="0.5" />
        ))}
        {[0, 64, 128, 192, 256, 320].map((x) => (
          <line key={x} x1={x} x2={x} y1="0" y2="130" stroke={T.divider} strokeWidth="0.5" />
        ))}
        <path
          d="M0,90 C30,84 45,78 70,72 S110,60 140,58 S190,40 220,34 S270,18 320,14"
          stroke={T.purple}
          strokeWidth="1.6"
          fill="none"
          strokeDasharray="3 3"
          opacity="0.7"
        />
        <path
          d="M0,100 C30,92 45,86 70,80 S110,66 140,60 S190,44 220,36 S270,22 320,10 L320,130 L0,130 Z"
          fill="url(#revFill)"
        />
        <path
          d="M0,100 C30,92 45,86 70,80 S110,66 140,60 S190,44 220,36 S270,22 320,10"
          stroke={T.blue}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="320" cy="10" r="3" fill={T.blue} />
      </svg>
    </div>
  );
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-2.5"
      style={{ background: T.card, border: `1px solid ${T.divider}` }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10.5px] font-medium" style={{ color: T.text }}>{title}</div>
        <Activity className="size-3" style={{ color: T.text3 }} />
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function SideRow({ name, value, muted }: { name: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[10.5px]">
      <span style={{ color: muted ? T.text3 : T.text2 }}>{name}</span>
      <span style={{ color: T.text }}>{value}</span>
    </div>
  );
}

/* ---------- Floating cards ---------- */
function FloatCard({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: [0, -6, 0] }}
      transition={{
        opacity: { duration: 0.7, delay: 0.4 + delay * 0.15 },
        y: { duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={className}
    >
      <div
        className="rounded-[18px] p-3.5 backdrop-blur-md"
        style={{
          background: "rgba(23,24,28,0.85)",
          border: `1px solid ${T.border}`,
          boxShadow: "0 20px 40px -20px rgba(0,0,0,0.6)",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
function MiniHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <div
        className="grid place-items-center h-6 w-6 rounded-md"
        style={{ background: T.bg2, border: `1px solid ${T.divider}` }}
      >
        {icon}
      </div>
      <span className="text-[12px] font-medium" style={{ color: T.text }}>{title}</span>
    </div>
  );
}
function MiniRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between text-[11px] py-0.5">
      <span style={{ color: T.text3 }}>{label}</span>
      <span style={{ color: valueColor ?? T.text }}>{value}</span>
    </div>
  );
}
function Sparkline({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 30" className="w-full h-6 mt-2" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sf-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,22 L15,18 L30,20 L45,12 L60,15 L75,8 L90,10 L105,4 L120,6 L120,30 L0,30 Z"
        fill={`url(#sf-${color})`}
      />
      <path
        d="M0,22 L15,18 L30,20 L45,12 L60,15 L75,8 L90,10 L105,4 L120,6"
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
