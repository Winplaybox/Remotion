# Future engine ideas (next phase)

Built from 13 reference Shorts/Reels (Nov 2026) that get high comment counts in India. These are **formats**, not
content to copy — every engine writes its own stories, art and audio. Each idea follows the existing contract:
`docs/NEW_ENGINE.md` (schema → `ForDay(n)` → duration → voice → answer → **AskOutro** ending → QA → approval).

Build one with: `npm run engine:new -- <slug> <Pascal> --channel "<Name>"`, then give an AI agent the prompt in
`docs/NEW_ENGINE.md` plus the section below.

**Status (14 Nov 2026):** ✅ Done 2 / 20 engines — #1 Code Cracker (`engines/code-lock`), #2 Jhooth Kaun? (`engines/liar-lineup`). Baki 18. Next: #19 Dharm Sankat (best data signal), then #8 Spot the Liar 17s.

## What all 13 references have in common

| Pattern | Seen as | We already have |
|---|---|---|
| Question with numbered options | `[1] [2] [3]` suspects, `HAAN / NAHI`, `NOKAR · PATNI · BETA` | `AskOutro.options` |
| "Comment karo" + Follow with a tap animation | cursor taps FOLLOW → FOLLOWING | `AskOutro` |
| Answer / Part 2 in the next video | "Jawab part 2 mein", "Answer tomorrow", "Result aaj shaam" | `answerInNextFrom`, `PrevAnswerCard`, answer comment |
| Countdown always on screen | `⏱ 09:57`, `0:46`, `00:00` | engine timer bar |
| Series identity badge | `CASE #108`, `DAY 4`, `TOWER 11 · PART 1` | post number badge |
| On-screen Hindi/Hinglish caption for every spoken line | word captions | **needs** a shared `Captions` component |
| Cartoon Indian characters in a lit set (spotlight, night, haveli, village) | flat vector people | **needs** a shared character rig |
| Clues collected into a sticky list | "Kamre mein mili sirf 3 cheezein" | **needs** a shared `ClueBoard` |

## Shared parts to build first (Phase 0, used by every engine below)

1. ✅ **Character rig** (`packages/visuals/src/rig/`) — flat vector Indian characters from parts: head, hair, face (eyes
   blink, 4 mouth shapes for lip-sync to voice amplitude), torso with outfit colours, arms with 6 poses
   (idle, point, think, shock, wave, hands-up), walk cycle. Presets: jasoos, seth, naukar, patni, beta, maali,
   maharaj, kisaan, police, raja, sipahi, dadi, bachcha.
2. ✅ **Set kit** — backgrounds as layered SVG: haveli night, hotel desk, village field, palace court, locked room,
   rooftop, vault, shop. Spotlight + dim layer to focus on the speaker.
3. ✅ **Captions** — big 2-line Hinglish/Devanagari captions synced to the voice lines (we already have timings).
4. 🟡 **SpeechBubble, ClueBoard, Countdown, CaseBadge, NumberedPodium** components. *(StoryKit has SpeechBubble, ClueNote, CountdownRing, CaseStamp; NumberedPodium baki)*
5. 🟡 **Lip-sync from voice** — mouth opens by WAV loudness per frame (no external service). *(rig accepts `mouth` 0..1; WAV-loudness extractor baki, abhi `talking` flag use hota hai)*

## The ideas — ranked by (reach × how automatic it can be) ÷ effort

