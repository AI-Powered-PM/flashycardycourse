"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createDeckForUser } from "@/src/db/queries";

const createDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
});

export type CreateDeckInput = z.infer<typeof createDeckSchema>;

export async function createDeck(input: CreateDeckInput) {
  const parsed = createDeckSchema.parse(input);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const deck = await createDeckForUser(userId, {
    title: parsed.title.trim(),
    description: parsed.description?.trim() || null,
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/decks/${deck.id}`);
}
