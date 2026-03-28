"use client";

import { ArrowLeft, ArrowRight, Check, FlipVertical, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Card = {
  id: number;
  front: string;
  back: string;
};

type FlashcardStudyProps = {
  deckId: number;
  deckTitle: string;
  cards: Card[];
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function FlashcardStudy({ deckId, deckTitle, cards }: FlashcardStudyProps) {
  const [shuffled, setShuffled] = useState<Card[]>(() => shuffleArray(cards));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [finished, setFinished] = useState(false);
  const [animate, setAnimate] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const total = shuffled.length;
  const card = shuffled[currentIndex];
  const progress = total > 0 ? ((currentIndex + (finished ? 1 : 0)) / total) * 100 : 0;

  const flip = useCallback(() => setFlipped((f) => !f), []);

  const navigateTo = useCallback(
    (index: number) => {
      setAnimate(false);
      setFlipped(false);
      setCurrentIndex(index);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true));
      });
    },
    [],
  );

  const next = useCallback(() => {
    if (flipped) return;
    if (currentIndex < total - 1) {
      navigateTo(currentIndex + 1);
    } else {
      setFinished(true);
    }
  }, [currentIndex, total, navigateTo, flipped]);

  const gradeAndAdvance = useCallback(
    (correct: boolean) => {
      if (correct) {
        setCorrectCount((c) => c + 1);
      } else {
        setIncorrectCount((c) => c + 1);
      }
      if (currentIndex < total - 1) {
        navigateTo(currentIndex + 1);
      } else {
        setFinished(true);
      }
    },
    [currentIndex, total, navigateTo],
  );

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      navigateTo(currentIndex - 1);
    }
  }, [currentIndex, navigateTo]);

  const restart = useCallback(() => {
    setShuffled(shuffleArray(cards));
    setCurrentIndex(0);
    setFlipped(false);
    setFinished(false);
    setCorrectCount(0);
    setIncorrectCount(0);
  }, [cards]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        flip();
      } else if (e.key === "ArrowRight") {
        if (finished) return;
        if (flipped) {
          e.preventDefault();
          gradeAndAdvance(true);
        } else {
          next();
        }
      } else if (e.key === "ArrowLeft") {
        prev();
      } else if (flipped && (e.key === "i" || e.key === "I")) {
        e.preventDefault();
        gradeAndAdvance(false);
      } else if (flipped && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        gradeAndAdvance(true);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [flip, next, prev, finished, flipped, gradeAndAdvance]);

  if (total === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="mb-2 text-lg font-medium text-foreground">No cards to study</p>
        <p className="mb-6 text-sm text-muted-foreground">
          Add some cards to this deck first, then come back to study.
        </p>
        <Button render={<Link href={`/dashboard/decks/${deckId}`} />} nativeButton={false} variant="outline">
          <ArrowLeft className="size-4" />
          Back to Deck
        </Button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
          <span className="text-3xl">🎉</span>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">Session complete!</h2>
        <p className="mb-2 text-muted-foreground">
          You reviewed all {total} {total === 1 ? "card" : "cards"} in &ldquo;{deckTitle}&rdquo;.
        </p>
        <p className="mb-8 text-sm tabular-nums text-foreground">
          <span className="text-emerald-500 dark:text-emerald-400">{correctCount} correct</span>
          <span className="mx-2 text-muted-foreground">·</span>
          <span className="text-destructive">{incorrectCount} incorrect</span>
        </p>
        <div className="flex gap-3">
          <Button onClick={restart} className="gap-2">
            <RotateCcw className="size-4" />
            Study Again
          </Button>
          <Button render={<Link href={`/dashboard/decks/${deckId}`} />} nativeButton={false} variant="outline" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Deck
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* progress header */}
      <div className="mb-8 w-full max-w-xl">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>
            Card {currentIndex + 1} of {total}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <p className="mb-2 text-center text-sm tabular-nums text-muted-foreground">
          <span className="text-emerald-600 dark:text-emerald-400">{correctCount} correct</span>
          <span className="mx-2">·</span>
          <span className="text-destructive">{incorrectCount} incorrect</span>
        </p>
        <Progress value={progress} />
      </div>

      {/* flashcard */}
      <div className="perspective-[1200px] mb-8 w-full max-w-xl">
        <button
          type="button"
          onClick={flip}
          aria-label={flipped ? "Show front" : "Show back"}
          className={`relative h-72 w-full cursor-pointer [transform-style:preserve-3d] ${animate ? "transition-transform duration-500" : ""}`}
          style={{ transform: flipped ? "rotateX(180deg)" : "rotateX(0deg)" }}
        >
          {/* front face */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-8 py-6 shadow-lg [backface-visibility:hidden]">
            <span className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Front
            </span>
            <p className="max-h-44 overflow-auto whitespace-pre-wrap text-center text-lg font-medium text-foreground">
              {card.front}
            </p>
          </div>

          {/* back face */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-8 py-6 shadow-lg [backface-visibility:hidden] [transform:rotateX(180deg)]">
            <span className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Back
            </span>
            <p className="max-h-44 overflow-auto whitespace-pre-wrap text-center text-lg font-medium text-foreground">
              {card.back}
            </p>
          </div>
        </button>
      </div>

      {/* controls */}
      <div className="flex flex-col items-center gap-4">
        {flipped && (
          <div className="flex w-full max-w-xl flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="min-w-[9rem] gap-2 bg-emerald-600 text-white hover:bg-emerald-600/90 dark:bg-emerald-600 dark:hover:bg-emerald-600/90"
              onClick={() => gradeAndAdvance(true)}
            >
              <Check className="size-4" />
              Correct
            </Button>
            <Button size="lg" variant="destructive" className="min-w-[9rem] gap-2" onClick={() => gradeAndAdvance(false)}>
              <X className="size-4" />
              Incorrect
            </Button>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" size="lg" onClick={prev} disabled={currentIndex === 0}>
            <ArrowLeft className="size-4" />
            Prev
          </Button>
          <Button variant="outline" size="lg" onClick={flip} className="gap-2">
            <FlipVertical className="size-4" />
            Flip
          </Button>
          {!flipped && (
            <Button size="lg" onClick={next}>
              {currentIndex === total - 1 ? "Finish" : "Next"}
              {currentIndex < total - 1 && <ArrowRight className="size-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* keyboard hint */}
      <p className="mt-6 max-w-xl text-center text-xs text-muted-foreground">
        {flipped ? (
          <>
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">C</kbd> or{" "}
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">→</kbd> correct,{" "}
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">I</kbd> incorrect ·{" "}
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">Space</kbd> flip ·{" "}
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">←</kbd> prev
          </>
        ) : (
          <>
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">Space</kbd> flip,{" "}
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">←</kbd>{" "}
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">→</kbd> prev / next
          </>
        )}
      </p>
    </div>
  );
}
