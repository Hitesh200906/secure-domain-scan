# Nexus Security — Backend (Express + TypeScript)

Production-ready Node.js backend deployable to **Render**. The frontend (Vercel) calls this API
via `VITE_API_BASE_URL` (see `src/lib/api-client.ts`).

## Endpoints

| Method | Path                          | Auth | Purpose                  |
| ------ | ----------------------------- | ---- | ------------------------ |
| GET    | `/health`                     | —    | Render health probe      |
| POST   | `/api/auth/signup`            | —    | Email/password signup    |
| POST   | `/api/auth/login`             | —    | Email/password login     |
| POST   | `/api/auth/logout`            | Bearer | Revoke current session |
| POST   | `/api/auth/forgot-password`   | —    | Send reset email         |
| GET    | `/api/auth/google`            | —    | Start Google OAuth flow  |
| GET    | `/api/user/profile`           | Bearer | Current user profile   |
| GET    | `/api/scans`                  | Bearer | List user's scans      |
| POST   | `/api/scans`                  | Bearer | Create scan request    |
| GET    | `/api/reports`                | Bearer | List user's reports    |
| GET    | `/api/notifications`          | Bearer | List user's notifications |
| GET    | `/api/support/tickets`        | Bearer | List user's tickets    |
| POST   | `/api/support/tickets`        | Bearer | Create support ticket  |

`Bearer` = `Authorization: Bearer <supabase-access-token>`. The backend validates the token
against Supabase Auth and proxies all DB queries through a per-request Supabase client so
your existing RLS policies apply.

## Local development

```bash
cd server
cp .env.example .env       # fill in values
npm install
npm run dev                # http://localhost:8080
```

## Deploy to Render

### Option A — Blueprint (recommended)
1. Push the repo to GitHub.
2. Render → **New +** → **Blueprint** → pick this repo. Render auto-detects `server/render.yaml`.
3. When prompted, paste values for the `sync: false` env vars below.
4. Deploy. The public URL is `https://<service-name>.onrender.com`.

### Option B — Manual web service
1. Render → **New +** → **Web Service** → connect repo.
2. **Root Directory:** `server`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm start`
5. **Health Check Path:** `/health`
6. Add env vars (see next section), then **Create Web Service**.

### Required environment variables (Render → Environment)

| Key                          | Value                                                         |
| ---------------------------- | ------------------------------------------------------------- |
| `SUPABASE_URL`               | `https://wwjruaobjavgkqaspdic.supabase.co`                    |
| `SUPABASE_SERVICE_ROLE_KEY`  | Supabase → Settings → API → `service_role` key                |
| `JWT_SECRET`                 | Long random string (Render can generate one)                  |
| `GOOGLE_CLIENT_ID`           | Google Cloud OAuth 2.0 Web client ID                          |
| `GOOGLE_CLIENT_SECRET`       | Google Cloud OAuth 2.0 Web client secret                      |
| `FRONTEND_URL`               | Your Vercel URL, e.g. `https://your-app.vercel.app`           |
| `NODE_ENV`                   | `production`                                                  |
| `PORT`                       | `8080` (Render injects its own — Express reads `process.env.PORT`) |

## Wire up the frontend (Vercel)

After Render gives you a URL, set in **Vercel → Project → Settings → Environment Variables**
(Production **and** Preview):

```
VITE_API_BASE_URL=https://YOUR-RENDER-URL.onrender.com/api
```

Redeploy Vercel **without build cache** so Vite re-inlines the value.

Then in components, import the typed client instead of calling Supabase directly:

```ts
import { api } from "@/lib/api-client";

const { scans } = await api.listScans();
await api.createScan({ target_url: "https://example.com" });
```

## Google OAuth setup

In Google Cloud → APIs & Services → Credentials → OAuth 2.0 Client (Web):
- **Authorized JavaScript origins:** `https://your-app.vercel.app`
- **Authorized redirect URIs:** `https://your-app.vercel.app/auth/callback`

The `/api/auth/google` endpoint kicks off the flow; the frontend's `/auth/callback` route
exchanges the returned `code` for a Supabase session (or you can keep using
`supabase.auth.signInWithOAuth` directly from the browser if you prefer Supabase's broker).

## Notes

- **CORS** allows `FRONTEND_URL`, localhost dev ports, and any `*.vercel.app` preview URL.
- **Rate limiting** is enabled on `/api/auth/*` (50 requests / 15 min / IP).
- The service uses the Supabase **service role key** only to validate tokens; user queries
  run through a request-scoped client bound to the user's bearer token so RLS is enforced.
- Free Render web services sleep after ~15 min of inactivity — first request after sleep
  takes 30–60 s. Upgrade plan if you need always-on.
