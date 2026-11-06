import { z } from "zod";
export const StorySceneSchema = z.object({
  id: z.string().min(1), chapter: z.string().min(1), heading: z.string().min(1),
  narration: z.string().min(1), durationFrames: z.number().int().positive(),
  palette: z.tuple([z.string(), z.string()]),
  motif: z.enum(["sun", "lotus", "mandala", "flame", "temple"]),
  visualAsset: z.string().optional()
});
export const EpisodeAudioCueSchema = z.object({ id: z.string().min(1), src: z.string().min(1), from: z.number().int().nonnegative(), durationFrames: z.number().int().positive(), role: z.enum(["narration", "music", "sfx"]), volume: z.number().min(0).max(1).optional() });
export const SanatanEpisodeSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), sourceNote: z.string().min(1),
  scenes: z.array(StorySceneSchema).min(1),
  audioCues: z.array(EpisodeAudioCueSchema).default([])
});
export type StoryScene = z.infer<typeof StorySceneSchema>;
export type SanatanEpisode = z.infer<typeof SanatanEpisodeSchema>;
export const SANATAN_EPISODE_DEMO: SanatanEpisode = {
  id: "dharma-001", title: "The Path of Dharma",
  sourceNote: "Original illustrative sample. Replace with a source-checked episode script and approved visual references.",
  audioCues: [],
  scenes: [
    { id: "hook", chapter: "ANCIENT WISDOM", heading: "THE PROMISE OF DHARMA", narration: "When darkness rises, the path of dharma is tested.", durationFrames: 270, palette: ["#120F22", "#452A39"], motif: "mandala" },
    { id: "choice", chapter: "THE TURNING POINT", heading: "A CHOICE THAT CHANGES DESTINY", narration: "Courage is choosing what is right, even when the path is difficult.", durationFrames: 360, palette: ["#101A2C", "#25485A"], motif: "flame" },
    { id: "revelation", chapter: "THE REVELATION", heading: "LIGHT RETURNS TO THE WORLD", narration: "Every action carries a consequence. Every honest choice creates a way forward.", durationFrames: 450, palette: ["#24172A", "#70472F"], motif: "sun" },
    { id: "lesson", chapter: "THE LESSON", heading: "DHARMA IS A DAILY CHOICE", narration: "Stand with truth. Act with compassion. Let wisdom guide your strength.", durationFrames: 420, palette: ["#101D24", "#315044"], motif: "lotus" },
    { id: "cta", chapter: "REMEMBER THE STORY", heading: "WALK THE PATH OF DHARMA", narration: "Follow for more stories from Sanatan tradition.", durationFrames: 300, palette: ["#171327", "#50352D"], motif: "temple" }
  ]
};
