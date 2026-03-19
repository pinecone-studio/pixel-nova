# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

**EPAS** (Employee Document Automation System) — a monorepo with three services:
- `front/` — Next.js 16 + React 19 frontend (Cloudflare Pages)
- `backend/` — Cloudflare Workers API (Hono + GraphQL Yoga + Drizzle ORM + D1 SQLite)
- `pdf-renderer/` — Express + Playwright microservice for HTML→PDF conversion (Railway)

## Commands

### Frontend (`front/`)
```bash
npm run dev          # Dev server on port 3000
npm run build        # Static export
npm run build:pages  # Build for Cloudflare Pages deployment
npm run lint         # ESLint
```

### Backend (`backend/`)
```bash
npm run dev          # Wrangler local dev (Cloudflare Workers emulation)
npm run check        # TypeScript type check
npm test             # Jest tests (runs with --runInBand)
npm run db:generate  # Generate Drizzle migrations
npm run db:export    # Export DB schema
npm run deploy       # Deploy to Cloudflare Workers
```

### Run a single backend test file
```bash
cd backend && npx jest path/to/test.test.ts
```

### PDF Renderer (`pdf-renderer/`)
```bash
npm run dev   # Start Express server on port 4001
```

## Architecture

### Data Flow
Employee lifecycle event → Cloudflare Queue → `backend/src/events/processEmployeeLifecycleEvent.ts` → action resolution (`src/services/actionResolver.ts`) → document generation (`src/document/generator.ts`) → HTML rendered to PDF via pdf-renderer → stored in R2 → email notifications sent via Resend → audit log recorded.

### Backend Structure
- **Entry point:** `backend/src/index.ts` — sets up Hono app with GraphQL Yoga at `/graphql`, health check at `/health`, document serving at `/documents/:documentId`, and Queue consumer.
- **GraphQL:** Schema-first. Type defs in `graphql/typeDefs.ts`, resolvers split into `queryResolvers.ts` and `mutationResolvers.ts`.
- **Database:** Drizzle ORM over Cloudflare D1 (SQLite). Schema at `src/db/schema.ts`. All queries in `src/db/queries/`.
- **Auth:** Session-based OTP authentication. Requests carry `x-actor-id` / `x-actor-role` headers for role-aware resolvers.

### Frontend Structure
- **App Router** with role-based routing: `/hr/*` for HR users, `/employee/*` for employees, `/auth/hr` and `/auth/employee` for login.
- **GraphQL client:** Apollo Client (`src/lib/apollo-client.ts`). API URL set via `NEXT_PUBLIC_API_URL`.
- **Static export:** `output: "export"` in `next.config.ts` — no server-side rendering. All pages are statically exported.
- **UI:** Tailwind CSS 4 + shadcn/ui (Radix Nova style). Custom components in `src/components/`, shadcn primitives in `src/components/ui/`.

### PDF Renderer
- Single endpoint: `POST /render-pdf` with `{ html: string, documentName: string }`.
- Optional `x-renderer-secret` header for auth.
- Deployed on Railway; URL configured via `PDF_RENDERER_URL` env var in backend.

### Environment Variables

**Backend** (`.dev.vars` locally, Cloudflare secrets in production):
```
RESEND_API_KEY          # Email sending
DOCUMENT_LINK_SECRET    # Signs 7-day document URLs
PDF_RENDERER_URL        # PDF renderer endpoint
PDF_RENDERER_SECRET     # Optional renderer auth
TEST_OTP_EMAIL          # Test inbox for OTP
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=https://backend.pixel-nova.workers.dev
```

### Cloudflare Resources
- **D1 Database:** `epas-db`
- **R2 Bucket:** `epas-documents`
- **Queue:** Cloudflare Queue for lifecycle events
- Bindings defined in `backend/wrangler.jsonc`

## Testing

Only the backend has unit tests (Jest + ts-jest). Test files are under `backend/test/` and mirror the `src/` structure. Frontend has no unit tests — validation is through TypeScript type checking and ESLint.

## CI/CD

GitHub Actions in `.github/workflows/`:
- **`ci.yml`** — path-filtered CI: backend (type check + tests), frontend (lint + build), pdf-renderer (syntax check).
- **`cd-backend.yml`** — deploys backend to Cloudflare Workers on `backend/**` changes.
- **`cd-front-pages.yml`** — deploys frontend to Cloudflare Pages on `front/**` changes.
