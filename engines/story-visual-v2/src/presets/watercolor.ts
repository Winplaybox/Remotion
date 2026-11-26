import type { StoryStyleConfig } from "../types";

export const watercolor: StoryStyleConfig = {
  id: "watercolor", label: "Watercolor",
  direction: "Soft loose watercolor on cold-press paper: misty birches, muted ochres, airy white space.",
  assetDir: "mindnest-v2/watercolor",
  background: { palette: { top: "#F6F1E6", mid: "#E8E0CC", ground: "#D9D2B4", deep: "#4A3424" }, environment: "misty birch meadow", depth: 3, groundY: 1460, foregroundFromY: 1580 },
  characters: { rendering: "watercolor", outline: "soft", texture: "paper", shadow: "rgba(120,96,60,0.3)", grade: "saturate(1.08)" },
  typography: { titleFont: "rounded-display", bodyFont: "humanist-sans", titleWeight: 700, bodyWeight: 600, ink: "#4A3020", accent: "#C24E33", brand: "#7A5A3E", captionInk: "#4A3020" },
  cards: { quoteStyle: "shadow", storyStyle: "scrim", radius: "lg", quoteBacking: "rgba(246,241,230,0.9)", storyBacking: "rgba(248,243,232,0.94)", topWash: "rgba(248,244,236,0.55)", shadow: "0 4px 18px rgba(74,52,36,0.12)" },
  composition: { characterScale: 0.9, titlePosition: 172, storyPosition: 210 },
  motion: { particles: "petals", particleColor: "#E9A27A", parallax: 0.8, sway: 0.8 }
};
