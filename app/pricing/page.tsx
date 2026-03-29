import type { Metadata } from "next";
import Link from "next/link";

import { PricingTable } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Pricing | FlashyCardy",
  description: "Choose a FlashyCardy plan that fits your study goals",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Pricing
            </h1>
            <p className="mt-2 text-muted-foreground">
              Compare plans and upgrade when you&apos;re ready.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-8 shrink-0 items-center justify-center self-start rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground no-underline transition-colors hover:bg-muted dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
          >
            Back to home
          </Link>
        </header>

        <PricingTable />
      </div>
    </div>
  );
}
