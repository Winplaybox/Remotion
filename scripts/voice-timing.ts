/**
 * Voice clips must never talk over each other. Given each clip's planned start and real length, push any clip that
 * would start before the previous one has finished (plus a small breath). Order is kept.
 */
export interface TimedCue { src: string; at: number; dur: number }

export function spaceCues<T extends TimedCue>(cues: T[], gap = 0.15): T[] {
  const out = [...cues].sort((a, b) => a.at - b.at).map((c) => ({ ...c }));
  let end = -Infinity;
  for (const c of out) {
    if (c.at < end + gap) c.at = Math.round((end + gap) * 100) / 100;
    end = c.at + c.dur;
  }
  return out;
}
