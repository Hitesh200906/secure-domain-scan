#!/usr/bin/env bash
# Split this monorepo into two sibling repos: frontend (Vercel) + backend (Render).
#
# Usage:
#   bash scripts/split-repos.sh <frontend-dir> <backend-dir>
#
# Example:
#   bash scripts/split-repos.sh ../nexus-security ../Nexussecuritylovable
#
# Both target directories must NOT already exist. The script does not run
# `git init` for you — review the output, then `cd` into each and push.

set -euo pipefail

FRONTEND="${1:-../nexus-security}"
BACKEND="${2:-../Nexussecuritylovable}"

if [[ -e "$FRONTEND" ]]; then echo "Refusing to overwrite $FRONTEND" >&2; exit 1; fi
if [[ -e "$BACKEND"  ]]; then echo "Refusing to overwrite $BACKEND"  >&2; exit 1; fi

SRC_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "Source repo:  $SRC_ROOT"
echo "Frontend → $FRONTEND"
echo "Backend  → $BACKEND"

# -------- Backend --------
mkdir -p "$BACKEND"
# Copy server/ contents (not the folder itself) into backend root.
cp -R "$SRC_ROOT/server/." "$BACKEND/"
# Backend never ships a .env with real secrets.
rm -f "$BACKEND/.env"
echo "[backend] copied"

# -------- Frontend --------
mkdir -p "$FRONTEND"
# Copy project root, excluding backend + VCS + build artifacts.
cp -R "$SRC_ROOT/." "$FRONTEND/"
# Remove backend + VCS + build artifacts.
rm -rf "$FRONTEND/server"
rm -rf "$FRONTEND/.git"
rm -rf "$FRONTEND/node_modules"
rm -rf "$FRONTEND/dist"
rm -rf "$FRONTEND/.vercel"
rm -rf "$FRONTEND/.lovable"
rm -f  "$FRONTEND/REPO_SPLIT.md"
rm -f  "$FRONTEND/scripts/split-repos.sh"
rm -f  "$FRONTEND/.env"
echo "[frontend] copied"

# Drop a frontend-specific README pointer.
cat > "$FRONTEND/README.md" <<'EOF'
# Nexefy Security — Frontend (React + Vite + TanStack Start)

Deployed to **Vercel**. Talks to the Express backend hosted on Render via
`VITE_API_BASE_URL`.

## Develop

```bash
npm install
cp .env.example .env   # fill in values
npm run dev
```

## Required environment variables

| Key                              | Example                                                 |
| -------------------------------- | ------------------------------------------------------- |
| `VITE_API_BASE_URL`              | `https://your-render-app.onrender.com/api`              |
| `VITE_SUPABASE_URL`              | `https://your-project.supabase.co`                      |
| `VITE_SUPABASE_PUBLISHABLE_KEY`  | Supabase anon/publishable key                           |

## Deploy to Vercel

1. Push to GitHub.
2. Vercel → New Project → import the repo (framework: Other / Vite).
3. Add the env vars above for **Production** and **Preview**.
4. Build command: `npm run build`. Output: `dist`.
5. After changing `VITE_*` vars, redeploy **without build cache**.

## Where data calls live

All HTTP calls to the backend go through `src/lib/api-client.ts`:

```ts
import { api } from "@/lib/api-client";
const { scans } = await api.listScans();
```

Auth UI (`supabase.auth.*`) stays in the browser using the publishable key.
EOF
echo "[frontend] README written"

# Update frontend .env.example with the backend URL placeholder.
cat > "$FRONTEND/.env.example" <<'EOF'
VITE_API_BASE_URL=https://YOUR-RENDER-BACKEND.onrender.com/api
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key
EOF

echo
echo "Done."
echo "Next:"
echo "  cd $BACKEND  && git init && git add -A && git commit -m 'Initial backend' && git remote add origin <url> && git push -u origin main"
echo "  cd $FRONTEND && git init && git add -A && git commit -m 'Initial frontend' && git remote add origin <url> && git push -u origin main"
