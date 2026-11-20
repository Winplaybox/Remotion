import { LANGS, mindNestForDay, type MindNestLang } from "../../../content/mindnest/fables";
import type { StoryText } from "./types";

export const SCRIPT: Record<MindNestLang, StoryText["script"]> = { hi: "deva", es: "latin", de: "latin", fil: "latin", ar: "arabic", ja: "cjk", ko: "cjk" };
const nb = (s: string) => s.replace(/\u00a0/g, " ").trim();

/**
 * Adapter from the existing MindNest content (content/mindnest/fables.ts) to the V2 UI text model.
 * `page` is the story page (0-4) whose narration becomes the caption; the headline is always the fable's moral.
 */
export function mindNestStoryText(lang: MindNestLang, fableNo: number, page = 3): StoryText {
  const d = mindNestForDay(lang, fableNo);
  const scene = d.scenes[Math.min(page, d.scenes.length - 1)]!;
  let moralData: { text?: string } = {};
  for (const l of d.scenes[d.scenes.length - 1]!.layers) if (l.kind === "prop" && l.prop === "moralCard") moralData = (l.data ?? {}) as { text?: string };
  const [a = "", b = ""] = (moralData.text ?? "").split("\n").map(nb);
  return {
    lang, rtl: lang === "ar", script: SCRIPT[lang],
    brand: "MINDNEST TALES",
    episode: `EPISODE ${String(fableNo).padStart(2, "0")}`,
    kicker: nb(LANGS[lang].moral),
    headline: [a, b],
    caption: nb(scene.caption)
  };
}
