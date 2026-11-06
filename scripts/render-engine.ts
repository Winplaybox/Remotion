import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { resolveEngine } from "../packages/core/src/engine-registry";
const requested = process.argv[2];
if (!requested) { process.stderr.write("Usage: npm run render:engine -- <orbit-puzzle|traffic-puzzle|sanatan-story>\n"); process.exit(2); }
const engine = resolveEngine(requested);
const output = resolve(engine.outputFile);
mkdirSync(dirname(output), { recursive: true });
execFileSync("npx", ["remotion", "render", "apps/studio/src/remotion/index.ts", engine.compositionId, output, "--codec=h264", "--pixel-format=yuv420p"], { stdio: "inherit" });