| Status | # | Engine (slug) | Format | Daily content source | Effort | Why first |
|---|---|---|---|---|---|---|
| ✅ Done | 1 | **Code Cracker** (`code-lock`) | "Can you crack the 3-digit code?" 5 clues (`682 — one digit correct, right place` …) → `WHAT IS THE CODE?` | **100% generated**: random code + clue generator, brute-force check that exactly one answer fits | S | Infinite, zero writing, tiny art (vault + digit tiles) |
| ✅ Done | 2 | **Jhooth Kaun?** (`liar-lineup`) | Crime scene → 3 clues → 3 suspects give alibis in spotlight → "Kaun jhooth bol raha hai? [1][2][3]" | Template generator: contradiction types (stopped clock vs alibi time, rain vs dry shoes, locked door vs "darwaza khula tha", light off vs "padh raha tha") × sets × names | M | Highest comments in the references; uses the rig once, then reused by #4–#7 |
| ⬜ Baki | 3 | **Jaldi Batao** (`trick-question`) | Speed trap: "SAFED 5 baar bolo… gaay kya peeti hai?" stick figure, ring countdown, brain-swap gag | Curated bank of 100+ trick pairs (Hinglish), rotate | S | 15–20 s, very loopable, easy art |
| ⬜ Baki | 4 | **Hisaab Lagao** (`math-story`) | Story maths: hotel bill missing rupee, candles left by morning, seven wives riddle; animated money/number counter | Parameterised bank: same logic, new numbers/objects/places each day; answer computed | M | Answer is computed so never wrong; counters look great |
| ⬜ Baki | 5 | **Bach Ke Dikhao** (`escape-riddle`) | Survival logic: tower 200 ft + rope 150 ft, king's court animal test; 10-min story countdown, "Ab tumhari baari!" | Authored bank (weekly batch) + rig + set kit | M | Strong hook ("You're hanging at 50 ft…") |
| ⬜ Baki | 6 | **Raaz Part 1/2** (`mystery-serial`) | Episodic mystery/horror (rooftop claps at 10 PM, Tower 11), cliffhanger + `HAAN/NAHI` choice; Part 2 is decided by the top comment | Authored seasons (like EpicBharatSaga) | L | Builds habit + return viewers; reuse story-diorama timeline |
| ⬜ Baki | 7 | **Kyun Karte Hain?** (`ritual-explainer`) | Narrator character + infographic cards: "Why exchange garlands?", "Why touch feet?" | Authored bank; fits **EpicBharatSaga** as a second format | M | Shares and saves; brand-safe |
| ⬜ Baki | 8 | **Spot the Liar 17s** (`liar-quick`) | 3 people, 3 one-line stories, one impossible detail, 17 s | Generated from #2's contradiction table | S (after #2) | Ultra-short variant for extra daily slots |

S = 1–2 days, M = 3–5 days, L = 1–2 weeks for an AI agent following `NEW_ENGINE.md`.

## Per-engine notes for the agent

### 1. Code Cracker (`code-lock`)
- Props: `digits` (3–4), `code`, `clues[] {guess, rule}` where rule ∈ `oneRightPlace | oneWrongPlace | twoWrongPlace | none | …`.
- Generator: pick code; generate candidate guesses; keep a clue set where a solver over all 10^d codes returns
  exactly one answer. Difficulty = digits and clue count. Test: every day has exactly one solution.
- Visual: steel vault, glowing digit tiles flip in one clue at a time, clue text under each; final `? ? ?` + AskOutro.
- Voice: read each clue in Hindi ("छह आठ दो — एक अंक सही है और सही जगह पर").

### 2. Jhooth Kaun? (`liar-lineup`)
- Props: `set`, `victimEvent`, `clues[3]`, `suspects[3] {preset, name, alibi}`, `liar` (index), `contradiction`.
- Generator: choose a contradiction rule → derive the clue that breaks one alibi → write the other two alibis to be
  consistent. Test: exactly one suspect contradicts a clue (rule check, not text).
- Timeline: title card (`CASE #n`) 3 s → set pan 5 s → clues to ClueBoard 10 s → 3 alibis × 6 s → "Jasoos ne suraag pakad liya" 4 s → AskOutro with `[1] [2] [3]` (names under numbers).

### 3. Jaldi Batao (`trick-question`)
- Props: `drill` (word repeated N times), `question`, `trapAnswer`, `rightAnswer`, `countdown`.
- Bank in `content/trick-questions.ts`; each entry reviewed once. 15–20 s.

### 4. Hisaab Lagao (`math-story`)
- Props: `story` (template id), `values`, computed `answer`. Templates: missing rupee, candles burn, ages, trains
  crossing, sharing ladoos. Number counter at top animates every change. Answer shown next video.

### 5. Bach Ke Dikhao (`escape-riddle`)
- Authored JSON per episode: `situation`, `items[]`, `constraint`, `solution`. Story clock counts down (`10:00 → 0:00`).

### 6. Raaz Part 1/2 (`mystery-serial`)
- Extends `story-diorama`: scenes + captions + rig. Part 1 ends with a choice; Part 2 script is picked by the
  top comment (read by `answer-comments.ts` → saved for the next episode).

