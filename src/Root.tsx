import React from "react";
import { Composition } from "remotion";
import { UniversalSceneVideo } from "./Composition";
import ep01SceneRaw from "../episodes/ep01-ai-advancing-faster/scene.json";
import { UniversalTeardownScene } from "../schemas/universalTeardown.schema";

const ep01Scene = ep01SceneRaw as unknown as UniversalTeardownScene;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1. Primary Showcase: Episode 01 in Data Physicalization Style */}
      <Composition
        id="Episode01-DataPhysicalization"
        component={UniversalSceneVideo}
        durationInFrames={ep01Scene.dimensions.totalDurationInFrames}
        fps={ep01Scene.dimensions.fps}
        width={ep01Scene.dimensions.width}
        height={ep01Scene.dimensions.height}
        defaultProps={{
          scene: ep01Scene,
        }}
      />

      {/* 2. Alternate Style Variant: Episode 01 in Exploded Teardown Style */}
      <Composition
        id="Episode01-ExplodedTeardown"
        component={UniversalSceneVideo}
        durationInFrames={ep01Scene.dimensions.totalDurationInFrames}
        fps={ep01Scene.dimensions.fps}
        width={ep01Scene.dimensions.width}
        height={ep01Scene.dimensions.height}
        defaultProps={{
          scene: {
            ...ep01Scene,
            style: "exploded-teardown",
          },
        }}
      />
    </>
  );
};
