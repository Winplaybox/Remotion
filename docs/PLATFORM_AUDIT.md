# Phase 0 — Platform audit & gap report (Nov 2026)

Scope: the master prompt "AI Video Creation & Telegram Automation Platform". This is the state of
`Winplaybox/Remotion` `main` on 2026-11-08, before Phase 1. Nothing here changes production behaviour.

Legend: ✅ implemented + tested · 🟡 implemented, not tested end-to-end with real providers · 🟠 partial · ❌ missing · 🔴 broken / risky

## 1. Architecture overview

```
                       ┌──────────── GitHub Actions (CPU, free) ─────────────┐
 Telegram ─webhook─▶ Render (apps/telegram-bot/server.mjs) ─repository_dispatch─▶ telegram-bot.yml
                       │   tg-idea  → content/ideas/inbox.jsonl (branch bot-data)
                       │   tg-video → Gemini → Edge TTS → Remotion NarratorVideo → sendVideo
                       │   tg-style → Remotion ToonVideo (SVG filters)     [switched OFF]
 Channels pipeline:    │
   prepare-voice.yml (Edge TTS) → render-queue branch ← Claude renders MP4 (queue.ts render)
   publish-channels.yml (hourly) → YouTube upload (+ Meta if secrets) → answers job (comments)
   ci.yml: typecheck, lint, jest, bot tests, narration smoke, portrait render smoke, engine-qa
```

Code layout: `engines/*` (one Remotion engine each) · `packages/{visuals,audio,motion,camera,core,scene-runtime}` ·
`channels/channels.ts` (schedule + metadata) · `scripts/` (post, queue, publish, telegram, narration, sound, engine tools) ·
`apps/studio` (Remotion Root) · `apps/telegram-bot` (zero-dependency webhook).

## 2. Telegram command inventory

| Command | Status | Notes |
|---|---|---|
| `/start`, `/help` | ✅ | static help (Hinglish); `/style` hidden while disabled |
| plain text / link / photo / video, `/idea` | 🟡 | saved to `bot-data` + admin ping; **no idea ID, status, category, dedup** |
| `/topic <narrator> <topic>` | 🟡 | allowlist + 5/day; Gemini JSON beats → Edge TTS → render → sendVideo; not yet run with live keys |
| `/script <narrator>` | 🟡 | keeps user words; AI only splits; falls back to plain split without Gemini |
| `/narrators`, `/myid` | ✅ | |
| `/ideas` (admin) | 🟡 | last 10 from GitHub |
| `/style` (video→video) | 🟠 off | Remotion filter look only; disabled until `TG_STYLE_ENABLED=true` |
| `/menu`, inline keyboards, `/status`, `/history`, `/cancel`, `/voice`, `/shorts`, `/thumbnail`, `/video` | ❌ | |

## 3. Existing bot functionality (behaviour)
- Webhook replies instantly; heavy work in Actions. Webhook secret derived from the token. Health `GET /`.
- Authorization: `TG_ADMIN_ID` + `TG_ALLOWLIST` (numeric ids, never usernames) ✅.
- Limits: 5 videos/user/day **in memory** (resets when the free Render instance restarts) 🟠.
- Idempotency: none — Telegram retries could double-dispatch 🔴 (low risk: reply is sent before work, 200 returned at once).
- Progress: only "ban raha hai…" then the result; no job IDs, no status ❌.

## 4. Remotion architecture
| Engine | Use | Status |
|---|---|---|
| odd-orbit (Chakra Puzzle) | daily puzzles, ask-mode, AskOutro | ✅ live |
| track-vehicle (Kaali Peeli Chase) | daily puzzles, speed tiers, AskOutro | ✅ live |
| story-diorama (EpicBharatSaga) | Dashavatar seasons, narration | ✅ (channel waits for `LIVE_`/`START_` vars) |
| narrator-video | bot topic/script, 5 narrators | 🟡 dry renders only |
| toon-video | bot `/style` | 🟠 off |
| _template + engine builder | new engines, catalog tests, locks, QA | ✅ |
| orbit-puzzle, traffic-puzzle, sanatan-story | legacy demos | legacy |

Shared: AskOutro, PrevAnswerCard, SoundBed (music ducking), VoiceCues, fonts. **Three.js (`three`, `@react-three/fiber`, drei) is
installed but used by no engine**; no `--gl` option is set anywhere (needed: `swangle` on CI).

