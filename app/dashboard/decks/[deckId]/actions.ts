"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  createCardForUserDeck,
  deleteCardForUser,
  deleteDeckForUser,
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
