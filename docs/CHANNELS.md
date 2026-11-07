# Channels: daily auto-publishing

Three channels, one repo. Every slot has a fixed post number, so each upload is new and in order. This repo renders the videos, schedules them on YouTube, and posts Reels to Instagram and Facebook.

| Channel | Composition | Language | Slots (IST) | Why these times |
|---|---|---|---|---|
| Chakra Puzzle (@ChakraPuzzle) | `ChakraPuzzle` | English (global) | 06:30, 08:30, 19:30 | 06:30 and 08:30 IST are US prime time. 19:30 IST is India prime time. |
| Kaali Peeli Chase (@KaaliPeeliChase) | `KaaliPeeliChase` | English (global) | 07:00, 09:00, 20:00 | Same reasoning, offset so the two channels don't clash |
| EpicBharatSaga | `EpicBharatSaga` | Hinglish + IndicF5 voice + captions | 19:00 | Switches over from colab-YT, see below |

All slots, start dates, titles, descriptions, tags and captions are in `channels/channels.ts`.

## How it runs

`.github/workflows/publish-channels.yml` runs every hour:
1. `scripts/due.ts` finds the slots that start 30–90 minutes from now.
2. `scripts/post.ts` resolves post N, renders the MP4, uploads it to YouTube as private and scheduled for the exact slot time, then posts the Reel to Instagram and Facebook.
3. The MP4 and metadata are kept as a workflow artifact for 7 days.

Scheduled runs only fire from the **default branch** and only when the repo variable `AUTO_PUBLISH=true` is set.

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
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | public bucket `meta-publishing`, where Meta pulls each Reel from (same values as daily-devotional-shorts) |
| `META_CHAKRA_PAGE_ID` / `_IG_USER_ID` / `_PAGE_TOKEN` | Facebook Page + Instagram professional account for Chakra Puzzle |
| `META_KPC_*`, `META_EBS_*` | same for the other two |

Variables: `AUTO_PUBLISH=true`. Add `EBS_ALLOW_SILENT=true` only if you want EpicBharatSaga to go out with captions and no voice.

**YouTube quota:** one upload costs 1,600 units, and a Google Cloud project gets 10,000 units/day. Six puzzle uploads a day = 9,600 units, so put EpicBharatSaga on a second Cloud project (its own client JSON), or keep puzzles at ≤ 3 slots per channel.

If a channel's Meta secrets are missing, that channel skips Meta and still uploads to YouTube.

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
