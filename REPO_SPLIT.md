# Final Architecture — Two-Repo Split

```
┌────────────────────────┐   HTTPS    ┌─────────────────────────┐
│  nexus-security         │ ─────────► │  Nexussecuritylovable   │
│  (Vercel)               │  Bearer    │  (Render)               │
│  React + Vite           │  token     │  Express + TypeScript   │
└──────────┬─────────────┘            └────────────┬────────────┘
           │ supabase.auth.* only                    │ service-role
           ▼ (publishable key)                       ▼
        Supabase Auth                          Supabase DB (RLS)
```

## 1. Frontend repository structure (`nexus-security`)

```
.env.example                # VITE_API_BASE_URL, VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
package.json
tsconfig.json
vite.config.ts
vercel.json
eslint.config.js
components.json
bunfig.toml
public/
src/
├── assets/
├── components/             # all UI (site, admin, ui primitives)
├── hooks/
│   ├── use-admin.ts        # calls /api/admin/*
│   ├── use-auth.tsx        # supabase.auth.* — STAYS
│   └── use-mobile.tsx
├── integrations/
│   └── supabase/
│       ├── client.ts       # publishable key, browser auth only
│       └── types.ts
├── lib/
│   ├── api-client.ts       # SINGLE entry point to the backend
│   ├── auth-helpers.ts     # supabase.auth.signInWithOAuth, reset, etc.
│   └── utils.ts
├── routes/                 # TanStack file-based routes
├── router.tsx
├── routeTree.gen.ts
├── server.ts               # SSR entry (still used by TanStack Start)
├── start.ts
└── styles.css
```

Removed from the frontend repo: `server/`, anything importing
`SUPABASE_SERVICE_ROLE_KEY`.

## 2. Backend repository structure (`Nexussecuritylovable`)

```
.env.example
.gitignore
README.md
package.json
tsconfig.json
render.yaml                 # blueprint deploy
src/
├── index.ts                # Express app, CORS, helmet, rate-limit, mounts /api/*
├── lib/
│   ├── env.ts              # validated env vars
│   └── supabase.ts         # supabaseAdmin + supabaseAsUser(token)
├── middleware/
│   └── auth.ts             # requireAuth — validates Supabase JWT
└── routes/
    ├── auth.ts             # signup, login, logout, forgot-password, google
    ├── user.ts             # /profile
    ├── scans.ts            # user scan create/list
    ├── reports.ts          # user reports list
    ├── notifications.ts    # user notifications list
    ├── support.ts          # tickets create/list + messages
    ├── public.ts           # public pricing plans
    └── admin.ts            # admin-only: users, scans, reports, tickets,
                            #       pricing, admins, audit logs
```

`admin.ts` gates every route with `requireAuth` + `requireAdmin`
(`has_role(user_id, 'admin')` RPC against `public.user_roles`).

## 3. API route list

### Public / auth (no Bearer)
| Method | Path                          | Purpose                  |
| ------ | ----------------------------- | ------------------------ |
| GET    | `/health`                     | Render health probe      |
| POST   | `/api/auth/signup`            | Email/password signup    |
| POST   | `/api/auth/login`             | Email/password login     |
| POST   | `/api/auth/forgot-password`   | Send reset email         |
| GET    | `/api/auth/google`            | Start Google OAuth flow  |
| GET    | `/api/public/pricing`         | Public pricing plans     |

### Authenticated (Bearer = Supabase access token)
| Method | Path                              | Purpose                       |
| ------ | --------------------------------- | ----------------------------- |
| POST   | `/api/auth/logout`                | Revoke session                |
| GET    | `/api/user/profile`               | Current user profile          |
| GET    | `/api/scans`                      | List my scans                 |
| POST   | `/api/scans`                      | Create scan request           |
| GET    | `/api/reports`                    | List my reports               |
| GET    | `/api/notifications`              | List my notifications         |
| GET    | `/api/support/tickets`            | List my tickets               |
| POST   | `/api/support/tickets`            | Create ticket                 |
| POST   | `/api/audit`                      | Append audit entry (self)     |

