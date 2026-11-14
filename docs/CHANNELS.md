# Channels: daily auto-publishing

Four channel brands, one repo; Dimaag Lock remains disabled until launch approval. Every slot has a fixed post number, so each upload is new and in order. This repo renders the videos, schedules them on YouTube, and posts Reels to Instagram and Facebook.

| Channel | Composition | Language | Slots (IST) | Why these times |
|---|---|---|---|---|
| Chakra Puzzle (@ChakraPuzzle) | `ChakraPuzzle` | Hinglish + voice, ~20 s | 06:30, 08:30, 19:30 | 06:30 and 08:30 IST are US prime time. 19:30 IST is India prime time. |
| Kaali Peeli Chase (@KaaliPeeliChase) | `KaaliPeeliChase` | Hinglish + voice, ~20 s | 07:00, 09:00, 20:00 | Same reasoning, offset so the two channels don't clash |
| EpicBharatSaga | `EpicBharatSaga` | Hinglish + IndicF5 voice + captions | 19:00 | Switches over from colab-YT, see below |
| Dimaag Lock | `CodeLock` | English + Edge TTS (`en-US-AriaNeural`) | 12:30, 19:30 | Disabled until account setup and QA approval; see `DIMAAG_LOCK_SETUP.md` |

All slots, start dates, titles, descriptions, tags and captions are in `channels/channels.ts`.

## How it runs

Claude renders, GitHub uploads.

1. **Voice (GitHub Actions, `prepare-voice.yml`)**: at 02:45 and 14:45 IST, and on every push that changes content, Edge TTS makes the Hinglish voice for the next 3 days of posts and puts it on the `render-queue` branch (`voice/<channel>/post-NNN/`).
2. **Video (Claude)**: every morning at 04:41 IST Claude renders each voiced post with Remotion (`npx ts-node scripts/queue.ts render --queue queue --push-each`) and pushes the MP4 to `render-queue` (`video/<channel>/post-NNN.mp4`).
3. **Upload (GitHub Actions, `publish-channels.yml`, hourly)**: `scripts/due.ts` finds slots 30–90 min away; `scripts/post.ts` takes Claude's MP4 from `render-queue`, schedules it on YouTube for the exact slot and posts the Reel to Instagram + Facebook. If Claude's video is missing, it renders the post itself so nothing is skipped (set repo variable `CI_RENDER_FALLBACK=false` to forbid that).
4. **Answer comment**: the `answers` job posts the answer as a comment on puzzle videos once they are public. The YouTube API cannot pin comments: pin it in YouTube Studio (one tap) if you want it on top.

Scheduled runs only fire from the **default branch** and only when the repo variable `AUTO_PUBLISH=true` is set. Dimaag Lock additionally stays disabled until `START_DIMAAG_LOCK` is set to its launch date and `LIVE_DIMAAG_LOCK=true`; see `docs/DIMAAG_LOCK_SETUP.md`.

## One-time setup

**Fast path (recommended):** on your PC, inside this repo:

```bash
npm ci
gh auth login     # once
node scripts/publish/setup-secrets.mjs --client C:/path/client_secret.json --ebs-dir C:/Users/sagar/Desktop/Project/daily-devotional-shorts --ebs-silent
```

This sets every YouTube secret plus `AUTO_PUBLISH`. Tokens go straight from Google to GitHub and are never shown. The manual table below is the same thing done by hand.


Add these in Settings → Secrets and variables → Actions:

| Secret | What |
|---|---|
| `YT_CLIENT_SECRET_JSON` | Google Cloud OAuth client JSON (YouTube Data API v3 enabled) |
| `YT_TOKEN_CHAKRA_PUZZLE` | output of `node scripts/publish/auth-youtube.mjs client_secret.json`. Pick **Chakra Puzzle** on the consent screen |
| `YT_TOKEN_KAALI_PEELI_CHASE` | same command, pick **Kaali Peeli Chase** |
| `YT_TOKEN_EPICBHARATSAGA` | same command, signed in as epicbharat.official, pick **EpicBharatSaga** |
| `YT_TOKEN_DIGITAL_IMMORTALS` | Digital Immortals (Kaun Hoon Main?): paste the **same JSON** as colab-YT's `DIGITALIMMORTALS_TOKEN_JSON` (google-auth `authorized_user` format with client_id/secret is supported), or run `node scripts/publish/auth-youtube.mjs client_secret.json` and pick **Digital Immortals** |
| `YT_TOKEN_DIMAAG_LOCK` | OAuth token JSON for the separate Dimaag Lock channel |
| `YT_TOKEN_DIMAAG_LOCK_CLIENT` | OAuth client JSON for the dedicated Dimaag Lock Cloud project |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | public bucket `meta-publishing`, where Meta pulls each Reel from (same values as daily-devotional-shorts) |
| `META_CHAKRA_PAGE_ID` / `_IG_USER_ID` / `_PAGE_TOKEN` | Facebook Page + Instagram professional account for Chakra Puzzle |
| `META_KPC_*`, `META_EBS_*`, `META_DIMAAG_LOCK_*` | same for the other channels; Dimaag Lock uses its own Page + Instagram Professional account |