### 7. Kyun Karte Hain? (`ritual-explainer`)
- Narrator in a corner, cards slide in (title, two icons, quote card, "then vs now" line). Citations in the description.

## Batch 2 — quick puzzle engines (all supported)

Every one fits the existing contract: deterministic `ForDay(n)` from a seed, an **answer computed by code** (so it is
never wrong), and the shared **AskOutro** ending (question + option chips → comment + FOLLOW, answer in the next video).
"Generated" = no writing needed, infinite days; "Bank" = a reviewed list of items.

| Status | # | Engine (slug) | Gameplay on screen | Content | Answer / options chips | Effort | Notes |
|---|---|---|---|---|---|---|---|
| ⬜ Baki | 9 | **Bubble Pop** (`bubble-pop`) | 40–80 bubbles float and pop in waves; one is special (different colour shade, wobble, size or reverse drift); bubbles pop faster and faster | Generated | `ROW · #` or `#1–#N` | S | Closest to the template — copy it first. Difference shrinks with difficulty |
| ⬜ Baki | 10 | **Brain Test** (`brain-test`) | Visual logic: which glass fills first (pipe network), which way the bus goes, which gear turns clockwise, which rope lifts the bucket | Generated for pipes/gears/ropes (simulate to get the answer); bank for trick ones | `[A] [B] [C] [D]` | M | Pipe/gear puzzles are solved by a small simulator → always correct |
| ⬜ Baki | 11 | **Spot the Difference** (`spot-diff`) | Two copies of a drawn scene (room, street, kitchen) stacked; 3–5 changes (colour, missing item, flip, extra item); timer | Generated: scene = list of SVG objects, changes picked by seed | "Kitne differences?" `[3] [4] [5]` or circle numbers `#1–#9` grid | M | Reuse props from story-diorama + set kit; check changes are visible (min size/contrast) |
| ⬜ Baki | 12 | **Find the Hidden Object** (`hidden-object`) | Busy scene or emoji wall (🐱 hidden among 🐯 / 6 among 9s / 🔑 in a messy room) with a slow zoom | Generated (emoji/glyph walls); scenes later with the set kit | `ROW · #` grid chips | S (emoji) / M (scenes) | Emoji version is like Chakra's glyph mode — fast to ship |
| ⬜ Baki | 13 | **Memory Challenge** (`memory`) | Grid of 6–12 items shown for 3–5 s, cards flip over, then: "Card #4 pe kya tha?" or "Kaunsa item gayab hai?" | Generated | 4 picture options `[🍎] [🚗] [⭐] [🐘]` | S | Difficulty = more cards, shorter look time |
| ⬜ Baki | 14 | **Number Puzzle** (`number-puzzle`) | Missing number in a sequence, number triangle, grid or clock ("2, 6, 12, 20, ?") | Generated from rule families (arithmetic, squares, Fibonacci, row sums) with a verifier | `[28] [30] [32] [36]` | S | Distractors from near-miss rules; voice reads the numbers in Hindi |
| ⬜ Baki | 15 | **Colour Challenge** (`colour-challenge`) | Stroop ("LAAL" written in blue — bolo rang!), odd shade in a colour grid, or colour-pattern next step | Generated | colour chips `[🔴] [🔵] [🟢] [🟡]` | S | Speed ramps like Chakra; colour-blind-safe pairs |
| ⬜ Baki | 16 | **Emoji Quiz** (`emoji-quiz`) | 3–5 emojis pop in one by one → guess the movie / song / muhavra / city / festival | Bank (300+ reviewed entries; titles are facts, no posters/lyrics) | 4 text options or free comment | S | Hugely commentable in India; rotate categories daily |
| ⬜ Baki | 17 | **Maze Challenge** (`maze`) | Generated maze, 3 runners at A/B/C; camera pans; "Kaun bahar niklega?" | Generated (DFS maze, BFS checks exactly one path reaches exit) | `[A] [B] [C]` | S–M | Answer reveal next video animates the winning path |
| ⬜ Baki | 18 | **Reaction Challenge** (`reaction`) | Fast flashes: "Kitni baar 🔴 dikha?", or symbol shown for 0.2 s among decoys, speed tiers like Kaali Peeli | Generated | number chips `[5] [6] [7] [8]` | S | Counts are exact from the schedule; keep flashes ≥ 3 frames (safe for photosensitive viewers) |

