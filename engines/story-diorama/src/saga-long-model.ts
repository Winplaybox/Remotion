import { z } from "zod";
import { StoryDioramaSchema, FPS, type StoryDiorama } from "./model";

/** A whole season as one 16:9 long video: flat scenes (so narration works like a Short) + chapter markers. */
export const SagaLongSchema = StoryDioramaSchema.extend({
  seasonTitle: z.string(),
  seasonSub: z.string(),
  /** Scenes before the first chapter (intro). */
  introScenes: z.number().int().min(0),
  /** Index of the outro scene (after the last chapter). */
  outroScene: z.number().int().min(0),
  chapters: z.array(z.object({ title: z.string(), tag: z.string(), tagAccent: z.string(), startScene: z.number().int().min(0) })).min(1)
});
export type SagaLong = z.infer<typeof SagaLongSchema>;

export const SAGA_W = 1920, SAGA_H = 1080;

/** Start second of every scene (after narration timing has been applied). */
export function sceneStarts(p: Pick<StoryDiorama, "scenes">): number[] {
  const out: number[] = [];
  let t = 0;
  for (const s of p.scenes) { out.push(t); t += s.seconds; }
  return out;
}

export function sagaLongDuration(p: Pick<StoryDiorama, "scenes">): number {
  return Math.round(p.scenes.reduce((a, s) => a + s.seconds, 0) * FPS);
}

/** Segments rendered as separate Shorts-style dioramas: intro, each chapter, outro (each with its own series header). */
export function sagaSegments(p: SagaLong): { from: number; to: number; tag: string; tagAccent: string; chapter: number }[] {
  const segs: { from: number; to: number; tag: string; tagAccent: string; chapter: number }[] = [];
  if (p.introScenes > 0) segs.push({ from: 0, to: p.introScenes, tag: p.tag, tagAccent: p.tagAccent, chapter: -1 });
  p.chapters.forEach((c, i) => segs.push({ from: c.startScene, to: p.chapters[i + 1]?.startScene ?? p.outroScene, tag: c.tag, tagAccent: c.tagAccent, chapter: i }));
  segs.push({ from: p.outroScene, to: p.scenes.length, tag: p.tag, tagAccent: p.tagAccent, chapter: p.chapters.length });
  return segs;
}
