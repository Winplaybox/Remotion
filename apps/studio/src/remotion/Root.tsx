import React from "react";
import { Composition } from "remotion";
import { MASTER_VIDEO } from "@core/contracts";
import { ORBIT_PUZZLE_DEMO } from "../../../../engines/orbit-puzzle/src/model";
import { OrbitPuzzleComposition } from "../../../../engines/orbit-puzzle/src/OrbitPuzzleComposition";
import { TRAFFIC_PUZZLE_DEMO, validateBoard, validateSolution } from "../../../../engines/traffic-puzzle/src/model";
const trafficErrors = [...validateBoard(TRAFFIC_PUZZLE_DEMO), ...validateSolution(TRAFFIC_PUZZLE_DEMO)];
if (trafficErrors.length) throw new Error("Traffic puzzle demo is invalid: " + trafficErrors.join("; "));
import { TrafficPuzzleComposition } from "../../../../engines/traffic-puzzle/src/TrafficPuzzleComposition";
import { SANATAN_EPISODE_DEMO } from "../../../../engines/sanatan-story/src/model";
import { SanatanStoryComposition } from "../../../../engines/sanatan-story/src/SanatanStoryComposition";
export const Root: React.FC = () => (
  <>
    <Composition id="OrbitPuzzle" component={OrbitPuzzleComposition} durationInFrames={900} fps={MASTER_VIDEO.fps} width={MASTER_VIDEO.width} height={MASTER_VIDEO.height} defaultProps={ORBIT_PUZZLE_DEMO} />
    <Composition id="TrafficPuzzle" component={TrafficPuzzleComposition} durationInFrames={1050} fps={MASTER_VIDEO.fps} width={MASTER_VIDEO.width} height={MASTER_VIDEO.height} defaultProps={TRAFFIC_PUZZLE_DEMO} />
    <Composition id="SanatanStory" component={SanatanStoryComposition} durationInFrames={SANATAN_EPISODE_DEMO.scenes.reduce((sum, scene) => sum + scene.durationFrames, 0)} fps={MASTER_VIDEO.fps} width={MASTER_VIDEO.width} height={MASTER_VIDEO.height} defaultProps={SANATAN_EPISODE_DEMO} />
  </>
);
