import React from "react";
import { Composition } from "remotion";
import { Vishnu3D } from "./Vishnu3D";
import { JasoosSample } from "./JasoosSample";
import { HorrorSample } from "./HorrorSample";
import { MindNest3D, MINDNEST3D_FRAMES } from "./MindNest3D";
import { StoryVisualV2, STORY_V2_FRAMES } from "../engines/story-visual-v2/src";

const v = { width: 1080, height: 1920, fps: 30 };
export const SamplesRoot: React.FC = () => (
  <>
    <Composition id="Vishnu3D" component={Vishnu3D} durationInFrames={120} {...v} />
    <Composition id="JasoosSample" component={JasoosSample} durationInFrames={120} {...v} defaultProps={{ style: "comic-art" }} />
    <Composition id="HorrorSample" component={HorrorSample} durationInFrames={150} {...v} defaultProps={{ style: "night-vision", src: "samples/bhangarh-cc0.jpg" }} />
    <Composition id="MindNest3D" component={MindNest3D} durationInFrames={MINDNEST3D_FRAMES} {...v} defaultProps={{ lang: "hi" as const, fable: 1, look: "toy3d" as const }} />
    <Composition id="StoryVisualV2" component={StoryVisualV2} durationInFrames={STORY_V2_FRAMES} {...v} defaultProps={{ lang: "hi" as const, fable: 1, style: "premium-2.5d" as const, page: 3 }} />
  </>
);
