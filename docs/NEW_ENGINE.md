# Building a new video engine (guide for humans and AI agents)

This repo turns one idea into an endless daily channel: **post number in → finished Short out**, with Hinglish voice, original music, SFX and an answer comment, rendered by Claude and uploaded by GitHub. Chakra Puzzle (`engines/odd-orbit`), Kaali Peeli Chase (`engines/track-vehicle`) and EpicBharatSaga (`engines/story-diorama`) are the reference engines. A new idea must follow the same pattern so every channel looks, sounds and ships the same way.

> **AI agent: read this whole file, then `engines/_template/`, then one reference engine closest to the idea before writing code.**

## 0. Scaffold

```bash
node scripts/new-engine.mjs bubble-pop BubblePop     # copies engines/_template -> engines/bubble-pop
```

The template is a complete, working puzzle ("find the one with a different beat"): schema, day builder, speed ramp, timer, reveal, end card, voice lines, music + SFX. Replace the puzzle logic, keep the structure.

## 1. The contract every engine follows

| Part | File | Rule |
|---|---|---|
| Schema | `model.ts` → `XSchema` (zod) | Everything the video shows is a prop. Includes `voice` (filled by post.ts), `sound`, `seed`, palette, end card. |
| Day builder | `model.ts` → `xForDay(n)` | Post number → complete props. **Deterministic**: only `random(seed)` from `remotion`, never `Math.random()` or `Date`. Weekly difficulty ramp (`(n-1) % 7`), rotate content so 30 consecutive posts never feel the same. |
| Duration | `model.ts` → `xDuration(p)` | Frames at 30 fps. Puzzles ~20 s, stories 40–60 s. |
| Answer | `model.ts` → `xAnswer(p)` | Computed from the seed. Video, voice and answer comment all read this one function, so they can never disagree. |
| Voice | `model.ts` → `xVoiceLines(p)` | `[{ file, text, at }]`. Text in **Devanagari** (the Hindi TTS voice reads it naturally; English words are fine inside). Each line must fit before the next event (≈ 12 characters per second). |
| Composition | `XComposition.tsx` | Pure function of props + frame. Renders `<VoiceCues>` and `<SoundBed>`. |
| Channel | `channels/channels.ts` | `resolve`, `meta` (Hinglish title/description/tags/caption), `voice`, `answer`, slots, start date. |
| Studio | `apps/studio/src/remotion/Root.tsx` | Register a `<Composition>` with `calculateMetadata` for the duration. |

## 2. Visual style (what makes these videos look "ours")

- **Canvas** 1080×1920, 30 fps, dark gradient background (puzzles) or warm paper-cutout diorama (stories).
- **Layout bands**: 0–180 brand row + `#NNN` · 180–470 title (Anton / `FONT.display`, auto-sized `min(110, 1800/len)`), subtitle (`FONT.ui`), timer · 470–1500 the puzzle/scene · 1500–1700 CTA or captions · ~1780 handle. Captions never go below 1700 (YouTube UI covers it).
- **Fonts** only from `useBundledFonts()`: `FONT.display` (Anton), `FONT.punch` (Poppins italic 900), `FONT.ui` (Inter), `FONT.mono`.
- **Look**: glows (`radialGradient` fades), soft shadows, a single accent colour per post, palettes rotate by post number. Everything drawn in SVG/React — no stock images, no copyrighted characters.
- **Motion**: spring entrances (`spring({ damping: 12–15 })`), everything ramps **slow → fast** over the play time (`rampedTime` or stepped tiers like Kaali Peeli's DHEEMA → TEZ → AUR TEZ → SABSE TEZ with an on-screen badge).
- **Retention beats** (puzzles): 0–1 s hook title + voice · countdown timer · last 3 s ticks + "बस तीन सेकंड!" · reveal with highlight + ding · 5 s end card: *"Main ek solo dev hoon — ek cozy X game bana raha hoon · FOLLOW KARO, SABSE PEHLE KHELO"*.
- **Stories** use `engines/story-diorama` directly — a new story channel is usually just new content (`content/<channel>/…`), not a new engine.

## 3. Sound (all original, in `public/sfx/`, made by `scripts/sound/synth.py`)

| File | Use |
|---|---|
| `music_puzzle`, `music_chase`, `music_saga` | Background loop. Puzzles 0.13–0.16 volume, stories 0.08; ducks under voice automatically (`duckFromCues`). |
| `tick`, `ding`, `pop`, `whoosh`, `swoosh`, `riser` | Countdown, reveal, appear, end card, each movement, speed-up. |
| `engine_loop`, `horn`, `footsteps`, `bell` | Vehicles, walking characters, temple/start. |
| `rain_loop`, `fire_loop`, `water_loop` | Ambience (stories pick these from `particles`). |

Need a new sound? Add a generator to `scripts/sound/synth.py` (numpy synthesis, no samples) and re-run it. Never download music or SFX from the internet.

## 4. Copy rules

Hinglish everywhere (Roman on screen, Devanagari for voice). Titles say exactly what to do ("9 KE BEECH 6 DHUNDO"). No clickbait the video doesn't deliver, no other channels' names, no fake numbers.

## 5. Shipping rules

1. **Never change a post that is already published.** If you change a day builder, keep posts ≤ the last uploaded number byte-identical (see the `LEGACY` map in `engines/odd-orbit/src/model.ts` and `speedTiers: d > 3` in `engines/track-vehicle`). Prove it by diffing the props JSON before/after.
2. Add a test in `tests/` that builds 30 days and checks: schema parses, answer in range, no two consecutive posts identical, voice lines don't overlap events.
3. Render stills of 3–4 frames (hook, mid, reveal, end card) for 3 different days and **look at them**: text fits, nothing under the YouTube UI.
4. `npx tsc --noEmit && npm run lint && npm test` must pass.
5. Work on a branch, open a PR. Never push to `main`.

## 6. Going live

1. Add the channel to `channels/channels.ts` (slots in IST, `startDate`, token secret name, `voice`, `answer`).
2. Create the YouTube channel and put its token in GitHub: `node scripts/publish/setup-secrets.mjs …`.
3. Merge. From then on: Prepare Voice (Actions) → Claude render (04:41 IST) → Publish Channels (hourly) → answer comment. See `docs/CHANNELS.md`.

## Prompt to give an AI agent

```
Build a new engine in Winplaybox/Remotion for this idea: <describe the idea, the viewer's task, the answer>.
Follow docs/NEW_ENGINE.md exactly: scaffold with scripts/new-engine.mjs, keep the schema/day-builder/answer/voice/
composition contract, the layout bands, fonts, slow->fast motion, Hinglish copy, SoundBed music+SFX and the end card.
Make 30 days of deterministic variety, add tests, render and inspect stills, and open a PR (never push to main).
```
