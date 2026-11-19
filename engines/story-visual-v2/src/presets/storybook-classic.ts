import type { StoryStyleConfig } from "../types";

export const storybookClassic: StoryStyleConfig = {
  id: "storybook-classic", label: "Storybook Classic",
  direction: "Rich hand-drawn storybook: warm ink line, gouache + coloured pencil, golden light through an old forest.",
  assetDir: "mindnest-v2/storybook-classic",
  background: { palette: { top: "#F3E2A6", mid: "#C9B46A", ground: "#7FA04A", deep: "#3A2412" }, environment: "golden enchanted glade, old trees, wildflowers", depth: 4, groundY: 1490, foregroundFromY: 1590 },
  characters: { rendering: "ink-gouache", outline: "ink", texture: "brush", shadow: "rgba(70,52,20,0.42)", grade: "saturate(1.02) sepia(0.06)" },
  typography: { titleFont: "rounded-display", bodyFont: "humanist-sans", titleWeight: 800, bodyWeight: 600, ink: "#3B2412", accent: "#B23A1A", brand: "#4A2C12", captionInk: "#FFF6E2" },
  cards: { quoteStyle: "glow", storyStyle: "scrim", radius: "lg", quoteBacking: "rgba(255,244,210,0.95)", storyBacking: "rgba(48,30,12,0.8)", topWash: "rgba(255,240,196,0.6)", shadow: "0 6px 24px rgba(59,36,18,0.2)" },
  composition: { characterScale: 0.9, titlePosition: 168, storyPosition: 200 },
  motion: { particles: "leaves", particleColor: "#D98B2B", parallax: 1, sway: 1 }
};
