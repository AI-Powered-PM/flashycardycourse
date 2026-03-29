import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getDecksForUser } from "@/src/db/queries";

import { FREE_PLAN_DECK_LIMIT } from "./deck-limits";
import { CreateDeckDialog } from "./create-deck-dialog";

export const metadata: Metadata = {
  title: "Dashboard | FlashyCardy",
  description: "Your FlashyCardy dashboard",
};

function formatUpdatedAt(value: Date) {
  return value.toLocaleDateString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function formatCardCount(cardCount: number) {
  return `${cardCount} ${cardCount === 1 ? "card" : "cards"}`;
}

export default async function DashboardPage() {
  const { userId, has } = await auth();
  if (!userId) redirect("/");

  const decks = await getDecksForUser(userId);
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });
  const canCreateDeck =
    hasUnlimitedDecks || decks.length < FREE_PLAN_DECK_LIMIT;

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your flashcard decks and study progress
          </p>
        </header>

        {decks.length === 0 ? (
          <p className="mb-6 text-sm text-muted-foreground">You don&apos;t have any decks yet.</p>
        ) : (
          <ul className="mb-6 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <li key={deck.id}>
                <Link
                  href={`/dashboard/decks/${deck.id}`}
                  className="group flex h-[200px] flex-col rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-border hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="min-h-0 flex-1">
                    <h2 className="line-clamp-2 font-semibold text-card-foreground">{deck.title}</h2>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {deck.description?.trim() ? deck.description : "No description"}
                    </p>
                  </div>
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground">
                      {formatCardCount(deck.cardCount)} • Last updated: {formatUpdatedAt(deck.updatedAt)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <CreateDeckDialog
          canCreateDeck={canCreateDeck}
          deckCount={decks.length}
          hasUnlimitedDecks={hasUnlimitedDecks}
          freePlanDeckLimit={FREE_PLAN_DECK_LIMIT}
        />
      </div>
    </div>
  );
}
