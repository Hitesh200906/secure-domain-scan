import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { SectionHeader } from "./Features";
import { SectionBackdrop } from "./SectionFx";
import bgIgAsset from "@/assets/social-bg-ig.png.asset.json";
import bgFbAsset from "@/assets/social-bg-fb.png.asset.json";
import bgXAsset from "@/assets/social-bg-x.png.asset.json";

const bgIg = bgIgAsset.url;
const bgFb = bgFbAsset.url;
const bgX = bgXAsset.url;
import logoIg from "@/assets/social-ig.png";
import logoFb from "@/assets/social-fb.png";
import logoX from "@/assets/social-x.png";

type Social = {
  name: string;
  href: string;
  logo: string;
  desc: string;
  note: string;
  bg: string;
  accent: string;
};

const socials: Social[] = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/nexefy_",
    logo: logoIg,
    desc: "Behind the scenes, reels, security tips & live updates.",
    note: "New reels & live updates",
    bg: bgIg,
    accent: "#e1306c",
  },
  {
    name: "X (Twitter)",
    href: "https://x.com",
    logo: logoX,
    desc: "Instant alerts, security news, and real-time intelligence.",
    note: "Real-time threat alerts",
    bg: bgX,
    accent: "#3b82f6",
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    logo: logoFb,
    desc: "Community updates, guides, and in-depth threat analysis.",
    note: "Guides & community updates",
    bg: bgFb,
    accent: "#1877F2",
  },
];

function SocialCard({ s, index }: { s: Social; index: number }) {
  return (
    <motion.a
      href={s.href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/10 p-6 sm:p-7 transition-colors duration-500 hover:border-white/20"
    >


      <div className="relative">
        <img src={s.logo} alt={`${s.name} logo`} width={56} height={56} loading="lazy" className="size-12 object-contain" />

        <h3 className="mt-6 text-base sm:text-lg font-semibold uppercase tracking-[0.18em] text-white">
          {s.name}
        </h3>
        <div className="mt-2 h-[3px] w-9 rounded-full" style={{ background: s.accent }} />

        <p className="mt-5 max-w-[16rem] text-sm leading-relaxed text-white/60">{s.desc}</p>

        <div className="mt-7 border-t border-white/10 pt-6">
          <span className="flex items-center justify-between rounded-lg bg-[#1d4ed8] px-4 py-3 text-sm font-medium text-white transition-colors duration-300 group-hover:bg-[#1e40af]">
            Follow Us
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
          <div className="mt-4 flex items-center gap-2 text-xs text-white/55">
            <span className="size-1.5 rounded-full" style={{ background: s.accent }} />
            {s.note}
          </div>
        </div>
      </div>
    </motion.a>
  );
}

export function Social() {
  return (
    <section className="relative py-16 sm:py-32 overflow-hidden">
      <SectionBackdrop variant="grid" opacity={0.08} />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Community"
          title="Join us on social"
          description="Follow Nexefy Security for live threat intel, research drops, and behind-the-scenes from our red team."
        />
        <div className="mt-10 sm:mt-16 grid md:grid-cols-3 gap-5 sm:gap-6">
          {socials.map((s, i) => (
            <SocialCard key={s.name} s={s} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 sm:mt-10 flex justify-center"
        >
          <div className="inline-flex items-center gap-4 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3">
            <ShieldCheck className="size-5 text-[#3b82f6]" strokeWidth={1.8} />
            <span className="text-sm font-medium text-white">Stay informed. Stay secure.</span>
            <span className="h-4 w-px bg-white/15" />
            <span className="text-sm text-white/55">We share. You stay ahead.</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
