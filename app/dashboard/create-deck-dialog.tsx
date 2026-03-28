"use client";

import { Plus } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createDeck } from "./actions";

export function CreateDeckDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setTitle("");
      setDescription("");
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createDeck({
        title: title.trim(),
        description: description.trim() || undefined,
      });
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => handleOpenChange(true)}
        >
          <Plus className="size-4" aria-hidden />
          Create New Deck
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Deck</DialogTitle>
            <DialogDescription>
              Give your deck a name and optional description. You can add cards after it is created.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="new-deck-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="new-deck-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Deck title"
                required
                maxLength={200}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="new-deck-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="new-deck-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                maxLength={1000}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !title.trim()}>
                {isPending ? "Creating..." : "Create Deck"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
