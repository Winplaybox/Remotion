# Telegram Shorts on the VPS (KVM 2)

Goal: `tg-shorts` jobs run on our own VPS instead of a fresh GitHub machine every time.
Wins: no 1.5 min setup per job (ffmpeg, pip, Whisper + Kokoro models stay installed), YouTube links
download through the OVD worker, the bot server never cold-starts.

The bot flow stays the same: Telegram -> `apps/telegram-bot/server.mjs` -> `repository_dispatch`
-> `.github/workflows/telegram-bot.yml`. Only *where* the `shorts` job runs changes.

## 1. One-time VPS setup (Ubuntu, as a normal sudo user, not root)

```bash
sudo apt-get update && sudo apt-get install -y ffmpeg git curl unzip python3-venv fonts-noto-color-emoji
curl -fsSL https://deno.land/install.sh | sh        # only for the local yt-dlp fallback
# Node 20 + Python come from actions/setup-node / setup-python on the first run (cached after that)
```

## 2. Register the VPS as a GitHub runner

GitHub -> Winplaybox/Remotion -> Settings -> Actions -> Runners -> **New self-hosted runner** -> Linux x64.
Run the commands it shows on the VPS, and when asked for labels type: `vps`

```bash
cd ~/actions-runner
sudo ./svc.sh install && sudo ./svc.sh start      # runs as a service, survives reboot
```

Security (repo is public): Settings -> Actions -> General -> "Fork pull request workflows" ->
**Require approval for all outside collaborators**. Only `telegram-bot.yml` (repository_dispatch)
targets this runner; never point a `pull_request` workflow at it.

## 3. Switch the shorts job to the VPS

Repo -> Settings -> Secrets and variables -> Actions:

| Kind | Name | Value |
| --- | --- | --- |
| Variable | `SHORTS_RUNNER` | `["self-hosted","vps"]` |
| Variable | `OVD_WORKER_URL` | `https://worker.winplaybox.in` (or `http://127.0.0.1:<port>` if the worker is on the same VPS) |
| Secret | `OVD_WORKER_KEY` | the worker's `WORKER_KEY` |
| Secret | `GEMINI_API_KEY` | needed for AI viral-highlight picking (without it a word-density fallback is used) |

Delete `SHORTS_RUNNER` to go back to GitHub-hosted runners instantly.

## 4. (Optional) Move the webhook server off Render

```bash
cd ~ && git clone https://github.com/Winplaybox/Remotion.git bot && cd bot/apps/telegram-bot
npm i -g pm2
TELEGRAM_BOT_TOKEN=... GH_DISPATCH_TOKEN=... TG_ADMIN_ID=... GITHUB_REPO=Winplaybox/Remotion PORT=8787 pm2 start server.mjs --name tg-bot
pm2 save && pm2 startup
```
Put it behind Caddy/Nginx with HTTPS (e.g. `bot.winplaybox.in` -> `127.0.0.1:8787`), then point the
Telegram webhook at the new URL. Render free sleeps when idle; the VPS does not.

## Notes
- One runner = one job at a time; extra jobs wait in the queue. Register a second runner (another folder,
  same label) only if the VPS has CPU to spare.
- KVM 2 has fewer cores than a GitHub runner, so the Remotion render itself is not faster; setup and
  downloads are.
