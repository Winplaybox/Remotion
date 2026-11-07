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
  accent: z.string().default("#FFD23F")
});
export type ShortClip = z.infer<typeof ShortClipSchema>;

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
  hook: "YE SACH HAI?", handle: "", accent: "#FFD23F"
};
