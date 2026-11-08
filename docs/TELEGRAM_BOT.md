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

### Web dashboard (`/admin` on the bot's Render URL, or `/dashboard` in Telegram)

Login with Telegram (only `TG_ADMIN_ID`). Tabs:
- **Overview** — KPIs (pending ideas, active/failed jobs, success rate, avg time, publishing), 14-day chart, failure reasons,
  and "needs attention" lists. KPI tiles open the filtered list.
- **Ideas / Jobs / Publishing / Users** — status chips with counts, search (ID, text, user name, @username, Telegram id),
  10/25/50/100 per page, pagination, bulk approve/reject (ideas) and retry/cancel (jobs).
- Click a row → side panel: job timeline with the real error, input script, title/description/hashtags/sources,
  thumbnail and ▶ video (short-lived signed link from the private bucket), publications; idea history + priority;
  user access (allow / remove).
- **Live** toggle refreshes every 15 s; filters live in the URL (shareable/bookmarkable); `/` focuses search, `R` refreshes.

API (admin session cookie only): `GET /admin/api/overview`, `/admin/api/list?entity=ideas|jobs|publications|users&status=&q=&page=&size=`,
`/admin/api/job/JOB-…`, `/admin/api/idea/IDEA-…`, `/admin/api/media/JOB-…/video|thumb|short-N`, `POST /admin/api/action`.
Every action runs as the admin's own bot command, so it is also logged in the admin's Telegram chat.

## Long video → Shorts (engines/short-clip)

Worker `scripts/telegram/make-shorts.ts` (GitHub job `shorts`, up to 90 min): normalise → faster-whisper (`small`, CPU int8,
model cached) word timestamps → Gemini picks highlights (fallback: dense-speech windows) → every clip is snapped to whole
sentences, max 90 s, no overlaps → Remotion `ShortClip` (landscape = full frame + blurred fill, portrait = cover). Telegram
uploads are limited to 20 MB, so send longer videos as a link (direct .mp4 or a page yt-dlp can read). Only use videos you
own or have rights to; links to other people's content are the user's responsibility.

## Publishing bot videos (admin approval only)

Finished videos (topic, script, style) are kept in the **private** Storage bucket `videobot` (`jobs/<JOB>/video.mp4`, thumbnail).
After delivery the user gets **📤 Publish ke liye bhejo** → `PUB-00001` (status `PENDING_APPROVAL`) → the admin picks
**channel** (`channels/publish-targets.json`: Chakra Puzzle, Kaali Peeli Chase, Epic Bharat Saga) → **platforms** (YouTube,
YouTube + IG + FB, IG + FB) → **time** (now, today 7:30 PM, tomorrow 9 AM / 7:30 PM IST) → `SCHEDULED`.
`.github/workflows/publish-bot.yml` runs right away (repository_dispatch) and every 3 h: it claims due rows (SKIP LOCKED),
uploads YouTube as private + scheduled `publishAt` (idempotent by title, schedule read back), posts IG/FB Reels at run time,
records per-platform results (`PUBLISHED` / `PARTIAL` / `FAILED`) and messages the admin and the requester.
Retries skip platforms that already succeeded. Nothing is published without approval; the daily channel pipeline is unchanged.
Admin: `/pubs [STATUS]`, `/publish JOB`, `/unpublish PUB`, `/pubretry PUB`, and the Publishing table on `/admin`.
Shorts (several files per job) are stored but not offered for publishing yet.

## Data (Supabase)

Schema `videobot` in the **winplayboxsite** project (`https://xatbfyiytcnogfbtfsym.supabase.co`), migration
`supabase/migrations/20261108000100_videobot_foundation.sql` + `…000200_videobot_publishing.sql`: `users`, `publications`, bucket `videobot` (private), `ideas` (+ `idea_events` history), `jobs`
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

## Environment variables

