import React from "react";
import { Composition, Folder } from "remotion";
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
import { STORY_DIORAMA_DEMO, StoryDioramaSchema, storyDioramaDuration, type StoryDiorama } from "../../../../engines/story-diorama/src/model";
import { StoryDioramaComposition } from "../../../../engines/story-diorama/src/StoryDioramaComposition";

const orbitPuzzle = OrbitPuzzleSchema.parse(ORBIT_PUZZLE_DEMO);
const trafficErrors = [...validateBoard(TRAFFIC_PUZZLE_DEMO), ...validateSolution(TRAFFIC_PUZZLE_DEMO)];
if (trafficErrors.length) throw new Error("Traffic puzzle demo is invalid: " + trafficErrors.join("; "));
const sanatanEpisode = SanatanEpisodeSchema.parse(SANATAN_EPISODE_DEMO);

const video = { fps: MASTER_VIDEO.fps, width: MASTER_VIDEO.width, height: MASTER_VIDEO.height };

export const Root: React.FC = () => (
  <>
    <Folder name="OddOrbit">
      <Composition id="OddOrbit" component={OddOrbitComposition} schema={OddOrbitSchema} {...video} durationInFrames={oddOrbitDuration(ODD_ORBIT_DEMO)} defaultProps={ODD_ORBIT_DEMO}
        calculateMetadata={({ props }: { props: OddOrbit }) => ({ durationInFrames: oddOrbitDuration(props) })} />
      {Object.entries(ODD_ORBIT_VARIANTS).map(([name, patch]) => {
        const props = { ...ODD_ORBIT_DEMO, ...patch };
        return <Composition key={name} id={`OddOrbit-${name}`} component={OddOrbitComposition} schema={OddOrbitSchema} {...video} durationInFrames={oddOrbitDuration(props)} defaultProps={props} />;
      })}
    </Folder>
    <Folder name="TrackVehicle">
      <Composition id="TrackVehicle" component={TrackVehicleComposition} schema={TrackVehicleSchema} {...video} durationInFrames={trackVehicleDuration(TRACK_VEHICLE_DEMO)} defaultProps={TRACK_VEHICLE_DEMO}
        calculateMetadata={({ props }: { props: TrackVehicle }) => ({ durationInFrames: trackVehicleDuration(props) })} />
      {Object.entries(TRACK_VEHICLE_VARIANTS).map(([name, patch]) => {
        const props = { ...TRACK_VEHICLE_DEMO, ...patch };
        return <Composition key={name} id={`TrackVehicle-${name}`} component={TrackVehicleComposition} schema={TrackVehicleSchema} {...video} durationInFrames={trackVehicleDuration(props)} defaultProps={props} />;
      })}
    </Folder>
    <Folder name="StoryDiorama">
      <Composition id="StoryDiorama" component={StoryDioramaComposition} schema={StoryDioramaSchema} {...video} durationInFrames={storyDioramaDuration(STORY_DIORAMA_DEMO)} defaultProps={STORY_DIORAMA_DEMO}
        calculateMetadata={({ props }: { props: StoryDiorama }) => ({ durationInFrames: storyDioramaDuration(props) })} />
    </Folder>
    <Folder name="Legacy">
      <Composition id="OrbitPuzzle" component={OrbitPuzzleComposition} durationInFrames={900} {...video} defaultProps={orbitPuzzle} />
      <Composition id="TrafficPuzzle" component={TrafficPuzzleComposition} durationInFrames={1050} {...video} defaultProps={TRAFFIC_PUZZLE_DEMO} />
      <Composition id="SanatanStory" component={SanatanStoryComposition} durationInFrames={sanatanEpisode.scenes.reduce((sum, scene) => sum + scene.durationFrames, 0)} {...video} defaultProps={sanatanEpisode} />
    </Folder>
  </>
);
