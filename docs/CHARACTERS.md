# Character rig — how to change a character

All looks live in `packages/visuals/src/rig/presets.ts`. One preset = one cast member. Change a field, run
`npx remotion still apps/studio/src/remotion/index.ts CharacterSheet out.png` (or open Studio → Rig/CharacterSheet) and check.

| Field | Options |
|---|---|
| `skin`, `hairColor`, `topColor`, `trim`, `bottomColor`, `shoes`, `headwearColor` | any hex colour |
| `hair` | short, sidePart, spiky, bald, bun, braid, ponytail, greyBun, none |
| `headwear` | none, pagdi, gandhiTopi, cap, policeCap, fedora |
| `facialHair` | none, mustache, bigMustache, stubble, beard |
| `top` | kurta, shirt, vest, blouse (saree), coat, uniform, tshirt |
| `bottom` | pants, dhoti, saree, salwar, pyjama |
| `accessories` | bindi, glasses, tilak, gamcha, dupatta, magnifier, goldChain, belly, badge, earrings, bangles |
| `height` | 0.85–1.1 |

Poses (`Character pose=`): idle, talk, point, think, shock, wave, handsUp, shrug, hipHand. Expressions: neutral, happy,
worried, angry, surprised, smug. A new preset is picked up by every engine; to use it in Jhooth Kaun? add it to a set's
`roles` in `engines/liar-lineup/src/content.ts`.
