"use client";

import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{ theme: dark }}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <Show when="signed-in">
        <header className="flex items-center justify-end gap-4 p-4">
          <UserButton />
        </header>
      </Show>
      {children}
    </ClerkProvider>
  );
}
