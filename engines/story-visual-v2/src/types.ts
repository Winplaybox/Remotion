/**
 * StoryVisualEngine V2 — typed style tokens.
 *
 * A style is ONLY data. <SceneLayer> reads `scene` + `characters` + `motion`; <StoryUI> reads `typography`, `cards`,
 * `composition` and `palette`. Text never lives in the scene and art never lives in the UI, so swapping a style
 * cannot break text layout and changing copy/language never re-renders the art.
 */

/** One radius scale for the whole engine. Cards/plates may only pick a key from here. */
export const RADIUS = { none: 0, sm: 12, md: 24, lg: 40, pill: 999 } as const;
export type RadiusToken = keyof typeof RADIUS;

/** Vertical rhythm for 1080x1920 (px). Shorts UI covers ~160-300px at the bottom and the action rail on the right. */
export const FRAME = { width: 1080, height: 1920, safeTop: 90, safeBottom: 190, safeSide: 90, railRight: 130 } as const;

export type ParticleKind = "none" | "pollen" | "leaves" | "fireflies" | "petals";

export interface StoryStyleConfig {
  id: string;
  /** Human label for sheets / studio. */
  label: string;
  /** One-line art direction (kept in code so prompts can be regenerated). */
  direction: string;
  /** Folder under public/ holding bg.jpg + characters.png for this style. */
  assetDir: string;
  background: {
    /** Dominant colours of the plate, top -> bottom (used for scrims, letterbox fills). */
    palette: { top: string; mid: string; ground: string; deep: string };
    environment: string;
    /** Number of painted depth layers in the plate (documentation + parallax strength). */
    depth: 2 | 3 | 4;
    /** y (px, 0-1920) where the characters' feet touch the ground in the plate. */
    groundY: number;
    /** Where the plate's foreground strip starts: re-layered over the characters for parallax. */
    foregroundFromY: number;
  };
  characters: {
    rendering: "flat-2.5d" | "ink-gouache" | "watercolor" | "cel-toon" | "painted-night" | "cg-3d";
    outline: "none" | "soft" | "ink" | "bold";
    texture: "none" | "paper" | "brush" | "fur";
    /** Contact shadow colour under the pair. */
    shadow: string;
    /** Optional colour grade on the cut-out so it sits in the plate's light (CSS filter). */
    grade?: string;
    /** Rim/back light glow colour (night) — drawn behind the pair. */
    glow?: string;
  };
  typography: {
    /** Display role (brand + headline). Real family is picked per script in fonts.ts. */
    titleFont: "rounded-display";
    bodyFont: "humanist-sans";
    titleWeight: 700 | 800;
    bodyWeight: 500 | 600 | 700;
    ink: string;
    accent: string;
    /** Brand line colour. */
    brand: string;
    captionInk: string;
  };
  cards: {
    /** How the moral headline separates from the art. No bordered cards. */
    quoteStyle: "shadow" | "glow" | "outline" | "plate";
    /** How the bottom caption separates from the art. */
    storyStyle: "scrim" | "plate";
    radius: RadiusToken;
    /** CSS colour of the halo / outline / plate behind the headline. */
    quoteBacking: string;
    /** Bottom scrim (or plate) colour. */
    storyBacking: string;
    /** Top wash behind brand + headline so it reads on any plate (0 = none). */
    topWash: string;
    shadow: string;
  };
  composition: {
    /** Character pair width as a share of the frame width. */
    characterScale: number;
    /** Headline block top (px). */
    titlePosition: number;
    /** Caption block bottom edge distance from the frame bottom (px, >= FRAME.safeBottom). */
    storyPosition: number;
  };
  motion: { particles: ParticleKind; particleColor: string; parallax: number; sway: number };
}

export interface StoryText {
  lang: string;
  rtl: boolean;
  /** Script family used for font selection. */
  script: "deva" | "latin" | "arabic" | "cjk";
  brand: string;
  episode: string;
  kicker: string;
  headline: [string, string];
  caption: string;
}
