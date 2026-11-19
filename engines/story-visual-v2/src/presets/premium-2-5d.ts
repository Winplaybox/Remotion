import type { StoryStyleConfig } from "../types";

export const premium25d: StoryStyleConfig = {
  id: "premium-2.5d", label: "Premium 2.5D",
  direction: "Clean flat 2.5D picture-book: simple layered shapes, soft gradients, paper grain, misty forest depth.",
  assetDir: "mindnest-v2/premium-2.5d",
  background: { palette: { top: "#D7E6C9", mid: "#B9D3A6", ground: "#C9B98A", deep: "#1E3A26" }, environment: "sunny misty forest clearing with path", depth: 4, groundY: 1460, foregroundFromY: 1560 },
  characters: { rendering: "flat-2.5d", outline: "soft", texture: "paper", shadow: "rgba(58,82,40,0.38)" },
  typography: { titleFont: "rounded-display", bodyFont: "humanist-sans", titleWeight: 800, bodyWeight: 600, ink: "#1F3A28", accent: "#D9472B", brand: "#2E5238", captionInk: "#FFFDF5" },
  cards: { quoteStyle: "glow", storyStyle: "scrim", radius: "lg", quoteBacking: "rgba(240,247,232,0.95)", storyBacking: "rgba(22,44,28,0.78)", topWash: "rgba(226,238,214,0.75)", shadow: "0 6px 24px rgba(30,58,38,0.18)" },
  composition: { characterScale: 0.9, titlePosition: 168, storyPosition: 200 },
  motion: { particles: "pollen", particleColor: "rgba(255,252,220,0.9)", parallax: 1, sway: 1 }
};
