# Implementation Plan

Six discrete fixes. No architecture changes beyond the role tier extension.

## 1. Database: 3-tier admin roles + master-admin seed

Single migration:
- Drop existing `app_role` enum value list, recreate as `('master_admin','super_admin','admin','user')` (or `ALTER TYPE ADD VALUE` if enum already exists — check first).
- Ensure `public.user_roles` exists with `(user_id, role)` unique; add GRANTs + RLS already in `has_role` policy.
- Add helper `public.get_user_role(_user_id uuid) returns app_role` (returns highest role).
- Add helper `public.is_master_admin(_user_id uuid) returns boolean`.
- Trigger on `auth.users` INSERT: if `email = 'hitesh.tanwar8318@gmail.com'`, insert `master_admin` row in `user_roles`. Also backfill the row for existing user with that email.
- Audit log entries for any role change via `log_role_change()` trigger on `user_roles`.

## 2. Backend: role-aware endpoints

`server/src/routes/admin.ts`:
- `GET /api/admin/me/role` → returns `{ role: 'master_admin'|'super_admin'|'admin'|null }`.
- `POST /api/admin/promote` body `{ user_id, role }` — enforce:
  - master_admin can set any role
  - super_admin can set `admin` only, cannot touch master/super
  - admin: forbidden
- `DELETE /api/admin/admins/:user_id` — same hierarchy rules; cannot remove master.
- All actions write `audit_logs` entries (`role.grant`, `role.revoke`).

Extend `api-client.ts` with `getMyRole`, `promoteAdmin`, `revokeAdmin`.

## 3. Frontend: session & redirect behavior

- `src/hooks/use-admin.ts`: replace boolean with `{ role, isAdmin, isSuperAdmin, isMasterAdmin }` using new `/api/admin/me/role` (single source of truth).
- New `src/routes/login.tsx` & `signup.tsx`: if `useAuth().user` present → `<Navigate to="/dashboard" replace />`. Signup confirmed users land on `/dashboard` (already via `emailRedirectTo`).
- `src/components/site/Navbar.tsx`: logo `to="/"` becomes `to={user ? "/dashboard" : "/"}`; same for "Home" links.
- `src/routes/index.tsx` (`/`): if `useAuth().user`, redirect to `/dashboard` via `useEffect` + `navigate({to:'/dashboard', replace:true})`. Session already persists via Supabase default `localStorage`; verify `useAuth` calls `getSession()` on mount (it does).

## 4. Pricing fix

Diagnose: `Pricing.tsx` calls `api.publicPricing()` → `${VITE_API_BASE_URL}/api/public/pricing`. In preview/Lovable hosting the Express backend isn't reachable, so the call fails and `setPlans([])` leaves the grid empty.

Fix:
- Add 3 hardcoded fallback plans (Starter/Professional/Enterprise) inside `Pricing.tsx`.
- If API response is empty or fails → use fallback. Pricing section always renders.
- Same fallback used on `/pricing` route.

## 5. Role badges everywhere

New component `src/components/ui/RoleBadge.tsx`:
- Props: `role: 'master_admin'|'super_admin'|'admin'|null`, `size?: 'sm'|'md'`.
- Master = red gradient with verified checkmark icon, "MASTER ADMIN".
- Super = gold gradient + checkmark, "SUPER ADMIN".
- Admin = blue glass, "ADMIN".
- Null → renders nothing.

Wire into:
- Dashboard header (next to greeting)
- Profile page (next to name)
- Navbar avatar dropdown (under email)
- `admin.users.tsx` user list rows
- `admin.admins.tsx` rows
- `admin.tickets.tsx` ticket author / assignee
- `admin.reports.tsx` author column
- `admin.logs.tsx` actor column

For lists we need role lookups — extend the listing endpoints to include `role` field per user (join `user_roles` server-side, return highest role).

## 6. Admin pages: hierarchy enforcement + master indicator

`admin.admins.tsx`:
- Show role badge per admin row.
- Promote/Demote buttons visible per current viewer's role.
- Master admin row: actions disabled with tooltip "Cannot modify Master Admin".
- Add "Add admin" form: master_admin can pick `super_admin`/`admin`; super_admin can pick `admin` only.

## Verification checklist

- [ ] `bun run build` (frontend) and `cd server && npm run build` clean
- [ ] Hard refresh `/dashboard` while signed in → stays
- [ ] Logo click while signed in → `/dashboard`
- [ ] Pricing visible on `/` and `/pricing` even with no backend
- [ ] Sign in as `hitesh.tanwar8318@gmail.com` → MASTER ADMIN red badge visible
- [ ] audit_logs gets row when role changed

## Technical notes

- `app_role` enum: if already created (likely from earlier user_roles setup), use `ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'master_admin'; ADD VALUE 'super_admin';` in a separate migration block (enum new values can't be used in same tx as creation, so commit then use).
- The `has_role` RPC already exists per `cloud-db-workflow` notes; we add `is_master_admin` separately.
- The master-admin seed trigger fires on `auth.users` insert — also run a one-time `INSERT ... ON CONFLICT DO NOTHING` for the existing user.
- Backend role check helper added in `server/src/middleware/role.ts` to DRY hierarchy checks.

## Files touched (summary)

DB migration (1), `server/src/routes/admin.ts`, `server/src/middleware/role.ts` (new),
`src/lib/api-client.ts`, `src/hooks/use-admin.ts`, `src/components/ui/RoleBadge.tsx` (new),
`src/components/site/Navbar.tsx`, `src/routes/index.tsx`, `src/routes/login.tsx`,
`src/routes/signup.tsx`, `src/routes/dashboard.tsx`, `src/routes/profile.tsx`,
`src/components/site/Pricing.tsx`, `src/routes/pricing.tsx`,
`src/routes/admin.admins.tsx`, `src/routes/admin.users.tsx`,
`src/routes/admin.tickets.tsx`, `src/routes/admin.reports.tsx`,
`src/routes/admin.logs.tsx`.
