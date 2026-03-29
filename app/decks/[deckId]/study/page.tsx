import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCardsForUserDeck, getDeckByIdForUser } from "@/src/db/queries";
import { parseDeckIdRouteParam } from "@/src/lib/deck-id-route-param";

import { FlashcardStudy } from "./flashcard-study";

type Props = {
  params: Promise<{ deckId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { deckId } = await params;
  const id = parseDeckIdRouteParam(deckId);
  if (id === null) {
    return { title: "Study | FlashyCardy" };
  }

  const { userId } = await auth();
  if (!userId) return { title: "Study | FlashyCardy" };

  const deck = await getDeckByIdForUser(userId, id);
  return {
    title: deck ? `Study ${deck.title} | FlashyCardy` : "Study | FlashyCardy",
  };
}

export default async function DeckStudyPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { deckId } = await params;
  const id = parseDeckIdRouteParam(deckId);
  if (id === null) notFound();

  const deck = await getDeckByIdForUser(userId, id);
  if (!deck) notFound();

  const cards = await getCardsForUserDeck(userId, id);

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              render={<Link href={`/dashboard/decks/${id}`} />}
              nativeButton={false}
              variant="ghost"
              size="sm"
              className="mb-2 gap-1.5 text-muted-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to Deck
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Study: {deck.title}
            </h1>
          </div>
        </div>

        <FlashcardStudy
          deckId={deck.id}
          deckTitle={deck.title}
          cards={cards.map((c) => ({ id: c.id, front: c.front, back: c.back }))}
        />
      </div>
    </div>
  );
}
