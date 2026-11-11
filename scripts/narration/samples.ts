/**
 * Voice samples: the same real lines of every channel through Kokoro, Gemini and Edge, one WAV per channel+engine.
 * Run by .github/workflows/voice-samples.yml (needs the engines installed); listen and adjust channels/voices.ts.
 *
 *   npx ts-node scripts/narration/samples.ts [--lines 3] [--out out/voice-samples]
 */
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { CHANNELS, dateOfPost, postNumber, type ChannelId } from "../../channels/channels";
import { VOICES, VOICE_SWITCH_DATE, type TtsEngine } from "../../channels/voices";

const args = process.argv.slice(2);
const opt = (k: string, d: string) => (args.includes(k) ? args[args.indexOf(k) + 1]! : d);
const LINES = Number(opt("--lines", "3"));
const OUT = opt("--out", "out/voice-samples");
const py = process.env.PYTHON || "python3";

function sampleLines(ch: ChannelId): string[] {
  const cfg = CHANNELS[ch] as { voice?: (n: number) => { text: string }[]; narrated: boolean; resolve: (n: number) => unknown; slots: readonly string[] };
  let n = 1;
  try { n = postNumber(ch, VOICE_SWITCH_DATE, 0); } catch { try { dateOfPost(ch, 1); } catch { /* keep 1 */ } }
  if (cfg.voice) return cfg.voice(n).map((l) => l.text).slice(0, LINES);
  if (cfg.narrated) return ((cfg.resolve(n) as { scenes?: { narration: string }[] }).scenes ?? []).map((s) => s.narration).slice(0, LINES);
  return [];
}

const GAP = path.resolve("output", "gap.wav");
fs.mkdirSync("output", { recursive: true });
execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", "0.6", GAP]);
const report: string[] = [];
for (const [ch, v] of Object.entries(VOICES) as [ChannelId, NonNullable<(typeof VOICES)[ChannelId]>][]) {
  const lines = sampleLines(ch).filter(Boolean);
  if (!lines.length) continue;
  for (const eng of ["kokoro", "gemini", "edge"] as TtsEngine[]) {
    const fake = `sample-${ch}-${eng}`;
    fs.mkdirSync(path.join("output", fake), { recursive: true });
    fs.writeFileSync(path.join("output", fake, "post-001.narration.json"), JSON.stringify(lines.map((text, i) => ({ file: `l${i + 1}.wav`, text }))));
    const t0 = Date.now();
    try {
      execFileSync(py, ["scripts/narration/narrate.py", "--channel", fake, "--n", "1", "--engine", eng,
        "--kokoro-voice", v.kokoro, "--kokoro-speed", String(v.kokoroSpeed), "--gemini-voice", v.gemini, "--gemini-style", v.geminiStyle,
        "--edge-voice", v.edge, "--edge-rate", v.edgeRate], { stdio: "inherit" });
      const dir = path.join("public", "audio", fake, "post-001");
      const list = path.join(dir, "list.txt");
      fs.writeFileSync(list, lines.map((_, i) => `file 'l${i + 1}.wav'\nfile '${GAP}'`).join("\n"));
      fs.mkdirSync(path.join(OUT, ch), { recursive: true });
      const voice = eng === "kokoro" ? v.kokoro : eng === "gemini" ? v.gemini : v.edge;
      const dest = path.join(OUT, ch, `${eng}-${voice}.wav`);
      execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-ar", "48000", "-ac", "1", dest]);
      report.push(`✓ ${ch.padEnd(18)} ${eng.padEnd(7)} ${voice.padEnd(20)} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    } catch (e) {
      report.push(`✗ ${ch.padEnd(18)} ${eng.padEnd(7)} ${(e as Error).message.split("\n")[0]}`);
    }
  }
  fs.writeFileSync(path.join(OUT, ch, "lines.txt"), lines.join("\n"));
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "README.txt"), report.join("\n") + "\n");
console.log(report.join("\n"));
