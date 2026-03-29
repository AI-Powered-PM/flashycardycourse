"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState, useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

type CreateDeckDialogProps = {
  canCreateDeck: boolean;
  deckCount: number;
  hasUnlimitedDecks: boolean;
  freePlanDeckLimit: number;
};

export function CreateDeckDialog({
  canCreateDeck,
  deckCount,
  hasUnlimitedDecks,
  freePlanDeckLimit,
}: CreateDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    startTransition(async () => {
      try {
        await createDeck({
          title: title.trim(),
          description: description.trim() || undefined,
        });
      } catch (err) {
        if (
          err instanceof Error &&
          "digest" in err &&
          typeof (err as { digest: unknown }).digest === "string" &&
          (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
        ) {
          throw err;
        }
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        {!hasUnlimitedDecks && canCreateDeck ? (
          <p className="text-center text-sm text-muted-foreground sm:mr-auto sm:text-left">
            {deckCount} of {freePlanDeckLimit} free decks used
          </p>
        ) : null}
        {canCreateDeck ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="gap-2 self-end sm:self-center"
            onClick={() => handleOpenChange(true)}
          >
            <Plus className="size-4" aria-hidden />
            Create New Deck
          </Button>
        ) : (
          <div className="flex flex-col items-stretch gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              You&apos;ve reached the free plan limit of {freePlanDeckLimit} decks. Upgrade to Pro
              for unlimited decks.
            </p>
            <Link
              href="/pricing"
              className={cn(buttonVariants({ variant: "default", size: "lg" }), "inline-flex shrink-0")}
            >
              View plans
            </Link>
          </div>
        )}
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
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
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
