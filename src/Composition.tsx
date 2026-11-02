import React from "react";
import {
  Composition,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { UniversalTeardownScene } from "../schemas/universalTeardown.schema";
import { DataPhysicalization } from "./components/DataPhysicalization";
import { ExplodedLayerStack } from "./components/ExplodedLayerStack";
import { SpatialTypography } from "./components/SpatialTypography";
import { KineticCaptions } from "./components/KineticCaptions";
import { ResearchCitationBadge } from "./components/ResearchCitationBadge";
import ep01SceneRaw from "../episodes/ep01-ai-advancing-faster/scene.json";

const ep01Scene = ep01SceneRaw as unknown as UniversalTeardownScene;

export interface UniversalSceneProps {
  scene?: UniversalTeardownScene;
}

export const UniversalSceneVideo: React.FC<UniversalSceneProps> = ({
  scene = ep01Scene,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle continuous cinematic camera push-in
  const cameraZoom = interpolate(frame, [0, scene.dimensions.totalDurationInFrames], [1, 1.045], {
    extrapolateRight: "clamp",
  });
  const cameraPanY = interpolate(frame, [0, scene.dimensions.totalDurationInFrames], [0, -12], {
    extrapolateRight: "clamp",
  });

  // Calculate SMPTE running timecode: HH:MM:SS:FF
  const totalSeconds = Math.floor(frame / fps);
  const frames = frame % fps;
  const secs = totalSeconds % 60;
  const mins = Math.floor(totalSeconds / 60);
  const smpteDisplay = `00:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        overflow: "hidden",
        backgroundColor: scene.palette.background,
        backgroundImage: `radial-gradient(circle at 50% 38%, rgba(0, 245, 255, 0.08) 0%, ${scene.palette.background} 80%)`,
        transform: `scale(${cameraZoom}) translateY(${cameraPanY}px)`,
        transformOrigin: "center center",
      }}
    >
      {/* 1. CAD Coordinate Grid Background Layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${scene.palette.cadGridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${scene.palette.cadGridColor} 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* 2. Top Header: Verified Research Citation Badge (FACTS.md) */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 50,
        }}
      >
        <ResearchCitationBadge
          source={scene.citation.source}
          claimRef={`${scene.citation.chapter} • p. ${scene.citation.page}`}
          isVerified={true}
        />
      </div>

      {/* 3. Episode Title & Hook Typography */}
      <div
        style={{
          position: "absolute",
          top: 190,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 40,
        }}
      >
        <SpatialTypography
          title={scene.title}
          subtitle={`${scene.channel} • ${scene.episodeId}`}
          accentWord="FASTER"
          delay={0}
        />
      </div>

      {/* 4. Core Motion Graphics Stage (Driven by Style) */}
      <div
        style={{
          position: "absolute",
          top: 480,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 30,
        }}
      >
        {scene.style === "data-physicalization" && (
          <DataPhysicalization
            plates={scene.plates}
            dials={scene.dials}
            accentColor={scene.palette.primaryAccent}
            delay={10}
          />
        )}

        {scene.style === "exploded-teardown" && (
          <ExplodedLayerStack
            layers={scene.layers}
            accentColor={scene.palette.primaryAccent}
            delay={10}
          />
        )}
      </div>

      {/* 5. Bottom SMPTE Telemetry & Status Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 60,
          right: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          paddingTop: "14px",
          zIndex: 50,
        }}
      >
        <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "#94A3B8" }}>
          SMPTE <span style={{ color: scene.palette.primaryAccent }}>{smpteDisplay}</span> • CAD #07090E
        </div>
        <div style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: scene.palette.secondaryAccent }}>
          STYLE: {scene.style.toUpperCase()} • 9:16 VERTICAL
        </div>
      </div>

      {/* 6. Kinetic Subtitle Sequences mapped to SMPTE Beats */}
      {scene.beats.map((beat) => (
        <Sequence
          key={beat.beatIndex}
          from={beat.startFrame}
          durationInFrames={beat.durationInFrames}
          name={`Beat-${beat.beatIndex}`}
        >
          <div
            style={{
              position: "absolute",
              bottom: 150,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 40,
            }}
          >
            <KineticCaptions text={beat.narrationCue} />
          </div>
        </Sequence>
      ))}
    </div>
  );
};

export const MainComposition: React.FC = () => {
  return (
    <Composition
      id="Episode01-DataPhysicalization"
      component={UniversalSceneVideo}
      durationInFrames={ep01Scene.dimensions.totalDurationInFrames}
      fps={ep01Scene.dimensions.fps}
      width={ep01Scene.dimensions.width}
      height={ep01Scene.dimensions.height}
    />
  );
};
