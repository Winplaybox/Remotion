import type { StoryStyleConfig } from "../types";

export const softPastel3d: StoryStyleConfig = {
  id: "soft-pastel-3d", label: "Soft Pastel 3D",
  direction: "Pixar-like CG still: soft fur with subsurface, pastel GI lighting, shallow depth of field.",
  assetDir: "mindnest-v2/soft-pastel-3d",
  background: { palette: { top: "#F3E3D6", mid: "#CFE6D8", ground: "#BFDC9A", deep: "#3A3150" }, environment: "pastel glade with out-of-focus flowers", depth: 4, groundY: 1450, foregroundFromY: 1600 },
  characters: { rendering: "cg-3d", outline: "none", texture: "fur", shadow: "rgba(70,90,60,0.38)" },
  typography: { titleFont: "rounded-display", bodyFont: "humanist-sans", titleWeight: 800, bodyWeight: 600, ink: "#3A2F55", accent: "#E0607A", brand: "#5C5078", captionInk: "#FFFFFF" },
  cards: { quoteStyle: "glow", storyStyle: "scrim", radius: "lg", quoteBacking: "rgba(255,246,240,0.95)", storyBacking: "rgba(52,44,80,0.72)", topWash: "rgba(255,240,232,0.55)", shadow: "0 6px 24px rgba(58,47,85,0.18)" },
  composition: { characterScale: 0.9, titlePosition: 168, storyPosition: 200 },
  motion: { particles: "pollen", particleColor: "rgba(255,255,240,0.95)", parallax: 0.8, sway: 0.8 }
};
