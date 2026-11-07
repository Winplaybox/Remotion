# Channels — daily production

Three separate channels, one repo. Each channel has a `startDate`, and every date maps to Day N, so every upload is new and in order.

| Channel | Composition | Engine | Narration | Config |
|---|---|---|---|---|
| Chakra Puzzle | `ChakraPuzzle` | `engines/odd-orbit` | none (music + SFX later) | `chakraPuzzleForDay()` in `engines/odd-orbit/src/model.ts` |
| Kaali Peeli Chase | `KaaliPeeliChase` | `engines/track-vehicle` | none | `kaaliPeeliForDay()` in `engines/track-vehicle/src/model.ts` |
| EpicBharatSaga | `EpicBharatSaga` | `engines/story-diorama` | IndicF5 (own voice) | `content/epicbharatsaga/vishnu-season.ts` |

Start dates, post captions and hashtags are in `channels/channels.ts`.

## Daily commands

```bash
npm run daily -- --channel chakra-puzzle                 # today's puzzle (IST date)
npm run daily -- --channel kaali-peeli-chase --day 5     # a specific day
npm run daily -- --channel epicbharatsaga --date 2026-11-12 --dry   # props + narration script only
```

Outputs go to `output/<channel>/day-NNN.mp4`, plus `.json` (props) and `.txt` (post caption with hashtags).

## How each day changes

- **Chakra Puzzle**: the element rotates daily (chakra, ring, diya, atom, planet, clock, gear, comet, binary, spinner). The rule follows a weekly pattern (ulta, tez, dheema, alag rang). Difficulty goes from easy to expert across the week. The colour palette rotates. The seed is unique, so no two days have the same answer.
- **Kaali Peeli Chase**: the vehicle rotates daily (kaali-peeli taxi, auto, BEST bus, police, ambulance, truck, red car, SUV). The grid grows from 3×3 to 4×4, and shuffle time and speed go up across the week. The level number equals the day number.
- **EpicBharatSaga**: EP N goes out on day N. If an episode is not written yet, the render **fails** instead of making something up. EP01 (Matsya) is done. EP02–EP10 are listed in `VISHNU_SEASON.outline`.

## Narration (EpicBharatSaga)

1. `npm run daily -- --channel epicbharatsaga --day 1 --dry` writes `output/epicbharatsaga/day-001.narration.json` (Devanagari text per scene).
2. Run it on a GPU machine or Colab:
   `pip install -r scripts/narration/requirements.txt`
   `python scripts/narration/narrate.py --channel epicbharatsaga --day 1 --ref ref.wav --ref-text "<exact words in ref.wav>"`
   This writes `public/audio/epicbharatsaga/day-001/scene-N.wav` (trimmed, -16 LUFS).
3. `npm run daily -- --channel epicbharatsaga --day 1` renders with the voice. Each scene stretches to fit its narration, and the captions follow it.

Use `--engine edge` for a quick Edge TTS fallback. Use `--only 3` to redo one scene.

## Adding an EpicBharatSaga episode

Copy the EP01 block in `vishnu-season.ts`. For each scene, write `narration` (Devanagari, for the voice), `caption` (Roman Hinglish, shown on screen), headlines, layers and labels. Then run `npm test`, which checks that every authored episode parses and has narration and captions. Fact-check every episode against the Purana before publishing.
