# Telegram video bot

```
Telegram ──webhook──▶ Render.com (apps/telegram-bot/server.mjs)      instant reply, allowlist, daily limit
                          │ repository_dispatch
                          ▼
              GitHub Actions (.github/workflows/telegram-bot.yml)
   tg-idea  : content/ideas/inbox.jsonl on branch bot-data + message to admin
   tg-video : Gemini → beats → Edge TTS → Remotion NarratorVideo → sendVideo to the same chat (~5–8 min)
```

## What users can do

| Send | Who | Bot replies |
|---|---|---|
| Any message, link, photo or **sample video** (or `/idea <text>`) | everyone | "✅ Got it! Aapka idea future pipeline list mein add ho gaya hai. Admin isko review karega." — admin gets the idea (+ the video) |
| `/topic <narrator> <topic>` e.g. `/topic dadi Holi kyun manate hain` | allowlist + admin | "🎬 Video ban raha hai…" then the finished MP4 |
| `/script <narrator>` + script on the next lines | allowlist + admin | Same; keeps the user's words (AI only splits into beats, adds emoji + Hindi voice line) |
| `/narrators`, `/myid`, `/help` | everyone | lists |
| `/ideas` | admin | last 10 ideas |

Narrator is optional (default `dost`). Others sending `/topic` get "invited users only" and their topic is saved as an idea.
Non-admins: 5 videos/day.

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

## One-time setup (admin, ~15 min)

1. **Create the bot**: Telegram → `@BotFather` → `/newbot` → copy the token.
2. **Gemini key**: aistudio.google.com → API key.
3. **GitHub repo settings → Secrets and variables → Actions**
   - Secrets: `TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY`
   - Variables: `TG_ADMIN_ID` (your Telegram id — send `/myid` to the bot after step 5), optional `GEMINI_MODEL`
4. **GitHub token for Render**: github.com/settings/personal-access-tokens → fine-grained → only repo
   `Winplaybox/Remotion` → Repository permissions **Contents: Read and write** (needed for repository_dispatch and to read ideas).
5. **Render.com** → New → **Blueprint** → this repo (uses `render.yaml`) → fill `TELEGRAM_BOT_TOKEN`, `GH_DISPATCH_TOKEN`
   (step 4), `TG_ADMIN_ID`, `TG_ALLOWLIST` (comma-separated ids of invited users). The webhook secret is derived from the bot token (or set `TG_WEBHOOK_SECRET`).
   On start the server registers its webhook and the command menu itself.
6. Test: `/myid` → `/topic dadi Diwali pe diye kyun` → a video in ~5–8 min. Send any text → idea saved.

Free Render plan sleeps after 15 min idle: the first message after a pause takes ~30–60 s to answer.

## Run locally

```bash
npm run test:bot                                  # command parsing
PAYLOAD='{"kind":"topic","narrator":"jasoos","text":"x","chatId":"1"}' npm run bot:video -- --dry   # demo render, no AI/TTS/Telegram
```
