export const FPS = 30;
export const PHASE = { intro: 20, show: 55, hide: 22 } as const;

/** Stepped speed tiers (fraction of the shuffle where each starts). */
export const SPEED_TIERS = [
  { at: 0, label: "DHEEMA", voice: "", color: "#5BD17A" },
  { at: 0.28, label: "TEZ", voice: "तेज़!", color: "#FFD23F" },
  { at: 0.52, label: "AUR TEZ", voice: "और तेज़!", color: "#FF8A00" },
  { at: 0.76, label: "SABSE TEZ!", voice: "सबसे तेज़!", color: "#FF2D55" }
] as const;
