/**
 * Turns the add-videos textarea into a clean URL list. Accepts one URL per
 * line and tolerates commas and stray whitespace, since pasted lists arrive
 * in both shapes. Repeats are dropped, first occurrence wins.
 */
export function parseVideoUrls(raw: string): string[] {
  const parts = raw
    .split(/[\s,]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  return [...new Set(parts)];
}
