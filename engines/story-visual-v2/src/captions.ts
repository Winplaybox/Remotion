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
  // Spaced scripts break only at "punctuation + space" (keeps "¡La voy a atrapar!, gritó" and "..." whole); Japanese
  // breaks after 、。！？ unless a closing quote follows, and is re-joined without spaces.
  const spaced = /\s/.test(text.trim());
  const sep = spaced ? " " : "";
  const clauses = (spaced ? text.split(/(?<=[।.!?؟،,、。！？…])\s+/u) : text.split(/(?<=[、。！？](?![」』）]))/u)).map((s) => s.trim()).filter(Boolean);
  const out: string[] = [];
  let cur = "";
  const push = () => { if (cur.trim()) out.push(cur.trim()); cur = ""; };
  for (const clause of clauses) {
    if ((cur + sep + clause).trim().length <= max) { cur = (cur + sep + clause).trim(); continue; }
    push();
    if (clause.length <= max) { cur = clause; continue; }
    // Too long for one chunk: the fewest near-equal pieces at word (CJK: character) boundaries, so no chunk is a
    // lonely last word ("था।").
    const units = spaced ? clause.split(/\s+/) : [...clause];
    const join = (u: string[]) => u.join(sep);
    const target = clause.length / Math.ceil(clause.length / max);
    let piece: string[] = [];
    for (const u of units) {
      const now = join(piece).length;
      const next = join([...piece, u]).length;
      if (piece.length && (next > max || (now >= target * 0.6 && Math.abs(next - target) > Math.abs(now - target)))) { out.push(join(piece)); piece = [u]; } else piece.push(u);
    }
    cur = join(piece);
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

/** Episode caption box: <= 2 lines inside the Shorts safe area (left margin 90, right action rail 130 + 20). */
export const EPISODE_CAPTION = { width: 1080 - 90 - 130 - 20, size: (script: StoryText["script"]) => (script === "cjk" ? 46 : 52) } as const;

/** The exact chunks an episode page shows; scripts/mindnest-v2-voice.ts narrates them one by one for exact timing. */
export function episodeChunks(text: string, script: StoryText["script"]): string[] {
  return chunkCaption(text, script, EPISODE_CAPTION.size(script), EPISODE_CAPTION.width);
}
