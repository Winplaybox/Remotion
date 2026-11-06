# Production Readiness — Winplaybox Video Engines

## Delivery contract
Every engine is independently selectable and produces a complete MP4 plus a machine-readable manifest. A passing source CI run or a short-frame smoke render is not a production render.
- 1080 × 1920, portrait 9:16, 30 FPS
- H.264 video, yuv420p; AAC when an audio track is present
- Deterministic frame-driven animation
- Every manifest records engine, composition, source revision, duration, byte size and SHA-256
- Failed quality checks retain diagnostics; unvalidated artifacts are never promoted to publishing

## Engine acceptance
### Orbit Puzzle
Validate puzzle schema, answer index and orbit configuration; render the full challenge, countdown, answer reveal and end card; review hook, middle, reveal and final frames for legibility and safe-area compliance.

### Traffic Puzzle
Validate board bounds, vehicle overlap, target vehicle, legal moves and solved exit state; render the complete move sequence; review that each animation matches the validated solution.

### Sanatan Story
Validate episode and scene schemas, narration text, audio cue boundaries and source notes; render all scenes and synchronized audio cues. The demo episode is a runtime fixture, not an approved publication script. Production episodes require source review, approved visual assets, narration/audio and subtitle/caption review.

## Shared pipeline acceptance
1. Typecheck, lint and unit tests pass.
2. Selected engine content passes validation.
3. Full composition renders.
4. ffprobe diagnostics are retained even when validation fails.
5. MP4 contract is enforced.
6. A SHA-256 manifest is generated.
7. MP4, manifest and diagnostics are uploaded as downloadable artifacts.
8. Publishing remains disabled; no platform API is called.

## Publishing boundary
YouTube, Instagram, Facebook and Pinterest publishing, credentials, automated scheduling and public upload activation remain out of scope until separately validated and explicitly approved.
