# TECHNIQUE.md — Technical Rendering & Code Standards

This document specifies the technical execution rules for building animations in Remotion and maintaining parity with `lemo-opuscar` and `lemo-wake`.

---

## 1. Pure Frame Animation Rule (Zero Flickering)
- **Strict Rule:** Never use CSS `transition: all 0.3s ease` or `animation: spin 2s infinite`. CSS transitions desynchronize during headless multi-threaded frame rendering and cause severe visual flickering.
- **The Standard:** All motion must be purely computed from `useCurrentFrame()` using:
  ```tsx
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring physics
  const progress = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100 } });

  // Continuous oscillation
  const tiltX = Math.sin(frame * 0.05) * 5;
  ```

---

## 2. The Lemo-Wake Technique (Image Wakeup Engine)
When research PDFs include architectural diagrams, schematics, or formulas:
- **Never present raw static image crops.**
- Wrap diagrams in `<LemoWake />`:
  1. **Perspective Tilt:** Mount on a 3D plane with dynamic `rotateX` and `rotateY` responding to camera movement.
  2. **Light Sweep (Sheen):** Run a subtle diagonal gradient glare across the diagram (`frame % 120`).
  3. **Breathing Scale:** Subtle sinusoidal pulsing (`1 + Math.sin(frame * 0.04) * 0.02`).
  4. **Highlight Callouts:** Pulsing glowing rings around the key section of the diagram currently being explained.

---

## 3. Three.js / WebGL Synchronization
- **Canvas Lifecycle:** Initialize Three.js objects once in a `useEffect` on mount.
- **Render Loop:** In a second `useEffect([frame])`, update rotations and cameras based on `frame` and invoke `renderer.render(scene, camera)` synchronously.
- **Headless Fallback:** Always catch WebGL initialization errors and render a 2.5D SVG/CSS fallback to ensure CI runners never fail under software rendering.

---

## 4. Multi-Speaker Audio Pacing
- Calculate scene durations from real audio:
  `durationInFrames = Math.ceil(audioDurationInSeconds * 30)`
- Set active speaker index by comparing `frame` against the speaker turn timeline:
  ```tsx
  const isSpeaker1Active = frame >= turn.startFrame && frame < turn.endFrame;
  ```
