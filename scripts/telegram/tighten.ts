/**
 * Tighten a spoken clip: cut long silences and immediate false-start repeats ("ye ye ye baat…", "main kehna — main kehna chahta hun").
 * Pure planning (planTighten) + one ffmpeg pass (cutKeep). Always safe to skip: any failure falls back to the untouched clip.
 */
export interface TWord { start: number; end: number; word: string }
export interface TightenOpts { /** pauses longer than this are shortened */ minGap?: number; /** pause left in place of a removed one */ keepGap?: number; /** give up (return untouched) if less than this share of the clip would remain */ minShare?: number; /** ignore savings below this (seconds) */ minSaving?: number }
export interface TightenPlan { keep: [number, number][]; words: TWord[]; duration: number; removed: number; changed: boolean }

const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

/** Indexes of words that are the FIRST copy of an immediately repeated 1-3 word phrase (a stumble / false start). */
export function falseStarts(words: TWord[]): Set<number> {
  const drop = new Set<number>();
  const n = words.length;
  for (let i = 0; i < n; i++) {
    if (drop.has(i)) continue;
    for (let len = 3; len >= 1; len--) {
      if (i + 2 * len > n) continue;
      const gap = words[i + len]!.start - words[i + len - 1]!.end;
      if (gap > 1.0) continue;
      let same = true;
      for (let k = 0; k < len && same; k++) { const a = norm(words[i + k]!.word), b = norm(words[i + len + k]!.word); same = a.length > 0 && a === b; }
      // A single repeated word only counts if it is not a short filler that can be repeated on purpose ("na na", "ha ha").
      if (same && len === 1 && norm(words[i]!.word).length < 3) same = false;
      if (same) { for (let k = 0; k < len; k++) drop.add(i + k); i += len - 1; break; }
    }
  }
  return drop;
}

export function planTighten(words: TWord[], duration: number, o: TightenOpts = {}): TightenPlan {
  const minGap = o.minGap ?? 0.7, keepGap = o.keepGap ?? 0.3, minShare = o.minShare ?? 0.4, minSaving = o.minSaving ?? 0.6;
  const identity: TightenPlan = { keep: [[0, duration]], words, duration, removed: 0, changed: false };
  const clean = words.filter((w) => w.end > w.start && Number.isFinite(w.start) && Number.isFinite(w.end));
  if (clean.length < 4 || duration < 4) return identity;
  const drop = falseStarts(clean);
  const kept = clean.filter((_, i) => !drop.has(i));
  if (!kept.length) return identity;
  const padB = keepGap * 0.4, padA = keepGap * 0.6;
  // Intervals of speech we keep. Split wherever a long pause or a removed false start sits between two kept words.
  const spans: [number, number][] = [];
  let cur: [number, number] = [Math.max(0, kept[0]!.start - 0.3), kept[0]!.end + padA];
  for (let i = 1; i < kept.length; i++) {
    const prev = kept[i - 1]!, w = kept[i]!;
    const removedBetween = clean.some((c, ci) => drop.has(ci) && c.start >= prev.end - 1e-6 && c.end <= w.start + 1e-6);
    if (w.start - prev.end > minGap || removedBetween) { spans.push(cur); cur = [Math.max(prev.end + padA, w.start - padB), w.end + padA]; }
    else cur[1] = w.end + padA;
  }
  cur[1] = Math.min(duration, cur[1] + 0.2);
  spans.push(cur);
  const keep: [number, number][] = [];
  for (const [a, b] of spans) {
    const s = Math.max(0, a), e = Math.min(duration, b);
    if (e - s < 0.2) continue;
    const last = keep[keep.length - 1];
    if (last && s <= last[1] + 1e-6) last[1] = Math.max(last[1], e); else keep.push([+s.toFixed(3), +e.toFixed(3)]);
  }
  const total = keep.reduce((t, [a, b]) => t + (b - a), 0);
  const removed = duration - total;
  if (removed < minSaving || total / duration < minShare) return identity;
  // Re-time the kept words onto the new timeline.
  const out: TWord[] = [];
  let offset = 0;
  for (const [a, b] of keep) {
    for (const [ci, w] of clean.entries()) if (!drop.has(ci) && w.start >= a - 1e-6 && w.start < b) out.push({ word: w.word, start: +(w.start - a + offset).toFixed(2), end: +(Math.min(w.end, b) - a + offset).toFixed(2) });
    offset += b - a;
  }
  return { keep, words: out, duration: +total.toFixed(2), removed: +removed.toFixed(2), changed: true };
}

/** ffmpeg filter graph that trims `keep` ranges out of input 0 and concatenates them (video + optional audio). */
export function cutFilter(keep: [number, number][], hasAudio: boolean): string {
  const parts: string[] = [];
  keep.forEach(([a, b], i) => {
    parts.push(`[0:v]trim=start=${a}:end=${b},setpts=PTS-STARTPTS[v${i}]`);
    if (hasAudio) parts.push(`[0:a]atrim=start=${a}:end=${b},asetpts=PTS-STARTPTS[a${i}]`);
  });
  const ins = keep.map((_, i) => `[v${i}]${hasAudio ? `[a${i}]` : ""}`).join("");
  parts.push(`${ins}concat=n=${keep.length}:v=1:a=${hasAudio ? 1 : 0}[v]${hasAudio ? "[a]" : ""}`);
  return parts.join(";");
}
