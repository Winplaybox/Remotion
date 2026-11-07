import React from "react";
import { Composition, Folder, Still } from "remotion";
import { BrandArt } from "./BrandArt";
import { MASTER_VIDEO } from "@core/contracts";
import { ORBIT_PUZZLE_DEMO, OrbitPuzzleSchema } from "../../../../engines/orbit-puzzle/src/model";
import { OrbitPuzzleComposition } from "../../../../engines/orbit-puzzle/src/OrbitPuzzleComposition";
import { TRAFFIC_PUZZLE_DEMO, validateBoard, validateSolution } from "../../../../engines/traffic-puzzle/src/model";
import { TrafficPuzzleComposition } from "../../../../engines/traffic-puzzle/src/TrafficPuzzleComposition";
import { SANATAN_EPISODE_DEMO, SanatanEpisodeSchema } from "../../../../engines/sanatan-story/src/model";
import { SanatanStoryComposition } from "../../../../engines/sanatan-story/src/SanatanStoryComposition";
import { ODD_ORBIT_DEMO, ODD_ORBIT_VARIANTS, OddOrbitSchema, oddOrbitDuration, type OddOrbit } from "../../../../engines/odd-orbit/src/model";
import { OddOrbitComposition } from "../../../../engines/odd-orbit/src/OddOrbitComposition";
import { TRACK_VEHICLE_DEMO, TRACK_VEHICLE_VARIANTS, TrackVehicleSchema, trackVehicleDuration, type TrackVehicle } from "../../../../engines/track-vehicle/src/model";
import { TrackVehicleComposition } from "../../../../engines/track-vehicle/src/TrackVehicleComposition";
import { StoryDioramaSchema, storyDioramaDuration, type StoryDiorama } from "../../../../engines/story-diorama/src/model";
import { epicBharatSagaForDay } from "../../../../content/epicbharatsaga/vishnu-season";
import { withNarrationDurations } from "../../../../engines/story-diorama/src/metadata";
import { StoryDioramaComposition } from "../../../../engines/story-diorama/src/StoryDioramaComposition";
import { TemplateSchema, templateDuration, templateForDay, type Template } from "../../../../engines/_template/src/model";
import { TemplateComposition } from "../../../../engines/_template/src/TemplateComposition";
// @engine-builder:imports

const orbitPuzzle = OrbitPuzzleSchema.parse(ORBIT_PUZZLE_DEMO);
const trafficErrors = [...validateBoard(TRAFFIC_PUZZLE_DEMO), ...validateSolution(TRAFFIC_PUZZLE_DEMO)];
if (trafficErrors.length) throw new Error("Traffic puzzle demo is invalid: " + trafficErrors.join("; "));
const sanatanEpisode = SanatanEpisodeSchema.parse(SANATAN_EPISODE_DEMO);

const STORY_DEMO = epicBharatSagaForDay(1);
const video = { fps: MASTER_VIDEO.fps, width: MASTER_VIDEO.width, height: MASTER_VIDEO.height };

const TEMPLATE_DEMO = templateForDay(1);

export const Root: React.FC = () => (
  <>
    {/* @engine-builder:compositions */}
    <Folder name="Templates">
      <Composition id="EngineTemplate" component={TemplateComposition} schema={TemplateSchema} {...video} durationInFrames={templateDuration(TEMPLATE_DEMO)} defaultProps={TEMPLATE_DEMO}
        calculateMetadata={({ props }: { props: Template }) => ({ durationInFrames: templateDuration(props) })} />
    </Folder>
    <Folder name="ChakraPuzzle">
      <Composition id="ChakraPuzzle" component={OddOrbitComposition} schema={OddOrbitSchema} {...video} durationInFrames={oddOrbitDuration(ODD_ORBIT_DEMO)} defaultProps={ODD_ORBIT_DEMO}
        calculateMetadata={({ props }: { props: OddOrbit }) => ({ durationInFrames: oddOrbitDuration(props) })} />
      {Object.entries(ODD_ORBIT_VARIANTS).map(([name, patch]) => {
        const props = { ...ODD_ORBIT_DEMO, ...patch };
        return <Composition key={name} id={`ChakraPuzzle-${name}`} component={OddOrbitComposition} schema={OddOrbitSchema} {...video} durationInFrames={oddOrbitDuration(props)} defaultProps={props} />;
      })}
    </Folder>
    <Folder name="KaaliPeeliChase">
      <Composition id="KaaliPeeliChase" component={TrackVehicleComposition} schema={TrackVehicleSchema} {...video} durationInFrames={trackVehicleDuration(TRACK_VEHICLE_DEMO)} defaultProps={TRACK_VEHICLE_DEMO}
        calculateMetadata={({ props }: { props: TrackVehicle }) => ({ durationInFrames: trackVehicleDuration(props) })} />
      {Object.entries(TRACK_VEHICLE_VARIANTS).map(([name, patch]) => {
        const props = { ...TRACK_VEHICLE_DEMO, ...patch };
        return <Composition key={name} id={`KaaliPeeliChase-${name}`} component={TrackVehicleComposition} schema={TrackVehicleSchema} {...video} durationInFrames={trackVehicleDuration(props)} defaultProps={props} />;
      })}
    </Folder>
    <Folder name="EpicBharatSaga">
      <Composition id="EpicBharatSaga" component={StoryDioramaComposition} schema={StoryDioramaSchema} {...video} durationInFrames={storyDioramaDuration(STORY_DEMO)} defaultProps={STORY_DEMO}
        calculateMetadata={async ({ props }: { props: StoryDiorama }) => {
          const timed = await withNarrationDurations(props);
          return { durationInFrames: storyDioramaDuration(timed), props: timed };
        }} />
    </Folder>
    <Folder name="BrandArt">
      <Still id="ChakraPuzzle-Avatar" component={BrandArt} width={800} height={800} defaultProps={{ channel: "chakra" as const, kind: "avatar" as const }} />
      <Still id="ChakraPuzzle-Banner" component={BrandArt} width={2560} height={1440} defaultProps={{ channel: "chakra" as const, kind: "banner" as const }} />
      <Still id="KaaliPeeliChase-Avatar" component={BrandArt} width={800} height={800} defaultProps={{ channel: "kpc" as const, kind: "avatar" as const }} />
      <Still id="KaaliPeeliChase-Banner" component={BrandArt} width={2560} height={1440} defaultProps={{ channel: "kpc" as const, kind: "banner" as const }} />
      <Still id="EpicBharatSaga-Avatar" component={BrandArt} width={800} height={800} defaultProps={{ channel: "ebs" as const, kind: "avatar" as const }} />
      <Still id="EpicBharatSaga-Banner" component={BrandArt} width={2560} height={1440} defaultProps={{ channel: "ebs" as const, kind: "banner" as const }} />
    </Folder>
    <Folder name="Legacy">
      <Composition id="OrbitPuzzle" component={OrbitPuzzleComposition} durationInFrames={900} {...video} defaultProps={orbitPuzzle} />
      <Composition id="TrafficPuzzle" component={TrafficPuzzleComposition} durationInFrames={1050} {...video} defaultProps={TRAFFIC_PUZZLE_DEMO} />
      <Composition id="SanatanStory" component={SanatanStoryComposition} durationInFrames={sanatanEpisode.scenes.reduce((sum, scene) => sum + scene.durationFrames, 0)} {...video} defaultProps={sanatanEpisode} />
    </Folder>
  </>
);
