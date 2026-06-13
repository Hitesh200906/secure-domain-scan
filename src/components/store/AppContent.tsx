import { type AppKey, APP_MAP } from "@/lib/store-apps";
import {
  Send, Plus, Search, ThumbsUp, MessageSquare, Star, Calendar,
  Download as DownloadIcon, ExternalLink, Mail, FileText, BarChart3,
  Users, Info, Sparkles, Lightbulb, History,
} from "lucide-react";
import type { Store } from "@/lib/business";

export function AppContent({ appKey, store, isOwner }: { appKey: AppKey; store: Store; isOwner: boolean }) {
  switch (appKey) {
    case "chat": return <ChatApp />;
    case "announcements": return <AnnouncementsApp isOwner={isOwner} />;
    case "forum": return <ForumApp isOwner={isOwner} />;
    case "faq": return <FaqApp isOwner={isOwner} />;
    case "reviews": return <ReviewsApp />;
    case "support": return <SupportApp />;
    case "resources": return <ResourcesApp isOwner={isOwner} />;
    case "downloads": return <DownloadsApp isOwner={isOwner} />;
    case "changelog": return <ChangelogApp isOwner={isOwner} />;
    case "feature_requests": return <FeatureRequestsApp />;
    case "polls": return <PollsApp isOwner={isOwner} />;
    case "events": return <EventsApp isOwner={isOwner} />;
    case "showcase": return <ShowcaseApp />;
    case "members": return <MembersApp store={store} />;
    case "about": return <AboutApp store={store} />;
    default: return <Empty title="Unknown app" sub="This app isn't available." />;
  }
}

export function AppHeader({ appKey }: { appKey: AppKey }) {
  const def = APP_MAP[appKey];
  if (!def) return null;
  return (
    <div className="flex items-center gap-3">
      <img src={def.logo} alt="" loading="lazy" width={32} height={32} className="size-8 rounded-xl object-contain shrink-0" />
      <div className="text-xl font-semibold">{def.name}</div>
    </div>
  );
}

/* ---------------- Apps ---------------- */

function ChatApp() {
  return (
    <div className="flex flex-col h-[calc(100vh-13rem)]">
      <div className="flex-1 grid place-items-center text-center">
        <div className="max-w-md">
          <div className="mx-auto size-16 rounded-3xl bg-gradient-to-br from-orange-500 to-rose-500 grid place-items-center mb-4 shadow-xl shadow-rose-500/20">
            <MessageSquare className="size-7 text-white" />
          </div>
          <div className="text-2xl font-semibold">What's pop'in?</div>
          <div className="text-sm text-muted-foreground mt-1">Be the first to start the conversation</div>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 flex items-center gap-2">
        <button className="size-9 grid place-items-center rounded-full hover:bg-white/5 text-muted-foreground"><Plus className="size-4" /></button>
        <input placeholder="Message #chat" className="flex-1 bg-transparent outline-none text-sm px-2" />
        <button className="size-9 grid place-items-center rounded-full bg-primary text-primary-foreground"><Send className="size-4" /></button>
      </div>
    </div>
  );
}

function AnnouncementsApp({ isOwner }: { isOwner: boolean }) {
  return (
    <div className="max-w-3xl space-y-4">
      {isOwner && (
        <button className="w-full rounded-2xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] transition p-4 text-sm text-muted-foreground flex items-center gap-2">
          <Plus className="size-4" /> Post an announcement
        </button>
      )}
      <Empty title="No announcements yet" sub={isOwner ? "Share an update with your community." : "Check back soon for updates."} />
    </div>
  );
}

function ForumApp({ isOwner }: { isOwner: boolean }) {
  const cats = ["General", "Help", "Showcase", "Off-topic"];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} className="text-xs rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 px-3 py-1.5">{c}</button>
          ))}
        </div>
        {isOwner && <button className="rounded-full bg-white text-black px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5"><Plus className="size-3.5" /> New topic</button>}
      </div>
      <Empty title="No topics yet" sub="Start the first discussion." />
    </div>
  );
}

function FaqApp({ isOwner }: { isOwner: boolean }) {
  return (
    <div className="max-w-3xl space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input placeholder="Search questions…" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 outline-none text-sm" />
      </div>
      {isOwner && <button className="text-sm rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 px-3 py-2 inline-flex items-center gap-1.5"><Plus className="size-4" /> Add question</button>}
      <Empty title="No FAQs yet" sub="Add common questions and answers." />
    </div>
  );
}

function ReviewsApp() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex items-center gap-6">
        <div>
          <div className="text-5xl font-bold">—</div>
          <div className="flex items-center gap-0.5 mt-1">
            {[1,2,3,4,5].map(i => <Star key={i} className="size-4 text-muted-foreground/40" />)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">0 reviews</div>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5,4,3,2,1].map((n) => (
            <div key={n} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-3">{n}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5" />
            </div>
          ))}
        </div>
      </div>
      <button className="rounded-full bg-white text-black px-4 py-2 text-sm font-semibold">Write a review</button>
    </div>
  );
}

