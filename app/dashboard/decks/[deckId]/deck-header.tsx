"use client";

import { ArrowLeft, BookOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { deleteDeck, updateDeck } from "./actions";

type DeckHeaderProps = {
  deck: {
    id: number;
    title: string;
    description: string | null;
  };
  cardCount: number;
};

export function DeckHeader({ deck, cardCount }: DeckHeaderProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(deck.title);
  const [description, setDescription] = useState(deck.description ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSaveDeck() {
    startTransition(async () => {
      await updateDeck({
        deckId: deck.id,
        title: title.trim(),
        description: description.trim() || null,
      });
      setEditOpen(false);
    });
  }

  function handleDeleteDeck() {
    startTransition(async () => {
      await deleteDeck({ deckId: deck.id });
    });
  }

  return (
    <>
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">
                {deck.title}
              </h1>
              <Badge variant="secondary">{cardCount} {cardCount === 1 ? "card" : "cards"}</Badge>
            </div>
            {deck.description && (
              <p className="mt-2 text-sm text-muted-foreground">{deck.description}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {cardCount > 0 ? (
              <Button render={<Link href={`/decks/${deck.id}/study`} />} nativeButton={false} size="default" className="gap-2">
                <BookOpen className="size-4" aria-hidden />
                Start study
              </Button>
            ) : (
              <Button
                type="button"
                disabled
                size="default"
                className="gap-2"
                title="Add at least one card to start studying"
              >
                <BookOpen className="size-4" aria-hidden />
                Start study
              </Button>
            )}
            <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" />}
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Deck options</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setTitle(deck.title);
                  setDescription(deck.description ?? "");
                  setEditOpen(true);
                }}
              >
                <Pencil className="size-4" />
                Edit Deck
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete Deck
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Deck</DialogTitle>
            <DialogDescription>Update the title and description of your deck.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveDeck();
            }}
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <label htmlFor="deck-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="deck-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Deck title"
                required
                maxLength={200}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="deck-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="deck-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                maxLength={1000}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending || !title.trim()}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Deck</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{deck.title}&rdquo; and all its cards. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDeck} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
