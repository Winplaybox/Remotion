/**
 * TOON VIDEO — a real video restyled in Remotion only (no AI model): SVG filter chains per frame
 * (smoothing, posterize, colour boost, edge lines, halftone, paper, displacement). Used by the Telegram bot (/style).
 * Opens with a before/after swipe (real -> styled), keeps the original audio.
 */
import { z } from "zod";

export const FPS = 30;
export const MAX_SECONDS = 90;

export const TOON_STYLES = {
  cartoon: { label: "CARTOON", about: "Bold colours + black outlines", accent: "#FFD23F" },
  anime: { label: "ANIME", about: "Soft glow, bright colours, thin lines", accent: "#FF7BAC" },
  comic: { label: "COMIC", about: "Comic book: few colours, halftone dots, thick ink", accent: "#FF3B30" },
  sketch: { label: "SKETCH", about: "Pencil drawing on paper", accent: "#2B2B2B" },
  watercolor: { label: "WATERCOLOR", about: "Painted, soft edges, paper texture", accent: "#4FA3D9" }
} as const;
export type ToonStyle = keyof typeof TOON_STYLES;
export const TOON_STYLE_IDS = Object.keys(TOON_STYLES) as ToonStyle[];

export const ToonVideoSchema = z.object({
  /** Video path relative to /public (e.g. "tg/abc/in.mp4") or an https URL. */
  src: z.string().min(1),
  style: z.enum(TOON_STYLE_IDS as [ToonStyle, ...ToonStyle[]]),
  /** Length of the input clip in seconds (probed by the pipeline). */
  seconds: z.number().min(1).max(MAX_SECONDS),
  /** Source size, so portrait/landscape clips are framed correctly. */
  width: z.number().int().positive().default(1080),
  height: z.number().int().positive().default(1920),
  /** Optional caption on top (e.g. what the user typed). */
  title: z.string().max(60).default(""),
  /** Real -> styled swipe at the start. */
  showBefore: z.boolean().default(true),
  handle: z.string().default("")
});
export type ToonVideo = z.infer<typeof ToonVideoSchema>;

export const toonVideoDuration = (p: ToonVideo) => Math.max(1, Math.round(p.seconds * FPS));

export const TOON_DEMO: ToonVideo = { src: "tg/demo/in.mp4", style: "cartoon", seconds: 8, width: 1080, height: 1920, title: "", showBefore: true, handle: "" };
