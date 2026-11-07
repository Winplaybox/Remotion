import { chakraPuzzleForDay } from "../engines/odd-orbit/src/model";
import { kaaliPeeliForDay } from "../engines/track-vehicle/src/model";
import { epicBharatSagaForDay } from "../content/epicbharatsaga/vishnu-season";

/**
 * One entry per channel. `startDate` = the date Day 1 / EP01 goes live (Asia/Kolkata).
 * Every later date maps to Day N = days since start + 1, so each upload is new and in order.
 */
export const CHANNELS = {
  "chakra-puzzle": {
    name: "Chakra Puzzle",
    composition: "ChakraPuzzle",
    startDate: "2026-11-10",
    narrated: false,
    resolve: (day: number) => chakraPuzzleForDay(day),
    caption: (day: number) => `Puzzle #${String(day).padStart(3, "0")} — ulta ghoomne wala dhundo! Comment mein ROW + NUMBER likho 👇 #brainteaser #puzzle #shorts #reels`
  },
  "kaali-peeli-chase": {
    name: "Kaali Peeli Chase",
    composition: "KaaliPeeliChase",
    startDate: "2026-11-10",
    narrated: false,
    resolve: (day: number) => kaaliPeeliForDay(day),
    caption: (day: number) => `Level ${day} — nazar hati, gaadi gayi! Kaunsa number? Comment karo 👇 #mumbai #kaalipeeli #puzzle #shorts #reels`
  },
  epicbharatsaga: {
    name: "EpicBharatSaga",
    composition: "EpicBharatSaga",
    startDate: "2026-11-10",
    narrated: true,
    resolve: (day: number) => epicBharatSagaForDay(day),
    caption: (day: number) => `Vishnu Season · EP ${String(day).padStart(2, "0")} — Dashavatar ki kahani 🙏 #sanatandharma #vishnu #dashavatar #shorts #reels`
  }
} as const;

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
