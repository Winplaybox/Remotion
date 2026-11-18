# Visual styles (49-style code-only catalogue)

Source: `docs/style-catalogue.json` → `packages/visuals/src/styles/catalogue.generated.ts` (49 entries, 13 requested ones flagged).
Looks + status: `styles/recipes.ts`. Use:

```tsx
<StyledScene style="comic-art"> <MyScene/> </StyledScene>      // any scene; inside it, useStyleFrame() gives the held frame
```
Preview any style: Studio → Styles/StyleShowcase (prop `styleId`), or `npx ts-node scripts/render-styles.ts`.

Status (rule from the catalogue: not “production ready” until renderer + assets + sample + tests exist):
- **ready (18)** real 2D treatment on any scene: pixel-art, comic-art, risograph, sharp-ink-outlines, flat-vector, pencil-sketch, watercolor-storybook, manga-screentone, ukiyo-e, linocut, engraving, pop-art, newspaper, cinematic-2.5d, film-noir, neon-cyberpunk, silhouette, vintage-film.
- **approx (20)** a 2D imitation of a look that fully needs drawn cels / puppets / folk-art assets / 3D (anime styles, rubber-hose, claymation, paper-cutout, miniature/toy tilt-shift, Indian miniature, Madhubani, Warli, sci-fi HUD …).
- **planned (11)** need a real 3D/shader renderer (Three.js) or a new design system: ps2, lego, low-poly, cel-shaded, stylized-3d, isometric, voxel, toon-shaded, 3d-cutaway, chibi, kinetic-typography. Their recipe is only a placeholder preview.

Deterministic: noise seeds come from the frame number; no `Math.random`.

## Channel pack (+20, Nov 2026) and channel looks

`packages/visuals/src/styles/extras.ts` adds 20 code-only looks made for our channels (total 69). New recipe tools in
`recipes.ts` / `StyledScene.tsx`: `gradientMap` (N-stop luminance map), `rgbSplit`, `lightLeak`, `rain`, `vignetteColor`,
`borderColors`, overlays `grid` / `arch` (temple jharokha) / `crt`.

| Group | Styles |
|---|---|
| Puzzle-safe (hue kept, no wobble/pixel) | neon-glow, crt-arcade, rangoli-festive |
| Mumbai | taxi-pop, mumbai-night, mumbai-monsoon |
| Indian art | tanjore-gold, pichwai-night, kalighat-pat, temple-mural |
| Cinematic / detective / tech | golden-hour, neon-noir, detective-pulp, matrix-terminal, blueprint |
| Horror cams | night-vision, thermal-cam, candlelight |
| Kids | crayon-kids, pastel-dream |

**Which channel wears what:** `channels/looks.ts`. From `LOOKS_FROM` (2026-11-22) every post of a listed channel gets
`style` = its rotation[(n-1) % 7]; earlier posts are untouched. Engines that read `style`: story-diorama (scenes only;
header, ask outro and finish stay crisp), odd-orbit, track-vehicle, liar-lineup, code-lock. Long 16:9 videos stay plain
(render time). Puzzle channels are `colourSafe`: no monochrome looks, and a Chakra `tint` puzzle always gets the signature.
Tests: `tests/channel-looks.test.ts`.
