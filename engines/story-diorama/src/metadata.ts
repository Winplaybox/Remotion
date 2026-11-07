import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { staticFile } from "remotion";
import type { StoryDiorama } from "./model";

/** Stretch every scene that has narration audio so the voice never gets cut. */
export async function withNarrationDurations(p: StoryDiorama): Promise<StoryDiorama> {
  const scenes = await Promise.all(
    p.scenes.map(async (scene) => {
      if (!scene.audio) return scene;
      const dur = await getAudioDurationInSeconds(staticFile(scene.audio));
      return { ...scene, seconds: Math.max(scene.seconds, Math.round((dur + 0.6) * 10) / 10) };
    })
  );
  return { ...p, scenes };
}