**Build order for batch 2:** Number Puzzle → Bubble Pop → Memory → Colour → Emoji Quiz (bank) → Maze → Hidden Object →
Reaction → Spot the Difference → Brain Test. The first five are ~1–2 days each with `npm run engine:new`.

**Channel fit:** Chakra Puzzle can rotate Bubble Pop / Hidden Object (emoji) / Colour as extra formats; a new **Dimaag Lock**
channel can carry Number, Memory, Maze, Reaction, Emoji Quiz, Code Cracker.

## Batch 3 — Mythology + logic (proven signal, build FIRST)

**Why:** in `channel-stats` (13 Nov 2026) EpicBharatSaga's best long-form/Shorts after a generic VFX reel are
*"Draupadi's Rejection of Karna: A Dark Psychology Analysis"* (1,149 views) and *"Draupadi's Vow"* (928) — a question /
judgement angle on a famous episode. Normal storytelling uploads average ~131 views. Debate questions have no single
"right" answer, so everyone can comment — the thing all our puzzle channels are missing (0–8 comments total).

| Status | # | Engine (slug) | Format | Content | Answer / options chips | Effort | Notes |
|---|---|---|---|---|---|---|---|
| ⬜ Baki | 19 | **Dharm Sankat** (`dharm-sankat`) | 35–50 s: hook question (≤1.5 s) → context in 3 beats → Side A with its text reference → Side B with its reference → "Aap kya kehte ho? [A] [B]" | Reviewed bank of 120+ questions, each with both sides + source (Valmiki Ramayan kanda, Mahabharat parva, Ramcharitmanas) | `[A] KARNA` `[B] ARJUN`, `HAAN / NAHI` | M | Next video opens with "Kal ka sawaal: 63% ne A kaha" (from real comments via `answer-comments.ts`) + what the text says |
| ⬜ Baki | 20 | **Sabse Bada Sawaal — Top 10** (`dharm-sankat-long`) | 8–10 min 16:9: 10 questions from the week's Shorts, with comment results + deeper context | Built from #19's bank + vote results | chapters per question | S (after #19) | For the 8,000 watch-hour target |

**Question bank starters:** Karna ya Arjun — bada dhanurdhar kaun? · Draupadi ka sabha mein sawaal: jo khud ko haar chuka,
kya wo patni ko daav pe laga sakta tha? · Bhishma cheerharan pe chup kyun rahe? · Ram ne Bali ko chhup ke kyun maara —
dharm ya adharm? · Ekalavya ka angutha — Drona sahi the? · Kunti ne Karna ka sach kyun chhupaya? · "Ashwatthama hato" —
Yudhishthir ka aadha sach jhooth tha? · Abhimanyu chakravyuh se bahar kyun nahi nikal paya? · Shikhandi ke peeche se
Bhishma par baan — dharm-yuddh tha? · Barbarik ka sheesh Krishna ne kyun maanga? · Lakshman rekha Valmiki Ramayan mein
hai ya nahi? · Kumbhakarna 6 mahine kyun sota tha? · Vibhishan — bhakt ya gaddar?

**Rules (sensitive topic):** respectful tone, never mock a deity or a tradition; when versions differ (Valmiki vs Tulsidas,
regional retellings) say so instead of picking one as "the truth"; every claim carries its source in the description;
existing blocked-words moderation stays on. Rig needs Mahabharat/Ramayan looks (Krishna, Arjun, Karna, Draupadi, Bhishma,
Ram, Sita, Ravan…) and a palace-court / Kurukshetra set — add as presets, respectful and non-photoreal.

## Channel ideas
| Channel | Engines |
|---|---|
| **Jasoos Bhai** ✅ live (@JasoosBhaiCases) | 2 Jhooth Kaun, 8 Spot the Liar, 6 Raaz serial |
| **Dimaag Lock** ✅ channel set up (@DimaagLock) | 1 Code Cracker, 4 Hisaab Lagao, 3 Jaldi Batao |
| **Chakra Puzzle** (existing) | add 1 Code Cracker as a second daily format |
| **EpicBharatSaga** (existing) | add 7 Kyun Karte Hain |

## Ideas inbox
New ideas (including from the Telegram bot) are stored in Supabase `videobot.ideas` (bot `/ideas`, `/approve`, `/reject`) and reviewed by the admin
before they become a row in the table above.
