import React from "react";
import { Composition } from "remotion";
import { ShortsMainVideo } from "./Composition";
import { VIDEO_STYLES } from "./styles/catalog";
import { VideoStyleId } from "./styles/types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1. Default Main Showcase Composition: DeepSeek-R1 in SciFi-HUD */}
      <Composition
        id="ShortsMainComposition"
        component={ShortsMainVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          useCaseId: "deepseek-r1",
          styleId: "scifi-hud" as VideoStyleId,
          showAvatar: true,
        }}
      />

      {/* 2. Flagship Research Use Case 1: DeepSeek-R1 Reasoning Miracle */}
      <Composition
        id="DeepSeek-SciFiHUD"
        component={ShortsMainVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          useCaseId: "deepseek-r1",
          styleId: "scifi-hud" as VideoStyleId,
          showAvatar: true,
        }}
      />

      <Composition
        id="DeepSeek-DarkKeynote"
        component={ShortsMainVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          useCaseId: "deepseek-r1",
          styleId: "dark-keynote" as VideoStyleId,
          showAvatar: true,
        }}
      />

      {/* 3. Flagship Research Use Case 2: Google Willow Quantum Chip */}
      <Composition
        id="Willow-BlueprintTeardown"
        component={ShortsMainVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          useCaseId: "google-willow",
          styleId: "exploded-teardown" as VideoStyleId,
          showAvatar: true,
        }}
      />

      <Composition
        id="Willow-DataStorytelling"
        component={ShortsMainVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          useCaseId: "google-willow",
          styleId: "data-storytelling" as VideoStyleId,
          showAvatar: true,
        }}
      />

      {/* 4. Flagship Research Use Case 3: Attention Is All You Need */}
      <Composition
        id="Transformer-DarkKeynote"
        component={ShortsMainVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          useCaseId: "transformer-attention",
          styleId: "dark-keynote" as VideoStyleId,
          showAvatar: true,
        }}
      />

      <Composition
        id="Transformer-SwissMotion"
        component={ShortsMainVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          useCaseId: "transformer-attention",
          styleId: "swiss-motion" as VideoStyleId,
          showAvatar: false,
        }}
      />

      {/* 5. Style Showcase Grid across all Opuscar Styles */}
      {Object.values(VIDEO_STYLES).map((style) => (
        <Composition
          key={style.id}
          id={`Style-${style.id}`}
          component={ShortsMainVideo}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            useCaseId: "deepseek-r1",
            styleId: style.id,
            showAvatar: true,
          }}
        />
      ))}
    </>
  );
};
