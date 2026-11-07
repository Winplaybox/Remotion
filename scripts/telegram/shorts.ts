/**
 * Long video -> Shorts: clip selection on transcript sentence boundaries (pure, tested).
 * make-shorts.ts does download, transcription (faster-whisper), Gemini highlight picking and rendering.
 */
import { z } from "zod";

export interface Word { start: number; end: number; word: string }
export interface Segment { start: number; end: number; text: string; words?: Word[] }
export interface Clip { start: number; end: number; title: string; hook: string; hashtags: string[] }

export const ClipsSchema = z.object({
  clips: z.array(z.object({
    start: z.number().min(0),
    end: z.number().positive(),
    title: z.string().min(1).max(100),
    hook: z.string().max(80).default(""),
    hashtags: z.array(z.string().max(40)).max(10).default([])
  })).min(1).max(10)
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
  return `You are a YouTube Shorts editor. From this timestamped transcript of a long video, pick the ${count} best self-contained moments for vertical Shorts.
Each clip: about ${target} seconds (between ${Math.max(15, target - 15)} and ${Math.min(90, target + 20)}), starts at the beginning of a sentence and ends at the end of a sentence (use the timestamps given), has a strong hook in the first seconds, does not overlap other clips, and makes sense without the rest of the video.
For each clip give: start, end (seconds), title (YouTube Shorts title, max 70 chars, ${language === "english" ? "English" : "Hinglish in Roman script"}), hook (max 6 words shown on screen in the first 3 seconds), hashtags (4-6, include #shorts).
Never cut in the middle of a sentence or a dialogue. Output ONLY JSON: {"clips":[{"start":0,"end":0,"title":"","hook":"","hashtags":[]}]}

Transcript:
${transcriptForPrompt(segs)}`;
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
  for (const c of raw) {
    if (c.end <= c.start || c.start >= duration) continue;
    let [s, e] = snapToSentences(segs, c.start, Math.min(c.end, duration));
    if (e - s > 90) e = snapToSentences(segs, s, s + 90)[1];
    if (e - s < 8) continue;
    if (out.some((o) => s < o.end && e > o.start)) continue;
    out.push({ start: +s.toFixed(2), end: +e.toFixed(2), title: c.title.trim(), hook: (c.hook || c.title).trim().slice(0, 80), hashtags: (c.hashtags.length ? c.hashtags : ["#shorts"]).map((h) => (h.startsWith("#") ? h : `#${h}`).replace(/\s+/g, "")) });
    if (out.length >= count) break;
  }
  return out.sort((a, b) => a.start - b.start);
}

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
    windows.push({ start: segs[i]!.start, end, score: (words / len) * q, text: segs[i]!.text });
  }
  windows.sort((a, b) => b.score - a.score);
  const out: Clip[] = [];
  for (const w of windows) {
    if (out.some((o) => w.start < o.end + 2 && w.end > o.start - 2)) continue;
    const hook = w.text.split(/\s+/).slice(0, 6).join(" ");
    out.push({ start: +w.start.toFixed(2), end: +w.end.toFixed(2), title: `${hook}… #shorts`.slice(0, 100), hook, hashtags: ["#shorts"] });
    if (out.length >= count) break;
  }
  return out.sort((a, b) => a.start - b.start);
}

/** Words inside a clip, re-timed from 0. */
export function clipWords(segs: Segment[], c: Pick<Clip, "start" | "end">): Word[] {
  const words = segs.flatMap((s) => s.words?.length ? s.words : [{ start: s.start, end: s.end, word: s.text }]);
  return words.filter((w) => w.end > c.start && w.start < c.end).map((w) => ({ start: +(Math.max(0, w.start - c.start)).toFixed(2), end: +(Math.min(c.end, w.end) - c.start).toFixed(2), word: w.word.trim() })).filter((w) => w.word);
}
