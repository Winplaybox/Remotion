---
name: spatial-storyboard-generator
description: Converts approved Hinglish scripts into structured scene JSON with camera motion, 2.5D depth layers, 3D hero moments, and typography direction.
---

# Spatial Storyboard Generator Skill

## Objective
Generate a complete, frame-accurate scene plan for Remotion rendering. Map every spoken sentence to visual components and dynamic spatial transformations.

## Rules
1. **Layer Hierarchy:**
   - **Layer 1 (2D):** Fast kinetic typography, flat diagrams, charts, badges.
   - **Layer 2 (2.5D):** Multi-plane parallax, glassmorphism cards with subtle 3D tilt, floating badges.
   - **Layer 3 (3D Hero):** Three.js geometric models, neural networks, or spatial environments reserved for core explanatory peaks.
2. **Timing Integrity:** The sum of all scene `durationInFrames` must equal the total video duration (`fps * targetDurationSeconds`).
3. **Camera Trajectory:** Specify clean camera movements (`push_in`, `parallax_orbit`, `pan_left`, etc.) to maintain visual momentum without causing motion sickness.
4. **Validation:** Emits valid JSON conforming to `StoryboardSchema` in `@schemas/storyboard`.
