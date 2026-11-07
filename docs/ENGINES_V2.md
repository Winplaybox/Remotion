# Engines v2 — OddOrbit, TrackVehicle, StoryDiorama

Three data-driven 9:16 engines built to match the reference reels (Loop Lab, Tiny Ocean Games, Chapters of Sanatan).
Silent by design: every composition renders with `--muted` and has no audio dependency.

| Composition | Reference format | What you change per video |
|---|---|---|
| `OddOrbit` (+ `OddOrbit-Atom/Planet/Clock/Gear/Binary/Comet/Spinner`) | "Find the one going backwards" grid | `element`, `oddRule`, `cols`, `count`, `seed`, texts, palette |
| `TrackVehicle` (+ `-Police/Ambulance/Bus/Truck/Sports/Auto/SUV`) | "Track the taxi" shell game | `vehicle`, `label`, `seed`, `difficulty`, `shuffleSeconds`, colors |
| `StoryDiorama` | Paper-cutout mythology explainer | `scenes[]` — layers, headlines, labels, particles, camera |

## Rendering

```bash
npm run remotion:preview                                   # Studio, edit props live
npx remotion render apps/studio/src/remotion/index.ts TrackVehicle output/taxi.mp4 --muted
npx remotion render apps/studio/src/remotion/index.ts OddOrbit out.mp4 --muted --props=./my-puzzle.json
```

A new daily video = a new JSON file passed with `--props`. Change only `seed` and you get a brand-new puzzle.

## OddOrbit

- `element`: `ring | planet | atom | binary | comet | clock | spinner | gear` — add more in `engines/odd-orbit/src/elements.tsx` (one small component each).
- `oddRule`: `reverse` (default), `faster`, `slower`, `tint`. For speed rules keep `speedJitter` ≤ 0.03.
- `oddIndex: -1` picks the odd cell from `seed`. Set a number to force it.
- `revealSeconds: 0` = pure loop (answer in comments), otherwise it spotlights the answer with `ROW x · #y`.

## TrackVehicle

- `vehicle`: `taxi | police | ambulance | bus | truck | sports | auto | suv` — top-down SVG in `vehicles.tsx`.
- Phases: intro → show target (glow + "remember this one") → disguise → shuffle with countdown → numbered question → optional answer → optional end card.
- `difficulty` 1–3 controls speed ramp and simultaneous swaps; `targetBias` is how often the target is in a swap.
- The answer is computed from the swap plan, never hand-typed (`tests/track-vehicle-schedule.test.ts` proves it).

## StoryDiorama

Each scene = sky gradient + optional ground + stacked layers + headline beats + leader-line labels + particles + camera move.

Layer types:
- `{ kind: "prop", prop: "rangoli", x, y, ... }` — built-in paper props: `moon, moonPhases, clouds, hills, doorway, toran, diya, diyaRow, rangoli, rooftops, lotus, water, tree, temple, sun, noteCard, festivalTracker, progress, monthCalendar`.
- `{ kind: "image", src: "story/lakshmi.png", width: 520, x, y }` — any transparent PNG in `public/`, anchored bottom-centre.

Shared layer fields: `at` (seconds), `enter` (`fade|rise|drop|pop|slideLeft|slideRight|none`), `idle` (`bob|sway|drift|pulse|walk|none`), `depth` (parallax for the camera), `scale`, `flip`.

### Getting the reference look (characters)

The reference channel's quality comes from **illustrated character cutouts**, not from Remotion. Remotion only composes and animates them. Pipeline:

1. Generate each character/prop separately on a plain background with one fixed style prompt (e.g. "Indian devotional storybook illustration, flat painted, soft shading, full body, plain white background").
2. Remove the background (`rembg i in.png out.png`) and save to `public/story/<episode>/`.
3. Add an `image` layer per cutout with `enter: "slideLeft"` / `idle: "walk"` etc. Keep backgrounds as separate layers so parallax works.

Fact-check every story line before publishing; the demo episode text is sample content.
