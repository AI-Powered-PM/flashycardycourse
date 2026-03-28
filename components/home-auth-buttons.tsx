"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, Show, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

/**
 * Modal sign-in does not re-run the home Server Component. Clerk's forceRedirectUrl handles the
 * intended post-auth navigation; a full location replace is a fallback when soft navigation stalls.
 */
function RedirectToDashboardWhenSignedIn() {
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || pathname !== "/") return;
    window.location.replace("/dashboard");
  }, [isLoaded, isSignedIn, pathname]);

  return null;
}

export function HomeAuthButtons() {
  return (
    <>
      <RedirectToDashboardWhenSignedIn />
      <Show when="signed-out">
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <Button size="lg">Sign Up</Button>
          </SignUpButton>
        </div>
      </Show>
    </>
  );
}
