import { z } from "zod";

/** `deckId` from `app/.../[deckId]/...` — digits only, positive integer */
const deckIdRouteParamSchema = z
  .string()
  .regex(/^\d+$/)
  .transform((s) => Number.parseInt(s, 10))
  .pipe(z.number().int().positive());

export function parseDeckIdRouteParam(segment: string): number | null {
  const parsed = deckIdRouteParamSchema.safeParse(segment);
  return parsed.success ? parsed.data : null;
}
