# DIRECTOR.md — Remotion Directing Principles & Editorial Grammar

Inspired by `lemo-opuscar`, this document governs how AI agents and human creators direct educational short-form films in PDF2Shorts Studio.

---

## 1. The 5-Step Director Workflow
Before rendering a full video, the director must always follow this sequence:
1. **Clarify Upfront (Director Q&A):** Confirm topic, target duration (60-180s), visual style from the style catalog, avatar format (Dual-Speaker vs PiP vs Stage), and voices.
2. **Structure the Content Contract:** Emit valid JSON adhering to `VideoContentSchema` (Hook, Core Breakdown, Real-World Analogy, Technical Depth, Takeaway, CTA).
3. **Render One Style Frame First (`npm run style:frame`):** Always render and inspect a single keyframe PNG before starting an expensive 300-frame video render.
4. **Audio Verification:** Generate and measure actual audio duration using Google AI Studio Multi-Speaker TTS (`Aoede` + `Puck`). Lock frame counts to actual audio length (`frames = Math.ceil(seconds * 30)`).
5. **Full Render & Automated QC:** Render composition and verify video resolution, frame rate, subtitle sync, and citation visibility.

---

## 2. Pacing & Rhythm Rules
- **Hook (0-4 seconds):** The visual and verbal hook must land simultaneously. Never start with "Hello guys" or generic intros. Start in media res with a surprising research paradox or question.
- **Visual Velocity (Scene Cuts every 3-5 seconds):** Educational shorts audience drop-off occurs if a static visual stays unchanged for more than 4 seconds. Introduce subtle camera zooms, card transitions, or diagram highlights every 90-120 frames.
- **Dual-Speaker Dynamics:**
  - **Speaker 1 (The Anchor / Lead Researcher):** Grounded, authoritative, delivers core thesis and research citations.
  - **Speaker 2 (The Inquirer / Curious Builder):** Asks the intuitive questions the viewer is thinking ("Wait, how does it process all words at once?", "What's the compute tradeoff?").

---

## 3. Visual Depth & Camera Grammar
- **Rule of Depth:** Never render flat 2D graphics without depth separation. Use `ParallaxLayers` with three distinct planes:
  - Background (Z: -200px): Ambient glowing orbs, cyber grids, deep space gradients.
  - Midground (Z: 0px): Main content cards, 3D models, or diagrams.
  - Foreground (Z: +100px): Kinetic captions, citation badges, and active speaker pills.
- **Camera Movement:** Avoid jarring cuts. Use smooth exponential push-ins (`scale: 1.0 -> 1.05`), subtle orbital tilts (`rotateX`, `rotateY`), and directional pans.

---

## 4. Source Traceability Gate
- If a claim is not verified with page/section reference from the underlying research document, it **must not** appear as an unqualified factual statement in the script.
