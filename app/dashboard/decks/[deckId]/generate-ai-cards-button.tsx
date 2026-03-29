"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { generateDeckCardsWithAi } from "./actions";

type GenerateAiCardsButtonProps = {
  deckId: number;
  canUseAi: boolean;
};

export function GenerateAiCardsButton({ deckId, canUseAi }: GenerateAiCardsButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!canUseAi) {
    return (
      <TooltipProvider delay={200}>
        <Tooltip>
          <TooltipTrigger
            type="button"
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "gap-2")}
            onClick={() => router.push("/pricing")}
          >
            <Sparkles className="size-4" aria-hidden />
            Generate cards with AI
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs text-pretty text-center">
            AI card generation is a paid feature. Click to view pricing and upgrade.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="default"
        className="gap-2"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await generateDeckCardsWithAi({ deckId });
            if (!result.success) setError(result.error);
          });
        }}
      >
        <Sparkles className="size-4" aria-hidden />
        {isPending ? "Generating…" : "Generate cards with AI"}
      </Button>
      {error ? (
        <p className="max-w-[min(100%,280px)] text-right text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
