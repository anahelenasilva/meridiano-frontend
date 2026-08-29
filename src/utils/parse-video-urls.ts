/**
 * Turns the add-videos textarea into a clean URL list. Accepts one URL per
 * line and tolerates commas, since pasted lists arrive in both shapes. Only
 * line breaks and commas separate entries, never spaces or tabs: a numbered
 * list or a spreadsheet column would otherwise fragment into junk tokens and
 * blow past the batch cap. Surrounding whitespace is trimmed off each entry.
 * A leading list marker ("1.", "2)", "-") is stripped so a numbered or
 * bulleted paste yields the URLs alone. Repeats are dropped, first
 * occurrence wins.
 */
const LIST_MARKER = /^(?:\d+[.)]|[-*\u2022])\s+/;

export function parseVideoUrls(raw: string): string[] {
  const parts = raw
    .split(/[\n\r,]+/)
    .map((part) => part.trim().replace(LIST_MARKER, "").trim())
    .filter((part) => part.length > 0);

  return [...new Set(parts)];
}
