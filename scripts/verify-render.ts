import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

interface ProbeStream { codec_type?: string; codec_name?: string; width?: number; height?: number; pix_fmt?: string; r_frame_rate?: string; }
interface ProbeOutput { streams?: ProbeStream[]; format?: { duration?: string }; }

const input = process.argv[2];
if (!input) {
  process.stderr.write("Usage: npm run quality:render -- <video-file>\n");
  process.exit(2);
}
const file = resolve(input);
if (!existsSync(file)) {
  process.stderr.write(`Render not found: ${file}\n`);
  process.exit(2);
}
const output = execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], { encoding: "utf8" });
const probe = JSON.parse(output) as ProbeOutput;
const video = probe.streams?.find((stream) => stream.codec_type === "video");
const audio = probe.streams?.find((stream) => stream.codec_type === "audio");
const failures: string[] = [];
if (!video) failures.push("Missing video stream");
if (video?.width !== 1080 || video.height !== 1920) failures.push(`Expected 1080x1920, got ${video?.width}x${video?.height}`);
if (video?.codec_name !== "h264") failures.push(`Expected h264 video, got ${video?.codec_name ?? "unknown"}`);
if (video?.pix_fmt !== "yuv420p") failures.push(`Expected yuv420p, got ${video?.pix_fmt ?? "unknown"}`);
if (video?.r_frame_rate !== "30/1") failures.push(`Expected 30fps, got ${video?.r_frame_rate ?? "unknown"}`);
if (audio && audio.codec_name !== "aac") failures.push(`Expected AAC audio, got ${audio.codec_name ?? "unknown"}`);
if (!audio) process.stdout.write("WARN: no audio stream detected; confirm this is intentional for this engine.\n");
if (failures.length) {
  process.stderr.write(failures.map((failure) => `FAIL: ${failure}`).join("\n") + "\n");
  process.exit(1);
}
process.stdout.write(`PASS: ${file} | 1080x1920 | 30fps | H.264 | yuv420p | duration ${probe.format?.duration ?? "unknown"}s\n`);
