import { db } from "./db";
import { decksTable } from "./db/schema";

async function main() {
  const decks = await db.select().from(decksTable);
  console.log("Decks:", decks);
}

main();