| Name | Where | Required | Purpose |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Render env + GitHub secret | yes | bot API (server + workers) |
| `GH_DISPATCH_TOKEN` | Render env | yes | fine-grained PAT, Contents read/write — starts workers |
| `GITHUB_REPO` | Render env | yes | `Winplaybox/Remotion` |
| `TG_ADMIN_ID` | Render env + GitHub variable | yes | admin Telegram id |
| `TG_ALLOWLIST` | Render env | no | comma-separated ids allowed to make videos (admin can `/allow`) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Render env + GitHub secrets | for production | jobs, ideas, publishing, storage. Without them: memory mode |
| `GEMINI_API_KEY` (+ optional `GEMINI_MODEL`) | GitHub secret / variable | yes | scripts, research, Shorts highlights |
| `PUBLIC_URL` | Render env | no | dashboard links; defaults to the Render URL |
| `TG_WEBHOOK_SECRET` | Render env | no | defaults to a value derived from the token |
| — | code | — | per-user limit: 5 videos / 24 h (`DAILY_VIDEO_LIMIT` in `commands.mjs`), admin unlimited |
| `TG_BOT_USERNAME` | Render env | no | bot username for the dashboard login widget (else read from `getMe`) |
| `MAX_JOBS_PER_DAY` | Render env | no | global cap for all users per 24 h, default **40** (protects Actions minutes + AI quota); `0` = off |
| `TG_STYLE_ENABLED` | Render env | no | `true` turns `/style` back on (off by default) |
| `REMOTION_GL` | workflow env | no | Chromium GL backend for renders, default `swangle` (CPU, works on CI runners) |
| `RETENTION_DAYS` | GitHub variable | no | stored bot videos are deleted after this many days, default 30 (never while a publication is pending/scheduled) |
| YouTube / Meta secrets | GitHub secrets | for publishing | same secrets the channel pipeline uses (`channels/publish-targets.json`) |

## Reliability (Phase 8)

- **Watchdog** — `.github/workflows/bot-maintenance.yml` runs hourly: a job with no progress for 2 h becomes `FAILED`
  (`timeout: no progress`), the status message turns into "atki thi" + 🔁 Retry. Previews waiting for the user's
  ▶️ Render are left alone.
- **Retention** — once a day (03 UTC) stored videos/thumbnails/shorts older than `RETENTION_DAYS` are deleted from the
  private bucket and the job is marked `file_deleted`. Run it by hand: Actions → Bot Maintenance → *retention* ✔.
- **Global cap** — `MAX_JOBS_PER_DAY` across all users; when hit, users get "aaj limit" and the admin a 🚦 notice.
- **Loudness** — every bot video/short is normalised to −14 LUFS / −1 dBTP (two-pass `loudnorm`, video copied, not re-encoded).
- **TTS retries** — Edge TTS is retried 3× with backoff and a 60 s timeout per line.
- **Duplicate Telegram updates** are ignored (`processed_updates`), job creation is idempotent, finished jobs can't change state.

## Production checklist

1. Merge the phase PRs in order (each is based on the previous one).
2. Secrets/variables from the table above are set in Render and GitHub (step 3–6 of the setup).
3. `@BotFather` → `/setdomain` → the Render host, so the dashboard's Telegram login works.
4. Remove `TELEGRAM_BOT_TOKEN` from any other service (one token = one webhook).
5. Smoke test: `/myid`, `/topic dadi Diwali pe diye kyun` (→ preview → ▶️ Render → video), `/status`, send an idea
   (→ admin buttons), `/dashboard`, then 📤 Publish → approve as admin → check the YouTube upload is *private + scheduled*.
6. Watch the first hourly Bot Maintenance run is green.

## Run locally

```bash
npm run test:bot                                  # command parsing
PAYLOAD='{"kind":"topic","narrator":"jasoos","text":"x","chatId":"1"}' npm run bot:video -- --dry   # demo render, no AI/TTS/Telegram
```
