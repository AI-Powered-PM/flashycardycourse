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
