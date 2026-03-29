"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { generateDeckCardsWithAi } from "./actions";

type GenerateAiCardsButtonProps = {
  deckId: number;
  canUseAi: boolean;
  /** Title and description must be non-empty (trimmed) before AI generation runs */
  readyForAi: boolean;
};

export function GenerateAiCardsButton({ deckId, canUseAi, readyForAi }: GenerateAiCardsButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!canUseAi) {
      router.push("/pricing");
      return;
    }
    if (!readyForAi) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await generateDeckCardsWithAi({ deckId });
      if (!result.success) setError(result.error);
    });
  }

  const showBillingTooltip = !canUseAi;
  const tooltipDisabled = canUseAi && readyForAi;

  const contextTooltipMessage =
    "Add a deck description first so AI knows what to generate. Open the ⋯ menu and choose Edit Deck.";

  const buttonDisabled = canUseAi && (!readyForAi || isPending);

  return (
    <TooltipProvider delay={200}>
      <div className="flex flex-col items-end gap-1">
        <Tooltip disabled={tooltipDisabled}>
          <TooltipTrigger
            type="button"
            render={
              <Button
                type="button"
                variant="outline"
                size="default"
                className="gap-2"
                disabled={buttonDisabled}
              />
            }
            onClick={handleClick}
          >
            <Sparkles className="size-4" aria-hidden />
            {canUseAi && isPending ? "Generating…" : "Generate cards with AI"}
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs text-pretty text-center">
            {showBillingTooltip
              ? "AI card generation is a paid feature. Click to view pricing and upgrade."
              : contextTooltipMessage}
          </TooltipContent>
        </Tooltip>
        {canUseAi && !readyForAi ? (
          <p className="max-w-[min(100%,280px)] text-right text-xs text-muted-foreground">
            Add a deck description first (⋯ → Edit Deck), then generate.
          </p>
        ) : null}
        {error ? (
          <p className="max-w-[min(100%,280px)] text-right text-xs text-destructive">{error}</p>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
