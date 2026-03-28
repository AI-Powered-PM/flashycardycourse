"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { createCard, updateCard } from "./actions";

type CardFormDialogProps = {
  deckId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: { id: number; front: string; back: string } | null;
};

export function CardFormDialog({ deckId, open, onOpenChange, card }: CardFormDialogProps) {
  const isEditing = !!card;
  const [front, setFront] = useState(card?.front ?? "");
  const [back, setBack] = useState(card?.back ?? "");
  const [isPending, startTransition] = useTransition();

  function resetAndClose() {
    setFront("");
    setBack("");
    onOpenChange(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (isEditing) {
        await updateCard({
          cardId: card.id,
          deckId,
          front: front.trim(),
          back: back.trim(),
        });
      } else {
        await createCard({
          deckId,
          front: front.trim(),
          back: back.trim(),
        });
      }
      resetAndClose();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetAndClose();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Card" : "Add Card"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the front and back of this card."
              : "Enter the content for the front and back of your new card."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="card-front" className="text-sm font-medium">
              Front
            </label>
            <Textarea
              id="card-front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Question or term"
              required
              maxLength={5000}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="card-back" className="text-sm font-medium">
              Back
            </label>
            <Textarea
              id="card-back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Answer or definition"
              required
              maxLength={5000}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending || !front.trim() || !back.trim()}>
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                  ? "Save Changes"
                  : "Add Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
