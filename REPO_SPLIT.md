# Splitting into Two Repositories

This project currently holds both the frontend and the Express backend. The
goal is two independent GitHub repos:

| Repo                       | Deploys to | Contains                                    |
| -------------------------- | ---------- | ------------------------------------------- |
| `nexus-security-frontend`  | Vercel     | React/Vite app, components, routes, hooks   |
| `nexus-security-backend`   | Render     | Express + TypeScript API, Supabase service  |

The two repos talk to each other over HTTPS only. The frontend has **no**
service-role key and **no** Supabase admin client — it calls the backend at
`VITE_API_BASE_URL`.

---

## 1. File ownership

### → `nexus-security-backend` (everything under `server/`)

```
server/.env.example
server/.gitignore
server/README.md
server/package.json
server/render.yaml
server/tsconfig.json
server/src/index.ts
server/src/lib/env.ts
server/src/lib/supabase.ts
server/src/middleware/auth.ts
server/src/routes/auth.ts
server/src/routes/notifications.ts
server/src/routes/reports.ts
server/src/routes/scans.ts
server/src/routes/support.ts
server/src/routes/user.ts
```

When copied into the new repo, drop the `server/` prefix — the contents of
`server/` become the repo root.

### → `nexus-security-frontend` (everything else, minus `server/`)

```
package.json
tsconfig.json
vite.config.ts
vercel.json
index.html (if present)
.env.example
.prettierrc / .prettierignore
eslint.config.js
components.json
bunfig.toml
src/**           (all of it)
public/**        (if present)
supabase/        (migrations stay with the frontend repo for now — they document
                  the schema both sides depend on; Render does not run them)
```

Explicitly **excluded** from the frontend repo:
- `server/`
- any `.env` containing `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. One-shot split script

Run from this project root. It produces two sibling folders ready to
`git init && git push`:

```bash
bash scripts/split-repos.sh ../nexus-security-frontend ../nexus-security-backend
```

(see `scripts/split-repos.sh` in this repo)

---

## 3. Environment variables

### Frontend (Vercel → Project Settings → Environment Variables)

| Key                                | Value                                                   |
| ---------------------------------- | ------------------------------------------------------- |
| `VITE_API_BASE_URL`                | `https://YOUR-RENDER-BACKEND.onrender.com/api`          |
| `VITE_SUPABASE_URL`                | `https://wwjruaobjavgkqaspdic.supabase.co` *(only for auth UI session storage)* |
| `VITE_SUPABASE_PUBLISHABLE_KEY`    | Supabase anon/publishable key                           |

> The frontend still uses `supabase.auth.*` for session persistence and
> Google OAuth redirect handling — that uses only the **publishable** key
> and is safe in the browser. All database reads/writes go through
> `api.*` to the backend.

### Backend (Render → Environment)

| Key                          | Value                                                   |
| ---------------------------- | ------------------------------------------------------- |
| `SUPABASE_URL`               | `https://wwjruaobjavgkqaspdic.supabase.co`              |
| `SUPABASE_SERVICE_ROLE_KEY`  | Service-role key (never ship to frontend)               |
| `JWT_SECRET`                 | Long random string                                      |
| `GOOGLE_CLIENT_ID`           | Google OAuth Web client ID                              |
| `GOOGLE_CLIENT_SECRET`       | Google OAuth Web client secret                          |
| `FRONTEND_URL`               | `https://your-app.vercel.app`                           |
| `NODE_ENV`                   | `production`                                            |

---

## 4. Deployment

### Backend → Render
1. Push `nexus-security-backend` to GitHub.
2. Render → **New +** → **Blueprint** → pick the repo (it reads `render.yaml`).
3. Fill in the `sync: false` env vars from the table above.
4. Deploy. URL = `https://<service>.onrender.com`. Health: `/health`.

### Frontend → Vercel
1. Push `nexus-security-frontend` to GitHub.
2. Vercel → **Add New… → Project** → import the repo.
3. Framework preset: **Other** (Vite). Build command: `npm run build`. Output:
   `dist` (Vite default).
4. Add the three env vars above for **Production** and **Preview**.
5. Deploy. Redeploy **without build cache** any time you change `VITE_*` vars —
   Vite inlines those at build time.

---

## 5. Migrating remaining direct-Supabase calls

`src/lib/api-client.ts` already exposes a typed `api.*` client. Components
that still call `supabase.from(...)` for data should be migrated to `api.*`.
Auth calls (`supabase.auth.signInWithPassword`, `signInWithOAuth`,
`onAuthStateChange`, `getSession`) stay as-is — they use the publishable
key and run in the browser by design.

A grep that surfaces what still needs porting:

```bash
rg -n "supabase\.from\(" src/
```

Each match is a candidate for an `api.*` method (add new ones to
`server/src/routes/*.ts` + `src/lib/api-client.ts` as needed).
