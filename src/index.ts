import "dotenv/config";

import { getDecksForUser } from "./db/queries";

/**
 * Lists decks for one Clerk user. Scoped reads only — set FLASHYCARDY_CLI_USER_ID to that
 * user's id (e.g. from the Clerk dashboard). Run: pnpm db:script / npm run db:script
 */
async function main() {
  const userId = process.env.FLASHYCARDY_CLI_USER_ID?.trim();
  if (!userId) {
    console.error(
      "Set FLASHYCARDY_CLI_USER_ID to a Clerk user id (e.g. user_...) to list that user's decks.",
    );
    process.exit(1);
  }

  const decks = await getDecksForUser(userId);
  console.log("Decks:", decks);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
