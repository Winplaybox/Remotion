import { z } from "zod";
import { buildSchedule } from "./schedule";
import { AskOutroSchema, askOutro, askOutroSeconds, askOutroVoice } from "../../ask-outro";
import { FPS, PHASE, SPEED_TIERS } from "./constants";
export { FPS, PHASE, SPEED_TIERS } from "./constants";

/** Every vehicle the engine can draw (top-down, facing up). Add one in vehicles.tsx and list it here. */
export const VEHICLE_KINDS = ["kaalipeeli", "bestbus", "taxi", "police", "ambulance", "bus", "truck", "sports", "auto", "suv", "firetruck", "schoolbus", "tempo", "scooter", "tractor", "tanker"] as const;
export type VehicleKind = (typeof VEHICLE_KINDS)[number];

const VEHICLE_VOICE: Record<string, string> = {
  "KAALI PEELI": "काली पीली टैक्सी", AUTO: "ऑटो रिक्शा", "BEST BUS": "बेस्ट बस", POLICE: "पुलिस की गाड़ी",
  AMBULANCE: "एम्बुलेंस", TRUCK: "ट्रक", "FIRE BRIGADE": "फायर ब्रिगेड", SCOOTY: "स्कूटी", "SCHOOL BUS": "स्कूल बस", TEMPO: "टेम्पो", TRACTOR: "ट्रैक्टर", TANKER: "टैंकर", "LAAL CAR": "लाल कार", SUV: "एसयूवी"
};


export const TrackVehicleSchema = z.object({
  /** Narration clips (seconds from start). Filled by scripts/post.ts --auto-narrate. */
  voice: z.array(z.object({ src: z.string(), at: z.number().min(0) })).default([]),
  vehicle: z.enum(VEHICLE_KINDS),
  /** Word shown in the title accent, e.g. "TAXI" -> "TRACK THE TAXI". */
  label: z.string().min(1),
  titlePrefix: z.string(),
  questionPrefix: z.string(),
  questionSuffix: z.string(),
  cta: z.string(),
  /** "{n}" is replaced with the answer number. */
  answerLine: z.string(),
  rememberText: z.string(),
  brand: z.string(),
  handle: z.string(),
  level: z.number().int().min(1),
  cols: z.number().int().min(2).max(4),
  rows: z.number().int().min(2).max(5),
  /** Grid slot the target starts in. -1 = seeded random. */
  targetSlot: z.number().int().min(-1),
  seed: z.string().min(1),
  /** Seconds of shuffling (the on-screen countdown). */
  shuffleSeconds: z.number().min(4).max(60),
  /** 1 = calm, 3 = brutal. Controls speed ramp and simultaneous swaps. */
  difficulty: z.number().min(1).max(3),
  /** "Answer in the next video": no reveal, ask viewers to comment; opening card shows the previous level's answer. */
  askMode: z.boolean().default(false),
  /** Shared ask ending (engines/ask-outro.ts). Present in ask mode; replaces the question card. */
  askOutro: AskOutroSchema.optional(),
  introSeconds: z.number().min(0).default(0),
  prevAnswer: z.string().default(""),
  /** Background music, engine, swoosh per swap, horn, ticks (original kit in public/sfx). */
  sound: z.boolean().default(true),
  /** Stepped speed: DHEEMA -> TEZ -> AUR TEZ -> SABSE TEZ, with an on-screen badge. false = old smooth ramp. */
  speedTiers: z.boolean().default(false),
  /** Probability that a swap involves the target (keeps it honest but trackable). */
  targetBias: z.number().min(0).max(1),
  questionSeconds: z.number().min(1),
  /** 0 = no answer reveal (answer in comments tomorrow). */
  answerSeconds: z.number().min(0),
  endCard: z.object({ show: z.boolean(), title: z.string(), line: z.string(), button: z.string(), seconds: z.number().min(0) }),
  colors: z.object({ target: z.string(), decoy: z.string(), trim: z.string(), accent: z.string() })
});

export type TrackVehicle = z.infer<typeof TrackVehicleSchema>;

/** Channel identity: Kaali Peeli Chase. Change names/colours here only. */
export const KPC_BRAND = { brand: "KAALI PEELI CHASE", handle: "@KaaliPeeliChase" } as const;

