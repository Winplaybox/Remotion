import { z } from "zod";

/** Every vehicle the engine can draw (top-down, facing up). Add one in vehicles.tsx and list it here. */
export const VEHICLE_KINDS = ["kaalipeeli", "bestbus", "taxi", "police", "ambulance", "bus", "truck", "sports", "auto", "suv"] as const;
export type VehicleKind = (typeof VEHICLE_KINDS)[number];

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
  { vehicle: "kaalipeeli", label: "TAXI", colors: { target: "#FFC800", decoy: "#FFC800", trim: "#1A1A1A", accent: "#FFC800" } },
  { vehicle: "auto", label: "RICKSHAW", colors: { target: "#2BD24F", decoy: "#2BD24F", trim: "#FFD400", accent: "#FFD400" } },
  { vehicle: "bestbus", label: "RED BUS", colors: { target: "#D62828", decoy: "#7A7F88", trim: "#F4E3B5", accent: "#FF4D4D" } },
  { vehicle: "police", label: "POLICE", colors: { target: "#2F6BFF", decoy: "#6B6F78", trim: "#8FB4FF", accent: "#4D8BFF" } },
  { vehicle: "ambulance", label: "AMBULANCE", colors: { target: "#FFFFFF", decoy: "#6B6F78", trim: "#FF4D4D", accent: "#FF4D4D" } },
  { vehicle: "truck", label: "TRUCK", colors: { target: "#FF8A00", decoy: "#6B6F78", trim: "#FFD08A", accent: "#FF8A00" } },
  { vehicle: "sports", label: "RED CAR", colors: { target: "#FF2D55", decoy: "#6B6F78", trim: "#FF8FA6", accent: "#FF2D55" } },
  { vehicle: "suv", label: "SUV", colors: { target: "#00C2FF", decoy: "#6B6F78", trim: "#9BE7FF", accent: "#00C2FF" } }
];
const GRIDS = [[3, 3], [3, 4], [3, 4], [4, 4]] as const;

/** Day N of the channel (1-based) -> a complete, deterministic level. */
export function kaaliPeeliForDay(day: number): TrackVehicle {
  const d = Math.max(1, Math.floor(day));
  const v = ROTATION[(d - 1) % ROTATION.length] ?? ROTATION[0]!;
  const week = (d - 1) % 7; // ramps every week, resets with a new vehicle mix
  const [cols, rows] = GRIDS[Math.min(3, Math.floor(week / 2))] ?? GRIDS[0];
  const long = v.vehicle === "bestbus" || v.vehicle === "truck" || v.vehicle === "ambulance";
  return {
    ...KPC_BRAND,
    voice: [],
    vehicle: v.vehicle,
    label: v.label,
    titlePrefix: "TRACK THE",
    questionPrefix: "WHERE'S THE",
    questionSuffix: "?",
    cta: "Comment the number 👇  •  Follow for daily levels",
    answerLine: "ANSWER: #{n} — did you get it?",
    rememberText: "▲ REMEMBER THIS ONE",
    level: d,
    cols,
    rows: long ? Math.min(rows, 3) : rows,
    targetSlot: -1,
    seed: `kpc-${d}`,
    shuffleSeconds: 14 + week,
    difficulty: Math.min(3, 1 + week * 0.34),
    targetBias: 0.45,
    questionSeconds: 3,
    answerSeconds: 2.5,
    endCard: { show: true, title: "Kaali Peeli Chase", line: "A new level every day. How far can you go?", button: "FOLLOW FOR LEVEL {next}", seconds: 2.5 },
    colors: v.colors
  };
}

export const TRACK_VEHICLE_DEMO: TrackVehicle = kaaliPeeliForDay(1);
export const TRACK_VEHICLE_VARIANTS: Record<string, Partial<TrackVehicle>> = Object.fromEntries(
  ROTATION.map((r, i) => [r.vehicle, kaaliPeeliForDay(i + 1)])
);

export const FPS = 30;
export const PHASE = { intro: 20, show: 55, hide: 22 } as const;

export function trackVehicleDuration(p: TrackVehicle): number {
  return Math.round(PHASE.intro + PHASE.show + PHASE.hide + (p.shuffleSeconds + p.questionSeconds + p.answerSeconds + (p.endCard.show ? p.endCard.seconds : 0)) * FPS);
}

const VEHICLE_VOICE: Record<string, string> = {
  TAXI: "काली पीली टैक्सी", RICKSHAW: "ऑटो रिक्शा", "RED BUS": "लाल बस", POLICE: "पुलिस की गाड़ी",
  AMBULANCE: "एम्बुलेंस", TRUCK: "ट्रक", "RED CAR": "लाल कार"
};

/** Hinglish voice lines (Devanagari so the Hindi TTS voice reads them naturally). answer = 1-based slot number. */
export function kaaliPeeliVoiceLines(p: TrackVehicle, answer: number): { file: string; text: string; at: number }[] {
  const name = VEHICLE_VOICE[p.label] ?? p.label.toLowerCase();
  const shuffleStart = (PHASE.intro + PHASE.show + PHASE.hide) / FPS;
  const questionAt = shuffleStart + p.shuffleSeconds;
  const answerAt = questionAt + p.questionSeconds;
  const lines = [
    { file: "hook.wav", at: 0.3, text: `${name} पर नज़र रखो। आँख मत हटाना!` },
    { file: "go.wav", at: shuffleStart, text: "शफल शुरू!" },
    { file: "question.wav", at: questionAt + 0.1, text: `बताओ, ${name} कहाँ है?` }
  ];
  if (p.answerSeconds > 0) lines.push({ file: "reveal.wav", at: answerAt + 0.1, text: `जवाब है, नंबर ${answer}!` });
  if (p.endCard.show) lines.push({ file: "follow.wav", at: answerAt + p.answerSeconds + 0.2, text: `अगला लेवल कल! फॉलो करो।` });
  return lines;
}
