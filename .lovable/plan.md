# Nexus Security — Full Upgrade Plan

## 1. Enable Lovable Cloud (Auth + DB)
Required for login/signup, profile, and persisting scan requests.

- Enable Cloud
- Email/password + Google sign-in (Cloud defaults)
- Tables:
  - `profiles` (id → auth.users, full_name, role_title, company, avatar_url, plan, credits)
  - `scan_requests` (id, user_id, full_name, role_title, company, email, target_url, business_email, verification_method [`email`|`manual`], status, created_at)
- RLS: users read/write only their own rows
- Trigger: auto-create profile + default plan on signup

## 2. New Routes
```
/login              public — email+password + Google
/signup             public — same + name capture
/reset-password     public — set new password after email link
/_authenticated     pathless guard (redirect to /login)
  /profile          edit name, role, company, avatar, view plan/credits
  /dashboard        replaces current reports showcase (KPIs, scan history, vulns, sparkline)
  /scan/new         the form in the screenshot (triggered from "Start Security Scan" + plan CTAs)
```

Delete `/reports` route; remove "Reports" from navbar. Add "Dashboard" + auth-aware "Profile/Logout" menu.

## 3. Scan Request Flow (matches screenshot)
Clicking any plan's CTA or "Start Security Scan" → `/scan/new?plan=starter|professional|enterprise`.

Form fields (exact to screenshot):
- Full Name, Role/Title
- Company Name, Your Email
- Target Website URL, Business Email
- Ownership Verification: radio cards — **Email Verification** | **Manual Code**
- Header chip: `PLAN: <NAME> — <N> CREDITS`
- Submit button: "Execute Scan →" (teal gradient, full width)

On submit → insert into `scan_requests`, toast success, redirect to `/dashboard`.

## 4. Hero Background Animation
Replace/augment current Globe with a richer always-moving layer:
- Keep canvas globe but add:
  - Animated cyan/teal aurora gradient blobs (CSS `@keyframes` drift + scale)
  - Slow horizontal scanline sweep across hero
  - Subtle floating particles (canvas) behind text
  - Grid-bg gets a slow pan animation
- All GPU-friendly transforms, respects `prefers-reduced-motion`

## 5. Navbar / Auth State
- Replace static "Login" link with real auth state:
  - Logged out: `Login` + `Start Free Scan`
  - Logged in: avatar dropdown → Profile, Dashboard, Logout
- Use `onAuthStateChange` at root + router context for guards

## 6. Wire All Buttons
Audit every CTA across Hero, Pricing, Features, CTASection, Footer:
- "Start Security Scan" / "Start Free Scan" → `/scan/new`
- "View Plans" / "Compare Plans" → `/pricing`
- Plan CTAs (Starter/Pro/Enterprise) → `/scan/new?plan=...`
- "Login" → `/login`, logo → `/`, footer links → real routes
- Dashboard sidebar links → real sub-sections

## 7. Dashboard (replaces Reports)
Real route at `/_authenticated/dashboard`:
- KPI cards (Scans run, Vulns found, Risk score, Credits left) — from `scan_requests`
- Scan history table (live from DB)
- Sparkline + ScoreRing components (reuse existing)
- Empty state → CTA to `/scan/new`

## 8. Profile Page
`/_authenticated/profile`:
- Avatar upload (Cloud Storage)
- Editable: name, role, company
- Read-only: email, plan, credits
- Danger zone: sign out

## Technical Notes
- `requireSupabaseAuth` middleware on any serverFn (none strictly needed — direct supabase client from authenticated context is enough here)
- All new colors via existing OKLCH tokens in `styles.css`; add `--aurora-1/2` if needed
- Framer Motion for form transitions and dashboard reveals
- SEO `head()` per new route

## Out of Scope
- Actually executing scans (mocked: insert request, mark `pending`)
- Payments (plan selection is informational; no Stripe yet)
- Email sending for verification (UI only, marked "pending verification")

Let me know if you'd like payments/Stripe wired in this pass, or to keep it mocked.