const ROTATION: { vehicle: VehicleKind; label: string; colors: TrackVehicle["colors"] }[] = [
  { vehicle: "kaalipeeli", label: "KAALI PEELI", colors: { target: "#FFC800", decoy: "#FFC800", trim: "#1A1A1A", accent: "#FFC800" } },
  { vehicle: "auto", label: "AUTO", colors: { target: "#2BD24F", decoy: "#2BD24F", trim: "#FFD400", accent: "#FFD400" } },
  { vehicle: "bestbus", label: "BEST BUS", colors: { target: "#D62828", decoy: "#7A7F88", trim: "#F4E3B5", accent: "#FF4D4D" } },
  { vehicle: "police", label: "POLICE", colors: { target: "#2F6BFF", decoy: "#6B6F78", trim: "#8FB4FF", accent: "#4D8BFF" } },
  { vehicle: "ambulance", label: "AMBULANCE", colors: { target: "#FFFFFF", decoy: "#6B6F78", trim: "#FF4D4D", accent: "#FF4D4D" } },
  { vehicle: "truck", label: "TRUCK", colors: { target: "#FF8A00", decoy: "#6B6F78", trim: "#FFD08A", accent: "#FF8A00" } },
  { vehicle: "sports", label: "LAAL CAR", colors: { target: "#FF2D55", decoy: "#6B6F78", trim: "#FF8FA6", accent: "#FF2D55" } },
  { vehicle: "suv", label: "SUV", colors: { target: "#00C2FF", decoy: "#6B6F78", trim: "#9BE7FF", accent: "#00C2FF" } },
  { vehicle: "firetruck", label: "FIRE BRIGADE", colors: { target: "#E3262C", decoy: "#6B6F78", trim: "#FFD0D0", accent: "#FF4D4D" } },
  { vehicle: "scooter", label: "SCOOTY", colors: { target: "#FF5FA2", decoy: "#7A7F88", trim: "#FFFFFF", accent: "#FF5FA2" } },
  { vehicle: "schoolbus", label: "SCHOOL BUS", colors: { target: "#FFC21A", decoy: "#7A7F88", trim: "#3A2A00", accent: "#FFC21A" } },
  { vehicle: "tempo", label: "TEMPO", colors: { target: "#1F8BFF", decoy: "#6B6F78", trim: "#BFDFFF", accent: "#1F8BFF" } },
  { vehicle: "tractor", label: "TRACTOR", colors: { target: "#2BB34A", decoy: "#6B6F78", trim: "#FFE08A", accent: "#2BB34A" } },
  { vehicle: "tanker", label: "TANKER", colors: { target: "#F2F2F2", decoy: "#6B6F78", trim: "#FF8A00", accent: "#FF8A00" } }
];
const GRIDS = [[3, 3], [3, 4], [3, 4], [4, 4]] as const;

/** Day N of the channel (1-based) -> a complete, deterministic level. */
/**
 * From this level on: harder (bigger grid sooner, longer + faster shuffles, the target always in play).
 * Earlier levels are already rendered/published — never change what they produce.
 */
export const HARD_FROM = 19;
const HARD_GRIDS = [[3, 4], [4, 4], [4, 4], [4, 4]] as const;

