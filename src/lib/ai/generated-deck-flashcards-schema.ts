import { z } from "zod";

/** Fixed batch size for deck AI generation (cost and schema bound). */
export const AI_DECK_GENERATION_CARD_COUNT = 20;

const flashcardItemSchema = z.object({
  front: z.string().min(1).max(5000),
  back: z.string().min(1).max(5000),
});

/**
 * Schema passed to `Output.object` for Anthropic structured output. Their API rejects arrays with
 * `minItems` other than 0 or 1, and does not support `maxItems` on arrays. Use `min(1)` only here;
 * enforce max length and exact batch size with `generatedDeckFlashcardsSchema` after the call.
 */
export const anthropicDeckFlashcardsOutputSchema = z.object({
  cards: z.array(flashcardItemSchema).min(1),
});

export const generatedDeckFlashcardsSchema = z.object({
  cards: z.array(flashcardItemSchema).length(AI_DECK_GENERATION_CARD_COUNT),
});

export type GeneratedDeckFlashcards = z.infer<typeof generatedDeckFlashcardsSchema>;
