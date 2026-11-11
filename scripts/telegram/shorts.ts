/**
 * Long video -> Shorts: clip selection on transcript sentence boundaries (pure, tested).
 * make-shorts.ts does download, transcription (faster-whisper), Gemini highlight picking and rendering.
 */
import { z } from "zod";

export interface Word { start: number; end: number; word: string }
export interface Segment { start: number; end: number; text: string; words?: Word[] }
export interface Clip { start: number; end: number; title: string; hook: string; hashtags: string[]; /** 0-100 virality estimate */ score: number; /** one line: why this moment works (shown to the user) */ reason: string; /** short voice-over line that introduces the clip in the highlight reel */ intro: string }

export const ClipsSchema = z.object({
  clips: z.array(z.object({
    start: z.number().min(0),
    end: z.number().positive(),
    title: z.string().min(1).max(100),
    hook: z.string().max(80).default(""),
    hashtags: z.array(z.string().max(40)).max(10).default([]),
    score: z.number().min(0).max(100).default(0),
    reason: z.string().max(200).default(""),
    intro: z.string().max(140).default("")
  })).min(1).max(20)
});

/** Transcript lines "[12.3-18.9] text" for the prompt (kept under ~24k chars). */
export function transcriptForPrompt(segs: Segment[], maxChars = 24_000): string {
  const lines: string[] = [];
  let n = 0;
  for (const s of segs) {
    const l = `[${s.start.toFixed(1)}-${s.end.toFixed(1)}] ${s.text.trim()}`;
    if (n + l.length > maxChars) break;
    lines.push(l); n += l.length + 1;
  }
  return lines.join("\n");
}

export function highlightsPrompt(segs: Segment[], count: number, target: number, language: string): string {
  return `You are a viral YouTube Shorts / Reels editor. From this timestamped transcript of a long video, find the ${count} MOST VIRAL, trending-worthy moments (return ${Math.min(20, count + 4)} candidates; the best ${count} will be kept).
Score every moment 0-100 for virality using: scroll-stopping hook in the first 2 seconds, strong emotion (shock, laughter, anger, awe), curiosity gap or surprising fact, quotable punchline or controversy, clear payoff, and it makes sense WITHOUT the rest of the video. Be strict: only truly great moments get 80+.
Each clip: about ${target} seconds (between ${Math.max(15, target - 15)} and ${Math.min(90, target + 20)}), starts at the beginning of a sentence and ends at the end of a sentence (use the timestamps given), does not overlap other clips.
For each clip give: start, end (seconds), score (0-100), reason (max 12 words: why it will go viral), title (YouTube Shorts title, max 70 chars, ${language === "english" ? "English" : "Hinglish in Roman script"}), hook (max 6 words shown on screen in the first 3 seconds), intro (one short punchy voice-over line, max 14 words, ${language === "english" ? "English" : "Hinglish"}, that teases this moment for a countdown reel), hashtags (4-6, include #shorts).
Never cut in the middle of a sentence or a dialogue. Output ONLY JSON: {"clips":[{"start":0,"end":0,"score":0,"reason":"","title":"","hook":"","intro":"","hashtags":[]}]}

Transcript:
${transcriptForPrompt(segs)}`;
}

const POWER = /\b(shocking|unbelievable|secret|never|always|worst|best|biggest|crazy|pagal|sach|jhooth|raaz|dhokha|galti|mistake|danger|khatarnak|free|million|crore|lakh|zaroor|warning|truth|saccha|rahasya|insaan|bhagwan|chamatkar)\b/i;
/** Cheap virality signal for a piece of speech (0-100): hook words, questions, numbers, exclamations, speech density. */
export function viralScore(text: string, seconds: number): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  const density = Math.min(1, words / Math.max(1, seconds) / 3.2); // ~3 words/s is lively speech
  const q = (text.match(/\?/g) ?? []).length, ex = (text.match(/!/g) ?? []).length, num = (text.match(/\b\d[\d,.]*\b/g) ?? []).length;
  const power = (text.match(new RegExp(POWER.source, "gi")) ?? []).length;
  return Math.round(Math.min(100, 25 + density * 30 + Math.min(3, q) * 6 + Math.min(3, ex) * 4 + Math.min(3, num) * 4 + Math.min(4, power) * 5));
}

/** Move start to the segment that contains/follows it and end to the segment end that contains/precedes it. */
export function snapToSentences(segs: Segment[], start: number, end: number): [number, number] {
  if (!segs.length) return [start, end];
  const first = segs.find((s) => s.end > start + 0.01) ?? segs[segs.length - 1]!;
  const s0 = start <= first.start ? first.start : (start - first.start < (first.end - first.start) / 2 ? first.start : (segs[segs.indexOf(first) + 1]?.start ?? first.start));
  const containing = [...segs].reverse().find((s) => s.start < end - 0.01) ?? segs[0]!;
  const e0 = end >= containing.end ? containing.end : (containing.end - end < (containing.end - containing.start) / 2 ? containing.end : (segs[segs.indexOf(containing) - 1]?.end ?? containing.end));
  return [Math.max(0, s0), Math.max(s0 + 1, e0)];
}

