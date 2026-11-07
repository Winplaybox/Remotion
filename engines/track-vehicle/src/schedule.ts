import { random } from "remotion";
import { FPS, SPEED_TIERS } from "./constants";
import type { TrackVehicle } from "./model";

export interface SwapEvent { a: number; b: number; fromA: number; fromB: number; start: number; end: number; bend: number }
export interface Schedule { slots: number; targetCar: number; events: SwapEvent[]; byCar: SwapEvent[][]; answerSlot: number }

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Deterministic shuffle plan. Car i starts in slot i. Frames are relative to the shuffle start.
 * Swaps speed up and overlap more as time passes; `difficulty` scales both.
 */
export function buildSchedule(p: TrackVehicle): Schedule {
  const slots = p.cols * p.rows;
  const targetCar = p.targetSlot >= 0 && p.targetSlot < slots ? p.targetSlot : Math.floor(random(`${p.seed}-target`) * slots);
  const carAt = Array.from({ length: slots }, (_, i) => i);
  const slotOf = Array.from({ length: slots }, (_, i) => i);
  const total = p.shuffleSeconds * FPS;
  const slow = Math.round(42 - p.difficulty * 4);
  const fast = Math.round(20 - p.difficulty * 3.5);
  const events: SwapEvent[] = [];
  const col = (s: number) => s % p.cols;
  const row = (s: number) => Math.floor(s / p.cols);
  const dist = (s1: number, s2: number) => Math.hypot(col(s1) - col(s2), row(s1) - row(s2));
  let t = 0;
  let n = 0;
  // Stepped tiers: each tier has its own swap duration, gap and number of simultaneous swaps.
  const tierDur = [46 - p.difficulty * 4, 30 - p.difficulty * 3, 21 - p.difficulty * 2.5, Math.max(9, 16 - p.difficulty * 2.5)];
  const tierGap = [8, 5, 3, 1];
  const tierOf = (prog: number) => SPEED_TIERS.reduce((k, tier, i) => (prog >= tier.at ? i : k), 0);
  while (t < total - fast) {
    const prog = t / total;
    const tier = tierOf(prog);
    const dur = p.speedTiers ? Math.round(tierDur[tier] ?? fast) : Math.round(lerp(slow, fast, Math.pow(prog, 0.8)));
    if (t + dur > total) break;
    const maxPairs = p.speedTiers
      ? Math.max(1, Math.min(Math.floor(slots / 2), tier === 0 ? 1 : Math.round(tier * 0.6 * p.difficulty)))
      : Math.max(1, Math.min(Math.floor(slots / 2), Math.round(1 + prog * p.difficulty * 1.2)));
    const pairs = 1 + Math.floor(random(`${p.seed}-k${n}`) * maxPairs);
    const free = new Set(Array.from({ length: slots }, (_, i) => i));
    for (let k = 0; k < pairs && free.size >= 2; k++) {
      const pool = [...free];
      let s1: number;
      const tSlot = slotOf[targetCar] ?? 0;
      if (k === 0 && free.has(tSlot) && random(`${p.seed}-b${n}`) < p.targetBias) s1 = tSlot;
      else s1 = pool[Math.floor(random(`${p.seed}-s1-${n}-${k}`) * pool.length)] ?? 0;
      free.delete(s1);
      const rest = [...free];
      const near = rest.filter((s) => dist(s, s1) <= 1.5);
      const choices = near.length && random(`${p.seed}-near${n}-${k}`) < 0.7 ? near : rest;
      const s2 = choices[Math.floor(random(`${p.seed}-s2-${n}-${k}`) * choices.length)] ?? rest[0] ?? 0;
      free.delete(s2);
      const a = carAt[s1] ?? 0, b = carAt[s2] ?? 0;
      events.push({ a, b, fromA: s1, fromB: s2, start: t, end: t + dur, bend: random(`${p.seed}-bend${n}-${k}`) < 0.5 ? 1 : -1 });
      carAt[s1] = b; carAt[s2] = a; slotOf[a] = s2; slotOf[b] = s1;
    }
    t += dur + (p.speedTiers ? (tierGap[tier] ?? 1) : Math.round(lerp(10, 2, prog) / p.difficulty * 1.5));
    n++;
  }
  const byCar: SwapEvent[][] = Array.from({ length: slots }, () => []);
  for (const e of events) { byCar[e.a]?.push(e); byCar[e.b]?.push(e); }
  return { slots, targetCar, events, byCar, answerSlot: slotOf[targetCar] ?? 0 };
}

export interface CarPose { slotFrom: number; slotTo: number; t: number; bend: number; moving: boolean }

/** Where a car is at a given shuffle-relative frame. */
export function carPose(s: Schedule, car: number, f: number): CarPose {
  let slot = car;
  for (const e of s.byCar[car] ?? []) {
    if (f < e.start) break;
    const to = e.a === car ? e.fromB : e.fromA;
    if (f < e.end) return { slotFrom: slot, slotTo: to, t: (f - e.start) / (e.end - e.start), bend: e.bend, moving: true };
    slot = to;
  }
  return { slotFrom: slot, slotTo: slot, t: 0, bend: 1, moving: false };
}
