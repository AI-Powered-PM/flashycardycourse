# Anthropic AI flashcard generation — runbook

## Goal

Deck AI generation uses the [Vercel AI SDK](https://ai-sdk.dev/) with the **Anthropic** provider (`@ai-sdk/anthropic`) and `ANTHROPIC_API_KEY`. OpenAI is not used for this feature.

## Prerequisites

- Anthropic account and API key
- A test user with Clerk **Pro** or feature **`ai_flashcard_generation`** (server enforces this)

## Manual setup

Do these before or alongside deploying code so environments can call Anthropic.

1. **Create an Anthropic API key**  
   - Log in at [Anthropic Console](https://console.anthropic.com/).  
   - Create an API key with access to the model used in code (see **Model** below).

2. **Local: add the key to `.env.local`** (project root, next to `package.json`)  
   - This file is gitignored; never commit secrets.  
   - Add: `ANTHROPIC_API_KEY=sk-ant-api03-...` (your real key).  
   - You may remove `OPENAI_API_KEY` if it was only for flashcards, to avoid confusion.

3. **Restart the dev server**  
   - Next.js loads `.env.local` at startup. After env changes, restart `npm run dev`.

4. **Production / preview (e.g. Vercel)**  
   - Add environment variable `ANTHROPIC_API_KEY` for Production (and Preview if needed).  
   - Redeploy so Server Actions receive the secret.  
   - Remove or rotate `OPENAI_API_KEY` on the host if it was only for this feature.

5. **Clerk / billing**  
   - Use a user with Pro or `ai_flashcard_generation` to test the button.

6. **Smoke test**  
   - Open a deck → **Generate cards with AI** → confirm new cards appear.  
   - If the UI shows “AI generation is not configured,” the running server has no `ANTHROPIC_API_KEY`.

## Environment variables

| Variable              | Required | Notes                                      |
| --------------------- | -------- | ------------------------------------------ |
| `ANTHROPIC_API_KEY`   | Yes      | Default for `@ai-sdk/anthropic`            |
| `OPENAI_API_KEY`      | No       | Not used for deck AI after migration       |

## Dependency commands

```bash
npm uninstall @ai-sdk/openai
npm install @ai-sdk/anthropic
```

## Code map

| File | Role |
| ---- | ---- |
| `src/lib/ai/generate-deck-flashcards.ts` | `generateText` + `Output.object`, Anthropic model, `ANTHROPIC_API_KEY` guard |
| `src/lib/ai/generated-deck-flashcards-schema.ts` | Zod schema and card count (unchanged) |
| `src/lib/ai/user-facing-ai-error-message.ts` | Safe UI messages for API errors |
| `app/dashboard/decks/[deckId]/actions.ts` | Server action; calls generator (provider-agnostic) |
| `.cursor/rules/vercel-ai-flashcards.mdc` | Cursor guidance for this feature |

## Model

Committed default: **`claude-haiku-4-5-20251001`** (Claude Haiku 4.5 — cost/latency friendly). Older IDs such as `claude-3-5-haiku-20241022` may return 404 from Anthropic.

To change it, edit `AI_DECK_GENERATION_MODEL` in `src/lib/ai/generate-deck-flashcards.ts`. Prefer model strings that appear in `@ai-sdk/anthropic`’s types or the [AI SDK Anthropic provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) docs.

## Rollback

1. `npm uninstall @ai-sdk/anthropic && npm install @ai-sdk/openai`
2. Revert `generate-deck-flashcards.ts`, `user-facing-ai-error-message.ts`, and `.cursor/rules/vercel-ai-flashcards.mdc` to the OpenAI versions (from git history).
3. Restore `OPENAI_API_KEY` in `.env.local` and hosting.

## Troubleshooting

| Symptom | Likely cause |
| ------- | -------------- |
| “AI generation is not configured.” | Missing `ANTHROPIC_API_KEY` on the process |
| 401 / invalid API key | Wrong or revoked key; check env and redeploy |
| 429 | Rate limit; wait and retry |
| “did not return flashcards in the expected format” | `NoObjectGeneratedError`; retry or try another model |
| Generic provider error | See [Anthropic provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic); check Anthropic status and account limits |
| 400 `output_config.format.schema` | Anthropic structured output limits array schemas: **`minItems` must be 0 or 1**, and **`maxItems` is not supported** on arrays. This app uses `cards: z.array(...).min(1)` for the API, caps length in code, then validates exactly **20** cards with `generatedDeckFlashcardsSchema`. |

Do not surface raw API error bodies to the client.
