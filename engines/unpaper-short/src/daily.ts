/**
 * UNPAPER DAILY — date-slot episodes (autopilot).
 *
 * One JSON file per publish slot: content/unpaper/daily/YYYY-MM-DD-am.json (09:00 IST) and -pm.json (19:00 IST).
 * `npm run unpaper:index` regenerates content/unpaper/daily/index.ts from the files in that folder (the publish
 * workflow runs it before planning and rendering, so committing the JSON alone is enough).
 *
 * The publish run for date D, slot S uses exactly that day's file. If the file is missing, does not parse, fails the
 * schema or fails the source gate, the slot is SKIPPED: there is no fallback to an older or repeat episode, and the
 * authored ep001 / ep002 draft are never published from here.
 *
 * Bundle-safe (no fs): Remotion Studio imports this too. File checks (page images on disk) live in
 * channels/unpaper-daily.ts.
 */
import { z } from "zod";
import { UNPAPER_DAILY } from "../../../content/unpaper/daily/index";
import { ProofSchema, ScriptSchema, SeriesSchema, UnpaperCtaSchema, unpaperScenes, type UnpaperEpisode, type UnpaperShort } from "./model";

/** Slot names in file names, in channel slot order (channels.ts "unpaper-short".slots = ["09:00", "19:00"]). */
export const UNPAPER_DAILY_SLOTS = ["am", "pm"] as const;
export type UnpaperDailySlot = (typeof UNPAPER_DAILY_SLOTS)[number];
export const UNPAPER_SLOT_TIMES: Record<UnpaperDailySlot, string> = { am: "09:00", pm: "19:00" };

export const DAILY_FILE_RE = /^(\d{4}-\d{2}-\d{2})-(am|pm)\.json$/;
export const dailyKey = (date: string, slot: UnpaperDailySlot) => `${date}-${slot}`;
export const slotOfIndex = (i: number): UnpaperDailySlot => UNPAPER_DAILY_SLOTS[i] ?? (() => { throw new Error(`unpaper: slot index ${i} out of range`); })();

/** Devanagari letters: the Hindi TTS voice needs the narration in Devanagari (English terms in Latin are fine). */
export const DEVANAGARI = /[\u0900-\u097F]/;

const Seo = z.object({
  /** YouTube title (<= 100 chars, include #shorts). */
  title: z.string().min(1).max(100),
  /** YouTube description: source link, points, links. */
  description: z.string().min(1).max(4900),
  tags: z.array(z.string().min(1)).min(1).max(40),
  /** Instagram / Facebook caption (hashtags included), <= 2200 chars. */
  caption: z.string().min(1).max(2200),
  categoryId: z.string().default("27"),
  language: z.string().default("hi")
});

