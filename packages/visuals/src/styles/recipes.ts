import { CATALOGUE, type CatalogueEntry } from "./catalogue.generated";

/**
 * STYLE RECIPES — how each of the 49 catalogue styles is produced with CODE ONLY (SVG filters + CSS overlays, no AI, no images).
 * status:
 *  - "ready"   a real 2D treatment that works on ANY scene (flat-vector rig, sets, text) — renderer + sample + tests exist.
 *  - "approx"  a 2D imitation of a look that fully needs extra assets / puppets / 3D (anime cels, rubber-hose, folk art…).
 *              Usable for a channel look, but it is a treatment on the flat rig, not the real technique.
 *  - "planned" needs a real renderer (Three.js, voxel/low-poly meshes, shaders). The recipe is only a placeholder preview;
 *              do NOT ship a channel on it until the 3D renderer + assets exist (catalogue rule `style_selection_rule`).
 */
export type StyleStatus = "ready" | "approx" | "planned";

export interface Recipe {
  /** CSS filter grade */
  grade?: { contrast?: number; saturate?: number; brightness?: number; sepia?: number; hue?: number; gray?: number };
  /** quantise each channel to N levels (cel / print look) */
  posterize?: number;
  /** map luminance to [dark, light] colours */
  duotone?: [string, string];
  /** 0..1 — black edge lines multiplied over the scene */
  ink?: number;
  /** block size in px (pixel art) */
  pixel?: number;
  /** wavy edge displacement (px scale, noise frequency); `boil` re-seeds every N frames for hand-drawn boil */
  wobble?: { scale: number; freq: number; boil?: number };
  /** glow radius (px) */
  bloom?: number;
  halftone?: { size: number; opacity: number; color?: string };
  grain?: number;
  scan?: number;
  vignette?: number;
  /** warm paper tint overlay colour + opacity */
  paper?: { color: string; opacity: number };
  tint?: { color: string; opacity: number; blend?: "multiply" | "screen" | "overlay" | "soft-light" | "color" };
  flicker?: number;
  /** blur strength (px) at the top and bottom edges (miniature / toy look) */
  tiltShift?: number;
  letterbox?: number;
  /** hold each drawing for N frames (limited animation: 2 = "on twos" at 30fps → 15 drawings/s) */
  hold?: number;
  /** decorative frame / HUD overlay */
  overlay?: "hud" | "border" | "speedlines";
}

export interface StyleSpec extends CatalogueEntry { status: StyleStatus; recipe: Recipe; note: string }

