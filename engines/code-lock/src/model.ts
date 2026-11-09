import { random } from "remotion";
import { z } from "zod";
import { AskOutroSchema, askOutro, askOutroSeconds, askOutroVoice } from "../../ask-outro";

export const FPS = 30;
const PALETTES = [
  { bgTop: "#071426", bgBottom: "#101D3A", accent: "#29D9FF", gold: "#FFC857", panel: "#14294B" },
  { bgTop: "#100D2B", bgBottom: "#241548", accent: "#8C7BFF", gold: "#FFD166", panel: "#292052" },
  { bgTop: "#071F24", bgBottom: "#10343A", accent: "#42E8C4", gold: "#FFD166", panel: "#15434A" }
] as const;

export const CodeLockSchema = z.object({
  voice: z.array(z.object({ src: z.string(), at: z.number().min(0) })).default([]),
  sound: z.boolean().default(true),
  brand: z.string(),
  handle: z.string(),
  postNo: z.number().int().min(1),
  title: z.string(),
  subtitle: z.string(),
  digits: z.number().int().min(3).max(4),
  code: z.string().regex(/^\\d{3,4}$/),
  clues: z.array(z.object({ guess: z.string(), correct: z.number().int(), rightPlace: z.number().int() })).length(5),
  seed: z.string(),
  playSeconds: z.number().positive(),
  introSeconds: z.number().min(0),
  prevAnswer: z.string(),
  askOutro: AskOutroSchema,
  palette: z.object({ bgTop: z.string(), bgBottom: z.string(), accent: z.string(), gold: z.string(), panel: z.string() })
}).superRefine((p, ctx) => {
  if (p.code.length !== p.digits || p.clues.some((c) => c.guess.length !== p.digits)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Code and clue lengths must match the selected digit count" });
  const solutions = allCodes(p.digits).filter((candidate) => matches(candidate, p.clues));
  if (solutions.length !== 1 || solutions[0] !== p.code) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Clues must produce exactly one solution, matching the answer" });
});
export type CodeLock = z.infer<typeof CodeLockSchema>;

type Clue = CodeLock["clues"][number];
const feedback = (code: string, guess: string) => {
  const rightPlace = [...code].filter((d, i) => d === guess[i]).length;
  const counts = new Map<string, number>();
  for (const digit of code) counts.set(digit, (counts.get(digit) ?? 0) + 1);
  let correct = 0;
  for (const digit of guess) { const remaining = counts.get(digit) ?? 0; if (remaining > 0) { correct++; counts.set(digit, remaining - 1); } }
  return { correct, rightPlace };
};
const matches = (candidate: string, clues: Clue[]) => clues.every((c) => {
  const f = feedback(candidate, c.guess);
  return f.correct === c.correct && f.rightPlace === c.rightPlace;
});
const allCodes = (digits: number) => Array.from({ length: 10 ** digits }, (_, i) => String(i).padStart(digits, "0"));

function makePuzzle(day: number, digits: number) {
  const seed = `dimaag-lock-code-${day}`;
  const code = String(Math.floor(random(`${seed}-answer`) * 10 ** digits)).padStart(digits, "0");
  const pool = allCodes(digits);
  for (let attempt = 0; attempt < 500; attempt++) {
    const clues: Clue[] = [];
    for (let i = 0; i < 5; i++) {
      const guess = String(Math.floor(random(seed + "-" + attempt + "-guess-" + i) * 10 ** digits)).padStart(digits, "0");
      const f = feedback(code, guess);
      if (!clues.some((c) => c.guess === guess)) clues.push({ guess, ...f });
    }
    if (clues.length === 5) {
      const solutions = pool.filter((candidate) => matches(candidate, clues));
      if (solutions.length === 1 && solutions[0] === code) return { code, clues, seed };
    }
  }
  throw new Error("Could not generate five unique clues for day " + day);
}

export function codeLockForDay(day: number): CodeLock {
  const d = Math.max(1, Math.floor(day));
  const week = (d - 1) % 7;
  const digits = week < 3 ? 3 : 4;
  const generated = makePuzzle(d, digits);
  const previous = d > 1 ? makePuzzle(d - 1, ((d - 2) % 7) < 3 ? 3 : 4).code : "";
  const playSeconds = 17;
  const palette = PALETTES[(d - 1) % PALETTES.length]!;
  return {
    voice: [], sound: true, brand: "DIMAAG LOCK", handle: "@DimaagLock", postNo: d,
    title: "CRACK THE CODE", subtitle: `${digits} digits. 5 clues. One secret code.`,
    digits, code: generated.code, clues: generated.clues, seed: generated.seed, playSeconds,
    introSeconds: previous ? 2.6 : 0, prevAnswer: previous ? `THE CODE WAS ${previous}` : "",
    askOutro: askOutro({
      question: "WHAT IS THE SECRET CODE?",
      options: [`${digits}-DIGIT CODE`, "USE ALL 5 CLUES"],
      voiceQuestion: "What is the secret code? Type your answer in the comments.",
      cta: "COMMENT YOUR CODE BELOW!",
      ctaSub: "FOLLOW @DimaagLock FOR THE NEXT PUZZLE",
      voiceCta: "Comment your code below and follow Dimaag Lock for the next puzzle.",
      handle: "@DimaagLock"
    }),
    palette
  };
}

export const codeLockDuration = (p: CodeLock) => Math.round((p.introSeconds + p.playSeconds + askOutroSeconds(p.askOutro)) * FPS);
export const codeLockAnswer = (p: CodeLock) => p.code;
export const codeLockAnswerComment = (p: CodeLock) => `🔐 THE CODE: ${p.code}\nWere you right? Follow @DimaagLock for the next challenge!`;
export function codeLockVoiceLines(p: CodeLock) {
  const start = p.introSeconds;
  return [
    ...(start ? [{ file: "prev.wav", at: 0.2, text: `The previous code was ${p.prevAnswer.replace("THE CODE WAS ", "")}.` }] : []),
    { file: "hook.wav", at: start + 0.25, text: `Can you crack this ${p.digits} digit code? Study all five clues.` },
    ...p.clues.map((c, i) => ({ file: `clue-${i + 1}.wav`, at: start + 2.1 + i * 2.15, text: `Clue ${i + 1}. ${c.guess.split("").join(" ")}. ${c.correct} digits are correct, and ${c.rightPlace} are in the right position.` })),
    { file: "hurry.wav", at: start + p.playSeconds - 2.5, text: "Time is almost up. Lock in your answer." },
    ...askOutroVoice(p.askOutro, start + p.playSeconds)
  ];
}
