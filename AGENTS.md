# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js 16 (App Router) flashcard application ("FlashyCardy"). Single-process, single-product — the only local process is the Next.js dev server.

### Required environment variables

All four must be present in `.env.local` (gitignored) for the app to function:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional for CRUD, required for AI card generation) |

These are injected as VM environment variables. To create `.env.local`:

```sh
python3 -c "
import os
keys = ['DATABASE_URL','NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY','CLERK_SECRET_KEY','ANTHROPIC_API_KEY']
with open('.env.local','w') as f:
    f.writelines(f'{k}={os.environ.get(k,\"\")}\n' for k in keys)
"
```

### Common commands

See `package.json` scripts. Key ones:

- `npm run dev` — Start dev server on port 3000
- `npm run build` — Production build (also validates TypeScript)
- `npm run lint` — ESLint
- `npm run db:push` — Push Drizzle schema to Neon (idempotent, safe to re-run)
- `npm run db:studio` — Drizzle Studio (visual DB browser)

### Clerk development mode auth

To sign up in dev mode, use the `+clerk_test` email suffix (e.g. `testuser+clerk_test@example.com`) with any password meeting requirements. The verification code is always `424242`.

### Architecture notes

- All infrastructure (DB, auth, AI) is remote — no Docker or local DB needed.
- Database schema changes: edit `src/db/schema.ts`, then run `npm run db:push`.
- No middleware file exists; Clerk auth is checked in Server Components/Actions via `auth()`.
- Path alias `@/*` maps to project root.
