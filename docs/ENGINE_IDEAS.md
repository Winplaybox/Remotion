# Future engine ideas (next phase)

Built from 13 reference Shorts/Reels (Nov 2026) that get high comment counts in India. These are **formats**, not
content to copy — every engine writes its own stories, art and audio. Each idea follows the existing contract:
`docs/NEW_ENGINE.md` (schema → `ForDay(n)` → duration → voice → answer → **AskOutro** ending → QA → approval).

Build one with: `npm run engine:new -- <slug> <Pascal> --channel "<Name>"`, then give an AI agent the prompt in
`docs/NEW_ENGINE.md` plus the section below.

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

1. **Character rig** (`packages/visuals/src/rig/`) — flat vector Indian characters from parts: head, hair, face (eyes
   blink, 4 mouth shapes for lip-sync to voice amplitude), torso with outfit colours, arms with 6 poses
   (idle, point, think, shock, wave, hands-up), walk cycle. Presets: jasoos, seth, naukar, patni, beta, maali,
   maharaj, kisaan, police, raja, sipahi, dadi, bachcha.
2. **Set kit** — backgrounds as layered SVG: haveli night, hotel desk, village field, palace court, locked room,
   rooftop, vault, shop. Spotlight + dim layer to focus on the speaker.
3. **Captions** — big 2-line Hinglish/Devanagari captions synced to the voice lines (we already have timings).
4. **SpeechBubble, ClueBoard, Countdown, CaseBadge, NumberedPodium** components.
5. **Lip-sync from voice** — mouth opens by WAV loudness per frame (no external service).

## The ideas — ranked by (reach × how automatic it can be) ÷ effort

| # | Engine (slug) | Format | Daily content source | Effort | Why first |
|---|---|---|---|---|---|
| 1 | **Code Cracker** (`code-lock`) | "Can you crack the 3-digit code?" 5 clues (`682 — one digit correct, right place` …) → `WHAT IS THE CODE?` | **100% generated**: random code + clue generator, brute-force check that exactly one answer fits | S | Infinite, zero writing, tiny art (vault + digit tiles) |
| 2 | **Jhooth Kaun?** (`liar-lineup`) | Crime scene → 3 clues → 3 suspects give alibis in spotlight → "Kaun jhooth bol raha hai? [1][2][3]" | Template generator: contradiction types (stopped clock vs alibi time, rain vs dry shoes, locked door vs "darwaza khula tha", light off vs "padh raha tha") × sets × names | M | Highest comments in the references; uses the rig once, then reused by #4–#7 |
| 3 | **Jaldi Batao** (`trick-question`) | Speed trap: "SAFED 5 baar bolo… gaay kya peeti hai?" stick figure, ring countdown, brain-swap gag | Curated bank of 100+ trick pairs (Hinglish), rotate | S | 15–20 s, very loopable, easy art |
| 4 | **Hisaab Lagao** (`math-story`) | Story maths: hotel bill missing rupee, candles left by morning, seven wives riddle; animated money/number counter | Parameterised bank: same logic, new numbers/objects/places each day; answer computed | M | Answer is computed so never wrong; counters look great |
| 5 | **Bach Ke Dikhao** (`escape-riddle`) | Survival logic: tower 200 ft + rope 150 ft, king's court animal test; 10-min story countdown, "Ab tumhari baari!" | Authored bank (weekly batch) + rig + set kit | M | Strong hook ("You're hanging at 50 ft…") |
| 6 | **Raaz Part 1/2** (`mystery-serial`) | Episodic mystery/horror (rooftop claps at 10 PM, Tower 11), cliffhanger + `HAAN/NAHI` choice; Part 2 is decided by the top comment | Authored seasons (like EpicBharatSaga) | L | Builds habit + return viewers; reuse story-diorama timeline |
| 7 | **Kyun Karte Hain?** (`ritual-explainer`) | Narrator character + infographic cards: "Why exchange garlands?", "Why touch feet?" | Authored bank; fits **EpicBharatSaga** as a second format | M | Shares and saves; brand-safe |
| 8 | **Spot the Liar 17s** (`liar-quick`) | 3 people, 3 one-line stories, one impossible detail, 17 s | Generated from #2's contradiction table | S (after #2) | Ultra-short variant for extra daily slots |

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

## Channel ideas
| Channel | Engines |
|---|---|
| **Jasoos Bhai** (new) | 2 Jhooth Kaun, 8 Spot the Liar, 6 Raaz serial |
| **Dimaag Lock** (new) | 1 Code Cracker, 4 Hisaab Lagao, 3 Jaldi Batao |
| **Chakra Puzzle** (existing) | add 1 Code Cracker as a second daily format |
| **EpicBharatSaga** (existing) | add 7 Kyun Karte Hain |

## Ideas inbox
New ideas (including from the Telegram bot, once built) are added to `content/ideas/inbox.json` and reviewed by the admin
before they become a row in the table above.
