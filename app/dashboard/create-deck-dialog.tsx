"use client";

import { Plus, Sparkles } from "lucide-react";
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

  const decksRemaining = freePlanDeckLimit - deckCount;
  const usagePercent = Math.min(100, Math.round((deckCount / freePlanDeckLimit) * 100));

  return (
    <>
      <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-stretch lg:justify-end lg:gap-6">
        {!hasUnlimitedDecks && canCreateDeck ? (
          <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-background p-4 sm:p-5 lg:mr-auto lg:max-w-xl lg:flex-1">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Free plan</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {deckCount} of {freePlanDeckLimit} decks used
                    {deckCount > 0
                      ? decksRemaining === 1
                        ? " — one slot left before you hit the limit."
                        : ` — ${decksRemaining} slots left.`
                      : null}
                  </p>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={deckCount}
                  aria-valuemin={0}
                  aria-valuemax={freePlanDeckLimit}
                  aria-label={`${deckCount} of ${freePlanDeckLimit} free decks used`}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <div className="flex gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2.5">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
                    <p className="font-medium text-foreground">Go Pro when you&apos;re ready</p>
                    <p>
                      Unlimited decks for every subject, plus AI flashcard generation so you can build
                      decks faster and study smarter.
                    </p>
                  </div>
                </div>
              </div>
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "default" }),
                  "w-full shrink-0 sm:w-auto sm:self-start",
                )}
              >
                Compare plans
              </Link>
            </div>
          </div>
        ) : null}
        {canCreateDeck ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="gap-2 self-end lg:self-center"
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
