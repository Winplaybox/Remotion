# Winplaybox Video Engine

## Product boundary
This repository is the video-production system. It does not publish to social platforms. Every engine produces portrait-first Remotion compositions and is validated before distribution integrations are considered.

## Master render contract
- 1080 × 1920 (9:16), 30 FPS
- H.264 video, AAC audio, yuv420p delivery
- Frame-driven, deterministic animation
- Mobile-safe typography and composition
- No landscape-first layouts or post-render cropping

## Architecture
- `apps/studio`: Remotion entry point and composition registry
- `engines/orbit-puzzle`: orbit puzzle content model, validation and composition
- `engines/traffic-puzzle`: board model, bounds/overlap validation and composition
- `engines/sanatan-story`: episode/scene model and cinematic story composition
- `packages/core`: video contracts, scene contracts and timeline math
- `packages/motion`: deterministic easing and motion primitives
- `packages/camera`: camera transform helpers for 2.5D moves
- `packages/audio`: reusable narration/music/SFX timeline tracks
- `packages/visuals`: portrait safe-area and reusable visual primitives
- `packages/scene-runtime`: shared scene lifecycle and transitions
- `tests`: deterministic model and timeline tests
- `content`, `public/audio`: retained source material from the former project for migration/reference

Engine packages own content and domain logic. Shared packages own rendering primitives; domain-specific behavior must not leak into the shared runtime.

## Engine definition of done
1. Content is data-driven and schema-validated.
2. Scene durations and audio cues are frame-accurate.
3. Puzzle engines validate board layouts and solution paths before rendering.
4. Story episodes include source notes, narration and scene/asset references.
5. Composition previews are reviewed at hook, middle, reveal and final frames.
6. Full MP4 is rendered and checked for clipping, blank frames, audio sync, encoding and continuity.
7. Tests, typecheck and lint pass in CI.

## 28-day milestone: 6 Nov – 4 Dec 2026
| Dates | Milestone | Exit criteria |
| --- | --- | --- |
| Nov 6–8 | Architecture reset | New studio entry, shared contracts, timeline and CI |
| Nov 9–12 | Core runtime | Motion, safe-area, camera, audio tracks and scene runtime |
| Nov 13–17 | Orbit Puzzle | Data-driven puzzle templates, timing, reveal and validated output |
| Nov 18–22 | Traffic Puzzle | Board validation, legal moves, solution playback and output |
| Nov 23–27 | Sanatan Story | Episode schema, scene pipeline, narration/subtitles and cinematic visual system |
| Nov 28–Dec 1 | Integration | Shared asset pipeline, sound design, render presets and reusable templates |
| Dec 2–4 | Quality gate | Full renders, regression tests, visual review and milestone sign-off |

## Quality gate
A passing TypeScript build is not a passing video. Each engine must produce a complete MP4, and the output must be inspected at representative timestamps and played end-to-end. Do not sign off based on smoke frames alone.

## Migration
The former PDF-to-Shorts source is removed from the active source tree. Its topic notes, storyboard JSON and narration audio are retained under their original paths as migration/reference material until assets are mapped into the new content model.
