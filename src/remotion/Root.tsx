import React from "react";
import { Composition } from "remotion";
import { PhaseOneTestComposition } from "./compositions/PhaseOneTest";
import { Ep01Composition } from "./compositions/Ep01";
import { EP01_TOTAL_FRAMES } from "./compositions/ep01Timing";
import { OrbitPuzzleEngine } from "./engines/orbit-puzzle/OrbitPuzzleEngine";
import { TrafficPuzzleEngine } from "./engines/traffic-puzzle/TrafficPuzzleEngine";
import { SanatanStoryEngine } from "./engines/sanatan-story/SanatanStoryEngine";

// Master delivery format: 1080 × 1920, 30fps, 9:16 portrait.
export const RootComponent: React.FC = () => (
  <>
    <Composition id="PhaseOneTest" component={PhaseOneTestComposition} durationInFrames={90} fps={30} width={1080} height={1920} defaultProps={{}} />
    <Composition id="Ep01" component={Ep01Composition} durationInFrames={EP01_TOTAL_FRAMES} fps={30} width={1080} height={1920} defaultProps={{}} />
    <Composition id="OrbitPuzzle" component={OrbitPuzzleEngine} durationInFrames={900} fps={30} width={1080} height={1920} defaultProps={{}} />
    <Composition id="TrafficPuzzle" component={TrafficPuzzleEngine} durationInFrames={1050} fps={30} width={1080} height={1920} defaultProps={{}} />
    <Composition id="SanatanStory" component={SanatanStoryEngine} durationInFrames={1800} fps={30} width={1080} height={1920} defaultProps={{}} />
  </>
);
