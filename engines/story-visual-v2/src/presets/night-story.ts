import type { StoryStyleConfig } from "../types";

export const nightStory: StoryStyleConfig = {
  id: "night-story", label: "Night Story",
  direction: "Cosy bedtime forest: deep blues, big moon, warm firefly glow pooling in the clearing, cool rim light.",
  assetDir: "mindnest-v2/night-story",
  background: { palette: { top: "#13214A", mid: "#1E3560", ground: "#5A4A2A", deep: "#0A1028" }, environment: "moonlit forest clearing with fireflies", depth: 4, groundY: 1460, foregroundFromY: 1600 },
  characters: { rendering: "painted-night", outline: "soft", texture: "brush", shadow: "rgba(6,10,30,0.55)", grade: "brightness(0.96)", glow: "rgba(255,206,110,0.55)" },
  typography: { titleFont: "rounded-display", bodyFont: "humanist-sans", titleWeight: 800, bodyWeight: 600, ink: "#FFF4D6", accent: "#FFC857", brand: "#CFD8FF", captionInk: "#FFF4D6" },
  cards: { quoteStyle: "shadow", storyStyle: "scrim", radius: "lg", quoteBacking: "rgba(5,10,35,0.85)", storyBacking: "rgba(5,9,28,0.82)", topWash: "rgba(8,14,40,0.45)", shadow: "0 8px 30px rgba(0,0,0,0.5)" },
  composition: { characterScale: 0.9, titlePosition: 168, storyPosition: 200 },
  motion: { particles: "fireflies", particleColor: "#FFD877", parallax: 1, sway: 0.7 }
};
