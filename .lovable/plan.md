# Forge — Business Operating System Build Plan

This is a very large scope (20+ full modules). To keep quality high and avoid half-finished pages, I'll ship it in **numbered phases**. Each phase is self-contained, production-ready, and preserves every existing route, API, and backend contract.

Please confirm the phase order (or tell me to reorder / skip) before I start.

---

## Foundation (Phase 0 — done in one pass, required first)

Shared visual + interaction layer that every page reuses.

- **Design tokens** in `src/styles.css`: layered darks (`#090909 / #111 / #171717 / #262626`), text (`#F5F5F5 / #9CA3AF`), 6 accent tokens (blue / purple / emerald / orange / pink / cyan), motion tokens, elevation.
- **Rebrand shell to "Forge"** inside the Business workspace only (public marketing site stays "Nexefy" — separate product surface).
- **New sidebar** (`BusinessShell` rewrite): grouped nav (Overview / Commerce / Growth / Ops / Settings), collapsible, active-branch aware, keyboard nav, mini mode.
- **Command palette** (`⌘K`) — global search, route jump, quick actions.
- **Primitives**: `PageHeader`, `EmptyState`, `SkeletonTable`, `DataTable` (sort/filter/paginate/bulk), `Drawer`, `ConfirmDialog`, `Toast` wiring, `StatCard`, `Chart` wrappers, `Breadcrumbs`.
- **Notification center** dropdown scaffold (feeds real `notifications` table).

## Phase 1 — Dashboard
Bento overview: revenue / MRR / ARR / orders today / visitors / conversion / pending payouts, growth + traffic charts, recent orders, recent members, unread messages, top products, AI insights, goal tracker, store health score, quick actions, upcoming launches. Real data where tables exist; realistic empty states elsewhere.

## Phase 2 — My Store
Full editor: identity, branding, theme, SEO, custom domain, visibility, verification, featured products/community, pinned announcements, live preview pane, draft mode. Keeps existing `stores` schema.

## Phase 3 — Products
Type picker (course / community / software / template / download / membership / bundle / service / subscription / one-time / free / preorder / private), rich editor, media, pricing + coupons + variants, inventory, publish/draft, reviews, refunds, duplicate/archive, bulk ops. Extends existing `products` table only additively.

## Phase 4 — Community
Channels, posts, comments, reactions, threads, announcements, events, leaderboards, roles, moderation, scheduled posts, media gallery, search, analytics. New tables added under existing store scoping.

## Phase 5 — Members (CRM)
Directory + rich profile: orders, subscriptions, tags, notes, LTV, activity timeline, warnings, ban/suspend, invite, roles, bulk actions, export.

## Phase 6 — Orders
Table with status/customer/payment/coupon/tax/refund, detail view with timeline + invoice/receipt, notes, export, filters, bulk.

## Phase 7 — Analytics
Revenue / traffic / product / retention / funnel / conversion / geo / device / referrer / affiliate / community / growth dashboards, custom date ranges, exports, live tiles.

## Phase 8 — Messages
Inbox: customer chat, internal notes, AI reply suggestions, templates, attachments, labels, pin/archive, typing + read receipts.

## Phase 9 — Affiliates
Dashboard, applications + approval flow, referral link generator, commission rules, tracking, payouts, leaderboard, assets, coupons, fraud flags.

## Phase 10 — Payouts
Balance / pending / completed, withdrawal request flow, payment methods (bank / crypto), invoices, tax docs, history, verification state.

## Phase 11 — Settings
Tabs: General, Branding, Billing, Security, Domains, Email, Notifications, Integrations, Developers (API keys, webhooks), Roles & Permissions, Team, Localization, Taxes, Privacy/Compliance, Audit logs, Backup, Danger zone.

## Phase 12 — Support
Tickets, knowledge base, docs, live chat, system status, FAQ, feature requests, bug reports, roadmap, community, AI assistant.

## Phase 13 — Advanced modules
AI Assistant, Automation Center (triggers/actions/workflows), Campaign Manager, Team Management, App Marketplace, full Notification Center inbox page.

---

## Technical notes

- **No backend contract changes** in Phase 0–2. Later phases add new tables *additively* with proper RLS + GRANTs; existing tables/policies untouched.
- All routes stay: existing `/business/*` files are refactored in place, none removed.
- Server work uses `createServerFn` + `requireSupabaseAuth` per project conventions.
- Public marketing site (`/`, `/discover`, `/$slug`) is untouched.

---

## What I need from you

1. **Go / adjust order?** Default: I'll build Phase 0 now, then Phase 1 (Dashboard), and pause for your review before continuing.
2. **Scope per turn**: Phase 0 + 1 in this turn, then one phase per follow-up message — OK?
3. Any module you want prioritized or dropped?

Reply "go" to start with Phase 0 + Dashboard.