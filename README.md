# Winplaybox Video Engine
A modular, portrait-first video production platform built with Remotion.

## Start
```bash
npm install
npm run remotion:preview
```

## Compositions
- `OrbitPuzzle` — animated orbital reasoning challenges
- `TrafficPuzzle` — grid-based traffic escape puzzles
- `SanatanStory` — episode-driven cinematic storytelling

All compositions target 1080×1920 at 30 FPS (9:16).

## Render
```bash
npm run render:orbit
npm run render:traffic
npm run render:sanatan
npm run quality:render -- output/orbit-puzzle.mp4
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for module boundaries, quality gates and the 28-day milestone.

Building a new engine: [docs/NEW_ENGINE.md](docs/NEW_ENGINE.md). Next-phase engine ideas (ranked): [docs/ENGINE_IDEAS.md](docs/ENGINE_IDEAS.md).
