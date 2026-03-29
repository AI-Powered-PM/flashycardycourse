# Project Rules

## Stack

Next.js (App Router) · Clerk auth + Clerk Billing (B2C) · Drizzle ORM (Neon) · Zod · shadcn/ui · TypeScript

## Architecture

- **Reads** → Server Components call query helpers from `@/src/db/queries`
- **Writes** → Server Actions (`"use server"`) with Zod-validated typed input → query helpers
- **Auth** → `auth()` from `@clerk/nextjs/server` at the Server Component / Server Action boundary
- **Billing** → Clerk Billing (B2C). Plans: `free_user`, `pro`. Gate with `has({ plan/feature })` server-side; `<Show>` client-side
- **DB** → Drizzle only. No raw SQL in app code. `db` instance used only inside `src/db/**`
- **UI** → shadcn/ui for all components. Install missing ones: `npx shadcn@latest add <name>`

## Critical Invariants

1. Every query must be scoped by `userId` — no unscoped data access
2. Child resources (cards) → join through parent (deck) to verify ownership
3. Server Actions accept typed objects (not `FormData`), validated with Zod
4. Feature code imports from `@/src/db/queries`, never from `@/src/db` or `schema.ts` directly
5. Path alias: `@/*` maps to project root
6. Paid features must be gated server-side with `has()` — never UI-only checks

## Detailed Rules

See `.claude/rules/` for extended guidelines per domain.