## 5. ComfyUI integration — ❌ none
No ComfyUI client, workflows or worker exist. (Correction to an assumption in the master prompt.)

## 6. Wan2.1 VACE workflow status — ❌ none
Research (Nov 2026): VACE 1.3B + CausVid/lightx2v runs on an 8 GB card at 832×480, ~2–6 min per 5 s chunk (estimate),
Apache-2.0 weights → monetization OK. **Cannot run on GitHub Actions** (no GPU); needs the home PC as a pull-based worker.
Decision 2026-11-08: video-to-video is **paused**; Phase 4 not scheduled.

## 7. Audio processing
| Piece | Status |
|---|---|
| Edge TTS narration (prepare-voice, bot) | ✅ / 🔴 licence risk: Microsoft has no published commercial grant for the Edge Read-Aloud endpoint; Azure Speech (same voices, 0.5M chars/month free) is the compliant path |
| Piper TTS | ❌ not used. **Its Hindi voices (Pratham, Priyamvada) are CC BY-NC-SA — not for monetized channels**; Rohan's licence unclear |
| IndicF5 bake-off | 🟠 workflow runs (Python 3.10 pins); not wired as default |
| Original SFX/music kit (`scripts/sound/synth.py`) | ✅ |
| Music ducking under voice | ✅ (SoundBed) |
| Loudness | 🟠 narration `loudnorm -16 LUFS` per clip + QA mean/peak check; **no final −14 LUFS / −1 dBTP pass** |
| Original-audio preservation for uploads | 🟠 ToonVideo keeps the source audio as one track; no extraction/separation/modes |
| Stereo panning / spatial | ❌ (Remotion `<Audio>` has no pan; would be FFmpeg pre-mix) |

