# Engine Pipelines & Multi-Platform Distribution Plan

## Objective
Operate Orbit Puzzle, Traffic Puzzle and Sanatan Story as independent content-to-MP4 pipelines. A shared distribution service packages validated outputs for YouTube, Instagram, Facebook and Pinterest. The default target mode is automatic publishing, with a first successful upload approval gate per platform. Production publishing remains disabled until platform validation is explicitly completed.

## Architecture boundaries

### Engine-owned responsibilities
Each engine owns its content schema, domain validation, composition, scene timing, engine-specific audio/visual assets, render preset and output manifest:
- `engines/orbit-puzzle`: puzzle data, answer validation, orbital animation and reveal timing.
- `engines/traffic-puzzle`: board validation, legal move/solution validation and solution playback.
- `engines/sanatan-story`: source-noted episode scripts, scene/asset manifests, narration cues, subtitles and cinematic scene rendering.

An engine failure must not block another engine's content queue or render jobs.

### Shared production services
- Content orchestrator: creates immutable jobs with engine, content ID, version and requested output targets.
- Render workers: render complete MP4s into durable storage; retries must reuse the same content/version identity.
- Quality gate: checks dimensions, frame rate, codecs, pixel format, duration, audio policy and required visual-review checkpoints.
- Asset/manifest store: records output checksum, render metadata, thumbnail, captions and source references.
- Distribution orchestrator: creates one idempotent delivery per platform/account/video, with independent retry state.
- Platform adapters: YouTube Data API, Meta Graph API (Instagram/Facebook) and Pinterest API.
- Analytics ingestor: collects platform metrics without coupling analytics failures to publishing.

## Pipeline contract
1. Validate engine content before rendering.
2. Render a full-length 1080x1920, 30 FPS video.
3. Validate H.264/yuv420p and AAC when an audio track is present.
4. Generate thumbnail, caption/subtitle assets and a platform-neutral metadata record.
5. Build platform-specific title, description, tags, cover and destination settings.
6. Keep each destination in a non-production state until its platform validation gate is passed.
7. After activation, publish automatically; record remote IDs, URLs, timestamps and errors.
8. Retry transient failures with bounded exponential backoff; never duplicate a successful upload.

## Publishing safety and activation gates
The desired operating mode is `automatic`. The first successful upload for each platform/account requires an explicit approval event. Approval is scoped to that platform/account, not globally. Until all checks pass, the platform adapter is disabled and no production upload is attempted.

Required checks per platform:
- API application and account permissions verified.
- Token refresh and secret storage tested without exposing credentials in logs.
- Upload/resumable upload tested with a private, unlisted or otherwise non-public test destination where supported.
- Metadata, aspect ratio, duration, thumbnail/cover and policy requirements verified.
- Remote processing completion and returned media ID confirmed.
- First-upload approval recorded.
- Explicit operator activation recorded after validation.

No credentials, tokens or secrets belong in this repository. Use GitHub Actions secrets or a dedicated secret manager only after platform setup.

## Staged implementation plan

### Stage 0 — Foundation (this PR)
- Document engine boundaries, pipeline contract, staged rollout and acceptance criteria.
- Add a safe example distribution config with every platform disabled.
- Add a manual, engine-selectable full-render workflow that validates and uploads MP4 artifacts.
- Do not add platform credentials, network publishing calls or automatic production triggers.

### Stage 1 — Independent engine jobs
- Add engine-specific content queues and job schemas.
- Add per-engine render workers, output manifests, deterministic IDs and retry isolation.
- Replace the demo-only Sanatan episode with source-checked scripts, approved visual assets, narration and subtitles.
- Add complete render tests and representative-frame visual review.

### Stage 2 — Shared distribution core
- Add delivery job schema, durable state store, idempotency keys, bounded retries and dead-letter handling.
- Add metadata/thumbnail/caption packaging and account-level destination configuration.
- Add operator dashboard and audit history.
- Keep all adapters in dry-run mode.

### Stage 3 — Platform adapters and validation
- Implement YouTube, Instagram, Facebook and Pinterest adapters independently.
- Verify account eligibility, API scopes, quotas, media requirements and upload processing.
- Test with private/non-public destinations where supported.
- Capture a first-upload approval per platform/account.
- Do not enable production publishing as a side effect of deployment.

### Stage 4 — Controlled automatic publishing
- Explicitly activate one validated platform/account at a time.
- Automatically distribute only quality-gated outputs.
- Add delivery alerts, retry visibility, duplicate prevention and rollback/disable switches.
- Keep other platform adapters disabled until their own validation passes.

### Stage 5 — Analytics and growth feedback
- Ingest views, watch time/retention, engagement, subscribers/follows and platform-specific metrics.
- Attribute results to engine, format, topic, hook and publishing slot.
- Use analytics to inform content selection; do not promise a specific view or subscriber outcome.

## Stage 0 acceptance criteria
- Each engine can be selected for a complete manual render from GitHub Actions.
- The MP4 is checked with the repository's render verifier.
- The generated MP4 is attached as a downloadable workflow artifact.
- No social publishing API is called.
- All platform flags in the example config remain disabled.
- Existing CI and current render compositions remain unchanged.
