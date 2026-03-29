import { APICallError, NoObjectGeneratedError, RetryError } from "ai";

/** Maps AI SDK / provider errors to safe, actionable UI copy (no raw API bodies). */
export function userFacingAiErrorMessage(error: unknown): string {
  const e = RetryError.isInstance(error) ? (error.lastError ?? error) : error;

  if (APICallError.isInstance(e)) {
    const msg = e.message.toLowerCase();

    if (e.statusCode === 401) {
      return "The API key was rejected. Check ANTHROPIC_API_KEY in your environment.";
    }

    if (
      msg.includes("credit") ||
      msg.includes("balance") ||
      msg.includes("billing") ||
      msg.includes("quota") ||
      msg.includes("exceeded your current quota") ||
      msg.includes("insufficient_quota")
    ) {
      return "The AI provider reports a quota or billing issue. Check your Anthropic account and try again.";
    }

    if (e.statusCode === 429) {
      return "AI rate limit reached. Wait a moment and try again.";
    }

    if (e.statusCode === 404 || msg.includes("not_found_error") || msg.startsWith("model:")) {
      return "The configured AI model is not available from the provider. Try again later or contact support.";
    }

    if (e.statusCode === 403) {
      return "The AI provider denied this request. Check API key permissions and your Anthropic account.";
    }

    if (e.statusCode === 400 && msg.includes("output_config")) {
      return "The AI provider rejected the response format. Try again; if it keeps happening, contact support.";
    }

    return "The AI provider returned an error. Try again later.";
  }

  if (NoObjectGeneratedError.isInstance(e)) {
    return "The model did not return flashcards in the expected format. Try again.";
  }

  if (e instanceof Error && e.message === "AI generation is not configured.") {
    return e.message;
  }

  if (e instanceof Error && e.message === "AI_FLASHCARD_COUNT_OR_SHAPE_MISMATCH") {
    return "The model did not return the expected number of flashcards. Try again.";
  }

  return "Could not generate cards. Try again later.";
}
