import type { EngineId } from "./contracts";
export interface EngineDefinition { id: EngineId; compositionId: "OrbitPuzzle" | "TrafficPuzzle" | "SanatanStory"; label: string; outputFile: string; durationFrames: number; }
export const ENGINE_REGISTRY: Record<EngineId, EngineDefinition> = {
  "orbit-puzzle": { id: "orbit-puzzle", compositionId: "OrbitPuzzle", label: "Orbit Puzzle", outputFile: "output/orbit-puzzle.mp4", durationFrames: 900 },
  "traffic-puzzle": { id: "traffic-puzzle", compositionId: "TrafficPuzzle", label: "Traffic Puzzle", outputFile: "output/traffic-puzzle.mp4", durationFrames: 1050 },
  "sanatan-story": { id: "sanatan-story", compositionId: "SanatanStory", label: "Sanatan Story", outputFile: "output/sanatan-story.mp4", durationFrames: 1800 }
};
export function resolveEngine(value: string): EngineDefinition {
  const engine = ENGINE_REGISTRY[value as EngineId];
  if (!engine) throw new Error(`Unknown engine "${value}". Choose: ${Object.keys(ENGINE_REGISTRY).join(", ")}`);
  return engine;
}
