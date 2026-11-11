/**
 * Narrator per channel. scripts/narration/narrate.py tries the engines in order and the FIRST that manages every
 * line of a post wins (one voice per video):
 *   1. Kokoro-82M — open model (Apache-2.0, commercial use OK), runs inside Actions, no quota
 *   2. Gemini TTS — most expressive, follows the style direction; needs GEMINI_API_KEY, free tier is rate-limited
 *   3. Edge TTS  — always-there fallback
 * Posts dated before VOICE_SWITCH_DATE keep their existing Edge voice (already in the render buffer).
 */
import { CHANNELS, dateOfPost, type ChannelId } from "./channels";

export type TtsEngine = "kokoro" | "gemini" | "edge";
export interface VoiceProfile {
  engines: TtsEngine[];
  /** Kokoro voice id; the first letter is the language (h Hindi, a American English). */
  kokoro: string;
  kokoroSpeed: number;
  /** Gemini prebuilt voice + how it should sound. */
  gemini: string;
  geminiStyle: string;
  edge: string;
  edgeRate: string;
}

export const VOICE_SWITCH_DATE = "2026-11-15";
const CHAIN: TtsEngine[] = ["kokoro", "gemini", "edge"];

const QUIZ_HOST: VoiceProfile = {
  engines: CHAIN, kokoro: "hf_alpha", kokoroSpeed: 1.05, gemini: "Zephyr",
  geminiStyle: "Say this in Hindi like a bright, energetic quiz-show host — smiling, quick, inviting the viewer to play", edge: "hi-IN-SwaraNeural", edgeRate: "+5%"
};
const CHASE_COMMENTATOR: VoiceProfile = {
  engines: CHAIN, kokoro: "hm_psi", kokoroSpeed: 1.08, gemini: "Fenrir",
  geminiStyle: "Say this in Hindi like an excited street-race commentator — high energy, punchy, building suspense", edge: "hi-IN-MadhurNeural", edgeRate: "+8%"
};
const KATHAVACHAK: VoiceProfile = {
  engines: CHAIN, kokoro: "hm_omega", kokoroSpeed: 0.92, gemini: "Charon",
  geminiStyle: "Say this in Hindi like a calm, deep, devotional storyteller (kathavachak) — warm, unhurried, reverent", edge: "hi-IN-MadhurNeural", edgeRate: "+0%"
};
const DETECTIVE: VoiceProfile = {
  engines: CHAIN, kokoro: "hm_omega", kokoroSpeed: 1.0, gemini: "Algenib",
  geminiStyle: "Say this in Hindi like a witty desi detective revealing clues — low, suspenseful, a little playful", edge: "hi-IN-MadhurNeural", edgeRate: "+3%"
};
const CODE_HOST_EN: VoiceProfile = {
  engines: CHAIN, kokoro: "af_heart", kokoroSpeed: 1.0, gemini: "Kore",
  geminiStyle: "Say this like a clear, confident puzzle-show host — crisp and engaging", edge: "en-US-AriaNeural", edgeRate: "+5%"
};

/** Chosen per channel and format. Long videos use their Shorts channel's narrator (same brand). */
export const VOICES: Partial<Record<ChannelId, VoiceProfile>> = {
  "chakra-puzzle": QUIZ_HOST,
  "chakra-marathon": QUIZ_HOST,
  "kaali-peeli-chase": CHASE_COMMENTATOR,
  "kpc-championship": CHASE_COMMENTATOR,
  epicbharatsaga: KATHAVACHAK,
  "liar-lineup": DETECTIVE,
  "dimaag-lock": CODE_HOST_EN
};

/** Voice for post n: the channel profile from VOICE_SWITCH_DATE on, else null (legacy Edge voice). */
export function voiceProfileFor(channel: ChannelId, n: number): VoiceProfile | null {
  const v = VOICES[channel];
  if (!v) return null;
  let date: string;
  try { date = dateOfPost(channel, n); } catch { return v; }
  return date >= VOICE_SWITCH_DATE ? v : null;
}

/** narrate.py arguments for post n. */
export function narrateArgs(channel: ChannelId, n: number): string[] {
  const v = voiceProfileFor(channel, n);
  const legacy = (CHANNELS[channel] as { voiceName?: string }).voiceName || process.env.EDGE_TTS_VOICE || "hi-IN-MadhurNeural";
  if (!v) return ["--engine", "edge", "--edge-voice", legacy];
  return ["--engine", "auto", "--engines", v.engines.join(","), "--kokoro-voice", v.kokoro, "--kokoro-speed", String(v.kokoroSpeed),
    "--gemini-voice", v.gemini, "--gemini-style", v.geminiStyle, "--edge-voice", v.edge, "--edge-rate", v.edgeRate];
}