Variables: `AUTO_PUBLISH=true`. Add `EBS_ALLOW_SILENT=true` only if you want EpicBharatSaga to go out with captions and no voice.

**YouTube quota:** one upload costs 1,600 units, and a Google Cloud project gets 10,000 units/day. Chakra Puzzle + Kaali Peeli Chase already use six uploads/day = 9,600 units. Dimaag Lock must use its own Google Cloud project and OAuth client for its two daily uploads; do not share the puzzle channels’ project quota.

If a channel's Meta secrets are missing, that channel skips Meta and still uploads to YouTube.

## Puzzle voice (automatic)

Chakra Puzzle and Kaali Peeli Chase get short Hinglish voice clips (Edge TTS, same voice): a hook at the start, a "3 seconds left" / "shuffle shuru" cue, the question and the answer. Lines live in `chakraVoiceLines` (engines/odd-orbit/src/model.ts) and `kaaliPeeliVoiceLines` (engines/track-vehicle/src/model.ts). If TTS fails the post still goes out, just silent.

## EpicBharatSaga narration (automatic)

Narration is generated automatically in GitHub Actions, the same way daily-devotional-shorts does it: Edge TTS reads each scene's Devanagari `narration` with `hi-IN-MadhurNeural` (male) right before rendering. Nothing to run by hand. To change the voice set the repo variable `EDGE_TTS_VOICE` (e.g. `hi-IN-SwaraNeural` for female).

Optional, your own voice: WAVs committed to `public/audio/epicbharatsaga/post-NNN/` always win over Edge TTS, so you can replace any episode with IndicF5:

```bash
python scripts/narration/narrate.py --channel epicbharatsaga --n 1-7 --ref ref.wav --ref-text "<exact words in ref.wav>"
git add public/audio && git commit -m "EBS narration 1-7" && git push
```

Every episode must be written in `content/epicbharatsaga/vishnu-season.ts` before its date. A missing episode **fails** instead of being made up.

Episodes are numbered globally: channel day N = episode N. Seasons run back to back in `SEASONS` (Vishnu 1–10, then Shiv, Ganesh, Devi, Hanuman). The daily ops task keeps the next 7 episodes written and opens a PR; merge it and narrate each week.

## Manual runs

```bash
npm run post -- --channel chakra-puzzle --n 4 --dry      # props + metadata only
npm run post -- --channel kaali-peeli-chase --n 4        # render locally
```

Or in GitHub: Actions → Publish Channels → Run workflow, with a channel and a post number.

## 28-day plan to the monetization bar

The bar is **per channel**: 1,000 subscribers + 10M Shorts views in 90 days (20M for new applicants from 1 Feb 2027). Views on one channel don't count for another.

1. **Days 1–7:** 3 posts/day per puzzle channel, 1/day EBS. Every evening, check YouTube Studio → Shorts → "Viewed vs swiped away".
2. **Days 8–14:** find the formats with the best viewed % and average view duration (element, vehicle, difficulty). Bias the rotation in `chakraPuzzleForDay` / `kaaliPeeliForDay` towards them.
3. **Days 15–28:** put the most posts on the channel that is winning (a second Cloud project gives more quota). Reply to comments in the first hour; the answer-in-comments CTA exists for this.
4. Every Reel also goes to Instagram and Facebook. Those views don't count for YouTube, but they bring followers back to YouTube.

No tool can guarantee 10M views in 28 days. This plan maximises how often and how consistently each channel posts, and gives you the data to double down on what works.

## EpicBharatSaga switch-over from colab-YT

The old pipeline (Winplaybox/colab-YT, `epic_bharat_saga_scheduler.yml`) keeps posting until the switch. On switch day, do all of these together so the channel never double-posts:

1. Put the channel token in this repo: `node scripts/publish/setup-secrets.mjs --only-ebs --ebs-token <colab-YT>/channels/EpicBharatSaga/token.json`. If you don't have that file, create it with `python channels/EpicBharatSaga/authenticate_youtube.py` in colab-YT.
2. Merge the colab-YT PR that removes the EpicBharatSaga cron.
3. Set the repo variables `START_EPICBHARATSAGA=<switch date YYYY-MM-DD>` (that day = EP01) and `LIVE_EPICBHARATSAGA=true`.
4. Have at least 7 episodes written (`content/epicbharatsaga/vishnu-season.ts`) and narrated with IndicF5. Missing narration posts with captions only while `EBS_ALLOW_SILENT=true`.
