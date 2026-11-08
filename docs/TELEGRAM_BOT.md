# Telegram video bot

```
Telegram ──webhook──▶ Render.com (apps/telegram-bot/server.mjs)      instant reply, allowlist, daily limit
                          │ repository_dispatch
                          ▼
              GitHub Actions (.github/workflows/telegram-bot.yml)
   tg-idea  : content/ideas/inbox.jsonl on branch bot-data + message to admin
   tg-video : Gemini → beats → Edge TTS → Remotion NarratorVideo → sendVideo to the same chat (~5–8 min)
   tg-style : user's real video → Remotion ToonVideo (SVG filters, no AI) → sendVideo (~1 min per 8–10 s of video)
```

## What users can do

`/menu` (also `/start`) shows the main menu as buttons: 💡 Future Ideas · 🎬 Topic to Video · 📝 Script to Video ·
🎨 Video to Video · ✂️ Shorts · 🖼️ Thumbnail · 🎙️ Narrator · 🌐 Translate · 📂 My Projects · 📊 Job Status · ⚙️ Settings · ❓ Help.
Pressing Topic / Script / Idea asks for the text in the next message (10 min).

| Send | Who | Result |
|---|---|---|
| Any message, link, photo or sample video, or `/idea <text>` | everyone | **Idea `IDEA-00001`, status Pending Admin Review**; likely duplicates flagged; admin gets Approve / Reject / P1–P5 / Merge / Produce buttons. Ideas never start a video by themselves |
| `/topic [narrator] <topic>` | allowlist, `/allow`ed users, admin | job `JOB-00001` with a live status message (progress bar, 🛑 Cancel) → MP4 in the chat |
| `/preview [narrator] <topic>` | same | the script comes first (numbered beats) with ▶️ Render / 🛑 Cancel; send an edited `/script` to change it |
| `/script [narrator] [enhance]` + script on the next lines, or a `.txt`/`.md` file with caption `/script` | same | keeps the user's words and dialogue by default; `enhance` lets the AI tighten it (no new facts) |
| video with caption `/style cartoon` | same, only when `TG_STYLE_ENABLED=true` | off by default |
| long video with caption `/shorts [count] [seconds]` (or reply, or `/shorts <link> 3`) | allowlist + admin | 1–5 vertical Shorts (20–60 s), cut on sentence boundaries, word-by-word captions, hook, original audio, each with title + hashtags |
| `/status [JOB]`, `/history`, `/cancel [JOB]` | everyone (own jobs) | progress, past videos + ideas, stop a job (the worker stops at its next step) |
| `/settings`, `/narrators` | everyone | narrator, Hinglish/हिंदी/English, 9:16/16:9, ~30/50/90 s — used for the next video |
| `/myid`, `/help` | everyone | |

Limits: 5 videos per user per 24 h (stored in the database; admin unlimited). Telegram retries never create a second job
(`update_id` is recorded; jobs are idempotent).

### Admin (`TG_ADMIN_ID`)
`/admin` lists: `/stats` · `/ideas [STATUS]` · `/approve ID [note]` · `/reject ID [note]` · `/priority ID 1-5` ·
`/channel ID name` · `/note ID text` · `/merge ID INTO_ID` · `/produce ID [narrator]` (APPROVED ideas only → topic video,
idea becomes IN_PRODUCTION → COMPLETED when delivered) · `/allow TG_ID` / `/disallow TG_ID` · `/jobs [STATUS]` · `/retry JOB`.
Idea owners get a message when their idea is approved, rejected, in production or completed.

Every finished video comes with: the MP4 (9:16 or 16:9), a **thumbnail** (1280×720 or 1080×1920), and a message with
**title, description, hashtags and sources**. Topic videos first run a research step (Gemini + Google Search grounding);
the script may only use those facts, and the sources are listed. Without sources the message says "verify facts".
Languages: Hinglish (Roman captions, Hindi voice), हिंदी (Devanagari captions; font bundled), English (Indian-English voices).

## Long video → Shorts (engines/short-clip)

Worker `scripts/telegram/make-shorts.ts` (GitHub job `shorts`, up to 90 min): normalise → faster-whisper (`small`, CPU int8,
model cached) word timestamps → Gemini picks highlights (fallback: dense-speech windows) → every clip is snapped to whole
sentences, max 90 s, no overlaps → Remotion `ShortClip` (landscape = full frame + blurred fill, portrait = cover). Telegram
uploads are limited to 20 MB, so send longer videos as a link (direct .mp4 or a page yt-dlp can read). Only use videos you
own or have rights to; links to other people's content are the user's responsibility.

