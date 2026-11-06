import { z } from "zod";
export const OrbitPuzzleSchema = z.object({
  title: z.string().min(1), prompt: z.string().min(1),
  orbitRadii: z.array(z.number().positive()).min(2).max(5),
  orbitSpeeds: z.array(z.number()).min(2).max(5),
  answerIndex: z.number().int().nonnegative(), options: z.array(z.string().min(1)).length(3),
  revealFrame: z.number().int().positive()
});
export type OrbitPuzzle = z.infer<typeof OrbitPuzzleSchema>;
export const ORBIT_PUZZLE_DEMO: OrbitPuzzle = {
  title: "ORBIT LAB", prompt: "Which orbit comes next?", orbitRadii: [150, 250, 350],
  orbitSpeeds: [0.018, -0.012, 0.008], answerIndex: 1, options: ["A", "B", "C"], revealFrame: 650
};
