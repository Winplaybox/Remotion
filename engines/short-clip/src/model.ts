/** SHORT CLIP — one vertical Short cut from a long video: 9:16 framing, word-by-word captions, hook, progress bar. */
import { z } from "zod";

export const FPS = 30;

export const ShortClipSchema = z.object({
  /** Source video relative to /public or https URL. */
  src: z.string().min(1),
  /** Clip range in the source (seconds). */
  start: z.number().min(0),
  end: z.number().positive(),
  width: z.number().int().positive().default(1920),
  height: z.number().int().positive().default(1080),
  /** "fit": whole frame + blurred fill (landscape talks); "crop": centre crop to fill 9:16. */
  framing: z.enum(["fit", "crop"]).default("fit"),
  /** Word timings relative to the clip start. */
  words: z.array(z.object({ start: z.number(), end: z.number(), word: z.string() })).default([]),
  hook: z.string().max(80).default(""),
  handle: z.string().default(""),
  accent: z.string().default("#FFD23F"),
  /** Branding overlay: channel name pill (top-left) + optional logo under /public. */
  brand: z.string().max(40).default(""),
  logo: z.string().default(""),
  /** Rank badge for countdown reels ("#3"); empty = none. */
  badge: z.string().max(8).default(""),
  /** Voice-over mp3 (under /public) that plays at the start while the original audio is ducked. */
  voice: z.string().default(""),
  voiceSeconds: z.number().min(0).default(0),
  /** Fade-in flash on the first frames (used between reel clips). */
  flash: z.boolean().default(false),
  /** Sound effect from public/sfx played at the start ("whoosh" | "ding" | "pop"); empty = none. */
  sfx: z.enum(["", "whoosh", "ding", "pop"]).default("")
});
export type ShortClip = z.infer<typeof ShortClipSchema>;

export const HighlightReelSchema = z.object({
  title: z.string().max(80).default("TOP 10 MOMENTS"),
  subtitle: z.string().max(80).default(""),
  intro: z.string().default(""), // optional voice-over mp3 for the title card
  introSeconds: z.number().min(0).default(0),
  cta: z.string().max(60).default("Follow for more"),
  clips: z.array(ShortClipSchema).min(1).max(12),
  accent: z.string().default("#FFD23F"),
  brand: z.string().max(40).default(""),
  logo: z.string().default("")
});
export type HighlightReel = z.infer<typeof HighlightReelSchema>;
export const REEL_INTRO = 3, REEL_OUTRO = 2.5;
export const reelDuration = (r: HighlightReel) => Math.round((REEL_INTRO + r.clips.reduce((t, c) => t + (c.end - c.start), 0) + REEL_OUTRO) * FPS);

export const ShortThumbSchema = z.object({
  src: z.string().min(1), at: z.number().min(0).default(1), width: z.number().int().positive().default(1920), height: z.number().int().positive().default(1080),
  title: z.string().max(80), accent: z.string().default("#FFD23F"), brand: z.string().default(""), logo: z.string().default(""), badge: z.string().default("")
});
export type ShortThumb = z.infer<typeof ShortThumbSchema>;

export const shortClipDuration = (p: ShortClip) => Math.max(1, Math.round((p.end - p.start) * FPS));

/** Caption pages of up to `size` words; a new page also starts after a pause > 0.6 s. */
export function captionPages(words: ShortClip["words"], size = 4) {
  const pages: { start: number; end: number; words: ShortClip["words"] }[] = [];
  for (const w of words) {
    const cur = pages[pages.length - 1];
    if (!cur || cur.words.length >= size || w.start - cur.end > 0.6) pages.push({ start: w.start, end: w.end, words: [w] });
    else { cur.words.push(w); cur.end = w.end; }
  }
  return pages;
}

export const SHORT_CLIP_DEMO: ShortClip = {
  src: "tg/demo/in.mp4", start: 0, end: 6, width: 1920, height: 1080, framing: "fit",
  words: [{ start: 0.2, end: 0.6, word: "Kya" }, { start: 0.6, end: 1.0, word: "aapko" }, { start: 1.0, end: 1.4, word: "pata" }, { start: 1.4, end: 1.9, word: "hai?" }, { start: 2.3, end: 2.8, word: "Ye" }, { start: 2.8, end: 3.4, word: "sach" }, { start: 3.4, end: 4.0, word: "hai!" }],
  hook: "YE SACH HAI?", handle: "", accent: "#FFD23F", brand: "", logo: "", badge: "", voice: "", voiceSeconds: 0, flash: false, sfx: ""
};
