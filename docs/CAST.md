# Jasoos Bhai cast — 100 characters, 20 actions, 16 expressions

All art is **code** (React/SVG, one rig: `packages/visuals/src/rig/Character.tsx`). No AI images.

| File | What |
|---|---|
| `rig/cast.ts` | the 100 looks: id, name, profession, category (10×10), tier (12 main · 38 supporting · 30 rotating suspects · 20 guests) |
| `rig/presets.ts` | the `Look` type + every option (hair, headwear, facial hair, outfit, accessories, props, face shape, eyes, nose, brows) |
| `rig/motion.ts` | the 16 expressions, 17 arm poses (2-bone IK, arms never stretch) and the 20 actions |
| `rig/parts.tsx` | drawing code for hair / hats / outfits / props |

**Edit a character:** change its row in `cast.ts` (e.g. `hair: "curly"`, `headwear: "pagdi"`). `tests/cast.test.ts` fails if two
characters become too similar (≥5 of 12 traits must differ), if tier/category counts break, or if arm bones stretch.

## Use in a video
```tsx
<Character look="seth" action="walk" frame={frame} />                  // loops every 32 frames
<Character look="dadi" action="talk" expression="angry" talking frame={frame} />
```
Actions: idle walk run talk smile laugh think point surprised afraid nervous stressed angry cry confused suspicious sneak lookLeft lookRight celebrate.
Expressions: neutral happy smiling laughing angry sad crying afraid nervous stressed shocked surprised suspicious confused thinking evilSmile.
Old `pose=` / `expression="smug"` props still work (liar-lineup uses them).

## Sprite library (transparent PNG)
```
npx ts-node scripts/export-cast.ts all output/characters     # or: jasoos,dadi
python3 scripts/make-sheets.py output/characters             # one sprite sheet per folder
```
`output/characters/<id>/{idle,walk,run,talk,expressions,emotions,actions}/*.png` + `<folder>.sheet.png/json` + `atlas.json`.
Every frame is 640×700 with the feet anchor at (320, 650) — identical for every character and state. Loop folders
(idle/walk/run/talk) contain whole loops, so frame N+1 after the last frame is frame 0 with no jump. `output/` is gitignored (≈160 MB).

Proof sheets (Studio → Rig): `CharacterSheet` (category + action), `ActionSheet` (all 20 actions + 16 expressions of one id).

## Honest limits
Faces are flat-vector (dot eyes, simple mouths) like the approved Jasoos reference; “3–4 poses” are the 17 IK poses, not hand-drawn variants.
