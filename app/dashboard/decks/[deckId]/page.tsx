import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getDeckByIdForUser } from "@/src/db/queries";

type Props = {
  params: Promise<{ deckId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { deckId } = await params;
  const id = Number.parseInt(deckId, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return { title: "Deck | FlashyCardy" };
  }

  const { userId } = await auth();
  if (!userId) {
    return { title: "Deck | FlashyCardy" };
  }

  const deck = await getDeckByIdForUser(userId, id);

  return {
    title: deck ? `${deck.title} | FlashyCardy` : "Deck | FlashyCardy",
  };
}

export default async function DeckPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { deckId } = await params;
  const id = Number.parseInt(deckId, 10);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const deck = await getDeckByIdForUser(userId, id);

  if (!deck) notFound();

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{deck.title}</h1>
      </div>
    </div>
  );
}
