import React from "react";
import { Composition } from "remotion";
import { ShortsMainVideo } from "./Composition";
import { VIDEO_STYLES } from "./styles/catalog";
import { VideoStyleId } from "./styles/types";
import { UseCaseId } from "./use-cases/types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1. Default Main Composition: NVIDIA Blackwell B200 Blueprint Teardown */}
      <Composition
        id="ShortsMainComposition"
        component={ShortsMainVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          useCaseId: "blackwell-b200" as UseCaseId,
          styleId: "blueprint-teardown" as VideoStyleId,
        }}
      />

      {/* 2. New Research Use Case 1: NVIDIA Blackwell B200 208B Transistors */}
      <Composition
        id="Blackwell-Teardown"
        component={ShortsMainVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          useCaseId: "blackwell-b200" as UseCaseId,
          styleId: "blueprint-teardown" as VideoStyleId,
        }}
      />

      {/* 3. New Research Use Case 2: Satellite Reconnaissance (100k GPU Clusters) */}
      <Composition
        id="Satellite-Datacenter"
        component={ShortsMainVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          useCaseId: "satellite-datacenter" as UseCaseId,
          styleId: "satellite-briefing" as VideoStyleId,
        }}
      />

      {/* 4. New Research Use Case 3: Living Screencast (Autonomous Claude Code) */}
      <Composition
        id="ClaudeCode-Screencast"
        component={ShortsMainVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          useCaseId: "claude-code-agent" as UseCaseId,
          styleId: "living-screencast" as VideoStyleId,
        }}
      />

      {/* 5. New Research Use Case 4: The 1956 Dartmouth AI Conference Dossier */}
      <Composition
        id="Dartmouth-Archive"
        component={ShortsMainVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          useCaseId: "dartmouth-dossier" as UseCaseId,
          styleId: "archive-lighttable" as VideoStyleId,
        }}
      />

      {/* 6. New Research Use Case 5: DeepSeek-R1 $6M Reasoning Miracle */}
      <Composition
        id="DeepSeek-SciFiHUD"
        component={ShortsMainVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          useCaseId: "deepseek-r1" as UseCaseId,
          styleId: "scifi-hud" as VideoStyleId,
        }}
      />

      {/* 7. New Research Use Case 6: Google Willow Quantum Error Correction */}
      <Composition
        id="Willow-BlueprintTeardown"
        component={ShortsMainVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          useCaseId: "google-willow" as UseCaseId,
          styleId: "blueprint-teardown" as VideoStyleId,
        }}
      />

      {/* 8. Full Multi-Style Registration across all Opuscar Styles */}
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
            useCaseId: "blackwell-b200" as UseCaseId,
            styleId: style.id,
          }}
        />
      ))}
    </>
  );
};