/** Validate AI clips: snap to sentences, clamp duration, drop overlaps, sort. */
export function cleanClips(raw: z.infer<typeof ClipsSchema>["clips"], segs: Segment[], duration: number, count: number): Clip[] {
  const out: Clip[] = [];
  // Best first: the highest scores win overlaps and the count limit (stable for equal / missing scores).
  for (const c of [...raw].sort((a, b) => b.score - a.score)) {
    if (c.end <= c.start || c.start >= duration) continue;
    let [s, e] = snapToSentences(segs, c.start, Math.min(c.end, duration));
    if (e - s > 90) e = snapToSentences(segs, s, s + 90)[1];
    if (e - s < 8) continue;
    if (out.some((o) => s < o.end && e > o.start)) continue;
    out.push({ start: +s.toFixed(2), end: +e.toFixed(2), title: c.title.trim(), hook: (c.hook || c.title).trim().slice(0, 80), score: c.score || viralScore(segs.filter((x) => x.end > s && x.start < e).map((x) => x.text).join(" "), e - s), reason: c.reason.trim(), intro: c.intro.trim(), hashtags: (c.hashtags.length ? c.hashtags : ["#shorts"]).map((h) => (h.startsWith("#") ? h : `#${h}`).replace(/\s+/g, "")) });
    if (out.length >= count) break;
  }
  return rankClips(out);
}

/** Best first (stable by time for equal scores). */
export const rankClips = (clips: Clip[]): Clip[] => [...clips].sort((a, b) => b.score - a.score || a.start - b.start);

/** Without AI: greedy windows of whole sentences, preferring dense speech, spread across the video. */
export function fallbackClips(segs: Segment[], count: number, target: number): Clip[] {
  const windows: { start: number; end: number; score: number; text: string }[] = [];
  for (let i = 0; i < segs.length; i++) {
    let j = i, words = 0;
    while (j < segs.length && segs[j]!.end - segs[i]!.start < target) { words += segs[j]!.text.split(/\s+/).length; j++; }
    const last = segs[Math.min(j, segs.length - 1)]!;
    const end = j < segs.length ? last.end : segs[segs.length - 1]!.end;
    const len = end - segs[i]!.start;
    if (len < Math.min(target * 0.6, 20)) continue;
    const q = segs.slice(i, j + 1).some((s) => /\?/.test(s.text)) ? 1.15 : 1;
    const text = segs.slice(i, j + 1).map((x) => x.text).join(" ");
    windows.push({ start: segs[i]!.start, end, score: viralScore(text, len) * q, text: segs[i]!.text });
  }
  windows.sort((a, b) => b.score - a.score);
  const out: Clip[] = [];
  for (const w of windows) {
    if (out.some((o) => w.start < o.end + 2 && w.end > o.start - 2)) continue;
    const hook = w.text.split(/\s+/).slice(0, 6).join(" ");
    out.push({ start: +w.start.toFixed(2), end: +w.end.toFixed(2), title: `${hook}… #shorts`.slice(0, 100), hook, hashtags: ["#shorts"], score: Math.min(100, Math.round(w.score)), reason: "energetic, dense speech", intro: "" });
    if (out.length >= count) break;
  }
  return rankClips(out);
}

/** Words inside a clip, re-timed from 0. */
export function clipWords(segs: Segment[], c: Pick<Clip, "start" | "end">): Word[] {
  const words = segs.flatMap((s) => s.words?.length ? s.words : [{ start: s.start, end: s.end, word: s.text }]);
  return words.filter((w) => w.end > c.start && w.start < c.end).map((w) => ({ start: +(Math.max(0, w.start - c.start)).toFixed(2), end: +(Math.min(c.end, w.end) - c.start).toFixed(2), word: w.word.trim() })).filter((w) => w.word);
}


/** One entry of the highlight reel: a clip trimmed (on a sentence end) to at most `maxClip` seconds. */
export interface ReelEntry { rank: number; start: number; end: number; clip: Clip }

/**
 * Countdown plan for the "best of" reel: the top `limit` clips shown from #N down to #1, each capped at `maxClip` seconds
 * (cut on a sentence end), and the total capped at `maxTotal` seconds so the reel stays a valid Short (< 3 min).
 */
export function reelPlan(ranked: Clip[], segs: Segment[], opts: { limit?: number; maxClip?: number; maxTotal?: number } = {}): ReelEntry[] {
  const limit = opts.limit ?? 10, maxClip = opts.maxClip ?? 15, maxTotal = opts.maxTotal ?? 165;
  let picks = ranked.slice(0, limit).map((clip, i) => {
    let end = clip.end;
    if (end - clip.start > maxClip) {
      // Last sentence end inside the cap (never past it); a hard cut only when no sentence fits.
      const e = Math.max(0, ...segs.filter((x) => x.end > clip.start + 6 && x.end <= clip.start + maxClip && x.end <= clip.end).map((x) => x.end));
      end = e > 0 ? e : Math.min(clip.end, clip.start + maxClip);
    }
    return { rank: i + 1, start: clip.start, end, clip };
  });
  // Too long: drop the weakest clips until it fits.
  while (picks.length > 1 && picks.reduce((t, p) => t + (p.end - p.start), 0) > maxTotal) picks = picks.slice(0, -1);
  return picks.reverse(); // countdown: weakest of the kept first, #1 last
}
