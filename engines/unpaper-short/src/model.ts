/**
 * ENGINE UNPAPER_SHORT — "Unpaper: Decode What Matters." AI-paper explainer Shorts (1080x1920, ~170-178 s).
 * Not a puzzle: no AskOutro, no answer comment. Episodes are authored JSON in content/unpaper/epNNN.json
 * (every scene: caption in Roman Hinglish, tts in Devanagari, a page cite). Narration is pre-rendered per scene
 * into public/unpaper/<episode>/sceneNN.mp3 and played by the composition itself, so no voiceLines here.
 * Deterministic: a post number maps to one authored episode, nothing random.
 */
import { z } from "zod";
import { UNPAPER_EP001 } from "../../../content/unpaper/ep001";

export const FPS = 30;

const SceneSchema = z.object({
  type: z.string(),
  seconds: z.number().positive(),
  caption: z.string(),
  tts: z.string(),
  cite: z.string().optional(),
  audio: z.string(),
  props: z.record(z.unknown()).default({})
}).passthrough();

export const UnpaperShortSchema = z.object({
  episode: z.object({
    id: z.string(),
    title: z.string(),
    source: z.object({ title: z.string().optional(), url: z.string().optional() }).passthrough(),
    scenes: z.array(SceneSchema).min(1)
  })
});
export type UnpaperShort = z.infer<typeof UnpaperShortSchema>;

/** Authored episodes, in publish order. Add new ones here (content/unpaper/epNNN.json). */
const EPISODES = [UNPAPER_EP001] as unknown as UnpaperShort["episode"][];

export const unpaperEpisodes = () => EPISODES.map((_, i) => i + 1);

export function unpaperShortForDay(day: number): UnpaperShort {
  const d = Math.min(Math.max(1, Math.floor(day)), EPISODES.length);
  return { episode: EPISODES[d - 1]! };
}

export const unpaperShortDuration = (p: UnpaperShort) =>
  Math.round(p.episode.scenes.reduce((a, s) => a + s.seconds, 0) * FPS);
