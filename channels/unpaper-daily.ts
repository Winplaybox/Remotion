/**
 * Unpaper autopilot, node side: post number <-> date + slot, and the checks that need the disk.
 * Post n of "unpaper-short" is the date dateOfPost(n) (from START_UNPAPER_SHORT) and slot (n - 1) % 2 (0 = am 09:00,
 * 1 = pm 19:00); its content is content/unpaper/daily/<date>-<am|pm>.json. See engines/unpaper-short/src/daily.ts.
 */
import fs from "node:fs";
import path from "node:path";
import { dailyImages, dailyMeta, dailyProps, lookupDaily, slotOfIndex, type DailyLookup, type UnpaperDailySlot } from "../engines/unpaper-short/src/daily";
import { CHANNELS, dateOfPost, type PostMeta } from "./channels";

const ID = "unpaper-short" as const;

/** Date + slot name of post n (throws if n is out of range). */
export function unpaperSlotOfPost(n: number): { date: string; slot: UnpaperDailySlot } {
  const slots = CHANNELS[ID].slots.length;
  return { date: dateOfPost(ID, n), slot: slotOfIndex((n - 1) % slots) };
}

/** Lookup + disk checks (page images present under public/unpaper/). */
export function unpaperLookup(n: number, publicDir = path.resolve("public")): DailyLookup {
  let at: { date: string; slot: UnpaperDailySlot };
  try { at = unpaperSlotOfPost(n); } catch (e) { return { ok: false, key: `post-${n}`, reason: (e as Error).message }; }
  const r = lookupDaily(at.date, at.slot);
  if (!r.ok) return r;
  const missing = dailyImages(r.episode).filter((img) => !fs.existsSync(path.join(publicDir, "unpaper", img)));
  if (missing.length) return { ok: false, key: r.key, reason: `page image(s) missing in public/unpaper/: ${missing.join(", ")}` };
  return r;
}

export const unpaperSkipReason = (n: number): string | undefined => { const r = unpaperLookup(n); return r.ok ? undefined : `${r.key}: ${r.reason}`; };

function must(n: number) {
  const r = unpaperLookup(n);
  if (!r.ok) throw new Error(`Unpaper ${r.key}: ${r.reason} — slot is skipped, nothing is published`);
  return r.episode;
}

export const unpaperDailyForPost = (n: number) => dailyProps(must(n));
export const unpaperMetaForPost = (n: number): PostMeta => dailyMeta(must(n));
