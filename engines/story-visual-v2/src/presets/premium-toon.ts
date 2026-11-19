import type { StoryStyleConfig } from "../types";

export const premiumToon: StoryStyleConfig = {
  id: "premium-toon", label: "Premium Toon",
  direction: "High-end 2D TV animation: bold even outlines, flat cel colour + one shade, punchy greens, arched tree frame.",
  assetDir: "mindnest-v2/premium-toon",
  background: { palette: { top: "#FFF3C8", mid: "#8FD3B6", ground: "#7CCB5A", deep: "#173A24" }, environment: "jungle-edge meadow framed by arched trees", depth: 3, groundY: 1490, foregroundFromY: 1580 },
  characters: { rendering: "cel-toon", outline: "bold", texture: "none", shadow: "rgba(40,96,30,0.45)", grade: "saturate(1.12)" },
  typography: { titleFont: "rounded-display", bodyFont: "humanist-sans", titleWeight: 800, bodyWeight: 700, ink: "#FFFFFF", accent: "#FFD23F", brand: "#FFFFFF", captionInk: "#FFFFFF" },
  cards: { quoteStyle: "outline", storyStyle: "scrim", radius: "pill", quoteBacking: "#1B3A20", storyBacking: "rgba(18,52,26,0.82)", topWash: "rgba(0,0,0,0)", shadow: "0 8px 0 rgba(20,50,25,0.25)" },
  composition: { characterScale: 0.9, titlePosition: 160, storyPosition: 200 },
  motion: { particles: "leaves", particleColor: "#5DBB4A", parallax: 1, sway: 1.2 }
};
