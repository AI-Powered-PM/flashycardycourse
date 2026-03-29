import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";

import {
  AI_DECK_GENERATION_CARD_COUNT,
  anthropicDeckFlashcardsOutputSchema,
  generatedDeckFlashcardsSchema,
  type GeneratedDeckFlashcards,
} from "@/src/lib/ai/generated-deck-flashcards-schema";

/** Anthropic model id — see docs/anthropic-ai-flashcards.md and @ai-sdk/anthropic model union */
const AI_DECK_GENERATION_MODEL = "claude-haiku-4-5-20251001";

export async function generateDeckFlashcardsWithAi(
  title: string,
  description: string | null,
): Promise<GeneratedDeckFlashcards["cards"]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("AI generation is not configured.");
  }

  const desc =
    description?.trim() && description.trim().length > 0
      ? `Description:\n${description.trim()}`
      : "No description was provided; infer appropriate scope from the title only.";

  const { output } = await generateText({
    model: anthropic(AI_DECK_GENERATION_MODEL),
    output: Output.object({
      schema: anthropicDeckFlashcardsOutputSchema,
      name: "flashcards",
      description: `Exactly ${AI_DECK_GENERATION_CARD_COUNT} flashcards with front (question) and back (answer).`,
    }),
    prompt: `Generate exactly ${AI_DECK_GENERATION_CARD_COUNT} educational flashcards for a spaced-repetition deck.

Deck title: ${title}

${desc}

Requirements:
- Each card: a clear question or prompt on the front, the answer on the back.
- Cover the topic comprehensively without repeating the same fact.
- Front and back must be plain text (no markdown fences).`,
  });

  if (output.cards.length > AI_DECK_GENERATION_CARD_COUNT) {
    throw new Error("AI_FLASHCARD_COUNT_OR_SHAPE_MISMATCH");
  }

  const validated = generatedDeckFlashcardsSchema.safeParse(output);
  if (!validated.success) {
    throw new Error("AI_FLASHCARD_COUNT_OR_SHAPE_MISMATCH");
  }

  return validated.data.cards;
}