## 8. Database structure — ❌ none in use
State lives in git: `render-queue` branch (voice/video), `bot-data` branch (ideas JSONL), `locks/published.json`.
`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are passed to `publish-channels.yml` but **no code reads them**; secrets are not set.

## 9. GitHub Actions workflows
| Workflow | Purpose | Status |
|---|---|---|
| ci.yml | typecheck, lint, jest (65), bot tests (11), narration smoke, portrait smoke, engine-qa | ✅ |
| prepare-voice.yml | Edge TTS → render-queue, lines.json staleness check | ✅ |
| publish-channels.yml | hourly upload from render-queue, CI render fallback, answers job | ✅ YouTube |
| telegram-bot.yml | tg-video / tg-style / tg-idea | 🟡 |
| render-engine-artifact.yml | manual render to artifact | ✅ |
| verify-secrets.yml | secret presence report | ✅ |
| voice-bakeoff.yml | TTS comparison | ✅ tool |

## 10. Publishing integrations
- YouTube ✅ — 3 channels, OAuth tokens per channel, idempotent by title, answer comments (pinning is manual).
- Instagram / Facebook 🟠 — `scripts/publish/meta.ts` exists; **Meta secrets not set**, never verified live.
- Scheduling: fixed IST slots in `channels.ts`; no per-video scheduling UI ❌.

## 11. Missing features (master prompt vs repo)
Idea IDs/status/admin actions/dedup · inline main menu · persistent job queue with IDs, progress, `/status`, `/cancel`,
`/history` · user preferences · research + references for factual topics · thumbnails/titles/hashtags for bot videos ·
16:9 and duration options · script document upload, scene-level edit/regenerate · long video → Shorts (transcription,
highlights) · translation · admin dashboard · multi-brand config beyond 3 hard-coded channels · per-platform scheduling ·
provider adapters & cost tracking · final loudness pass · ComfyUI/VACE (paused).

## 12. Broken / risky now
1. 🔴 Edge TTS commercial-use risk (all live narration).
2. 🔴 No idempotency on Telegram updates; in-memory limits reset on Render restart.
3. 🟠 Telegram bot never exercised end-to-end with live Gemini key (needs `GEMINI_API_KEY` + Render env vars).
4. 🟠 Supabase secrets plumbed but unused (dead config).
5. 🟠 Three.js deps unused; if adopted, CI must render with `gl: "swangle"` or canvases come out blank with exit 0.
6. 🟠 Free Render instance sleeps → first bot reply after idle takes ~30–60 s.

## 13. Technical risks
- YouTube "inauthentic / mass-produced content" policy matters more than model licences for automated channels.
- Telegram Bot API: 20 MB download / 50 MB upload limits.
- GitHub Actions: 6 h per job; public repo runners free (4 vCPU / 16 GB), private repos use plan minutes.
- Gemini factual errors on history/religion topics → needs sources + admin approval before publishing.

## 14. Cost & hardware limits
- Free: GitHub Actions CPU, Render free web service, Edge TTS (risk), Gemini free tier (quota-limited).
- Home PC (32 GB RAM, 8 GB VRAM) is the only GPU: VACE 1.3B, Wan 2.2 I2V GGUF, Indic Parler-TTS / IndicF5 would run there as a
  pull-based worker (no open ports). Not needed for Phases 1–3.

## 15. Files to create / modify in Phase 1 (proposed)
| File | Change |
|---|---|
| `supabase/migrations/0001_bot.sql` | `users`, `ideas` (id `IDEA-00001`, status, category, tags, priority, channel, notes, history), `jobs`, `job_events`, `processed_updates` (idempotency), `user_preferences` |
| `apps/telegram-bot/db.mjs` | tiny Supabase REST client (fetch, service key only on Render) |
| `apps/telegram-bot/commands.mjs` | idea flow with IDs + statuses, `/menu` inline keyboard, `/status`, `/history`, `/cancel`, admin approve/reject buttons |
| `apps/telegram-bot/server.mjs` | callback_query handling, update_id dedup, persistent rate limits |
| `scripts/telegram/*.ts` | write job status/progress to `jobs`, store outputs, progress messages |
| `.github/workflows/telegram-bot.yml` | job id in payload, status updates |
| `docs/TELEGRAM_BOT.md`, README | env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` on Render) |
| tests | ideas lifecycle, idempotency, authorization, job state machine (mocked DB) |

## 16. Recommended Phase 1
"Telegram foundation": Supabase-backed users / ideas / jobs; idea IDs + status + admin approve/reject (inline buttons,
ideas never auto-start production); main menu; `/status`, `/history`, `/cancel`; update-id idempotency; persistent
daily limits; job progress messages for `/topic` and `/script`. Keep YouTube publishing untouched. Needs from the admin:
a Supabase project (free tier) and its URL + service-role key added to Render env and GitHub secrets.

Also recommended outside Phase 1: move narration from the Edge Read-Aloud endpoint to Azure Speech F0 (same voices,
commercial terms) or Indic Parler-TTS on the home GPU; add a final `loudnorm I=-14:TP=-1` pass.

## 17. Status after Phases 1–8 (2026-11-08)

| Phase | PR | What | Status |
|---|---|---|---|
| 0 Audit | #33 | this report, `/style` switched off | ✅ merged |
| 1 Telegram foundation | #34 | Supabase `videobot` schema, idea IDs + admin review, `/menu` `/status` `/history` `/cancel` `/settings`, idempotent updates, job tracking | ✅ tests · 🟡 live run pending secrets |
| 2+3 Topic/Script video | #35 | research with sources, 9:16 + 16:9, Devanagari font, thumbnail, title/description/hashtags, preview → ▶️ Render, `.txt` scripts | ✅ tests · 🟡 live |
| 4 Video → video (ComfyUI / VACE) | — | paused by decision (home GPU only, not free on CI) | ⏸️ |
| 5 Long video → Shorts | #36 | faster-whisper transcript, Gemini highlights snapped to sentences, captioned 9:16 clips | ✅ tests · 🟡 live |
| 6 Admin dashboard | #37 | `/admin` with Telegram login (HMAC), signed session, whitelisted actions, same-origin check | ✅ tests |
| 7 Publishing | #38 | private storage, publish request → admin approval → YouTube (private + scheduled) / IG / FB, retries never duplicate | ✅ mocked tests · 🟡 live |
| 8 Hardening | this PR | watchdog, 30-day retention, global daily cap, −14 LUFS loudness, TTS retries, `swangle` GL, env table + checklist | ✅ tests |

Still open (needs the admin): secrets in Render/GitHub, `@BotFather /setdomain`, a licensed TTS for monetized output
(Edge TTS has no published commercial grant; Piper Hindi voices are non-commercial), Polly blocked by the AWS SCP.
