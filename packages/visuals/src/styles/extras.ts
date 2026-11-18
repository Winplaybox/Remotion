import type { CatalogueEntry } from "./catalogue.generated";

/**
 * CHANNEL PACK — 20 extra code-only looks made for our channels (Indian art, Mumbai, horror cams, kids, puzzles).
 * Kept apart from the 49-style generated catalogue so that file stays a pure copy of docs/style-catalogue.json.
 * Looks + status live in recipes.ts like every other style; which channel uses which is in channels/looks.ts.
 */
const e = (id: string, name: string, category: string, approach: string, limitation: string): CatalogueEntry => ({
  id, name, category, approach, packages: ["Built-in React/SVG/CSS"], assets: "Fully code-native (SVG filters + CSS overlays).", difficulty: "Low–Medium", limitation, requested: false
});

export const EXTRA_CATALOGUE: CatalogueEntry[] = [
  // puzzles (readability-safe: no wobble / pixel / heavy posterize, so glyphs and spin stay clear)
  e("neon-glow", "Neon Glow", "Channel pack / puzzle", "Bloom + saturation lift + deep vignette on dark scenes.", "Needs dark backgrounds; flat light scenes just get brighter."),
  e("crt-arcade", "CRT Arcade", "Channel pack / puzzle", "Scanlines, RGB split, bloom and rounded CRT corners.", "Keep RGB split small (≤3px) so small text stays sharp."),
  e("rangoli-festive", "Rangoli Festive", "Channel pack / puzzle", "Warm gold grade, drifting diya light-leak, marigold border.", "Festival weeks look best; daily use can feel repetitive."),
  e("taxi-pop", "Taxi Pop", "Channel pack / Mumbai", "Kaali-peeli yellow/black pop grade with light halftone.", "Boosts yellows strongly; tune if a decoy colour is also yellow."),
  e("mumbai-night", "Mumbai Night", "Channel pack / Mumbai", "Sodium-lamp orange vs teal night grade, bloom, vignette.", "Darkens the frame ~10%."),
  e("mumbai-monsoon", "Mumbai Monsoon", "Channel pack / Mumbai", "Teal-grey monsoon grade + deterministic rain streaks.", "Rain overlay sits over the scene; keep opacity low on puzzles."),
  // mythology / Indian art
  e("tanjore-gold", "Tanjore Gold", "Channel pack / Indian art", "Rich pigments, gold-leaf bloom, ruby + gold border.", "Approximation; real Tanjore uses raised gesso and gold foil."),
  e("pichwai-night", "Pichwai Night", "Channel pack / Indian art", "Deep indigo night grade, gold highlights, lotus-toned border.", "Approximation of Nathdwara pichwai; motifs are not drawn."),
  e("kalighat-pat", "Kalighat Pat", "Channel pack / Indian art", "Bold sweeping ink outlines, flat colour, plain ochre paper.", "Ink pass is the heaviest filter here; ~1.3x render time."),
  e("temple-mural", "Temple Mural", "Channel pack / Indian art", "Ajanta-style earthy palette, soft wall wobble, plaster grain, temple-arch frame.", "Mutes saturation; bright brand colours get earthier."),
  e("golden-hour", "Golden Hour", "Channel pack / cinematic", "Warm sunset grade, drifting light-leak, soft bloom.", "Not for night scenes."),
  // detective / tech
  e("neon-noir", "Neon Noir", "Channel pack / detective", "Magenta-blue night grade, letterbox, heavy vignette, grain.", "Keeps colour, so colour-coded clues still read."),
  e("detective-pulp", "Detective Pulp", "Channel pack / detective", "Yellowed pulp paper, halftone, light sepia (colour kept).", "Light sepia; clues coded only by colour should be checked."),
  e("matrix-terminal", "Matrix Terminal", "Channel pack / tech", "Green phosphor gradient map, scanlines, bloom, CRT corners.", "Monochrome: never for colour-coded puzzles."),
  e("blueprint", "Blueprint", "Channel pack / trains", "Navy-to-cyan gradient map with engineering grid.", "Monochrome blue; brand colours are lost while it is on."),
  // horror
  e("night-vision", "Night Vision", "Channel pack / horror", "Green gradient map, grain, scanlines, tight vignette.", "Monochrome by design."),
  e("thermal-cam", "Thermal Cam", "Channel pack / horror", "Luminance → blue/purple/red/yellow/white heat map.", "Bright = hot; dark scenes read cold."),
  e("candlelight", "Candlelight", "Channel pack / horror", "Warm flickering low-key grade, deep vignette, grain.", "Very dark edges; keep key action central."),
  // kids
  e("crayon-kids", "Crayon Kids", "Channel pack / kids", "Wobbly boiling outlines, crayon grain, paper, held on twos.", "Hand-drawn boil can feel busy on very fast motion."),
  e("pastel-dream", "Pastel Dream", "Channel pack / kids", "Lifted pastel grade, soft bloom, warm paper.", "Lowers contrast; keep text outside the style.")
];
