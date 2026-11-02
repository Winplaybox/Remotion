/**
 * timeline.ts — Single Source of Truth
 * Directing timeline driving picture, camera, audio cues, and subtitle burns.
 * Modeled on lemo-opuscar TECHNIQUE.md §3.
 */

export interface TimelineSection {
  id: string;
  name: string;
  startFrame: number;
  endFrame: number;
  durationInFrames: number;
  cameraMove: "push_in" | "parallax_orbit" | "pan_left" | "pull_back";
  spokenLine: string;
  subtitleText: string;
  hitBeat: number;
}

export const TIMELINE = {
  fps: 30,
  totalDurationInFrames: 300, // 10.0 seconds
  bpm: 120, // 1 beat = 15 frames = 0.5s

  sections: [
    {
      id: "sec_hook",
      name: "Scene 1: The Vector Paradox Hook",
      startFrame: 0,
      endFrame: 90,
      durationInFrames: 90,
      cameraMove: "push_in",
      spokenLine: "Kya aapne socha hai ki AI aapki baatein kaise samajhta hai?",
      subtitleText: "Kya aapne socha hai ki AI aapki baatein kaise samajhta hai?",
      hitBeat: 0,
    },
    {
      id: "sec_hero_3d",
      name: "Scene 2A: 3D Attention Core Ignite",
      startFrame: 90,
      endFrame: 145,
      durationInFrames: 55,
      cameraMove: "parallax_orbit",
      spokenLine: "Transformer model har word ko ek mathematical vector space mein scan karta hai.",
      subtitleText: "Transformer model har word ko vector space mein scan karta hai.",
      hitBeat: 6,
    },
    {
      id: "sec_lemowake_diagram",
      name: "Scene 2B: Lemo-Wake Architecture Loop",
      startFrame: 145,
      endFrame: 200,
      durationInFrames: 55,
      cameraMove: "pan_left",
      spokenLine: "Self-attention har token ke beech parallel weighted probabilities calculate karta hai.",
      subtitleText: "Self-attention har token ke beech parallel weights calculate karta hai.",
      hitBeat: 10,
    },
    {
      id: "sec_findings_outro",
      name: "Scene 3: Scaling Law Findings & CTA",
      startFrame: 200,
      endFrame: 300,
      durationInFrames: 100,
      cameraMove: "pull_back",
      spokenLine: "Aise hi real scientific research ko simple Hinglish mein samajhne ke liye subscribe karein!",
      subtitleText: "Aise hi real scientific research ko samajhne ke liye subscribe karein!",
      hitBeat: 14,
    },
  ] as TimelineSection[],

  audioHits: [
    { frame: 0, type: "sub_drop", gain: 0.8 },
    { frame: 90, type: "core_ignite_whoosh", gain: 0.7 },
    { frame: 145, type: "laser_sheen_sweep", gain: 0.6 },
    { frame: 200, type: "metric_impact_hit", gain: 0.75 },
  ],
};
