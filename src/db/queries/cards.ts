import { and, desc, eq } from "drizzle-orm";

import { db } from "@/src/db";
import { cardsTable, decksTable } from "@/src/db/schema";

export async function getCardsForUserDeck(userId: string, deckId: number) {
  const cards = await db
    .select({
      id: cardsTable.id,
      deckId: cardsTable.deckId,
      front: cardsTable.front,
      back: cardsTable.back,
      createdAt: cardsTable.createdAt,
      updatedAt: cardsTable.updatedAt,
    })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(eq(cardsTable.deckId, deckId), eq(decksTable.userId, userId)))
    .orderBy(desc(cardsTable.updatedAt), desc(cardsTable.id));

  return cards;
}

export async function createCardForUserDeck(
  userId: string,
  deckId: number,
  front: string,
  back: string,
) {
  const [deck] = await db
    .select({ id: decksTable.id })
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));

  if (!deck) throw new Error("Deck not found");

  const [card] = await db
    .insert(cardsTable)
    .values({ deckId, front, back })
    .returning();

  return card;
}

export async function createCardsBulkForUserDeck(
  userId: string,
  deckId: number,
  cards: Array<{ front: string; back: string }>,
) {
  if (cards.length === 0) return 0;

  const [deck] = await db
    .select({ id: decksTable.id })
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));

  if (!deck) throw new Error("Deck not found");

  await db.insert(cardsTable).values(cards.map((c) => ({ deckId, front: c.front, back: c.back })));

  return cards.length;
}

export async function updateCardForUser(
  userId: string,
  cardId: number,
  front: string,
  back: string,
) {
  const [existing] = await db
    .select({ id: cardsTable.id })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(eq(cardsTable.id, cardId), eq(decksTable.userId, userId)));

  if (!existing) throw new Error("Card not found");

  const [updated] = await db
    .update(cardsTable)
    .set({ front, back, updatedAt: new Date() })
    .where(eq(cardsTable.id, cardId))
    .returning();

  return updated;
}

export async function deleteCardForUser(userId: string, cardId: number) {
  const [existing] = await db
    .select({ id: cardsTable.id })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(eq(cardsTable.id, cardId), eq(decksTable.userId, userId)));

  if (!existing) throw new Error("Card not found");

  await db.delete(cardsTable).where(eq(cardsTable.id, cardId));
}
