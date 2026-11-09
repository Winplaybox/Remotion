/**
 * Reading a viewer's guess out of a comment (comment auto-reply checks it against the post's answer).
 * parse() returns the numbers in answer order, "partial" when only part of the answer is there, null when there is no guess.
 */
export interface Quiz {
  key: (n: number) => number[];
  parse: (text: string) => number[] | "partial" | null;
  label: (key: number[]) => string;
  /** How to write an answer, e.g. "Row 5 #9". */
  how: string;
}

const clean = (t: string) => t.toLowerCase().replace(/https?:\/\/\S+/g, " ").replace(/[०-९]/g, (d) => String("०१२३४५६७८९".indexOf(d)));
const ints = (t: string) => [...t.matchAll(/(?<![\d])(\d{1,2})(?![\d])/g)].map((m) => Number(m[1]));

/** "Row 5 #9", "R5 N9", "5th row 9th", "5,9", "5 9", "row 5 number 9" -> [5, 9]. */
export function parseCell(text: string, maxRow = 20, maxCol = 20): number[] | "partial" | null {
  let t = clean(text);
  let row: number | undefined, col: number | undefined;
  const r = /\b(?:row|r|line|lin|pankti)\s*(?:no\.?|number|num)?\s*[:#.\-=]?\s*(\d{1,2})\b/.exec(t) ?? /\b(\d{1,2})\s*(?:st|nd|rd|th|vi|va|wi)?\s*(?:row|line)\b/.exec(t);
  if (r) { row = Number(r[1]); t = t.slice(0, r.index) + " " + t.slice(r.index + r[0].length); }
  const c = /(?:#|\b(?:number|nmbr|num|no|column|col|n|c)\.?)\s*[:#.\-=]?\s*(\d{1,2})\b/.exec(t) ?? /\b(\d{1,2})\s*(?:st|nd|rd|th|va|vi)?\s*(?:number|no|col|column)\b/.exec(t);
  if (c) { col = Number(c[1]); t = t.slice(0, c.index) + " " + t.slice(c.index + c[0].length); }
  const rest = ints(t);
  if (row === undefined && col === undefined) { if (rest.length >= 2) { row = rest[0]; col = rest[1]; } else if (rest.length === 1) return "partial"; else return null; }
  else if (row === undefined) row = rest[0];
  else if (col === undefined) col = rest[0];
  if (row === undefined || col === undefined) return "partial";
  if (row < 1 || col < 1 || row > maxRow || col > maxCol) return null;
  return [row, col];
}

/** "#7", "7", "number 7", "7 no" -> [7] (1..max). */
export function parseNumber(text: string, max = 12): number[] | null {
  const t = clean(text);
  const m = /#\s*(\d{1,2})\b/.exec(t) ?? /\b(?:no|num|number|nmbr|taxi|car|gaadi)\.?\s*[:#.\-=]?\s*(\d{1,2})\b/.exec(t);
  const v = m ? Number(m[1]) : ints(t)[0];
  return v !== undefined && v >= 1 && v <= max ? [v] : null;
}
