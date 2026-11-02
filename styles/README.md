# Lemo-Opuscar Style Catalog Index

This directory mirrors the canonical `lemomo-ai/lemo-opuscar` style system. Each style defines an end-to-end visual aesthetic grammar, color grading, typography hierarchy, camera physics, and sound atmosphere in `STYLE.md`, paired with a full demo production script in `DEMO.md`.

## Available Film Styles

| Style ID | Name | Aesthetic Description | Ideal Topic Types |
| :--- | :--- | :--- | :--- |
| **`dark-keynote`** | Dark Tech Keynote | Apple & Vercel keynote aesthetic with frosted glass, cyan/purple glow, and spatial depth. | Foundation Models, AI Architectures, Product Launches |
| **`scifi-hud`** | Sci-Fi Hologram HUD | High-tech JARVIS telemetry, rotating reticles, wireframe grids, coordinate counters. | Autonomous Reasoning, Cybernetics, DeepSeek RL |
| **`blueprint-teardown`** | Exploded Teardown & Blueprint | Cobalt blueprint grid, white patent lines, mechanical exploded parts, dimension callouts. | Hardware, Quantum Chips, TPU/GPU Clusters |
| **`satellite-briefing`** | Satellite & Geopolitical Briefing | Top-secret intelligence dashboard, radar rings, live satellite vector layers, coordinates. | Compute Clusters, Energy Grid for AI, Global Data Centers |
| **`data-storytelling`** | Scientific Data Storytelling | Financial & empirical benchmarking, animated SVG bar races, exponential loss curves. | AI Scaling Laws, Benchmark Evals, Benchmark Truth |
| **`swiss-motion`** | Swiss International Typographic | Minimalist black & signal red, asymmetric grids, bold Helvetica kinetic typography. | Math Proofs, Philosophy of AI, Hard Takeaways |

---

## Directing a Film with a Style
To generate a video in any style:
```bash
# Render specific use case in selected style
npx remotion render DeepSeek-SciFiHUD output/previews/deepseek-scifi.mp4
npx remotion render Willow-QuantumTeardown output/previews/willow-blueprint.mp4
```
