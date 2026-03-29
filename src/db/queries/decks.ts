import { and, count, desc, eq } from "drizzle-orm";

import { db } from "@/src/db";
import { cardsTable, decksTable } from "@/src/db/schema";

export async function getDecksForUser(userId: string) {
  const decks = await db
    .select({
      id: decksTable.id,
      userId: decksTable.userId,
      title: decksTable.title,
      description: decksTable.description,
      createdAt: decksTable.createdAt,
      updatedAt: decksTable.updatedAt,
      cardCount: count(cardsTable.id),
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(cardsTable.deckId, decksTable.id))
    .where(eq(decksTable.userId, userId))
    .groupBy(
      decksTable.id,
      decksTable.userId,
      decksTable.title,
      decksTable.description,
      decksTable.createdAt,
      decksTable.updatedAt,
    )
    .orderBy(desc(decksTable.updatedAt));

  return decks.map((deck) => ({ ...deck, cardCount: Number(deck.cardCount) }));
}

export async function getDeckCountForUser(userId: string) {
  const [row] = await db
    .select({ n: count() })
    .from(decksTable)
    .where(eq(decksTable.userId, userId));

  return Number(row?.n ?? 0);
}

export async function getDeckByIdForUser(userId: string, deckId: number) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));

  return deck ?? undefined;
}

export async function createDeckForUser(
  userId: string,
  data: { title: string; description?: string | null },
) {
  const [created] = await db
    .insert(decksTable)
    .values({
      userId,
      title: data.title,
      description: data.description ?? null,
    })
    .returning();

  return created;
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
