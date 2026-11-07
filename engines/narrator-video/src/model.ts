/**
 * NARRATOR VIDEO — any topic or script as a narrated Short (used by the Telegram bot).
 * A narrator character talks at the bottom, each beat shows a big emoji card + karaoke captions, music underneath.
 * Narrators are presets: look, background set, palette, music and Edge TTS voice. Add one to NARRATORS to add a style.
 */
import { z } from "zod";

export const FPS = 30;
export const TITLE_SECONDS = 2.6;
export const OUTRO_SECONDS = 3.2;

export const SETS = ["night", "noir", "paper", "bright", "board"] as const;
export const ACCESSORIES = ["bun", "hat", "tilak", "cap", "specs"] as const;

export interface Narrator {
  id: string;
  /** Shown on the name plate and in /narrators. */
  label: string;
  /** One line for /narrators. */
  about: string;
  /** Edge TTS voice. */
  voice: string;
  rate: string;
  set: (typeof SETS)[number];
  music: string;
  palette: { bgTop: string; bgBottom: string; accent: string; text: string; card: string };
  look: { skin: string; hair: string; outfit: string; accessory: (typeof ACCESSORIES)[number]; hairStyle: "bun" | "short" | "long" | "bald" };
  /** Gemini persona for /topic scripts. */
  persona: string;
}

export const NARRATORS = {
  dadi: {
    id: "dadi", label: "DADI KI KAHANI", about: "Garam, pyaari dadi — kahaniyan, tyohaar, seekh", voice: "hi-IN-SwaraNeural", rate: "-4%",
    set: "night", music: "sfx/music_saga.mp3",
    palette: { bgTop: "#0E1033", bgBottom: "#2A1B4A", accent: "#FFC857", text: "#FFFFFF", card: "#1D1A44" },
    look: { skin: "#C98B62", hair: "#E8E4DC", outfit: "#B83A4B", accessory: "specs", hairStyle: "bun" },
    persona: "a warm Indian grandmother telling a story to grandchildren at night — simple words, gentle, a small life lesson at the end"
  },
  jasoos: {
    id: "jasoos", label: "JASOOS BHAI", about: "Rahasya, crime, mystery — suspense wala andaaz", voice: "hi-IN-MadhurNeural", rate: "+0%",
    set: "noir", music: "sfx/music_chase.mp3",
    palette: { bgTop: "#07090D", bgBottom: "#1B2230", accent: "#E9B949", text: "#FFFFFF", card: "#141A24" },
    look: { skin: "#B97A55", hair: "#1C1C1C", outfit: "#7A5A3A", accessory: "hat", hairStyle: "short" },
    persona: "a sharp Indian detective narrating with suspense — short punchy lines, clues, a question for the viewer"
  },
  saga: {
    id: "saga", label: "EPIC BHARAT SAGA", about: "Sanatan, itihaas, devi-devta — paper-cutout style", voice: "hi-IN-MadhurNeural", rate: "-2%",
    set: "paper", music: "sfx/music_saga.mp3",
    palette: { bgTop: "#F6E7C8", bgBottom: "#EBCB95", accent: "#B4361F", text: "#2B1A10", card: "#FFF4DE" },
    look: { skin: "#C88A5E", hair: "#2A1A12", outfit: "#E07A1F", accessory: "tilak", hairStyle: "long" },
    persona: "a respectful storyteller of Sanatan Dharma and Indian history — accurate, cites the scripture or source by name, no made-up facts"
  },
  dost: {
    id: "dost", label: "DOST SE SUNO", about: "Fun explainer — science, tech, facts, 'kyun hota hai?'", voice: "hi-IN-MadhurNeural", rate: "+6%",
    set: "bright", music: "sfx/music_puzzle.mp3",
    palette: { bgTop: "#3A2BD9", bgBottom: "#8E2DE2", accent: "#FFE14D", text: "#FFFFFF", card: "#2A1F9E" },
    look: { skin: "#C68A63", hair: "#141414", outfit: "#18B37E", accessory: "cap", hairStyle: "short" },
    persona: "a friendly young Indian explainer — energetic, simple examples from daily Indian life, one surprising fact"
  },
  teacher: {
    id: "teacher", label: "MADAM JI", about: "Padhai, GK, how-to — chalkboard style", voice: "hi-IN-SwaraNeural", rate: "+0%",
    set: "board", music: "sfx/music_puzzle.mp3",
    palette: { bgTop: "#1F3B2D", bgBottom: "#183024", accent: "#FFD166", text: "#F4F1E8", card: "#26473A" },
    look: { skin: "#D19A72", hair: "#1E1410", outfit: "#2E6FD8", accessory: "specs", hairStyle: "long" },
    persona: "a clear Indian school teacher — step by step, numbered points, ends with a quick quiz question for comments"
  }
} satisfies Record<string, Narrator>;

export type NarratorId = keyof typeof NARRATORS;
export const NARRATOR_IDS = Object.keys(NARRATORS) as NarratorId[];

export const BeatSchema = z.object({
  /** On-screen caption (Hinglish, roman). */
  caption: z.string().min(1).max(160),
  /** One emoji shown big on the card. */
  icon: z.string().max(16).default(""),
  /** Voice clip (relative to /public). Empty = silent beat. */
  voice: z.string().default(""),
  seconds: z.number().min(1).max(15)
});
export type Beat = z.infer<typeof BeatSchema>;

export const NarratorVideoSchema = z.object({
  narrator: z.enum(NARRATOR_IDS as [NarratorId, ...NarratorId[]]),
  title: z.string().min(1).max(60),
  beats: z.array(BeatSchema).min(1).max(20),
  /** Last card, e.g. "Pasand aaya? Follow karo!" */
  outro: z.string().default("Pasand aaya? FOLLOW karo! 🙏"),
  handle: z.string().default(""),
  sound: z.boolean().default(true)
});
export type NarratorVideo = z.infer<typeof NarratorVideoSchema>;

export const beatStarts = (p: NarratorVideo) => {
  let t = TITLE_SECONDS;
  return p.beats.map((b) => { const s = t; t += b.seconds; return s; });
};
export const narratorVideoSeconds = (p: NarratorVideo) => TITLE_SECONDS + p.beats.reduce((s, b) => s + b.seconds, 0) + OUTRO_SECONDS;
export const narratorVideoDuration = (p: NarratorVideo) => Math.round(narratorVideoSeconds(p) * FPS);

export const NARRATOR_DEMO: NarratorVideo = {
  narrator: "dadi",
  title: "DIWALI PE DIYE KYUN?",
  beats: [
    { caption: "Bachcho, kabhi socha hai Diwali pe hum diye kyun jalaate hain?", icon: "🪔", voice: "", seconds: 4 },
    { caption: "Jab Shri Ram 14 saal ke vanvaas ke baad Ayodhya laute…", icon: "🏹", voice: "", seconds: 4 },
    { caption: "…toh poori Ayodhya ne ghee ke diye jalaakar unka swagat kiya.", icon: "✨", voice: "", seconds: 4.5 },
    { caption: "Diya andhere pe roshni ki jeet ka nishaan hai.", icon: "🌙", voice: "", seconds: 4 },
    { caption: "Toh is Diwali, ek diya kisi aur ke ghar bhi jalaana!", icon: "❤️", voice: "", seconds: 4 }
  ],
  outro: "Pasand aaya? FOLLOW karo! 🙏",
  handle: "",
  sound: true
};
