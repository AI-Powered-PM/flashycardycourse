"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { generateDeckFlashcardsWithAi } from "@/src/lib/ai/generate-deck-flashcards";
import { userFacingAiErrorMessage } from "@/src/lib/ai/user-facing-ai-error-message";
import {
  createCardForUserDeck,
  createCardsBulkForUserDeck,
  deleteCardForUser,
  deleteDeckForUser,
  getCardsForUserDeck,
  getDeckByIdForUser,
  updateCardForUser,
  updateDeckForUser,
} from "@/src/db/queries";

const createCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front side is required").max(5000),
  back: z.string().min(1, "Back side is required").max(5000),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;

export async function createCard(input: CreateCardInput) {
  const parsed = createCardSchema.parse(input);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await createCardForUserDeck(userId, parsed.deckId, parsed.front, parsed.back);
  revalidatePath(`/dashboard/decks/${parsed.deckId}`);
}

const updateCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front side is required").max(5000),
  back: z.string().min(1, "Back side is required").max(5000),
});

export type UpdateCardInput = z.infer<typeof updateCardSchema>;

export async function updateCard(input: UpdateCardInput) {
  const parsed = updateCardSchema.parse(input);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await updateCardForUser(userId, parsed.cardId, parsed.front, parsed.back);
  revalidatePath(`/dashboard/decks/${parsed.deckId}`);
}

const deleteCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(),
});

export type DeleteCardInput = z.infer<typeof deleteCardSchema>;

export async function deleteCard(input: DeleteCardInput) {
  const parsed = deleteCardSchema.parse(input);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await deleteCardForUser(userId, parsed.cardId);
  revalidatePath(`/dashboard/decks/${parsed.deckId}`);
}

const updateDeckSchema = z.object({
  deckId: z.number().int().positive(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).nullable(),
});

export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

export async function updateDeck(input: UpdateDeckInput) {
  const parsed = updateDeckSchema.parse(input);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await updateDeckForUser(userId, parsed.deckId, {
    title: parsed.title,
    description: parsed.description,
  });
  revalidatePath(`/dashboard/decks/${parsed.deckId}`);
}

const deleteDeckSchema = z.object({
  deckId: z.number().int().positive(),
});

export type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function deleteDeck(input: DeleteDeckInput) {
  const parsed = deleteDeckSchema.parse(input);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await deleteDeckForUser(userId, parsed.deckId);
  redirect("/dashboard");
}

const generateDeckCardsWithAiSchema = z.object({
  deckId: z.number().int().positive(),
});

export type GenerateDeckCardsWithAiInput = z.infer<typeof generateDeckCardsWithAiSchema>;

export type GenerateDeckCardsWithAiResult =
  | { success: true; count: number }
  | { success: false; error: string };

export async function generateDeckCardsWithAi(
  input: GenerateDeckCardsWithAiInput,
): Promise<GenerateDeckCardsWithAiResult> {
  const parsed = generateDeckCardsWithAiSchema.parse(input);
  const { userId, has } = await auth();
  if (!userId) {
    return { success: false, error: "You must be signed in." };
  }

  if (!has({ feature: "ai_flashcard_generation" }) && !has({ plan: "pro" })) {
    return { success: false, error: "Upgrade to use AI card generation." };
  }

  const deck = await getDeckByIdForUser(userId, parsed.deckId);
  if (!deck) {
    return { success: false, error: "Deck not found." };
  }

  const titleTrimmed = deck.title.trim();
  const descriptionTrimmed = deck.description?.trim() ?? "";
  if (titleTrimmed.length === 0) {
    return {
      success: false,
      error: "Add a deck title before generating cards with AI. Use the ⋯ menu and choose Edit Deck.",
    };
  }
  if (descriptionTrimmed.length === 0) {
    return {
      success: false,
      error: "Add a deck description first so AI knows what to generate. Use the ⋯ menu and choose Edit Deck.",
    };
  }

  try {
    const existingCards = await getCardsForUserDeck(userId, parsed.deckId);
    const existingPairs = existingCards.map((c) => ({ front: c.front, back: c.back }));

    const generated = await generateDeckFlashcardsWithAi(
      deck.title,
      deck.description,
      existingPairs,
    );

    if (generated.length === 0) {
      return {
        success: false,
        error:
          "No new cards were added. The model only suggested items that are already in this deck (or duplicates of them). Try editing the deck description to ask for a different angle, or add cards manually.",
      };
    }

    const count = await createCardsBulkForUserDeck(userId, parsed.deckId, generated);
    revalidatePath(`/dashboard/decks/${parsed.deckId}`);
    return { success: true, count };
  } catch (caught) {
    if (process.env.NODE_ENV === "development") {
      console.error("[generateDeckCardsWithAi]", caught);
    }
    return {
      success: false,
      error: userFacingAiErrorMessage(caught),
    };
  }
}
