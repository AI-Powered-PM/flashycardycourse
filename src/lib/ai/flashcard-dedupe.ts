/** Normalize for duplicate detection: trim, lowercase, collapse internal whitespace. */
export function flashcardPairKey(front: string, back: string): string {
  const norm = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  return `${norm(front)}\n${norm(back)}`;
}

/**
 * Drops cards whose (front, back) pair matches an existing card or an earlier item in `generated`
 * (normalized). Preserves order of first occurrences in `generated`.
 */
export function filterDuplicateFlashcards(
  existing: Array<{ front: string; back: string }>,
  generated: Array<{ front: string; back: string }>,
): Array<{ front: string; back: string }> {
  const used = new Set<string>();
  for (const c of existing) {
    used.add(flashcardPairKey(c.front, c.back));
  }

  const out: Array<{ front: string; back: string }> = [];
  for (const c of generated) {
    const k = flashcardPairKey(c.front, c.back);
    if (used.has(k)) continue;
    used.add(k);
    out.push(c);
  }
  return out;
}
