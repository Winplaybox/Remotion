# Building a new video engine (guide for humans and AI agents)

This repo turns one idea into an endless daily channel: **post number in → finished Short out**, with Hinglish voice, original music, SFX and an answer comment, rendered by Claude and uploaded by GitHub. Chakra Puzzle (`engines/odd-orbit`), Kaali Peeli Chase (`engines/track-vehicle`) and EpicBharatSaga (`engines/story-diorama`) are the reference engines. A new idea must follow the same pattern so every channel looks, sounds and ships the same way.

> **AI agent: read this whole file, then `engines/_template/`, then one reference engine closest to the idea before writing code.**

## The Engine Builder pipeline

| Step | Who / what | Output | Gate |
|---|---|---|---|
| 1. Idea → architecture | Agent writes a short design in the PR: the viewer's task, what changes day to day, the answer, the difficulty ramp, the voice lines | PR description | Human agrees with the idea |
| 2. Architecture → code | `npm run engine:new -- <slug> <Pascal>` then the agent **writes the real game logic** (the template is only a placeholder puzzle) | `engines/<slug>/` wired into Studio, catalog and a **disabled** channel | `npx tsc --noEmit`, `npm run lint` |
| 3. Code → 30 days | `<x>ForDay(n)` with seeded variety | — | `tests/engine-catalog.test.ts`: schema, length, all 30 days unique, voice lines in order and not stacked, answer for every post |
| 4. Narration + music | `<x>VoiceLines` (Devanagari Hinglish) + `SoundBed` (original kit in `public/sfx`) | — | voice test above; loudness in QA |
| 5. Render → QA | `npm run engine:qa -- --engine <slug>` (also runs in CI as job **engine-qa**) | `qa/<slug>/contact-sheet.png`, `day01.mp4`, `report.md` | stills render, audio stream present, mean −40…−10 dB, peak ≤ −0.3 dB, **a human looks at the contact sheet and the MP4** |
| 6. Quality pass → PR | branch + PR, never `main` | PR with QA artifact | all CI checks green |
| 7. Approval → publishing | human merges, adds `YT_TOKEN_<ID>`, sets `START_<ID>` + `LIVE_<ID>` | channel goes live | — |

### Three non-negotiable conditions

1. **The template does not write the game.** It is a working placeholder ("find the one with a different beat") so the wiring compiles and renders. The agent must replace the model and composition with the real mechanic, layout and answer logic.
2. **Published posts are frozen.** `locks/published.json` stores the generated props of every published post; `tests/published-lock.test.ts` fails if any stored key changes. Lock posts as they go out: `npm run engine:lock -- --engine <slug> --upto <last published post>`. New fields must default to the old behaviour; new behaviour starts from a post number above the lock (see `ASK_FROM`, `LEGACY`, `speedTiers: d > 3`).
3. **Production approval.** TypeScript, lint, tests (including locks), rendered previews and the audio check must pass, and a human reviews the QA artifact before merging. New channels are created disabled and only a human turns them on.

## 0. Scaffold

```bash
npm run engine:new -- bubble-pop BubblePop --channel "Bubble Pop" --handle @BubblePop --slots 07:30,18:30
```

This creates `engines/bubble-pop/src/{model.ts,BubblePopComposition.tsx}` from `engines/_template`, registers the composition in `apps/studio/src/remotion/Root.tsx`, adds it to `engines/catalog.ts` (so tests and QA cover it) and adds a **disabled** channel to `channels/channels.ts` (start 2099-01-01, `autoPublish: false`). It does not write the game; see condition 1.

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

## 1b. The ending every puzzle engine uses — AskOutro (required, tested)

Puzzles never reveal the answer in the same video and never have a separate end card. They end with the shared
**AskOutro** (`engines/ask-outro.ts` + `packages/visuals/src/AskOutro.tsx`), modelled on what works on IG/YT Shorts:

| Phase | Time | On screen (scene stays bright underneath) | Voice |
|---|---|---|---|
| Prev answer | `introSeconds` (2.6s, post 2+) | `PrevAnswerCard`: "PICHHLE PUZZLE KA JAWAB" | `prev.wav` |
| Puzzle | `playSeconds` | your engine | hook / hurry |
| Question | `questionSeconds` (4s) | top banner: question + answer-format chips (`#1 #2 #3…`, `ROW 1-8 · NUMBER 1-7`) | `ask_q.wav` |
| CTA | `ctaSeconds` (5s) | yellow banner "APNA JAWAB COMMENT MEIN LIKHO! 👇 / Sahi jawab dekhne ke liye FOLLOW karo!" + red FOLLOW button a cursor taps -> ✓ FOLLOWING + handle | `ask_cta.wav` |

How to use it in an engine:
1. Schema: `askOutro: AskOutroSchema` (or `.optional()` if older posts were published without it).
2. `<x>ForDay`: `askOutro: askOutro({ question, options, voiceQuestion, handle })`; add `askOutroSeconds(outro)` to the duration.
3. Voice: `...askOutroVoice(p.askOutro, outroStartSeconds)` as the LAST lines.
4. Sound: `...askOutroSfx(p.askOutro, outroStartSeconds)` in the SoundBed sfx.
5. Composition: render `<AskOutro from={outroStartFrame} a={p.askOutro} accent={…} tapAt={followTapAt(p.askOutro)} />` as the last layer (before `PrevAnswerCard`).
6. Catalog: `askFrom` (1 for a new channel). Channel: `answerInNextFrom` = same number, and use `ASK_META` in description/caption.

`tests/engine-catalog.test.ts` fails if a puzzle engine has no `askFrom`, or if any post from `askFrom` on is missing the outro,
still reveals the answer, shows an end card, or does not end on `ask_cta.wav`. The answer comment is posted on post n
automatically once post n+1 is public (`scripts/publish/answer-comments.ts`); pin it in YouTube Studio.

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
2. The generic gate in `tests/engine-catalog.test.ts` covers every catalog engine automatically; add engine-specific tests for the game logic (e.g. the answer really is the odd one).
3. `npm run engine:qa -- --engine <slug>` and **look at** `qa/<slug>/contact-sheet.png` and `day01.mp4`.
4. `npx tsc --noEmit && npm run lint && npm test` must pass (includes the published-post locks).
5. Work on a branch, open a PR. Never push to `main`.

## 6. Going live

1. The scaffold already added a disabled channel to `channels/channels.ts`; fill in its titles/tags and slots.
2. Create the YouTube channel and put its token in GitHub: `node scripts/publish/setup-secrets.mjs …`.
3. Merge. From then on: Prepare Voice (Actions) → Claude render (04:41 IST) → Publish Channels (hourly) → answer comment. See `docs/CHANNELS.md`.

## Prompt to give an AI agent

```
Build a new engine in Winplaybox/Remotion for this idea: <describe the idea, the viewer's task, the answer>.
Follow docs/NEW_ENGINE.md exactly: scaffold with scripts/new-engine.mjs, keep the schema/day-builder/answer/voice/
composition contract, the layout bands, fonts, slow->fast motion, Hinglish copy, SoundBed music+SFX and the end card.
Make 30 days of deterministic variety, add tests, render and inspect stills, and open a PR (never push to main).
```
