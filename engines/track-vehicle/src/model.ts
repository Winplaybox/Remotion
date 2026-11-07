import { z } from "zod";

/** Every vehicle the engine can draw (top-down, facing up). Add one in vehicles.tsx and list it here. */
export const VEHICLE_KINDS = ["taxi", "police", "ambulance", "bus", "truck", "sports", "auto", "suv"] as const;
export type VehicleKind = (typeof VEHICLE_KINDS)[number];

export const TrackVehicleSchema = z.object({
  vehicle: z.enum(VEHICLE_KINDS),
  /** Word shown in the title accent, e.g. "TAXI" -> "TRACK THE TAXI". */
  label: z.string().min(1),
  titlePrefix: z.string(),
  questionPrefix: z.string(),
  cta: z.string(),
  brand: z.string(),
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

export const TRACK_VEHICLE_DEMO: TrackVehicle = {
  vehicle: "taxi",
  label: "TAXI",
  titlePrefix: "TRACK THE",
  questionPrefix: "WHERE'S THE",
  cta: "Answer in comments tomorrow  •  Follow for more",
  brand: "TINY OCEAN GAMES",
  cols: 3,
  rows: 4,
  targetSlot: 4,
  seed: "taxi-001",
  shuffleSeconds: 18,
  difficulty: 2,
  targetBias: 0.45,
  questionSeconds: 3,
  answerSeconds: 2.5,
  endCard: { show: true, title: "TinyTour", line: "Follow for a new tracking puzzle every day", button: "Follow to play first", seconds: 2.5 },
  colors: { target: "#FFC21A", decoy: "#6B6F78", trim: "#F5B800", accent: "#FFC21A" }
};

const base = TRACK_VEHICLE_DEMO.colors;
export const TRACK_VEHICLE_VARIANTS: Record<string, Partial<TrackVehicle>> = {
  Police: { vehicle: "police", label: "POLICE CAR", seed: "cop-2", colors: { ...base, target: "#2F6BFF", trim: "#8FB4FF", accent: "#4D8BFF" } },
  Ambulance: { vehicle: "ambulance", label: "AMBULANCE", seed: "amb-3", rows: 3, colors: { ...base, target: "#FFFFFF", trim: "#FF4D4D", accent: "#FF4D4D" } },
  Bus: { vehicle: "bus", label: "BUS", seed: "bus-4", rows: 3, colors: { ...base, target: "#FF5A36", trim: "#FFB199", accent: "#FF7A50" } },
  Truck: { vehicle: "truck", label: "TRUCK", seed: "truck-5", rows: 3, colors: { ...base, target: "#2BD67B", trim: "#9CF5C4", accent: "#2BD67B" } },
  Sports: { vehicle: "sports", label: "RED CAR", seed: "sport-6", difficulty: 3, colors: { ...base, target: "#FF2D55", trim: "#FF8FA6", accent: "#FF2D55" } },
  Auto: { vehicle: "auto", label: "RICKSHAW", seed: "auto-7", cols: 4, rows: 4, colors: { ...base, target: "#2BD24F", trim: "#FFD400", accent: "#FFD400", decoy: "#5E6470" } },
  SUV: { vehicle: "suv", label: "SUV", seed: "suv-8", colors: { ...base, target: "#00C2FF", trim: "#9BE7FF", accent: "#00C2FF" } }
};

export const FPS = 30;
export const PHASE = { intro: 20, show: 55, hide: 22 } as const;

export function trackVehicleDuration(p: TrackVehicle): number {
  return Math.round(PHASE.intro + PHASE.show + PHASE.hide + (p.shuffleSeconds + p.questionSeconds + p.answerSeconds + (p.endCard.show ? p.endCard.seconds : 0)) * FPS);
}
