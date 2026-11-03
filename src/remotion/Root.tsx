import React from "react";
import { Composition } from "remotion";
import { PhaseOneTestComposition } from "./compositions/PhaseOneTest";
import { Ep01Composition } from "./compositions/Ep01";
import { EP01_TOTAL_FRAMES } from "./compositions/ep01Timing";

// Video spec: 1080×1920, 30fps, 9:16 vertical
export const RootComponent: React.FC = () => {
  return (
    <>
      <Composition
        id="PhaseOneTest"
        component={PhaseOneTestComposition}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="Ep01"
        component={Ep01Composition}
        durationInFrames={EP01_TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};
