/**
 * Prints the GitHub Actions matrix of posts to publish now.
 * - Normal: slots starting 30-90 min after the top of the current hour (rendered/scheduled ahead of time).
 * - Catch-up (only with the Supabase ledger): slots of the last LOOKBACK hours that were never published because a
 *   scheduled run was skipped. Those go out right away (YouTube publishes ~15 min later). Slots before CATCHUP_SINCE
 *   (ledger start) are never caught up, so nothing published before the ledger existed is posted again.
 *   npx ts-node scripts/due.ts [--from ISO] [--hours 1] [--channel id] [--no-ledger]
 */
import { CHANNELS, isLive, startDateOf, todayIST, slotTimeISO, type ChannelId } from "../channels/channels";
import { ledgerEnabled, ledgerStatus, type SlotKey } from "./ledger";

export const LOOKBACK_HOURS = 12;
export const CATCHUP_SINCE = Date.parse("2026-11-08T05:30:00Z");

/** Slots that could be due at `from` (top of hour). catchUp adds past slots of the last LOOKBACK hours. */
export function candidates(from: number, hours: number, only: string | undefined, catchUp: boolean): (SlotKey & { channel: ChannelId; late: boolean })[] {
  const out: (SlotKey & { channel: ChannelId; late: boolean })[] = [];
  for (const dayOffset of [-1, 0, 1]) {
    const date = todayIST(new Date(from + dayOffset * 86_400_000));
    for (const channel of Object.keys(CHANNELS) as ChannelId[]) {
      if (only && only !== channel) continue;
      if (!isLive(channel) || date < startDateOf(channel)) continue;
      CHANNELS[channel].slots.forEach((hhmm, slot) => {
        const t = Date.parse(slotTimeISO(date, hhmm));
        const normal = t >= from + 30 * 60_000 && t < from + (30 + hours * 60) * 60_000;
        const late = catchUp && t < from + 30 * 60_000 && t >= from - LOOKBACK_HOURS * 3_600_000 && t >= CATCHUP_SINCE;
        if (normal || late) out.push({ channel, date, slot, late: !normal });
      });
    }
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const arg = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
  // Anchor to the top of the hour so a late-starting run still picks the same window.
  const from = arg("from") ? Date.parse(arg("from")!) : Math.floor(Date.now() / 3_600_000) * 3_600_000;
  const useLedger = ledgerEnabled() && !args.includes("--no-ledger");
  let due = candidates(from, Number(arg("hours") ?? 1), arg("channel"), useLedger);
  if (useLedger) {
    try {
      const done = new Set((await ledgerStatus(due)).map((r) => `${r.channel}|${String(r.date).slice(0, 10)}|${r.slot}`));
      due = due.filter((d) => !done.has(`${d.channel}|${d.date}|${d.slot}`));
    } catch (e) {
      // Ledger down: never catch up blindly (could double-post Reels); keep the normal window only.
      console.error(`[due] ledger unavailable, no catch-up: ${(e as Error).message}`);
      due = due.filter((d) => !d.late);
    }
  }
  for (const d of due.filter((x) => x.late)) console.error(`[due] catch-up ${d.channel} ${d.date} slot ${d.slot}`);
  process.stdout.write(JSON.stringify({ include: due.map(({ channel, date, slot }) => ({ channel, date, slot })) }));
}

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
