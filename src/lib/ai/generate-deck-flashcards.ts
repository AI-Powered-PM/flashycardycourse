import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";

import {
  AI_DECK_GENERATION_CARD_COUNT,
  generatedDeckFlashcardsSchema,
  type GeneratedDeckFlashcards,
} from "@/src/lib/ai/generated-deck-flashcards-schema";

export async function generateDeckFlashcardsWithAi(
  title: string,
  description: string | null,
): Promise<GeneratedDeckFlashcards["cards"]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("AI generation is not configured.");
  }

  const desc =
    description?.trim() && description.trim().length > 0
      ? `Description:\n${description.trim()}`
      : "No description was provided; infer appropriate scope from the title only.";

  const { output } = await generateText({
    // Chat Completions API (stable billing/quota); default `openai(id)` uses the Responses API.
    model: openai.chat("gpt-4o-mini"),
    output: Output.object({
      schema: generatedDeckFlashcardsSchema,
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

  return output.cards;
}