## Data (Supabase)

Schema `videobot` in the **winplayboxsite** project (`https://xatbfyiytcnogfbtfsym.supabase.co`), migration
`supabase/migrations/20261108000100_videobot_foundation.sql`: `users`, `ideas` (+ `idea_events` history), `jobs`
(+ `job_events`), `processed_updates`, `user_preferences`. Tables are not exposed to the public API; the bot and the
workers call `public.videobot_*` functions with the **service-role key** only (anon/authenticated cannot execute them).
Without `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` the bot falls back to memory + the old `bot-data` branch for ideas.

## Narrators (engines/narrator-video)

| id | Style | Voice |
|---|---|---|
| `dadi` | night sky, moon, grandma with bun + specs | hi-IN-SwaraNeural |
| `jasoos` | noir spotlight + rain, detective hat | hi-IN-MadhurNeural |
| `saga` | saffron paper + mandala (EpicBharatSaga look), tilak | hi-IN-MadhurNeural |
| `dost` | bright purple, cap, energetic | hi-IN-MadhurNeural |
| `teacher` | chalkboard, specs | hi-IN-SwaraNeural |

Add one: a new entry in `NARRATORS` (`engines/narrator-video/src/model.ts`) **and** in `apps/telegram-bot/commands.mjs`
(the test checks they match).

## Real video → cartoon (engines/toon-video) — switched OFF

`/style` replies "abhi band hai" and is hidden from help/menu unless the Render env var `TG_STYLE_ENABLED=true` is set.


Made only with Remotion: every frame goes through an SVG filter chain (smoothing, posterize, colour boost, edge lines,
halftone / paper / watercolour displacement). No AI model, no extra cost, own code (safe for monetized channels).
Limits: Telegram bots can download up to **20 MB**; up to **90 s** is converted; rendered at 720×1280 for speed.
It is a filter look, not AI re-drawing — faces/hands keep their real shapes. Add a style: an entry in `TOON_STYLES`, a
`<filter id="toon-<style>">` in `ToonVideoComposition.tsx`, and the id in `apps/telegram-bot/commands.mjs` (`STYLES`).

## One-time setup (admin, ~15 min)

1. **Create the bot**: Telegram → `@BotFather` → `/newbot` → copy the token.
2. **Gemini key**: aistudio.google.com → API key.
3. **GitHub repo settings → Secrets and variables → Actions**
   - Secrets: `TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY`
   - Variables: `TG_ADMIN_ID` (your Telegram id — send `/myid` to the bot after step 5), optional `GEMINI_MODEL`
4. **GitHub token for Render**: github.com/settings/personal-access-tokens → fine-grained → only repo
   `Winplaybox/Remotion` → Repository permissions **Contents: Read and write** (needed for repository_dispatch and to read ideas).
5. **Supabase** (winplayboxsite project → Settings → API): copy the **service_role** key. Add `SUPABASE_URL` =
   `https://xatbfyiytcnogfbtfsym.supabase.co` and `SUPABASE_SERVICE_ROLE_KEY` to **Render env** and to **GitHub secrets**
   (workers update job progress). Never put this key anywhere else.
6. **Render.com** → New → **Blueprint** → this repo (uses `render.yaml`) → fill `TELEGRAM_BOT_TOKEN`, `GH_DISPATCH_TOKEN`
   (step 4), `TG_ADMIN_ID`, `TG_ALLOWLIST` (comma-separated ids of invited users). The webhook secret is derived from the bot token (or set `TG_WEBHOOK_SECRET`).
   On start the server registers its webhook and the command menu itself.
7. Test: `/myid` → `/topic dadi Diwali pe diye kyun` → a video in ~5–8 min. Send any text → idea saved.

Free Render plan sleeps after 15 min idle: the first message after a pause takes ~30–60 s to answer.

## Run locally

```bash
npm run test:bot                                  # command parsing
PAYLOAD='{"kind":"topic","narrator":"jasoos","text":"x","chatId":"1"}' npm run bot:video -- --dry   # demo render, no AI/TTS/Telegram
```
