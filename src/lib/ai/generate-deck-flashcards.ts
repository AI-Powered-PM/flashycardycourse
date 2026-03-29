import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";

import { filterDuplicateFlashcards } from "@/src/lib/ai/flashcard-dedupe";
import {
  AI_DECK_GENERATION_CARD_COUNT,
  anthropicDeckFlashcardsOutputSchema,
  generatedDeckFlashcardsSchema,
} from "@/src/lib/ai/generated-deck-flashcards-schema";

/** Anthropic model id — see docs/anthropic-ai-flashcards.md and @ai-sdk/anthropic model union */
const AI_DECK_GENERATION_MODEL = "claude-haiku-4-5-20251001";

/** Cap how many existing cards we inject into the prompt (token limits). */
const EXISTING_CARDS_PROMPT_MAX = 150;

function formatExistingCardsForPrompt(
  cards: Array<{ front: string; back: string }>,
  totalInDeck: number,
): string {
  if (cards.length === 0) {
    return "There are no cards in this deck yet.";
  }

  const lines = cards.map(
    (c, i) =>
      `${i + 1}. Front: ${c.front.replace(/\r?\n/g, " ").trim()} | Back: ${c.back.replace(/\r?\n/g, " ").trim()}`,
  );
  const omitted = totalInDeck - cards.length;
  const tail =
    omitted > 0
      ? `\n(${omitted} older card(s) in the deck are not listed above; still avoid duplicating content that clearly overlaps with any card in the deck, including unlisted ones.)`
      : "";

  return `Existing cards in this deck (${totalInDeck} total) — do NOT repeat any of the same front/back pairs, paraphrases of the same fact, or the same vocabulary item as any of these:\n${lines.join("\n")}${tail}`;
}

export async function generateDeckFlashcardsWithAi(
  title: string,
  description: string | null,
  existingCards: Array<{ front: string; back: string }> = [],
): Promise<Array<{ front: string; back: string }>> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("AI generation is not configured.");
  }

  const desc =
    description?.trim() && description.trim().length > 0
      ? `Description:\n${description.trim()}`
      : "No description was provided; infer appropriate scope from the title only.";

  const existingForPrompt = existingCards.slice(0, EXISTING_CARDS_PROMPT_MAX);
  const existingBlock = formatExistingCardsForPrompt(existingForPrompt, existingCards.length);

  const { output } = await generateText({
    model: anthropic(AI_DECK_GENERATION_MODEL),
    output: Output.object({
      schema: anthropicDeckFlashcardsOutputSchema,
      name: "flashcards",
      description: `Exactly ${AI_DECK_GENERATION_CARD_COUNT} flashcards: front and back text per deck type (see prompt).`,
    }),
    prompt: `Generate exactly ${AI_DECK_GENERATION_CARD_COUNT} educational flashcards for a spaced-repetition deck.

Deck title: ${title}

${desc}

${existingBlock}

Duplication rules:
- Each new card must be novel relative to the existing cards above and relative to the other new cards in this batch: no duplicate facts, no duplicate vocabulary items, and no trivial rephrasings of the same answer.
- If nearly all obvious content is already covered, explore adjacent subtopics, harder examples, or less common items that still fit the deck description.

General rules (all decks):
- Cover the topic comprehensively without repeating the same fact.
- Front and back must be plain text (no markdown fences).

Language learning / translation decks:
If the deck title or description indicates learning a language, translating between languages, or vocabulary (e.g. "English to Russian", "Learning Indonesian", "Spanish vocab"):
1. Infer the intended direction from the title and description (which language is "known" vs "learned"). If unclear, assume the deck name lists source then target (e.g. English → Russian means recall Russian from English).
2. Front: put ONLY a word or short sentence in the SOURCE (known) language. Do not use quiz wording—no "Translate …", "What is the word for …", "How do you say …", and do not put the target language on the front.
3. Back: put ONLY the direct translation in the TARGET (learned) language—typically a single word or the natural equivalent phrase. Do not add definitions, explanations, English glosses, or "or / also" alternatives unless the description explicitly asks for them. Do not add parenthetical transliteration or pronunciation on the back unless the description asks for it.

All other decks (not primarily language learning):
- Front: a clear question or short prompt; back: the concise answer.`,
  });

  if (output.cards.length > AI_DECK_GENERATION_CARD_COUNT) {
    throw new Error("AI_FLASHCARD_COUNT_OR_SHAPE_MISMATCH");
  }

  const validated = generatedDeckFlashcardsSchema.safeParse(output);
  if (!validated.success) {
    throw new Error("AI_FLASHCARD_COUNT_OR_SHAPE_MISMATCH");
  }

  return filterDuplicateFlashcards(existingCards, validated.data.cards);
}
