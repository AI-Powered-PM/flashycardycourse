import { and, desc, eq } from "drizzle-orm";

import { db } from "@/src/db";
import { decksTable } from "@/src/db/schema";

export async function getDecksForUser(userId: string) {
  return db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.updatedAt));
}

export async function getDeckByIdForUser(userId: string, deckId: number) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));

  return deck ?? undefined;
}

export async function updateDeckForUser(
  userId: string,
  deckId: number,
  data: { title?: string; description?: string | null },
) {
  const [updated] = await db
    .update(decksTable)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .returning();

  return updated;
}

export async function deleteDeckForUser(userId: string, deckId: number) {
  await db
    .delete(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));
}
