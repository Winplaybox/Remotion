import { chakraPuzzleForDay } from "../engines/odd-orbit/src/model";
import { kaaliPeeliForDay } from "../engines/track-vehicle/src/model";
import { epicBharatSagaForDay, VISHNU_SEASON } from "../content/epicbharatsaga/vishnu-season";

export interface PostMeta { title: string; description: string; tags: string[]; caption: string; language: string; categoryId: string }

export interface ChannelConfig {
  name: string;
  composition: string;
  /** Date (Asia/Kolkata) on which post #1 goes live. */
  startDate: string;
  /** Publish times in IST, "HH:MM". Post number = (day - 1) * slots.length + slotIndex + 1. */
  slots: readonly string[];
  narrated: boolean;
  /** GitHub secret holding this channel's YouTube OAuth token JSON. */
  youtubeTokenSecret: string;
  /** GitHub secret prefix for Meta: <PREFIX>_PAGE_ID, <PREFIX>_IG_USER_ID, <PREFIX>_PAGE_TOKEN. */
  metaSecretPrefix: string;
  resolve: (n: number) => unknown;
  meta: (n: number) => PostMeta;
}

const ORDINAL = ["pehla", "doosra", "teesra", "chautha", "paanchva", "chhatha", "saatva", "aathva", "nauva", "dasva"];
const PUZZLE_TAGS = ["puzzle", "brain teaser", "brain test", "odd one out", "iq test", "focus test", "shorts"];

/**
 * Posting slots are chosen for reach: 06:30 and 08:30 IST = US prime time (8-11 PM ET),
 * 19:30 IST = India prime time. All three channels share one schedule file.
 */
export const CHANNELS = {
  "chakra-puzzle": {
    name: "Chakra Puzzle",
    composition: "ChakraPuzzle",
    startDate: "2026-11-10",
    slots: ["06:30", "08:30", "19:30"],
    narrated: false,
    youtubeTokenSecret: "YT_TOKEN_CHAKRA_PUZZLE",
    metaSecretPrefix: "META_CHAKRA",
    resolve: (n) => chakraPuzzleForDay(n),
    meta: (n) => {
      const p = chakraPuzzleForDay(n);
      return {
        title: `${p.title.charAt(0)}${p.title.slice(1).toLowerCase()} 👀 Puzzle #${n} (${p.difficulty}) #shorts`,
        description: `${p.subtitle}\nPuzzle #${n} · ${p.difficulty.toUpperCase()} · answer at the end.\nComment the ROW + NUMBER before the reveal!\n\nNew puzzle every day — subscribe @ChakraPuzzle\n#puzzle #brainteaser #oddoneout #iqtest #shorts`,
        tags: [...PUZZLE_TAGS, "find the odd one", "spinning puzzle", p.element],
        caption: `Puzzle #${n} — ${p.subtitle} Comment ROW + NUMBER 👇\n#puzzle #brainteaser #oddoneout #iqtest #reels`,
        language: "en",
        categoryId: "20"
      };
    }
  },
  "kaali-peeli-chase": {
    name: "Kaali Peeli Chase",
    composition: "KaaliPeeliChase",
    startDate: "2026-11-10",
    slots: ["07:00", "09:00", "20:00"],
    narrated: false,
    youtubeTokenSecret: "YT_TOKEN_KAALI_PEELI_CHASE",
    metaSecretPrefix: "META_KPC",
    resolve: (n) => kaaliPeeliForDay(n),
    meta: (n) => {
      const p = kaaliPeeliForDay(n);
      return {
        title: `Can you track the ${p.label.toLowerCase()}? 🚕 Level ${n} #shorts`,
        description: `Keep your eyes on the ${p.label.toLowerCase()} — they all shuffle!\nLevel ${n} · answer at the end. Comment your number before the reveal 👇\n\nA new level every day — subscribe @KaaliPeeliChase\n#puzzle #trackthecar #shellgame #brainteaser #shorts`,
        tags: [...PUZZLE_TAGS, "track the car", "shell game", "follow the taxi", "eye test", p.vehicle],
        caption: `Level ${n}: where's the ${p.label.toLowerCase()}? Comment the number 👇\n#puzzle #trackthecar #brainteaser #reels`,
        language: "en",
        categoryId: "20"
      };
    }
  },
  epicbharatsaga: {
    name: "EpicBharatSaga",
    composition: "EpicBharatSaga",
    startDate: "2026-11-10",
    slots: ["18:30"],
    narrated: true,
    youtubeTokenSecret: "YT_TOKEN_EPICBHARATSAGA",
    metaSecretPrefix: "META_EBS",
    resolve: (n) => epicBharatSagaForDay(n),
    meta: (n) => {
      const name = VISHNU_SEASON.outline[n - 1] ?? "";
      return {
        title: `Vishnu ka ${ORDINAL[n - 1] ?? `${n}th`} avatar: ${name.charAt(0)}${name.slice(1).toLowerCase()} 🙏 | EP ${String(n).padStart(2, "0")} #shorts`,
        description: `Vishnu Season · EP ${String(n).padStart(2, "0")} — ${name}\nDashavatar ki kahani, roz ek episode.\n\nSubscribe @epicbharatsaga\n#sanatandharma #vishnu #dashavatar #hindumythology #shorts`,
        tags: ["sanatan dharma", "vishnu", "dashavatar", name.toLowerCase(), "hindu mythology", "bhagavata purana", "shorts"],
        caption: `Vishnu Season · EP ${String(n).padStart(2, "0")} — ${name} 🙏\n#sanatandharma #vishnu #dashavatar #reels`,
        language: "hi",
        categoryId: "27"
      };
    }
  }
} satisfies Record<string, ChannelConfig>;

export type ChannelId = keyof typeof CHANNELS;

/** Today's date in Asia/Kolkata as YYYY-MM-DD. */
export function todayIST(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function dayNumber(channel: ChannelId, date: string): number {
  const start = Date.parse(`${CHANNELS[channel].startDate}T00:00:00Z`);
  const target = Date.parse(`${date}T00:00:00Z`);
  const d = Math.round((target - start) / 86_400_000) + 1;
  if (d < 1) throw new Error(`${channel}: ${date} is before startDate ${CHANNELS[channel].startDate}`);
  return d;
}

/** Sequential post number for a date + slot index. */
export function postNumber(channel: ChannelId, date: string, slot: number): number {
  const slots = CHANNELS[channel].slots.length;
  if (slot < 0 || slot >= slots) throw new Error(`${channel}: slot ${slot} out of range 0..${slots - 1}`);
  return (dayNumber(channel, date) - 1) * slots + slot + 1;
}

/** ISO timestamp for a date + "HH:MM" IST slot. */
export function slotTimeISO(date: string, hhmm: string): string {
  return new Date(`${date}T${hhmm}:00+05:30`).toISOString();
}