### Admin (Bearer + `user_roles.role = 'admin'`)
| Method | Path                                      | Purpose                  |
| ------ | ----------------------------------------- | ------------------------ |
| GET    | `/api/admin/users`                        | List all profiles        |
| PATCH  | `/api/admin/users/:id`                    | Update profile fields    |
| GET    | `/api/admin/scans`                        | List all scan requests   |
| PATCH  | `/api/admin/scans/:id`                    | Update status / notes    |
| DELETE | `/api/admin/scans/:id`                    | Delete scan              |
| GET    | `/api/admin/reports`                      | List all reports         |
| POST   | `/api/admin/reports`                      | Create report            |
| DELETE | `/api/admin/reports/:id`                  | Delete report            |
| GET    | `/api/admin/tickets`                      | List all tickets         |
| PATCH  | `/api/admin/tickets/:id`                  | Update ticket            |
| GET    | `/api/admin/tickets/:id/messages`         | Thread for ticket        |
| POST   | `/api/admin/tickets/:id/reply`            | Reply + notify user      |
| GET    | `/api/admin/pricing`                      | List pricing plans       |
| PATCH  | `/api/admin/pricing/:id`                  | Update pricing plan      |
| GET    | `/api/admin/admins`                       | List admin grants        |
| GET    | `/api/admin/audit`                        | List audit logs (500)    |

## 4. Build verification

Both repositories build independently:

- **Frontend (`nexus-security`)**: `npm install && npm run build` succeeds. Output: `dist/`.
- **Backend (`Nexussecuritylovable`)**: `npm install && npm run build` succeeds. Output: `dist/` (TypeScript `.js` files).

## 5. Deployment checklist

### Backend → Render
- [ ] `Nexussecuritylovable` pushed to GitHub
- [ ] Render → New + → Blueprint → pick repo (reads `render.yaml`)
- [ ] Env vars set: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_URL`
- [ ] Deploy succeeds, `GET /health` returns `{"status":"ok"}`
- [ ] Copy the Render URL (e.g. `https://nexussecuritylovable.onrender.com`)

### Frontend → Vercel
- [ ] `nexus-security` pushed to GitHub
- [ ] Vercel → New Project → import the repo (framework: Other / Vite)
- [ ] Env vars set (Production + Preview):
  - `VITE_API_BASE_URL=https://YOUR-RENDER-URL.onrender.com/api`
  - `VITE_SUPABASE_URL=https://wwjruaobjavgkqaspdic.supabase.co`
  - `VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>`
- [ ] Build command `npm run build`, output `dist`
- [ ] Deploy **without** build cache (Vite inlines `VITE_*` at build time)

### Supabase (one-time)
- [ ] Auth → URL Configuration → Site URL = Vercel URL
- [ ] Redirect URLs include: Vercel URL, `<vercel>/dashboard`, `<vercel>/reset-password`
- [ ] Auth → Providers → Google enabled with OAuth client id/secret
- [ ] Google Cloud OAuth client → redirect URI = `https://wwjruaobjavgkqaspdic.supabase.co/auth/v1/callback`
- [ ] Grant yourself admin: `INSERT INTO public.user_roles (user_id, role) VALUES ('<your-uid>', 'admin');`

### CORS sanity check
- [ ] From a browser on the deployed Vercel domain, `fetch(VITE_API_BASE_URL + '/health')` returns 200 with no CORS error

## 6. GitHub push instructions

Run the split script from this monorepo:

```bash
bash scripts/split-repos.sh ../nexus-security ../Nexussecuritylovable
```

Then for each:

```bash
# Backend
cd ../Nexussecuritylovable
git init -b main
git add -A
git commit -m "Initial commit: Express backend for Nexefy Security"
gh repo create Nexussecuritylovable --private --source=. --remote=origin --push
# or: git remote add origin git@github.com:<you>/Nexussecuritylovable.git && git push -u origin main

# Frontend
cd ../nexus-security
git init -b main
git add -A
git commit -m "Initial commit: React frontend for Nexefy Security"
gh repo create nexus-security --private --source=. --remote=origin --push
# or: git remote add origin git@github.com:<you>/nexus-security.git && git push -u origin main
```

After Render + Vercel are connected to their respective repos, every push
to `main` triggers an auto-deploy on both platforms.