const R: Record<string, { status: StyleStatus; recipe: Recipe; note: string }> = {
  "pixel-art": { status: "ready", recipe: { pixel: 6, posterize: 5, grade: { saturate: 1.2 } }, note: "Block pixelation + 5-level palette. Real sprite atlases can replace it later." },
  "ps2-style": { status: "planned", recipe: { pixel: 3, posterize: 8, grain: 0.25, grade: { contrast: 1.1, saturate: 0.85 } }, note: "Needs Three.js low-res 3D, affine texture wobble and vertex jitter." },
  "comic-art": { status: "ready", recipe: { ink: 0.9, posterize: 6, halftone: { size: 9, opacity: 0.22 }, grade: { contrast: 1.15, saturate: 1.25 } }, note: "Ink lines + halftone + flat colours." },
  "lego-style": { status: "planned", recipe: { pixel: 10, posterize: 6, grade: { saturate: 1.4 } }, note: "Needs 3D brick instancing." },
  claymation: { status: "approx", recipe: { wobble: { scale: 5, freq: 0.012, boil: 4 }, grain: 0.18, grade: { saturate: 1.1, contrast: 1.05 }, hold: 3, tint: { color: "#f3d9b0", opacity: 0.12, blend: "multiply" } }, note: "Stop-motion boil (jitter every 3 frames) on the flat rig; true clay shading needs 3D." },
  "paper-cutout": { status: "approx", recipe: { posterize: 6, wobble: { scale: 3, freq: 0.03 }, paper: { color: "#f5ead2", opacity: 0.18 }, grain: 0.15, hold: 2, ink: 0.35 }, note: "Rough-cut edges + paper grain; puppet layers come from the rig." },
  "retro-anime": { status: "approx", recipe: { posterize: 7, grain: 0.22, vignette: 0.3, flicker: 0.02, grade: { saturate: 1.15, contrast: 1.08 }, hold: 2, tint: { color: "#ffd9a8", opacity: 0.1, blend: "soft-light" } }, note: "Cel palette + film grain; real cels need drawn frames." },
  "low-poly-3d": { status: "planned", recipe: { posterize: 5, ink: 0.3 }, note: "Needs Three.js low-poly meshes." },
  risograph: { status: "ready", recipe: { duotone: ["#1d2a6b", "#ffd9e6"], grain: 0.35, halftone: { size: 5, opacity: 0.14, color: "#ff4f8b" }, wobble: { scale: 2, freq: 0.04 }, grade: { contrast: 1.1 } }, note: "Two-ink print look with grain and misregistration wobble." },
  "miniature-diorama": { status: "approx", recipe: { tiltShift: 9, grade: { saturate: 1.3, contrast: 1.08 }, vignette: 0.25 }, note: "Tilt-shift blur fakes a miniature; a real diorama is 3D." },
  "90s-classic-shonen-anime": { status: "approx", recipe: { posterize: 6, ink: 0.55, grade: { saturate: 1.35, contrast: 1.2 }, vignette: 0.35, grain: 0.15, overlay: "speedlines", hold: 2 }, note: "High contrast cel look + speed lines for impact frames." },
  "cel-shaded-art": { status: "planned", recipe: { posterize: 4, ink: 0.7 }, note: "Real toon shading needs a 3D renderer with outline pass." },
  "sharp-ink-outlines": { status: "ready", recipe: { ink: 1, posterize: 8, grade: { contrast: 1.1 } }, note: "Strong dark edge lines on flat colours." },
  "rubber-hose-cartoon": { status: "approx", recipe: { duotone: ["#161616", "#f3ead8"], grain: 0.3, flicker: 0.04, wobble: { scale: 3, freq: 0.02, boil: 3 }, hold: 3, vignette: 0.35, ink: 0.4 }, note: "1930s black/cream look + boil. Rubber-hose limbs need a dedicated rig." },
  "modern-western-cartoon": { status: "approx", recipe: { posterize: 8, ink: 0.25, grade: { saturate: 1.3, contrast: 1.05 } }, note: "Clean flat look; matches the rig as-is." },
  "saturday-morning-cartoon": { status: "approx", recipe: { posterize: 6, ink: 0.5, grade: { saturate: 1.3, contrast: 1.1 }, hold: 2, grain: 0.1 }, note: "Limited animation on twos + bold outlines." },
  "flat-vector-animation": { status: "ready", recipe: { grade: { saturate: 1.05 } }, note: "The rig's native look — no processing." },
  "2d-puppet-animation": { status: "approx", recipe: { ink: 0.2, paper: { color: "#fff6e0", opacity: 0.08 }, hold: 2 }, note: "Rig + hold frames; the rig already is a 2-bone IK puppet." },
  "pencil-sketch": { status: "ready", recipe: { ink: 1, duotone: ["#3a3a3a", "#fbf8f0"], grain: 0.25, wobble: { scale: 3, freq: 0.03, boil: 3 }, paper: { color: "#f6f0e2", opacity: 0.2 }, hold: 3 }, note: "Graphite lines on paper with seeded line boil." },
  "watercolor-storybook": { status: "ready", recipe: { wobble: { scale: 9, freq: 0.01 }, posterize: 9, paper: { color: "#f7f0de", opacity: 0.22 }, grain: 0.18, grade: { saturate: 0.85, brightness: 1.06 }, bloom: 2 }, note: "Soft bleeding edges + paper tint." },
  "gouache-illustration": { status: "approx", recipe: { posterize: 8, wobble: { scale: 4, freq: 0.02 }, paper: { color: "#f3e7cf", opacity: 0.14 }, grain: 0.12, grade: { saturate: 1.1, contrast: 1.05 } }, note: "Opaque matte-paint feel." },
  "modern-tv-anime": { status: "approx", recipe: { posterize: 9, ink: 0.35, bloom: 3, grade: { saturate: 1.25, brightness: 1.04 }, hold: 2 }, note: "Clean cel + soft bloom." },
  "manga-screentone": { status: "ready", recipe: { duotone: ["#101010", "#ffffff"], ink: 0.9, halftone: { size: 8, opacity: 0.35, color: "#000" }, grade: { contrast: 1.25 } }, note: "Black/white ink with screentone dots." },
  "chibi-anime": { status: "planned", recipe: { posterize: 8, ink: 0.4, grade: { saturate: 1.3 } }, note: "Needs a separate 2-3 head-tall character design system (not a scaled rig)." },
  "anime-watercolor": { status: "approx", recipe: { ink: 0.4, wobble: { scale: 6, freq: 0.012 }, paper: { color: "#f7f0de", opacity: 0.16 }, bloom: 2, grade: { saturate: 0.95, brightness: 1.05 }, posterize: 9 }, note: "Cel lines over painted-looking wash." },
  "limited-animation-anime": { status: "approx", recipe: { posterize: 8, ink: 0.4, hold: 3, grade: { saturate: 1.15 } }, note: "Drawings held for 3 frames (10 drawings/s)." },
  "80s-ova-anime": { status: "approx", recipe: { posterize: 8, tint: { color: "#ff6ec7", opacity: 0.12, blend: "soft-light" }, grain: 0.3, scan: 0.1, bloom: 3, vignette: 0.3, grade: { saturate: 1.2, contrast: 1.1 } }, note: "Pastel/purple cel tint, grain, bloom." },
  "stylized-3d-cartoon": { status: "planned", recipe: { bloom: 3, grade: { saturate: 1.25 } }, note: "Needs rigged 3D characters." },
  "isometric-3d": { status: "planned", recipe: { ink: 0.3 }, note: "Needs orthographic 3D scenes." },
  "voxel-art": { status: "planned", recipe: { pixel: 12, posterize: 6 }, note: "Needs voxel meshes." },
  "toon-shaded-3d": { status: "planned", recipe: { posterize: 4, ink: 0.6 }, note: "Needs shader-based toon rendering." },
  "3d-cutaway": { status: "planned", recipe: { ink: 0.4, duotone: ["#16324f", "#dff3ff"] }, note: "Needs 3D models with sectioning." },
  "toy-photography": { status: "approx", recipe: { tiltShift: 12, grade: { saturate: 1.25, contrast: 1.1 }, vignette: 0.3, grain: 0.1 }, note: "Shallow depth-of-field fake; real toys are 3D." },
  "ukiyo-e": { status: "ready", recipe: { posterize: 5, ink: 0.6, paper: { color: "#efe0b8", opacity: 0.3 }, grain: 0.2, grade: { saturate: 0.8, contrast: 1.05 }, tint: { color: "#3b5b7a", opacity: 0.1, blend: "multiply" } }, note: "Flat colour blocks, key-line, aged washi paper (digital emulation)." },
  "linocut-print": { status: "ready", recipe: { duotone: ["#1a1410", "#f1e4c8"], posterize: 3, ink: 0.8, grain: 0.3, wobble: { scale: 2, freq: 0.05 }, grade: { contrast: 1.3 } }, note: "Bold carved two-tone." },
  "engraving-art": { status: "ready", recipe: { duotone: ["#1c1812", "#efe6cf"], ink: 1, halftone: { size: 4, opacity: 0.28, color: "#1c1812" }, grade: { contrast: 1.2 } }, note: "Fine line/dot shading in sepia." },
  "indian-miniature-painting": { status: "approx", recipe: { posterize: 7, paper: { color: "#f1dfae", opacity: 0.25 }, grade: { saturate: 1.3, contrast: 1.05 }, overlay: "border", grain: 0.15, ink: 0.35 }, note: "Rich flat pigments + ornate border; needs original miniature-style art for full effect." },
  "madhubani-folk-art": { status: "approx", recipe: { posterize: 5, ink: 0.7, overlay: "border", paper: { color: "#f0dcb0", opacity: 0.2 }, grade: { saturate: 1.35 } }, note: "Bold outlines + pattern border; fills need hand-authored patterns." },
  "warli-art": { status: "approx", recipe: { duotone: ["#f4efe6", "#8a3b1e"], ink: 0.6, posterize: 2, grain: 0.15 }, note: "White strokes on terracotta; needs stick-figure primitives for authenticity." },
  "pop-art": { status: "ready", recipe: { posterize: 4, ink: 1, halftone: { size: 12, opacity: 0.4, color: "#ff2d95" }, grade: { saturate: 1.7, contrast: 1.3 } }, note: "CMYK-ish palette + big halftone dots." },
  "newspaper-illustration": { status: "ready", recipe: { duotone: ["#2b2b2b", "#e9e4d6"], halftone: { size: 5, opacity: 0.3, color: "#2b2b2b" }, grain: 0.3, ink: 0.4, paper: { color: "#e8e1cd", opacity: 0.2 } }, note: "Newsprint halftone." },
  "kinetic-typography": { status: "planned", recipe: {}, note: "Text-motion kit (not a filter). Needs per-word animation presets and font loading." },
  "cinematic-2-5d": { status: "ready", recipe: { letterbox: 0.1, vignette: 0.4, grade: { contrast: 1.12, saturate: 1.05 }, grain: 0.08, bloom: 2 }, note: "Letterbox, vignette, grade; add parallax layers in the scene." },
  "film-noir": { status: "ready", recipe: { duotone: ["#000000", "#f2f2f2"], grade: { contrast: 1.45 }, vignette: 0.6, grain: 0.3, flicker: 0.03, letterbox: 0.06 }, note: "High-contrast B&W." },
  "neon-cyberpunk": { status: "ready", recipe: { tint: { color: "#ff00c8", opacity: 0.22, blend: "color" }, bloom: 6, grade: { contrast: 1.25, saturate: 1.5, brightness: 0.9 }, scan: 0.1, vignette: 0.45 }, note: "Magenta/cyan grade with bloom + scanlines." },
  "silhouette-animation": { status: "ready", recipe: { duotone: ["#0a0a12", "#f6c26b"], posterize: 2, grade: { contrast: 1.4 } }, note: "Backlit black shapes on warm gradient." },
  "geometric-motion-graphics": { status: "approx", recipe: { posterize: 5, grade: { saturate: 1.3 } }, note: "Flat colour grade; real style is shape-driven motion design." },
  "vintage-film-animation": { status: "ready", recipe: { grade: { sepia: 0.55, contrast: 1.1, saturate: 0.8 }, grain: 0.35, flicker: 0.05, vignette: 0.5, scan: 0.04 }, note: "Sepia, grain, flicker, vignette." },
  "sci-fi-hud": { status: "approx", recipe: { tint: { color: "#00e5ff", opacity: 0.15, blend: "screen" }, scan: 0.14, bloom: 4, overlay: "hud", grade: { contrast: 1.15 }, vignette: 0.3 }, note: "Cyan scanlines + HUD frame." }
};

export const STYLES: StyleSpec[] = CATALOGUE.map((c) => {
  const r = R[c.id];
  if (!r) throw new Error(`style recipe missing for ${c.id}`);
  return { ...c, ...r };
});
export const STYLE_BY_ID = Object.fromEntries(STYLES.map((s) => [s.id, s])) as Record<string, StyleSpec>;
export type StyleId = (typeof CATALOGUE)[number]["id"];
export const STYLE_IDS: string[] = STYLES.map((s) => s.id);
export const stylesByStatus = (s: StyleStatus) => STYLES.filter((x) => x.status === s);
