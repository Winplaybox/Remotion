/**
 * CHANNEL LOOKS — which visual style (packages/visuals/src/styles) each channel wears, post by post.
 *
 * - `from`: first IST date the look applies. Posts before it keep their original look (published posts never change,
 *   and the voice/render queue already holds the next ~3 days).
 * - `rotation`: post n wears rotation[(n - 1) % length]. The signature look repeats so the brand stays recognisable,
 *   with variety looks between.
 * - `colourSafe`: puzzle channels whose answer can depend on colour. Only grade/glow looks that keep hue are allowed,
 *   and never a monochrome one (tests/channel-looks.test.ts enforces this).
 * Long videos (marathon, championship, weekly/season long) stay plain on purpose: a filter over 10-20 min of 16:9
 * frames multiplies render time on the free CI runner.
 */
export interface ChannelLook { from: string; signature: string; rotation: readonly string[]; colourSafe?: boolean; why: string }

export const LOOKS_FROM = "2026-11-22";

const MINDNEST: ChannelLook = {
  from: LOOKS_FROM, signature: "watercolor-storybook",
  rotation: ["watercolor-storybook", "crayon-kids", "pastel-dream", "watercolor-storybook", "paper-cutout", "pastel-dream", "crayon-kids"],
  why: "Kids fables: soft storybook looks, a crayon day and a paper-cutout day for variety."
};

export const CHANNEL_LOOKS: Record<string, ChannelLook> = {
  "chakra-puzzle": {
    from: LOOKS_FROM, signature: "neon-glow", colourSafe: true,
    rotation: ["neon-glow", "crt-arcade", "neon-glow", "rangoli-festive", "neon-glow", "crt-arcade", "sci-fi-hud"],
    why: "Spinning-chakra odd-one-out on dark sets: glow and arcade looks keep every glyph, spin and tint readable."
  },
  "kaali-peeli-chase": {
    from: LOOKS_FROM, signature: "taxi-pop", colourSafe: true,
    rotation: ["taxi-pop", "mumbai-night", "taxi-pop", "mumbai-monsoon", "taxi-pop", "crt-arcade", "mumbai-night"],
    why: "Mumbai kaali-peeli shell game: yellow/black pop, Mumbai night and monsoon, an arcade day."
  },
  epicbharatsaga: {
    from: LOOKS_FROM, signature: "tanjore-gold",
    rotation: ["tanjore-gold", "pichwai-night", "temple-mural", "tanjore-gold", "kalighat-pat", "indian-miniature-painting", "golden-hour"],
    why: "Vishnu/Shiv/Devi sagas: Indian painting traditions (Tanjore, Pichwai, Ajanta, Kalighat, miniature)."
  },
  "dharm-sankat": {
    from: LOOKS_FROM, signature: "kalighat-pat",
    rotation: ["kalighat-pat", "temple-mural", "tanjore-gold", "kalighat-pat", "cinematic-2-5d", "pichwai-night", "golden-hour"],
    why: "Mythology debates: bold Kalighat outlines read like a poster; differs from the main EBS signature on the same channel."
  },
  "kaun-hoon-main": {
    from: LOOKS_FROM, signature: "pichwai-night",
    rotation: ["pichwai-night", "tanjore-gold", "engraving-art", "pichwai-night", "temple-mural", "ukiyo-e", "golden-hour"],
    why: "Guess-the-character mystery: deep indigo night signature, an engraving day for an ancient-text feel."
  },
  "liar-lineup": {
    from: LOOKS_FROM, signature: "neon-noir", colourSafe: true,
    rotation: ["neon-noir", "detective-pulp", "neon-noir", "cinematic-2-5d", "neon-noir", "detective-pulp", "mumbai-night"],
    why: "Jasoos Bhai detective lineup: noir looks that keep colour so suspect details still read."
  },
  "dimaag-lock": {
    from: LOOKS_FROM, signature: "sci-fi-hud",
    rotation: ["sci-fi-hud", "matrix-terminal", "sci-fi-hud", "crt-arcade", "sci-fi-hud", "neon-glow", "matrix-terminal"],
    why: "Vault code cracker: HUD signature (unchanged), terminal and arcade days. Digits are white on dark, so monochrome is fine."
  },
  alltrainreels: {
    from: LOOKS_FROM, signature: "golden-hour",
    rotation: ["golden-hour", "blueprint", "mumbai-monsoon", "golden-hour", "vintage-film-animation", "cinematic-2-5d", "blueprint"],
    why: "Train A-vs-B battles: golden-hour rail shots, blueprint stat days, monsoon ghats, heritage sepia."
  },
  "indian-horror-tapes": {
    from: LOOKS_FROM, signature: "night-vision",
    rotation: ["night-vision", "candlelight", "thermal-cam", "night-vision", "film-noir", "candlelight", "thermal-cam"],
    why: "Found-footage folklore: camera modes (IR, thermal) under the VHS finish, plus candlelit and noir tapes."
  },
  "mindnest-hi": MINDNEST, "mindnest-es": MINDNEST, "mindnest-ar": MINDNEST, "mindnest-de": MINDNEST,
  "mindnest-ja": MINDNEST, "mindnest-ko": MINDNEST, "mindnest-fil": MINDNEST
};

/** The look for post n posted on `date` (IST YYYY-MM-DD), or undefined before the channel's `from` date. */
export function lookFor(channel: string, n: number, date: string): string | undefined {
  const l = CHANNEL_LOOKS[channel];
  if (!l || date < l.from || n < 1) return undefined;
  return l.rotation[(n - 1) % l.rotation.length];
}
