# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

PDF2Shorts Studio converts research PDFs and authoritative technical documentation into original Hinglish educational YouTube Shorts and Instagram Reels (1080×1920, max 180s). Channel niche: AI, Technology & Future Explained. Target: 2 approved videos/day via GitHub Actions rendering with mandatory human approval before publishing.

## Tech Stack

- **Runtime**: Node.js LTS + TypeScript (strict mode)
- **Video**: Remotion + React
- **3D**: Three.js / React Three Fiber (reserved for hero scenes only)
- **2.5D**: CSS transforms + SVG (default for most scenes)
- **PDF**: PyMuPDF (Python) with pdf.js fallback
- **Validation**: Zod for all schemas
- **Audio**: FFmpeg for processing; TTS via adapter interface
- **Automation**: GitHub Actions (scheduled + manual dispatch)

## Common Commands

```bash
npm ci
npm run typecheck
npm run lint
npm run test
npm run remotion:preview
npm run render -- --composition=<id>
npm run audit:scheduled
```

## Architecture Principles

**Claude does**: research interpretation, script writing, storyboard generation, SEO suggestions.
**Code does**: PDF extraction, OCR, duplicate detection, timing math, subtitle validation, rendering, audio mixing, analytics.

## Core Data Contract

```
research → script-review → storyboard-review → render-ready
→ rendered → quality-review → approved → published / rejected
```

Any material change to script or visuals invalidates prior approval.

## Content Rules

1. Every factual claim must have a traceable source.
2. Never invent statistics, citations, or research findings.
3. Write original scripts — never reproduce a PDF verbatim.
4. Natural Hinglish narration; preserve English technical terms.
5. Target 120–175s; measure from actual audio duration.
6. Detect and reject duplicate topics before generating scripts.

## Remotion Design System

`CinematicIntro` · `CinematicOutro` · `SpatialTypography` · `KineticCaptions` · `FloatingCards` · `DataVisualization` · `ProcessFlow` · `NeuralNetworkScene` · `CodeVisualization` · `CameraRig` · `ParallaxLayers` · `SceneTransition` · `AudioTimeline`

2D/2.5D layers by default. Three.js reserved for hero moments only.

## GitHub Actions

- Daily audits at 08:00 and 18:00 IST.
- Rendering is `workflow_dispatch` only — requires approved `videoId`.
- Pin all third-party Actions to full commit SHAs.

## Implementation Phases (do not skip ahead)

| Phase | Gate |
|-------|------|
| 0 | Environment audit |
| 1 | Working Remotion test render |
| 2 | PDF extraction → structured research JSON |
| 3 | Editorial engine → 3 reviewed scripts |
| 4 | Storyboard engine → valid scene JSON |
| 5 | Media engine → narrated video with captions |
| 6 | Visual design system → 3 videos from shared components |
| 7 | Cloud render + QC → downloadable validated MP4 |
| 8 | Analytics + daily automation workflow |