export const DailyEpisodeSchema = z.object({
  /** Must match the file name. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.enum(UNPAPER_DAILY_SLOTS),
  /** Stable id; also the folder for page images: public/unpaper/<id>/... */
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  series: SeriesSchema.optional(),
  /** On-video episode title. */
  title: z.string().min(1),
  /** The official document every claim is checked against (source gate). */
  sourceUrl: z.string().url().refine((u) => /^https?:\/\//.test(u), "sourceUrl must be http(s)"),
  source: z.object({ title: z.string().min(1), date: z.string().min(1), issuer: z.string().optional() }).passthrough(),
  /** hook -> doc -> 3 points -> aap par asar -> outro; every beat has caption, tts, seconds (+ proof, see the gate). */
  script: ScriptSchema,
  cta: UnpaperCtaSchema.optional(),
  seo: Seo,
  /** Optional pinned-comment text (source link + IG link); not posted automatically yet. */
  pinnedComment: z.string().optional()
}).passthrough();
export type UnpaperDailyEpisode = z.infer<typeof DailyEpisodeSchema>;

const filledProof = (p: unknown) => {
  const r = ProofSchema.safeParse(p);
  return r.success && !!r.data.source.trim() && !!r.data.page.trim() && !!r.data.date.trim();
};

/**
 * Source gate: every claim on screen must carry a proof chip (source · page · date) and the episode must link the
 * source. The outro is the call to action and makes no claim, so it is exempt. Returns the problems (empty = pass).
 */
export function sourceGate(ep: UnpaperDailyEpisode): string[] {
  const out: string[] = [];
  if (!ep.sourceUrl || !/^https?:\/\/\S+$/.test(ep.sourceUrl)) out.push("episode has no sourceUrl");
  const s = ep.script;
  if (!filledProof(s.hook.proof)) out.push("hook has no proof");
  if (!filledProof(s.doc.proof)) out.push("doc has no proof");
  s.points.forEach((p, i) => { if (!filledProof(p.proof)) out.push(`point ${i + 1} has no proof`); });
  if (!filledProof(s.asar.proof)) out.push("asar has no proof");
  return out;
}

/** Narration sanity: every beat has spoken Devanagari text and a positive length. */
export function narrationProblems(ep: UnpaperDailyEpisode): string[] {
  const s = ep.script;
  const beats: [string, { tts: string; caption: string }][] = [["hook", s.hook], ["doc", s.doc], ...s.points.map((p, i) => [`point ${i + 1}`, p] as [string, typeof p]), ["asar", s.asar], ["outro", s.outro]];
  return beats.flatMap(([name, b]) => [
    ...(b.tts.trim() && DEVANAGARI.test(b.tts) ? [] : [`${name}: tts must be Devanagari (English terms in Latin are fine)`]),
    ...(b.caption.trim() ? [] : [`${name}: empty caption`])
  ]);
}

/** Page images an episode needs under public/unpaper/ (checked on disk by channels/unpaper-daily.ts). */
export const dailyImages = (ep: UnpaperDailyEpisode): string[] => [...new Set([ep.script.doc.image, ...ep.script.points.map((p) => p.page)])];

export type DailyLookup =
  | { ok: true; key: string; episode: UnpaperDailyEpisode }
  | { ok: false; key: string; reason: string };

/** The episode for one slot from a raw table (the generated index by default), or why it can't publish. Pure. */
export function lookupDaily(date: string, slot: UnpaperDailySlot, table: Record<string, unknown> = UNPAPER_DAILY): DailyLookup {
  const key = dailyKey(date, slot);
  const raw = table[key];
  if (raw === undefined) return { ok: false, key, reason: `no episode file content/unpaper/daily/${key}.json` };
  const r = DailyEpisodeSchema.safeParse(raw);
  if (!r.success) return { ok: false, key, reason: `invalid episode: ${r.error.issues.slice(0, 5).map((i) => `${i.path.join(".") || "(root)"} ${i.message}`).join("; ")}` };
  const ep = r.data;
  if (ep.date !== date || ep.slot !== slot) return { ok: false, key, reason: `file ${key}.json says date ${ep.date} slot ${ep.slot}` };
  const gate = sourceGate(ep);
  if (gate.length) return { ok: false, key, reason: `source gate: ${gate.join("; ")}` };
  const voice = narrationProblems(ep);
  if (voice.length) return { ok: false, key, reason: `narration: ${voice.join("; ")}` };
  return { ok: true, key, episode: ep };
}

/** Engine props for a daily episode (scenes built from the script). */
export function dailyProps(ep: UnpaperDailyEpisode): UnpaperShort {
  const episode: UnpaperEpisode = {
    id: ep.id,
    title: ep.title,
    ...(ep.series ? { series: ep.series } : {}),
    source: { title: ep.source.title, url: ep.sourceUrl, date: ep.source.date },
    script: ep.script,
    scenes: unpaperScenes(ep.script),
    ...(ep.cta ? { cta: ep.cta } : {})
  };
  return { episode };
}

/** Publish metadata straight from the episode JSON. */
export function dailyMeta(ep: UnpaperDailyEpisode) {
  const seo = ep.seo;
  const title = /#shorts/i.test(seo.title) ? seo.title : `${seo.title} #shorts`.slice(0, 100);
  return {
    title: title.slice(0, 100),
    description: seo.description.includes(ep.sourceUrl) ? seo.description : `${seo.description}\n\nSource: ${ep.sourceUrl}`.slice(0, 4900),
    tags: seo.tags,
    caption: seo.caption,
    language: seo.language,
    categoryId: seo.categoryId
  };
}

/** Every daily key in the index, sorted (for Studio previews and tests). */
export const dailyKeys = (table: Record<string, unknown> = UNPAPER_DAILY) => Object.keys(table).sort();

/** Valid daily episodes as engine props, for Remotion Studio previews (compositions "UnpaperDaily-<key>"). */
export function dailyPreviews(table: Record<string, unknown> = UNPAPER_DAILY): { key: string; props: UnpaperShort }[] {
  return dailyKeys(table).flatMap((key) => {
    const r = DailyEpisodeSchema.safeParse(table[key]);
    return r.success ? [{ key, props: dailyProps(r.data) }] : [];
  });
}
