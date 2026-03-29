"use client";

import { ClerkProvider, Show } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";

import { AppHeader } from "@/components/app-header";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{ theme: dark }}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <Show when="signed-in">
        <AppHeader />
      </Show>
      {children}
    </ClerkProvider>
  );
}
