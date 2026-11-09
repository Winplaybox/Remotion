import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { staticFile } from "remotion";
import { liarLineupVoiceLines, type LiarLineup } from "./model";

/**
 * Render-time timing: measure every voice clip, stretch the beats so no line is cut or overlaps the next,
 * then move each voice cue to its beat's new start. Without voice (silent preview) props are unchanged.
 */
export async function withSpokenDurations(p: LiarLineup): Promise<LiarLineup> {
  if (!p.voice.length) return p;
  const spoken: Record<string, number> = {};
  await Promise.all(
    p.voice.map(async (v) => {
      const file = v.src.split("/").pop()!;
      try { spoken[file] = await getAudioDurationInSeconds(staticFile(v.src)); } catch { /* missing clip: keep estimate */ }
    })
  );
  const q = spoken["ask_q.wav"];
  const c = spoken["ask_cta.wav"];
  const askOutro = {
    ...p.askOutro,
    ...(q !== undefined ? { questionSeconds: Math.max(p.askOutro.questionSeconds, Math.round((q + 0.5) * 10) / 10) } : {}),
    ...(c !== undefined ? { ctaSeconds: Math.max(p.askOutro.ctaSeconds, Math.round((c + 0.7) * 10) / 10) } : {})
  };
  const timed: LiarLineup = { ...p, spoken, askOutro };
  const at = new Map(liarLineupVoiceLines(timed).map((l) => [l.file, l.at]));
  return { ...timed, voice: p.voice.map((v) => ({ ...v, at: at.get(v.src.split("/").pop()!) ?? v.at })) };
}
