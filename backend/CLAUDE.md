# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Local Cloudflare Worker (wrangler dev)
npm run check        # TypeScript type check
npm test             # Run all Jest tests (--runInBand, ESM mode)
npm run test:check   # Type check test files
npm run db:generate  # Generate Drizzle migration from schema changes
npm run db:export    # Export current DB schema
npm run deploy       # Minified deploy to Cloudflare Workers
npm run cf-typegen   # Regenerate worker-configuration.d.ts from wrangler.jsonc
```

**Run a single test file:**
```bash
node --experimental-vm-modules ./node_modules/jest/bin/jest.js --config jest.config.cjs --runInBand test/services/actionResolver.test.ts
```

## Architecture

### Entry Point (`src/index.ts`)

The Hono app exposes:
- `POST /graphql` — main API (GraphQL Yoga)
- `GET /health` — health check
- `GET /documents/:documentId` — signed document download (verifies HMAC signature before serving from R2)
- Queue consumer — processes `EmployeeLifecycleEvent` messages from Cloudflare Queue

Every request gets an `Actor` context (`{ id, role }`) resolved from either a Bearer session token or `x-actor-id`/`x-actor-role` headers. Role is normalized to `ActorRole`: `admin | hr | employee | unknown`.

### GraphQL Layer (`src/graphql/`)

Schema-first. Type definitions live in `typeDefs.ts`. Resolvers are split:
- `queryResolvers.ts` — read-only queries
- `mutationResolvers.ts` — all mutations

Role-based access is enforced manually inside each resolver using the `Actor` from context. No middleware-based auth guards.

### Database Layer (`src/db/`)

- **Schema:** `src/db/schema.ts` — 13 Drizzle tables (SQLite/D1)
- **Client:** `src/db/client.ts` — initializes Drizzle with D1 binding from Cloudflare env
- **Queries:** `src/db/queries/` — one file per domain, all re-exported from `index.ts`

Query functions take a `db` parameter (Drizzle client) rather than using a singleton, making them testable without Cloudflare bindings.

### Lifecycle Event Flow

```
Queue message → processEmployeeLifecycleEvent.ts
  → tryStartProcessedEvent (deduplication via processedEvents table)
  → upsertEmployeeRecord
  → build changeset (old vs new field values)
  → actionResolver.ts → resolves which LifecycleAction applies
  → createTriggeredActionRecords → generates documents + sends notifications
  → finishProcessedEvent (mark complete/ignored/failed)
```

The 4 lifecycle actions (`add_employee`, `promote_employee`, `change_position`, `offboard_employee`) each have `triggerFields` in `src/services/actionResolver.ts`. Default configs are also seeded into the DB via `ensureDefaultActionConfigs`.

### Document Generation (`src/document/`)

1. `generator.ts` — maps template filename → HTML string (imported at build time as text), renders Handlebars-style `{{{token}}}` tokens
2. `templateData.ts` — builds token map from an `Employee` record
3. `pdfRenderer.ts` — POSTs rendered HTML to the external PDF renderer service
4. Generated PDF is stored in R2 (or as a data URL if R2 unavailable)

9 contract templates live in `src/document/contractTemplates/*.html`.

### Notifications (`src/notifications/`)

- `resolveRecipients.ts` — maps recipient roles to email addresses from the DB registry
- `buildEmailTemplate.ts` — builds HTML email body with document download links
- `documentLinks.ts` — generates HMAC-signed 7-day URLs for `/documents/:documentId`
- `sendEmailWithRetry.ts` — sends via Resend API with exponential backoff

### Authentication (`src/auth/`)

OTP flow: `requestOtp` creates hashed OTP in `otpCodes` table and emails it. `verifyOtp` checks hash and creates a session in `authSessions`. `loginWithCode` creates a session directly from employee code (for HR-initiated logins). Sessions expire and are validated on each request in `index.ts`.

### Contract Request Workflow

`contractRequests` table tracks HR-initiated contract signature requests. Employee signature data is stored in `employeeSignatures` with a passcode-protected hash. When submitting a `contractRequest`, the employee can `redraw` (new signature) or `reuse` (verified via passcode).

## Key Conventions

- **All DB query functions accept `db` as first argument** — never import a DB singleton in query files. This keeps them testable with a mocked/injected client.
- **HTML templates are imported as raw strings** — `html.d.ts` declares the `.html` module type so TypeScript accepts `import html from './foo.html'`.
- **Tests mock Cloudflare bindings** — `test/htmlTemplateMock.js` stubs `.html` imports. R2, D1, Queue are mocked per test via `jest.mock`.
- **ESM throughout** — `"type": "module"` in package.json. Jest uses `--experimental-vm-modules`. Import paths in source use `.js` extensions (resolved by bundler to `.ts`).

## Local Development

Requires a `.dev.vars` file in `backend/`:
```
RESEND_API_KEY=
DOCUMENT_LINK_SECRET=
PDF_RENDERER_URL=https://pdf-renderer-production-1240.up.railway.app/
TEST_OTP_EMAIL=          # optional, overrides recipient for OTP emails
PDF_RENDERER_SECRET=     # optional
```

Cloudflare D1 and R2 are emulated locally by Wrangler (state stored in `.wrangler/`).

## Cloudflare Resources (wrangler.jsonc)

| Resource | Binding | Name/ID |
|---|---|---|
| D1 Database | `DB` | `epas-db` |
| R2 Bucket | `R2` | `epas-documents` |
| Queue | (consumer) | lifecycle events queue |
