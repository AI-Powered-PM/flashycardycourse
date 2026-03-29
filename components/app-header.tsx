"use client";

import { UserButton } from "@clerk/nextjs";
import { Library } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function AppHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "flex items-center gap-4 border-b border-border bg-background px-4 py-3 shadow-sm",
        isHome ? "justify-end" : "justify-between",
      )}
    >
      {!isHome ? (
        <Link
          href="/dashboard"
          className={cn(
            "inline-flex min-w-0 max-w-[min(100%,28rem)] items-center gap-2.5 rounded-md py-1 text-foreground transition-opacity hover:opacity-90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"
            aria-hidden
          >
            <Library className="size-5" strokeWidth={2} />
          </span>
          <span className="truncate text-base font-semibold tracking-tight sm:text-lg">
            Flashy Cardy Course
          </span>
        </Link>
      ) : null}
      <UserButton />
    </header>
  );
}
