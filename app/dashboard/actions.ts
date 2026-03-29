"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createDeckForUser, getDeckCountForUser } from "@/src/db/queries";

import { FREE_PLAN_DECK_LIMIT } from "./deck-limits";

const createDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
});

export type CreateDeckInput = z.infer<typeof createDeckSchema>;

export async function createDeck(input: CreateDeckInput) {
  const parsed = createDeckSchema.parse(input);
  const { userId, has } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!has({ feature: "unlimited_decks" })) {
    const deckCount = await getDeckCountForUser(userId);
    if (deckCount >= FREE_PLAN_DECK_LIMIT) {
      throw new Error(
        `Free plan is limited to ${FREE_PLAN_DECK_LIMIT} decks. Upgrade to Pro for unlimited decks.`,
      );
    }
  }

  const deck = await createDeckForUser(userId, {
    title: parsed.title.trim(),
    description: parsed.description?.trim() || null,
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/decks/${deck.id}`);
}
