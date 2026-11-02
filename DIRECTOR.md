# DIRECTOR.md — Remotion Directing Principles & Editorial Grammar

Strictly governed by the code-driven film architecture of `lemo-opuscar` and the diagram wake-up loop engine of `lemo-wake`.

---

## 1. Core Philosophy (Zero Tacky Avatars, 100% Cinematic Code)
- **Subject is the Star:** In `lemo-opuscar`, we reject cheesy floating circular talking-head avatars. The subject itself—the 3D models, animated technical schematics, mathematical matrices, and spatial typography—commands 40–60% of the screen center.
- **Pure Code Rendering:** No AI video generation hallucinations, morphing artifacts, or blurry text. Every visual is drawn with deterministic HTML5 Canvas, SVG, Three.js WebGL, and Remotion frame math.
- **Lemo-Wake Image Engine:** Every technical paper figure or architecture diagram is "woken up" into a dynamic ~5-second seamless motion loop with multi-layer depth, cyclic breathing, and directional vector flow.

---

## 2. The 5-Step Director Workflow
Before rendering a full video, the director must always follow this sequence:
1. **Clarify Upfront (Director Q&A):** Confirm topic, research paper source, target duration (60-180s), visual style from the style catalog (`dark-keynote`, `scifi-hud`, `exploded-teardown`, `whiteboard-explainer`, `data-storytelling`, `swiss-motion`), and voice personas.
2. **Structure the Content Contract:** Emit valid JSON adhering to `VideoContentSchema` (Hook, Core Breakdown, Real-World Analogy, Technical Depth, Takeaway, CTA).
3. **Render One Style Frame First (`npm run style:frame`):** Always render and inspect a single keyframe PNG before starting an expensive full-length video render.
4. **Audio Verification:** Generate and measure actual audio duration using Google AI Studio Multi-Speaker TTS (`Aoede` + `Puck`). Lock frame counts to actual audio length (`frames = Math.ceil(seconds * 30)`).
5. **Full Render & Automated QC:** Render composition and verify video resolution (1080x1920), frame rate (30 FPS), subtitle sync, and citation visibility.

---

## 3. Pacing & Rhythm Rules
- **Hook (0-4 seconds):** The visual and verbal hook must land simultaneously. Never start with "Hello guys" or generic intros. Start in media res with a surprising research paradox or question.
- **Visual Velocity (Scene Cuts every 3-5 seconds):** Educational shorts audience drop-off occurs if a static visual stays unchanged for more than 4 seconds. Introduce subtle camera zooms, card transitions, or diagram highlights every 90-120 frames.
- **Dual-Speaker Voice Dynamics:**
  - **Speaker 1 (The Anchor / Lead Researcher - Aoede):** Grounded, authoritative, delivers core thesis and research citations.
  - **Speaker 2 (The Inquirer / Curious Builder - Puck):** Asks the intuitive questions the viewer is thinking ("Wait, how does it process all words at once?", "What's the compute tradeoff?").

---

## 4. Visual Depth & Camera Grammar
- **Rule of Depth:** Never render flat 2D graphics without depth separation. Use `ParallaxLayers` with three distinct planes:
  - **Background (Z: -200px):** Ambient glowing orbs, cyber grids, deep space gradients.
  - **Midground (Z: 0px):** Main content cards, 3D Attention Core models, or Lemo-Wake diagrams.
  - **Foreground (Z: +100px):** Kinetic captions, citation badges, and active speaker pills.
- **Camera Movement:** Avoid jarring cuts. Use smooth exponential push-ins (`scale: 1.0 -> 1.05`), subtle orbital tilts (`rotateX`, `rotateY`), and directional pans.

---

## 5. Source Traceability Gate
- If a claim is not verified with page/section reference from the underlying research document (`FACTS.md`), it **must not** appear as an unqualified factual statement in the script.
