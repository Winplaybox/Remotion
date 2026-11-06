import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { resolveEngine } from "../packages/core/src/engine-registry";
const requested = process.argv[2];
if (!requested) { process.stderr.write("Usage: npm run manifest:render -- <orbit-puzzle|traffic-puzzle|sanatan-story>\n"); process.exit(2); }
const engine = resolveEngine(requested);
const file = resolve(engine.outputFile);
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], { encoding: "utf8" })) as { streams?: Array<{ codec_type?: string; codec_name?: string; width?: number; height?: number; pix_fmt?: string; r_frame_rate?: string }>; format?: { duration?: string } };
const video = probe.streams?.find((stream) => stream.codec_type === "video");
const audio = probe.streams?.find((stream) => stream.codec_type === "audio");
const stats = statSync(file);
const manifest = { schemaVersion: 1, engine: engine.id, composition: engine.compositionId, file: engine.outputFile, createdAt: new Date().toISOString(), sourceRevision: process.env.GITHUB_SHA ?? "local", durationFrames: engine.durationFrames, durationSeconds: Number(probe.format?.duration ?? 0), bytes: stats.size, sha256: createHash("sha256").update(readFileSync(file)).digest("hex"), video: video ?? null, audio: audio ? { codec: audio.codec_name } : null, publishing: { enabled: false, status: "not_configured" } };
const destination = resolve("output", "manifests", `${engine.id}.json`);
mkdirSync(dirname(destination), { recursive: true });
writeFileSync(destination, JSON.stringify(manifest, null, 2) + "\n");
process.stdout.write(`Manifest written: ${destination}\n`);
