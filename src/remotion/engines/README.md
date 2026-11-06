# Portrait Video Engines

Three standalone Remotion compositions are registered in `src/remotion/Root.tsx`.

## Output contract

- Canvas: 1080 × 1920 (9:16 portrait)
- Frame rate: 30 FPS
- Codec: H.264 / MP4 (repository Remotion config)
- Duration: Orbit Puzzle 30s, Traffic Puzzle 35s, Sanatan Story 60s
- Rendering is frame-deterministic; animation derives from Remotion's current frame.

## Engines

| Composition ID | Source | Purpose |
| --- | --- | --- |
| `OrbitPuzzle` | `src/remotion/engines/orbit-puzzle/OrbitPuzzleEngine.tsx` | Orbital pattern challenge, countdown and answer reveal |
| `TrafficPuzzle` | `src/remotion/engines/traffic-puzzle/TrafficPuzzleEngine.tsx` | Top-down traffic puzzle, countdown and escape reveal |
| `SanatanStory` | `src/remotion/engines/sanatan-story/SanatanStoryEngine.tsx` | Five-scene devotional/storytelling visual sequence |

## Preview and render

Run from the repository root:

```bash
npm run remotion:preview
npx remotion render src/remotion/index.ts OrbitPuzzle output/orbit-puzzle.mp4
npx remotion render src/remotion/index.ts TrafficPuzzle output/traffic-puzzle.mp4
npx remotion render src/remotion/index.ts SanatanStory output/sanatan-story.mp4
```

## Engineering notes

- These are first-pass, self-contained sample compositions intended to establish each engine's visual language and timing.
- Puzzle content, board layouts, answer keys, episode scripts, narration, character/art assets and sound design should move into typed data/configuration before the engines are used for batch production.
- The Sanatan composition currently uses original abstract sacred-geometry motifs and typography rather than claiming historical character or scene accuracy. Production episodes should use approved reference art and script/source validation.
- Social publishing and platform APIs are intentionally out of scope until video generation and quality gates are complete.
