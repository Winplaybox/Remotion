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
