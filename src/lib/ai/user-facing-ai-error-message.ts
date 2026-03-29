import { APICallError, NoObjectGeneratedError, RetryError } from "ai";

function openAiErrorCode(error: APICallError): string | undefined {
  const d = error.data;
  if (d && typeof d === "object" && "error" in d) {
    const inner = (d as { error?: { code?: string } }).error?.code;
    return typeof inner === "string" ? inner : undefined;
  }
  return undefined;
}

/** Maps AI SDK / provider errors to safe, actionable UI copy (no raw API bodies). */
export function userFacingAiErrorMessage(error: unknown): string {
  const e = RetryError.isInstance(error) ? (error.lastError ?? error) : error;

  if (APICallError.isInstance(e)) {
    const code = openAiErrorCode(e);
    const msg = e.message.toLowerCase();

    if (e.statusCode === 401) {
      return "OpenAI rejected the API key. Check OPENAI_API_KEY in your environment.";
    }

    if (
      code === "insufficient_quota" ||
      msg.includes("exceeded your current quota") ||
      msg.includes("insufficient_quota")
    ) {
      return "OpenAI reports no quota or billing on this API key. Add credits in your OpenAI billing settings, then try again.";
    }

    if (e.statusCode === 429) {
      return "OpenAI rate limit reached. Wait a moment and try again.";
    }

    return "The AI provider returned an error. Try again later.";
  }

  if (NoObjectGeneratedError.isInstance(e)) {
    return "The model did not return flashcards in the expected format. Try again.";
  }

  if (e instanceof Error && e.message === "AI generation is not configured.") {
    return e.message;
  }

  return "Could not generate cards. Try again later.";
}