function SupportApp() {
  return (
    <div className="max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="size-5 text-primary" />
        <div className="text-lg font-semibold">Contact support</div>
      </div>
      <div className="space-y-3">
        <input placeholder="Subject" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 outline-none text-sm" />
        <textarea placeholder="How can we help?" rows={5} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 outline-none text-sm resize-none" />
        <button className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold">Send request</button>
      </div>
    </div>
  );
}

function ResourcesApp({ isOwner }: { isOwner: boolean }) {
  return (
    <div className="max-w-3xl space-y-4">
      {isOwner && <button className="text-sm rounded-full bg-white/[0.06] border border-white/10 px-3 py-2 inline-flex items-center gap-1.5"><Plus className="size-4" /> Add resource</button>}
      <Empty title="No resources yet" sub="Add useful links and docs." icon={ExternalLink} />
    </div>
  );
}

function DownloadsApp({ isOwner }: { isOwner: boolean }) {
  return (
    <div className="max-w-3xl space-y-4">
      {isOwner && <button className="text-sm rounded-full bg-white/[0.06] border border-white/10 px-3 py-2 inline-flex items-center gap-1.5"><Plus className="size-4" /> Upload file</button>}
      <Empty title="No downloads yet" sub="Share files, templates and assets." icon={DownloadIcon} />
    </div>
  );
}

function ChangelogApp({ isOwner }: { isOwner: boolean }) {
  return (
    <div className="max-w-3xl space-y-4">
      {isOwner && <button className="text-sm rounded-full bg-white/[0.06] border border-white/10 px-3 py-2 inline-flex items-center gap-1.5"><Plus className="size-4" /> Publish update</button>}
      <Empty title="No releases yet" sub="Publish your first product update." icon={History} />
    </div>
  );
}

function FeatureRequestsApp() {
  return (
    <div className="max-w-3xl space-y-4">
      <button className="text-sm rounded-full bg-white text-black px-3 py-2 font-semibold inline-flex items-center gap-1.5"><Lightbulb className="size-4" /> Suggest a feature</button>
      <Empty title="No requests yet" sub="Be the first to suggest a feature." icon={ThumbsUp} />
    </div>
  );
}

function PollsApp({ isOwner }: { isOwner: boolean }) {
  return (
    <div className="max-w-3xl space-y-4">
      {isOwner && <button className="text-sm rounded-full bg-white/[0.06] border border-white/10 px-3 py-2 inline-flex items-center gap-1.5"><Plus className="size-4" /> Create poll</button>}
      <Empty title="No polls yet" sub="Start a community vote." icon={BarChart3} />
    </div>
  );
}

function EventsApp({ isOwner }: { isOwner: boolean }) {
  return (
    <div className="max-w-3xl space-y-4">
      {isOwner && <button className="text-sm rounded-full bg-white/[0.06] border border-white/10 px-3 py-2 inline-flex items-center gap-1.5"><Plus className="size-4" /> Schedule event</button>}
      <Empty title="No events scheduled" sub="Plan a workshop, webinar or meetup." icon={Calendar} />
    </div>
  );
}

function ShowcaseApp() {
  return (
    <div className="max-w-3xl space-y-4">
      <button className="text-sm rounded-full bg-white text-black px-3 py-2 font-semibold inline-flex items-center gap-1.5"><Plus className="size-4" /> Submit project</button>
      <Empty title="No showcases yet" sub="Share your project or success story." icon={Sparkles} />
    </div>
  );
}

function MembersApp({ store }: { store: Store }) {
  return (
    <div className="max-w-3xl space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">{store.member_count ?? 0}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Members</div>
        </div>
        <Users className="size-6 text-muted-foreground" />
      </div>
      <Empty title="No members to display" sub="Member list will appear here." />
    </div>
  );
}

function AboutApp({ store }: { store: Store }) {
  return (
    <div className="max-w-3xl space-y-6">
      <section>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">About</div>
        {store.description ? (
          <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">{store.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No description yet.</p>
        )}
      </section>
      {store.skills && store.skills.length > 0 && (
        <section>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Skills</div>
          <div className="flex flex-wrap gap-2">
            {store.skills.map((s) => (
              <span key={s} className="text-xs rounded-full bg-white/[0.06] border border-white/10 px-3 py-1.5">{s}</span>
            ))}
          </div>
        </section>
      )}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><Info className="size-3.5" /> Contact</div>
        {store.website_url ? <a href={store.website_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">{store.website_url}</a> : <div className="text-sm text-muted-foreground">No contact details yet.</div>}
      </section>
    </div>
  );
}

function Empty({ title, sub, icon: Icon = FileText }: { title: string; sub: string; icon?: any }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
      <div className="mx-auto size-12 rounded-full bg-white/[0.04] grid place-items-center mb-3">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{sub}</div>
    </div>
  );
}
