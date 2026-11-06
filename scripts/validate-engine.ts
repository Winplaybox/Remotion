import { ORBIT_PUZZLE_DEMO, OrbitPuzzleSchema } from "../engines/orbit-puzzle/src/model";
import { TRAFFIC_PUZZLE_DEMO, validateBoard, validateSolution } from "../engines/traffic-puzzle/src/model";
import { SANATAN_EPISODE_DEMO, SanatanEpisodeSchema } from "../engines/sanatan-story/src/model";
import { resolveEngine } from "../packages/core/src/engine-registry";
const requested = process.argv[2];
if (!requested) { process.stderr.write("Usage: npm run validate:engine -- <orbit-puzzle|traffic-puzzle|sanatan-story>\n"); process.exit(2); }
const engine = resolveEngine(requested);
const failures: string[] = [];
switch (engine.id) {
  case "orbit-puzzle": {
    const result = OrbitPuzzleSchema.safeParse(ORBIT_PUZZLE_DEMO);
    if (!result.success) failures.push(...result.error.issues.map((issue) => issue.message));
    break;
  }
  case "traffic-puzzle": failures.push(...validateBoard(TRAFFIC_PUZZLE_DEMO), ...validateSolution(TRAFFIC_PUZZLE_DEMO)); break;
  case "sanatan-story": {
    const result = SanatanEpisodeSchema.safeParse(SANATAN_EPISODE_DEMO);
    if (!result.success) failures.push(...result.error.issues.map((issue) => issue.message));
    const total = SANATAN_EPISODE_DEMO.scenes.reduce((sum, scene) => sum + scene.durationFrames, 0);
    for (const cue of SANATAN_EPISODE_DEMO.audioCues) if (cue.from + cue.durationFrames > total) failures.push(`Audio cue "${cue.id}" extends beyond the episode duration`);
    break;
  }
}
if (failures.length) { process.stderr.write(failures.map((failure) => `FAIL: ${failure}`).join("\n") + "\n"); process.exit(1); }
process.stdout.write(`PASS: ${engine.label} content validation\n`);
