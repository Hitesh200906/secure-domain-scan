import { motion } from "framer-motion";
import { useState } from "react";
import {
  Image as ImageIcon, Smile, BarChart3, DollarSign, Radio, ChevronDown,
  Heart, MessageCircle, Share2, MoreHorizontal,
} from "lucide-react";

type Tab = "all" | "following" | "joined";

const samplePosts = [
  {
    author: "Steven Schwartz",
    store: "Nexefy AI",
    time: "2h",
    body: "Just shipped a new model fine-tune that scores 12% higher on extraction tasks. Drop your hardest prompts below 👇",
    likes: 248,
    comments: 41,
    color: "from-cyan-500 to-blue-600",
  },
  {
    author: "Tiana Reyes",
    store: "Nexefy University",
    time: "5h",
    body: "New cohort opens Monday. Three seats left for the live mentorship track. Who's in?",
    likes: 132,
    comments: 27,
    color: "from-violet-500 to-fuchsia-600",
  },
  {
    author: "Evan Stanfield",
    store: "Clipping Culture",
    time: "8h",
    body: "Hit $20k MRR this month. Couldn't have done it without this community. Sharing the exact playbook in tonight's drop 🚀",
    likes: 612,
    comments: 89,
    color: "from-orange-500 to-red-600",
  },
];

export function TownhallFeed() {
  const [tab, setTab] = useState<Tab>("all");
  const [draft, setDraft] = useState("");

  return (
    <section className="relative py-14 sm:py-20 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-3xl font-semibold tracking-tight text-white">Townhall</h2>
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full glass p-1">
            {(["all", "following", "joined"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 sm:px-4 py-1.5 text-[11px] sm:text-sm font-medium rounded-full capitalize transition ${
                  tab === t ? "bg-white text-black" : "text-muted-foreground hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Composer */}
        <div className="rounded-2xl glass p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <button className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs sm:text-sm text-white hover:border-white/20 transition">
              <span className="size-5 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 grid place-items-center text-[10px] font-bold">C</span>
              ClipForge
              <ChevronDown className="size-3.5" />
            </button>
            <button className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs sm:text-sm text-white hover:border-white/20 transition">
              <span className="size-3.5 rounded-sm border border-white/30" />
              Public forum
              <ChevronDown className="size-3.5" />
            </button>
          </div>

          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center text-white font-semibold shrink-0">
              N
            </div>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Drop something worth talking about..."
              className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-white placeholder:text-muted-foreground py-2"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground">
              {[ImageIcon, Smile, BarChart3, DollarSign].map((Icon, i) => (
                <button key={i} className="size-8 sm:size-9 grid place-items-center rounded-full hover:bg-white/[0.05] hover:text-white transition">
                  <Icon className="size-4" />
                </button>
              ))}
              <button className="size-8 sm:size-9 grid place-items-center rounded-full hover:bg-white/[0.05] hover:text-white transition text-[10px] font-bold tracking-tight">
                GIF
              </button>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="inline-flex items-center gap-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 text-[11px] sm:text-sm font-medium transition">
                <Radio className="size-3.5" /> <span className="hidden xs:inline">Go live</span><span className="xs:hidden">Live</span>
              </button>
              <button className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-5 py-2 text-[11px] sm:text-sm font-medium transition">
                Post
              </button>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="mt-6 space-y-4">
          {samplePosts.map((p, i) => (
            <motion.article
              key={p.author + i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl glass p-4 sm:p-5 hover:border-white/20 transition"
            >
              <div className="flex items-start gap-3">
                <div className={`size-11 rounded-full bg-gradient-to-br ${p.color} grid place-items-center text-white font-semibold shrink-0`}>
                  {p.author[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <span className="font-semibold text-white">{p.author}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{p.store}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground text-xs">{p.time}</span>
                    </div>
                    <button className="size-7 grid place-items-center rounded-full text-muted-foreground hover:bg-white/[0.05] hover:text-white transition">
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm sm:text-[15px] text-white/90 leading-relaxed">{p.body}</p>
                  <div className="mt-4 flex items-center gap-1 text-muted-foreground">
                    <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs hover:bg-white/[0.05] hover:text-rose-400 transition">
                      <Heart className="size-4" /> {p.likes}
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs hover:bg-white/[0.05] hover:text-white transition">
                      <MessageCircle className="size-4" /> {p.comments}
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs hover:bg-white/[0.05] hover:text-white transition">
                      <Share2 className="size-4" /> Share
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
