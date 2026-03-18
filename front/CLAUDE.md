# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server (Next.js, port 3000)
npm run build        # Static export to out/
npm run build:pages  # Same — used by Cloudflare Pages CI
npm run lint         # ESLint
```

No unit test runner — validation is TypeScript type checking and ESLint only.

## Architecture

### Static Export

`next.config.ts` sets `output: "export"`. There is **no server-side rendering** — all pages are pre-rendered as static HTML. This means:
- No `getServerSideProps`, no API routes, no server actions
- `useSearchParams` and similar hooks that depend on the server are unavailable
- All data fetching happens client-side via Apollo Client

### Layout Structure

There are **two separate layout trees**:

1. **Global layout** (`src/app/layout.tsx`) — wraps `/`, `/auth/*`, `/employee/*`, `/profile/*`
   - Renders `<Navbar>` + `<FooterSection>` around content
   - Provides `<ApolloAppProvider>` (Apollo context)
   - `<Navbar>` hides itself when the path starts with `/hr`

2. **HR layout** (`src/app/hr/layout.tsx` → `src/components/hr/shell.tsx`) — wraps `/hr/*`
   - Renders its own sidebar navigation (`src/components/hr/navigation.tsx`)
   - Does not use the global Navbar or Footer
   - HR-specific shell handles its own auth guard

### Authentication

Auth tokens are stored in `localStorage` under the key `epas_auth_token`. Client components read this via `useSyncExternalStore` (see `src/components/pages/employee/useEmployeeSession.ts`). Tokens are passed to GraphQL as `Authorization: Bearer {token}` headers.

For unauthenticated/role-tagged requests, the backend accepts `x-actor-id` and `x-actor-role` headers instead. Helper: `buildGraphQLHeaders()` in `src/lib/apollo-client.ts`.

### GraphQL

Apollo Client is configured in `src/lib/apollo-client.ts` with `fetchOptions: { cache: "no-store" }`. The single client instance (`appApolloClient`) is exposed via `<ApolloAppProvider>` in the root layout. All queries and mutations are written inline in component files using `gql` tagged templates.

### Mongolian Labels

All user-facing strings use Mongolian (`lang="mn"`). Enum values from the API (departments, levels, branches, statuses) are translated via formatter functions in `src/lib/labels.ts`. Always use these formatters when displaying enum values — do not hardcode Mongolian text inline.

### Icons

`src/components/icons.tsx` is the single source for all icons — it re-exports from `react-icons` (`bi`, `fi`, `ai`) and defines custom SVG components (`EpasLogo`, `FactIcon`, `AuditLog`, `DownIcon`). Import icons from `@/components/icons`, not directly from `react-icons`.

### Styling

- **Tailwind CSS v4** — configured via PostCSS (`postcss.config.mjs`). There is no `tailwind.config.ts` file.
- All CSS variables and theme tokens are defined in `src/app/globals.css` using OKLCH color model.
- Use `cn()` from `src/lib/utils.ts` for conditional class merging (wraps `clsx` + `tailwind-merge`).
- Shadcn components live in `src/components/ui/`. Add new shadcn components with `npx shadcn add <component>`.

## Key Conventions

- **Path alias:** `@/*` maps to `src/*`
- **Types:** Shared frontend types are in `src/lib/types.ts` — always define new API-mirroring types here, not inline
- **Component organization:** Page-specific logic lives in `src/components/pages/<role>/`. Shared UI goes in `src/components/`. HR-specific components go in `src/components/hr/`.

## Environment

`.env.local`:
```
NEXT_PUBLIC_API_URL=https://backend.pixel-nova.workers.dev
```

This is the only env variable. Falls back to the same URL if not set.
