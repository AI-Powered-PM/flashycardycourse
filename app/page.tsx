import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HomeAuthButtons } from "@/components/home-auth-buttons";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          FlashyCardy
        </h1>
        <p className="mt-3 max-w-lg text-lg text-muted-foreground">
          Your personal flashcard platform
        </p>
        <HomeAuthButtons />
      </div>
    </div>
  );
}
