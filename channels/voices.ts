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
  geminiStyle: "Say this in Hindi like an excited street-race commentator — high energy, punchy, building suspense", edge: "hi-IN-MadhurNeural", edgeRate: "+5%"
};
const KATHAVACHAK: VoiceProfile = {
  engines: CHAIN, kokoro: "hm_omega", kokoroSpeed: 0.92, gemini: "Charon",
  geminiStyle: "Say this in Hindi like a calm, deep, devotional storyteller (kathavachak) — warm, unhurried, reverent", edge: "hi-IN-MadhurNeural", edgeRate: "+5%"
};
const DETECTIVE: VoiceProfile = {
  engines: CHAIN, kokoro: "hm_omega", kokoroSpeed: 1.0, gemini: "Algenib",
  geminiStyle: "Say this in Hindi like a witty desi detective revealing clues — low, suspenseful, a little playful", edge: "hi-IN-MadhurNeural", edgeRate: "+5%"
};
const CODE_HOST_EN: VoiceProfile = {
  engines: CHAIN, kokoro: "af_heart", kokoroSpeed: 1.0, gemini: "Kore",
  geminiStyle: "Say this like a clear, confident puzzle-show host — crisp and engaging", edge: "en-US-AriaNeural", edgeRate: "+5%"
};

const RAIL_HOST: VoiceProfile = {
  engines: CHAIN, kokoro: "hm_psi", kokoroSpeed: 1.05, gemini: "Puck",
  geminiStyle: "Say this in Hindi like an excited railway documentary host — curious, punchy, proud of Indian trains", edge: "hi-IN-MadhurNeural", edgeRate: "+5%"
};
const HORROR_NARRATOR: VoiceProfile = {
  engines: CHAIN, kokoro: "hm_omega", kokoroSpeed: 0.9, gemini: "Charon",
  geminiStyle: "Say this in Hindi like a late-night horror radio storyteller — low, slow, hushed, with tense pauses", edge: "hi-IN-MadhurNeural", edgeRate: "-4%"
};
const NEWS_ANCHOR: VoiceProfile = {
  engines: CHAIN, kokoro: "hm_psi", kokoroSpeed: 1.05, gemini: "Fenrir",
  geminiStyle: "Say this in Hindi like a crisp, urgent breaking-news broadcaster — authoritative, punchy, dramatic", edge: "hi-IN-MadhurNeural", edgeRate: "+5%"
};
const BATTLE_HYPE: VoiceProfile = {
  engines: CHAIN, kokoro: "hm_omega", kokoroSpeed: 1.05, gemini: "Zephyr",
  geminiStyle: "Say this in Hindi like an energetic anime battle tournament announcer — hype, fierce, building up to the winner", edge: "hi-IN-MadhurNeural", edgeRate: "+6%"
};
/** Unpaper: one fixed Edge voice (the scripts are written for it), no engine chain — fast and predictable in the hourly job. */
const UNPAPER_EXPLAINER: VoiceProfile = {
  engines: ["edge"], kokoro: "hm_psi", kokoroSpeed: 1.0, gemini: "Fenrir",
  geminiStyle: "Say this in Hindi like a clear, confident explainer", edge: "hi-IN-MadhurNeural", edgeRate: "+6%"
};
const bedtime = (language: string, kokoro: string, gemini: string, edge: string, engines: TtsEngine[] = CHAIN): VoiceProfile => ({
  engines, kokoro, kokoroSpeed: 0.92, gemini,
  geminiStyle: `Say this in ${language} like a warm, gentle bedtime storyteller for small children — clear, smiling, unhurried`, edge, edgeRate: "-6%"
});
/** Kokoro has no Arabic, German, Korean, Filipino or Vietnamese voice: those go Gemini -> Edge. */
const NO_KOKORO: TtsEngine[] = ["gemini", "edge"];

/** Chosen per channel and format. Long videos use their Shorts channel's narrator (same brand). */
export const VOICES: Partial<Record<ChannelId, VoiceProfile>> = {
  "chakra-puzzle": QUIZ_HOST,
  "chakra-marathon": QUIZ_HOST,
  "kaali-peeli-chase": CHASE_COMMENTATOR,
  "kpc-championship": CHASE_COMMENTATOR,
  epicbharatsaga: KATHAVACHAK,
  "ebs-season-long": KATHAVACHAK,
  "dharm-sankat": KATHAVACHAK,
  "dharm-sankat-long": KATHAVACHAK,
  "kaun-hoon-main": KATHAVACHAK,
  "liar-lineup": DETECTIVE,
  "dimaag-lock": CODE_HOST_EN,
  alltrainreels: RAIL_HOST,
  "bachke-dikhao": CHASE_COMMENTATOR,
  "indian-horror-tapes": HORROR_NARRATOR,
  "breaking-desk": NEWS_ANCHOR,
  "versus-split": BATTLE_HYPE,
  "unpaper-short": UNPAPER_EXPLAINER,
  "mindnest-hi": bedtime("Hindi", "hf_alpha", "Leda", "hi-IN-SwaraNeural"),
  "mindnest-es": bedtime("Spanish", "ef_dora", "Leda", "es-MX-DaliaNeural"),
  "mindnest-ar": bedtime("Arabic", "af_heart", "Leda", "ar-SA-ZariyahNeural", NO_KOKORO),
  "mindnest-de": bedtime("German", "af_heart", "Leda", "de-DE-KatjaNeural", NO_KOKORO),
  "mindnest-ja": bedtime("Japanese", "jf_alpha", "Leda", "ja-JP-NanamiNeural"),
  "mindnest-ko": bedtime("Korean", "af_heart", "Leda", "ko-KR-SunHiNeural", NO_KOKORO),
  "mindnest-fil": bedtime("Filipino", "af_heart", "Leda", "fil-PH-BlessicaNeural", NO_KOKORO),
  "mindnest-en": bedtime("English", "af_heart", "Leda", "en-US-AnaNeural"),
  "mindnest-pt": bedtime("Brazilian Portuguese", "pf_dora", "Leda", "pt-BR-FranciscaNeural"),
  "mindnest-fr": bedtime("French", "ff_siwis", "Leda", "fr-FR-DeniseNeural"),
  "mindnest-vi": bedtime("Vietnamese", "af_heart", "Leda", "vi-VN-HoaiMyNeural", NO_KOKORO)
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
    "--gemini-voice", v.gemini, "--gemini-style", v.geminiStyle, "--edge-voice", v.edge, `--edge-rate=${v.edgeRate}`];
}
