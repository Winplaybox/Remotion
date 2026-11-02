# PDF2Shorts Studio — Operating Guide

## Project Objective
Build an AI-assisted research-to-video production system that converts research PDFs and authoritative technical documentation into original educational YouTube Shorts and Instagram Reels.
- **Channel Niche:** AI, Technology & Future Explained.
- **Content Language:** Natural Hinglish (Roman script Hindi + English technical terms).
- **Visual Identity:** Premium cinematic 2.5D and 3D spatial animations.
- **Target Duration:** 120–175 seconds. Hard maximum: 180 seconds.
- **Target Production:** 2 approved videos per day.
- **Rendering:** GitHub Actions.
- **Publishing:** Human approval required. Never publish automatically.

---

## 1. Technology Stack
- **Runtime & Language:** Node.js (v20+) & Strict TypeScript
- **Video Rendering:** React & Remotion (v4)
- **3D Graphics:** Three.js / React Three Fiber for selected 3D scenes
- **2.5D Motion:** SVG, CSS 3D transforms, parallax layers
- **PDF Extraction:** Python (PyMuPDF / pdf.js)
- **Validation:** Zod schemas
- **Audio/Video Utilities:** FFmpeg
- **Automation:** GitHub Actions (CI, scheduled audits, approved rendering)

---

## 2. Architecture & Engine Separation
1. **Research Engine (`packages/research`):** PDF ingestion, text/table extraction, citations, and source registry.
2. **Editorial Engine (`packages/editorial`):** Topic scoring, claim verification, and original Hinglish script writing.
3. **Storyboard Engine (`packages/storyboard`):** Structured scene JSON, camera direction, and timing rules.
4. **Media Engine (`packages/media`):** Narration adapters, audio normalization, and synchronized captions.
5. **Remotion Engine (`packages/remotion`):** Reusable 2D/2.5D/3D components, transitions, and video compositions.
6. **Quality & Growth Engine (`packages/quality`, `packages/analytics`):** Automated QC audits, SEO checks, and analytics.

---

## 3. Core Rules
- **Traceable Sources:** Every factual claim must have a traceable source ID, document title, page number, and section.
- **No Hallucinations:** Never invent research findings, statistics, or citations.
- **Originality:** Write original explanatory scripts; never merely read or summarize verbatim text from a PDF.
- **Natural Hinglish:** Preserve standard English technical terms (e.g., *embeddings, attention mechanism, backpropagation, gradient descent*).
- **Cost Discipline:** Code executes deterministic tasks; Claude makes creative and editorial decisions.

---

## 4. Video Specifications
- **Aspect Ratio:** 9:16 (Vertical)
- **Resolution:** 1080 × 1920
- **Frame Rate:** 30 FPS
- **Format:** MP4 (H.264 / AAC)
- **Max Duration:** 180 seconds

---

## 5. Workflow States
`research` → `script-review` → `storyboard-review` → `render-ready` → `rendered` → `quality-review` → `approved` → `published` (or `rejected`)

*Approval is strictly version-locked. Any script or visual change invalidates prior approval.*
