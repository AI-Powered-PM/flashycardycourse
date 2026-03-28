"use client";

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

import { deleteCard } from "./actions";
import { CardFormDialog } from "./card-form-dialog";

type CardData = {
  id: number;
  deckId: number;
  front: string;
  back: string;
  createdAt: Date;
  updatedAt: Date;
};

type CardListProps = {
  deckId: number;
  cards: CardData[];
};

function truncatePreview(text: string, max = 80) {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export function CardList({ deckId, cards }: CardListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [cardPendingDelete, setCardPendingDelete] = useState<CardData | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleEdit(card: CardData) {
    setEditingCard(card);
    setFormOpen(true);
  }

  function handleConfirmDelete() {
    if (!cardPendingDelete) return;
    const cardId = cardPendingDelete.id;
    startTransition(async () => {
      await deleteCard({ cardId, deckId });
      setCardPendingDelete(null);
    });
  }

  function handleOpenNew() {
    setEditingCard(null);
    setFormOpen(true);
  }

  return (
    <>
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <Plus className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mb-1 font-medium text-foreground">No cards yet</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Add your first card to start studying.
          </p>
          <Button onClick={handleOpenNew}>
            <Plus className="size-4" />
            Add Your First Card
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Cards</h2>
            <Button onClick={handleOpenNew} size="sm">
              <Plus className="size-4" />
              Add Card
            </Button>
          </div>

          <div className="grid gap-3">
            {cards.map((card, index) => (
              <Card key={card.id} size="sm">
                <CardContent className="relative">
                  <div className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Front
                          </p>
                          <p className="whitespace-pre-wrap text-sm text-foreground">
                            {card.front}
                          </p>
                        </div>
                        <div className="max-sm:border-t max-sm:pt-3 sm:border-l sm:pl-3">
                          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Back
                          </p>
                          <p className="whitespace-pre-wrap text-sm text-foreground">
                            {card.back}
                          </p>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" />}
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Card options</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(card)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setCardPendingDelete(card)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <CardFormDialog
        key={editingCard?.id ?? "new"}
        deckId={deckId}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingCard(null);
        }}
        card={editingCard}
      />

      <Dialog
        open={cardPendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) setCardPendingDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete card</DialogTitle>
            <DialogDescription>
              This will permanently remove this card. This action cannot be undone.
              {cardPendingDelete && (
                <span className="mt-3 block rounded-md border border-border bg-muted/50 p-3 text-left text-foreground">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Front
                  </span>
                  <span className="mt-1 block text-sm">{truncatePreview(cardPendingDelete.front)}</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCardPendingDelete(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
