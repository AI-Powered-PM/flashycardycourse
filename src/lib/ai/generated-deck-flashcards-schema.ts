import { z } from "zod";

/** Fixed batch size for deck AI generation (cost and schema bound). */
export const AI_DECK_GENERATION_CARD_COUNT = 20;

export const generatedDeckFlashcardsSchema = z.object({
  cards: z
    .array(
      z.object({
        front: z.string().min(1).max(5000),
        back: z.string().min(1).max(5000),
      }),
    )
    .length(AI_DECK_GENERATION_CARD_COUNT),
});

export type GeneratedDeckFlashcards = z.infer<typeof generatedDeckFlashcardsSchema>;
