# Archlet

AI-assisted system architecture diagram tool. Cloudflare-native stack.

## Stack
- **Frontend**: React 18 + Vite + TypeScript + Tailwind + shadcn/ui (Cloudflare Pages)
- **Backend**: Hono + Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: Better Auth (email+password)

## Dev Setup

```bash
pnpm install
pnpm dev        # starts web (5173) + api (8787)
```

## Apps
- `apps/web` — Vite React SPA
- `apps/api` — Hono Worker
- `packages/shared` — shared Zod schemas + types
