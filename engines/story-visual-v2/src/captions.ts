import type { StoryText } from "./types";

/** Average glyph advance as a share of font size, per script (Baloo 2 / Mukta / Baloo Bhaijaan 2). */
export const ADVANCE: Record<StoryText["script"], number> = { deva: 0.5, latin: 0.5, arabic: 0.46, cjk: 1.0 };

/**
 * Split narration into caption chunks that fit in at most two lines of `width` px at `fontSize`.
 * Breaks on sentence/clause punctuation first, then greedily on words (characters for CJK).
 */
export function chunkCaption(text: string, script: StoryText["script"], fontSize: number, width: number): string[] {
  const perLine = Math.floor(width / (fontSize * ADVANCE[script]));
  const max = Math.floor(perLine * 1.75);
  const clauses = text.split(/(?<=[।.!?؟،,、。！？])\s*/u).map((s) => s.trim()).filter(Boolean);
  const out: string[] = [];
  let cur = "";
  const push = () => { if (cur.trim()) out.push(cur.trim()); cur = ""; };
  for (const clause of clauses) {
    if ((cur + " " + clause).trim().length <= max) { cur = (cur + " " + clause).trim(); continue; }
    push();
    if (clause.length <= max) { cur = clause; continue; }
    const units = script === "cjk" ? [...clause] : clause.split(/\s+/);
    for (const u of units) {
      const next = script === "cjk" ? cur + u : (cur + " " + u).trim();
      if (next.length > max) { push(); cur = u; } else cur = next;
    }
  }
  push();
  return out;
}

/** Which chunk is on screen at `frame`, timed by character share of `frames`. */
export function chunkAt(chunks: string[], frame: number, frames: number): { index: number; local: number } {
  const total = chunks.reduce((n, c) => n + c.length, 0) || 1;
  let start = 0;
  for (let i = 0; i < chunks.length; i++) {
    const len = (chunks[i]!.length / total) * frames;
    if (frame < start + len || i === chunks.length - 1) return { index: i, local: frame - start };
    start += len;
  }
  return { index: 0, local: frame };
}