export function kaaliPeeliForDay(day: number): TrackVehicle {
  const d = Math.max(1, Math.floor(day));
  const hard = d >= HARD_FROM;
  const v = ROTATION[(d - 1) % ROTATION.length] ?? ROTATION[0]!;
  const week = (d - 1) % 7; // ramps every week, resets with a new vehicle mix
  const [cols, rows] = (hard ? HARD_GRIDS : GRIDS)[Math.min(3, Math.floor(week / 2))] ?? GRIDS[0];
  const long = ["bestbus", "truck", "ambulance", "firetruck", "schoolbus", "tanker"].includes(v.vehicle);
  const base: TrackVehicle = {
    ...KPC_BRAND,
    voice: [],
    sound: true,
    vehicle: v.vehicle,
    label: v.label,
    titlePrefix: "NAZAR RAKHO:",
    questionPrefix: "",
    questionSuffix: " KAHAN HAI?",
    cta: "Comment mein number likho 👇",
    answerLine: "JAWAB: #{n} — sahi pakda?",
    rememberText: "▲ ISE YAAD RAKHO",
    level: d,
    cols,
    rows: long ? Math.min(rows, 3) : rows,
    targetSlot: -1,
    seed: `kpc-${d}`,
    // Levels 1-3 were published with the smooth ramp; keep them identical.
    speedTiers: d > 3,
    shuffleSeconds: hard ? 10 + Math.round(week * 0.6) : 8 + Math.round(week * 0.5),
    difficulty: hard ? Math.min(3, 2 + week * 0.2) : Math.min(3, 1 + week * 0.34),
    targetBias: hard ? 1 : 0.9,
    questionSeconds: 2.5,
    answerSeconds: 2,
    endCard: { show: true, title: "KAALI PEELI CHASE", line: "Kal ka naya vehicle chase challenge miss mat karna!", button: "FOLLOW KARO, KAL NAYA CHALLENGE KHELO", seconds: 5 },
    colors: v.colors,
    askMode: false,
    introSeconds: 0,
    prevAnswer: ""
  };
  if (d < ASK_FROM) return base;
  // From level 4 on: answer in the NEXT video, previous level's answer on the opening card.
  const prev = kaaliPeeliForDay(d - 1);
  const slots = base.cols * base.rows;
  const name = VEHICLE_VOICE[base.label] ?? base.label.toLowerCase();
  const outro = askOutro({
    question: `${base.label} KAHAN HAI?`,
    options: slots <= 8 ? Array.from({ length: slots }, (_, i) => `#${i + 1}`) : [`NUMBER 1-${slots}`],
    voiceQuestion: `${name} कहाँ है? नंबर बताइए।`,
    handle: KPC_BRAND.handle
  });
  return {
    ...base,
    askMode: true,
    askOutro: outro,
    introSeconds: 2.6,
    prevAnswer: `#${buildSchedule(prev).answerSlot + 1}`,
    questionSeconds: askOutroSeconds(outro),
    answerSeconds: 0,
    cta: "AAPKA JAWAB? COMMENT MEIN BATAIYE 👇",
    endCard: { ...base.endCard, show: false, seconds: 0 }
  };
}

/** Levels before this were published with the answer revealed in the same video. */
export const ASK_FROM = 4;

export const TRACK_VEHICLE_DEMO: TrackVehicle = kaaliPeeliForDay(1);
export const TRACK_VEHICLE_VARIANTS: Record<string, Partial<TrackVehicle>> = Object.fromEntries(
  ROTATION.map((r, i) => [r.vehicle, kaaliPeeliForDay(i + 1)])
);


export function trackVehicleDuration(p: TrackVehicle): number {
  return Math.round(p.introSeconds * FPS + PHASE.intro + PHASE.show + PHASE.hide + (p.shuffleSeconds + p.questionSeconds + p.answerSeconds + (p.endCard.show ? p.endCard.seconds : 0)) * FPS);
}



/** Hinglish voice lines (Devanagari so the Hindi TTS voice reads them naturally). answer = 1-based slot number. */
export function kaaliPeeliVoiceLines(p: TrackVehicle, answer: number): { file: string; text: string; at: number }[] {
  const name = VEHICLE_VOICE[p.label] ?? p.label.toLowerCase();
  const o = p.introSeconds;
  const shuffleStart = o + (PHASE.intro + PHASE.show + PHASE.hide) / FPS;
  const questionAt = shuffleStart + p.shuffleSeconds;
  const answerAt = questionAt + p.questionSeconds;
  const lines = [
    ...(p.askMode && o > 0 && p.prevAnswer ? [{ file: "prev.wav", at: 0.2, text: `पिछले लेवल का जवाब: नंबर ${p.prevAnswer.replace("#", "")}।` }] : []),
    { file: "hook.wav", at: o + 0.3, text: `${name} पर नज़र रखो। आँख मत हटाना!` },
    { file: "go.wav", at: shuffleStart, text: "शफल शुरू!" },
    ...(p.speedTiers ? SPEED_TIERS.slice(1).map((t, i) => ({ file: `tier${i + 1}.wav`, at: shuffleStart + p.shuffleSeconds * t.at, text: t.voice })) : []),
    ...(p.askOutro ? askOutroVoice(p.askOutro, questionAt) : [{ file: "question.wav", at: questionAt + 0.1, text: `बताओ, ${name} कहाँ है?` }])
  ];
  if (p.answerSeconds > 0) lines.push({ file: "reveal.wav", at: answerAt + 0.1, text: `जवाब है, नंबर ${answer}!` });
  if (p.endCard.show) lines.push({ file: "outro.wav", at: answerAt + p.answerSeconds + 0.2, text: p.askMode ? "सही जवाब अगली वीडियो में बताएँगे। फॉलो करो!" : "कल का नया व्हीकल चेज़ चैलेंज देखने के लिए फॉलो करो!" });
  return lines;
}
