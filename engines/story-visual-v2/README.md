# StoryVisualEngine V2 (MindNest Tales)

Art and text never mix: `SceneLayer` / `episode/EpisodeScene.tsx` draw the art (language-free), `StoryUI` /
`episode/EpisodeUI.tsx` draw the type. A style (`src/presets/`) is only data.

## Compositions
| id | what |
|---|---|
| `MindNestEpisodeV2` (apps/studio Root, folder MindNest) | full episode: ~1.5-2 s hook card (emblem + wordmark + title, finished first frame) -> four illustrated story pages -> moral card (typography) -> "see you tomorrow" page. Pages cross-dissolve with a slight page-turn drift; characters hop / slide / rise / drop in; per-page particles; music ducked under the voice. Page length = voice + breath (`episode/model.ts`). |
| `StoryVisualV2` (samples/Root.tsx) | single page still/clip per style, as before. |

## Render an episode
```bash
python scripts/sound/synth_mindnest_v2.py                     # music (already committed)
npx ts-node scripts/mindnest-v2-voice.ts --lang hi --fable 1  # narration per caption chunk + episode.json (props)
npx remotion render apps/studio/src/remotion/index.ts MindNestEpisodeV2 out/ep1-hi.mp4 \
  --props=public/mindnest-v2/audio/fable-1/hi/episode.json
```
Voice: Kokoro via `scripts/narration/narrate.py` (same chain/voices as the channel in `channels/voices.ts`; falls back
to kokoro-onnx when the torch `kokoro` package is absent, and to Gemini/Edge for ar/de/ko/fil). Every caption chunk
is narrated separately and joined with a 0.22 s breath, so captions and the word highlight are timed to the real
audio. Without `cues` (channel pipeline, one WAV per page) captions are timed by character share of the page audio.

## Channels
`channels/channels.ts`: MindNest channels render `MindNestEpisodeV2` with `MINDNEST_STYLE[lang]` (default
`storybook-classic`; `night-story` is the bedtime preset). `MINDNEST_ENGINE=legacy` (env or repo variable) switches back
to the old story-diorama render (`EpicBharatSaga` + `mindNestForDay`), unchanged. The channel's `style` prop from
`channels/looks.ts` is ignored by V2 (it uses `storyStyle`).

**Fails closed:** a fable without hand-made art for the style (`episode/art.ts`) throws in `resolve()`. Today only
fable 1 / storybook-classic has art, so fables 2-7 need art (or `MINDNEST_ENGINE=legacy`) before those posts render.

## Add art for a fable
1. Generate per page a plate (no characters, calm top 30 % for the headline) and pose cut-outs, always with
   `public/mindnest-v2/storybook-classic/characters.png` as the identity reference; key green -> alpha.
2. Put them in `public/mindnest-v2/<style>/fable-<n>/` (JPEG plates, WebP cut-outs).
3. Add an `EpisodeArt` entry in `episode/art.ts` (positions in 1080x1920 px, times as page fractions).
4. `npm test -- story-visual-v2`.

Licences and sources: `public/mindnest-v2/CREDITS.md`.
