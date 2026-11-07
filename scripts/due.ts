/**
 * Prints the GitHub Actions matrix of posts whose slot starts within the look-ahead window.
 * The hourly workflow renders those, uploads to YouTube scheduled for the exact slot time,
 * and publishes to Instagram/Facebook right away.
 *   npx ts-node scripts/due.ts [--from ISO] [--hours 1]
 */
import { CHANNELS, isLive, startDateOf, todayIST, slotTimeISO, type ChannelId } from "../channels/channels";

const args = process.argv.slice(2);
const arg = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
// Anchor to the top of the hour so a late-starting cron run still picks the same window.
const from = arg("from") ? Date.parse(arg("from")!) : Math.floor(Date.now() / 3_600_000) * 3_600_000;
const hours = Number(arg("hours") ?? 1);
const only = arg("channel");

const due: { channel: ChannelId; date: string; slot: number }[] = [];
for (const dayOffset of [0, 1]) {
  const date = todayIST(new Date(from + dayOffset * 86_400_000));
  for (const channel of Object.keys(CHANNELS) as ChannelId[]) {
    if (only && only !== channel) continue;
    if (!isLive(channel) || date < startDateOf(channel)) continue;
    CHANNELS[channel].slots.forEach((hhmm, slot) => {
      const t = Date.parse(slotTimeISO(date, hhmm));
      // slot falls in [from+30min, from+30min+hours): rendered 30-90 min ahead
      if (t >= from + 30 * 60_000 && t < from + (30 + hours * 60) * 60_000) due.push({ channel, date, slot });
    });
  }
}
process.stdout.write(JSON.stringify({ include: due }));
