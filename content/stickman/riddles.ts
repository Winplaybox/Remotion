import { askOutro } from "../../engines/ask-outro";
import { P, StoryDioramaSchema, type StoryDiorama, type StoryDioramaInput } from "../../engines/story-diorama/src/model";

/**
 * STICKMAN "CAN YOU SURVIVE?" riddles — an original stickman (props-channels.tsx `stickman`, WinPlayBox design) in
 * classic survival riddles. English, made for Dimaag Lock (@DimaagLock): the answer comes in the next video + as a comment,
 * the video ends on the shared AskOutro (A / B / C). Not wired to a channel yet: a human picks where it goes.
 * Post n = RIDDLES[n - 1]; unwritten posts fail closed.
 */

type Icon = "fire" | "lion" | "gun" | "water" | "skull" | "door";
export interface Riddle {
  h1: string; h2: string;
  hook: string; setup: string;
  doors: [Icon, Icon, Icon];
  clues: string[]; clueVoice: string;
  question: string; voiceQuestion: string;
  /** 0-based index of the safe door. */
  answer: number; why: string;
}

const RIDDLES: Riddle[] = [
  {
    h1: "CAN YOU", h2: "SURVIVE?",
    hook: "You're trapped. Three doors. Only one keeps you alive.",
    setup: "Door A is full of fire. Door B has lions that haven't eaten in three years. Door C has guards with loaded guns.",
    doors: ["fire", "lion", "gun"],
    clues: ["A: FIRE", "B: LIONS, 3 YRS HUNGRY", "C: LOADED GUNS"], clueVoice: "Think carefully. Every detail matters.",
    question: "WHICH DOOR IS SAFE?", voiceQuestion: "Which door would you choose? A, B, or C?",
    answer: 1, why: "Lions that haven't eaten in three years can't survive that long — the room is empty."
  },
  {
    h1: "ONE DOOR", h2: "IS SAFE",
    hook: "Three doors again. One wrong step and it's game over.",
    setup: "Door A is flooding with water. Door B is an empty room with a skull on the floor. Door C is burning.",
    doors: ["water", "skull", "fire"],
    clues: ["A: FLOODING", "B: JUST A SKULL", "C: BURNING"], clueVoice: "Don't let the scary one fool you.",
    question: "WHERE DO YOU GO?", voiceQuestion: "Where do you go? A, B, or C?",
    answer: 1, why: "A skull can't hurt you. The empty room is the only safe one."
  }
];

const PAL = { paper: "#FFFFFF", ink: "#141414", accent: "#FF4D3D", accent2: "#FFD23F", accent3: "#3DD6FF" };
const DESERT: [string, string] = ["#F7D488", "#F2B65E"];
const ROOM: [string, string] = ["#2A2440", "#4A3A5E"];

export const STICK_HANDLE = "@DimaagLock";
export const stickRiddleCount = () => RIDDLES.length;
export function stickRiddle(n: number): Riddle {
  const r = RIDDLES[Math.floor(n) - 1];
  if (!r) throw new Error(`Stickman riddle #${n} is not written yet in content/stickman/riddles.ts`);
  return r;
}
export const stickRiddleAnswer = (n: number) => { const r = stickRiddle(n); return `✅ ANSWER: ${"ABC"[r.answer]} — ${r.why}\nDid you get it? Reply below 👇`; };

type Scene = Omit<StoryDioramaInput["scenes"][number], "fig">;

export function stickRiddleForDay(n: number): StoryDiorama {
  const r = stickRiddle(n);
  const ground = { color: "#E3A24C", y: 1480 };
  const scenes: Scene[] = [
    {
      id: "hook", seconds: 4.5, location: `RIDDLE #${String(n).padStart(2, "0")}`, sky: DESERT, ground, tone: "dark", camera: "push", particles: "none",
      narration: r.hook, caption: r.hook, sfx: ["riser"],
      headlines: [{ at: 0, lines: [{ text: r.h1 }, { text: r.h2, tone: "accent" }] }],
      layers: [P("sun", 820, 640, { depth: 0.1, idle: "pulse" }), P("stickman", 540, 1560, { depth: 1, enter: "pop", data: { pose: "panic", face: "shock", sweat: true } })]
    },
    {
      id: "doors", seconds: 9, location: "THE DOORS", sky: ROOM, ground: { color: "#1C1626", y: 1480 }, tone: "light", camera: "still", particles: "none",
      narration: r.setup, caption: r.setup,
      headlines: [{ at: 0, lines: [{ text: "PICK ONE" }] }],
      layers: [
        P("threeDoors", 540, 1300, { depth: 0.7, enter: "none", data: { labels: ["A", "B", "C"], icons: r.doors } }),
        P("stickman", 540, 1640, { depth: 1, scale: 0.55, enter: "rise", data: { pose: "think", face: "think" } })
      ]
    },
    {
      id: "clues", seconds: 5, location: "THE CLUES", sky: ROOM, tone: "light", camera: "push", particles: "none",
      narration: r.clueVoice, caption: r.clueVoice,
      headlines: [{ at: 0, lines: [{ text: "THINK!" }] }],
      layers: [
        P("noteCard", 540, 1000, { depth: 0.8, enter: "drop", scale: 0.85, data: { title: "CLUES", items: r.clues } }),
        P("stickman", 860, 1660, { depth: 1, scale: 0.6, data: { pose: "shrug", face: "sad" } })
      ]
    },
    {
      id: "ask", seconds: 9.5, location: "YOUR CHOICE", sky: ROOM, ground: { color: "#1C1626", y: 1480 }, tone: "light", camera: "still", particles: "none",
      narration: `${r.voiceQuestion} Comment your answer, and follow to see if you survived.`, caption: "",
      headlines: [{ at: 0, lines: [{ text: "A, B OR C?" }] }],
      layers: [
        P("threeDoors", 540, 1300, { depth: 0.7, enter: "none", data: { labels: ["A", "B", "C"], icons: r.doors } }),
        P("stickman", 540, 1640, { depth: 1, scale: 0.55, data: { pose: "point", face: "shock", sweat: true } })
      ]
    }
  ];
  return StoryDioramaSchema.parse({
    music: "sfx/music_puzzle.mp3", brand: "DIMAAG LOCK", handle: STICK_HANDLE,
    tag: "SURVIVE · #", tagAccent: String(n).padStart(2, "0"),
    palette: PAL, transitionFrames: 8, finish: "rail",
    scenes: scenes.map((s, i) => ({ ...s, fig: `${i + 1}/4` })),
    ask: askOutro({
      question: r.question, options: ["A", "B", "C"], voiceQuestion: r.voiceQuestion,
      cta: "COMMENT YOUR ANSWER! 👇", ctaSub: "Answer in the next video — FOLLOW!", voiceCta: "Comment your answer, and follow to see if you survived.",
      handle: STICK_HANDLE, questionSeconds: 4, ctaSeconds: 5.5
    })
  });
}
