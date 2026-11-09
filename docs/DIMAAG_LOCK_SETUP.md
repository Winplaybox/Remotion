# Dimaag Lock — channel setup

Dimaag Lock is a separate English-first puzzle channel. It does not share a YouTube channel with Pavitra Panchang 365, Chakra Puzzle or Kaali Peeli Chase.

## Engine plan

The channel plan in `docs/ENGINE_IDEAS.md` assigns three formats:
1. **Code Cracker** (`code-lock`) — generated 3- and 4-digit vault puzzles. Five clues are validated against the full candidate space; exactly one code must satisfy all clues.
2. **Hisaab Lagao** (`math-story`) — parameterised story-maths puzzles with computed answers.
3. **Jaldi Batao** (`trick-question`) — reviewed quick-question bank.

This PR implements and registers Code Cracker as the first production format. The other two are planned follow-up engines and are not silently substituted with placeholder content.

## Channel defaults

- Channel ID: `dimaag-lock`
- Composition: `CodeLock`
- Handle / visible video watermark: `@DimaagLock`
- Language: English (voice, on-screen text, metadata and captions)
- Edge TTS voice: `en-US-AriaNeural`
- Initial schedule: 12:30 and 19:30 Asia/Kolkata
- YouTube: full Short
- Instagram: full Reel through existing Meta fan-out
- Facebook: teaser through existing Meta fan-out
- Start date: `2099-01-01` placeholder
- `autoPublish: false` — intentionally disabled until the account connections, credentials and first QA review are complete.

## Required GitHub Actions secrets

| Secret | Purpose |
|---|---|
| `YT_TOKEN_DIMAAG_LOCK` | OAuth token JSON for the Dimaag Lock YouTube channel |
| `YT_TOKEN_DIMAAG_LOCK_CLIENT` | OAuth client JSON for the dedicated Dimaag Lock Google Cloud project |
| `META_DIMAAG_LOCK_PAGE_ID` | Facebook Page ID |
| `META_DIMAAG_LOCK_IG_USER_ID` | Instagram Professional account ID |
| `META_DIMAAG_LOCK_PAGE_TOKEN` | Meta Page access token |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Existing public media storage used by Meta publishing |

Optional Pinterest secrets are wired but not required: `PINTEREST_DIMAAG_LOCK_REFRESH_TOKEN` and `PINTEREST_DIMAAG_LOCK_BOARD_ID`.

## Required GitHub Actions variables when ready to launch

1. `START_DIMAAG_LOCK` = launch date in `YYYY-MM-DD` (IST).
2. `LIVE_DIMAAG_LOCK` = `true`.

The repository-wide `AUTO_PUBLISH=true` is still required for scheduled workflow runs. Do not set the two Dimaag Lock variables until the YouTube channel and social accounts are ready and the human has approved the rendered previews.

## Quota isolation

The repository's publishing guide estimates 1,600 YouTube API quota units per upload. The existing Chakra Puzzle and Kaali Peeli Chase schedules already use six uploads/day (9,600 units) in their shared Cloud project. Dimaag Lock's two daily uploads should use its own Google Cloud project and OAuth client; otherwise the shared project can exceed its 10,000-unit daily quota.

## QA before launch

Run:

```bash
npx tsc --noEmit
npm run lint
npm test
npm run engine:qa -- --engine code-lock
npm run post -- --channel dimaag-lock --n 1 --dry
```

Review `qa/code-lock/contact-sheet.png`, `qa/code-lock/day01.mp4` and the audio report. The generated puzzle must have exactly one valid code, and the on-video watermark must read `@DimaagLock`.

## Safety gates

- Keep `autoPublish: false` until the channel owner explicitly enables it.
- Never modify already-published posts on other channels.
- Do not enable Dimaag Lock by changing the repository-wide `AUTO_PUBLISH` variable; use the channel-specific launch variables above.
- First launch should be a manually reviewed test post before scheduled publishing is enabled.
