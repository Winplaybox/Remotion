import React from "react";
import {
  Composition,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { ParallaxLayers } from "./components/ParallaxLayers";
import { SpatialTypography } from "./components/SpatialTypography";
import { FloatingCard } from "./components/FloatingCard";
import { ThreeHeroScene } from "./components/ThreeHeroScene";
import { KineticCaptions } from "./components/KineticCaptions";
import { AudioWaveform } from "./components/AudioWaveform";
import { ResearchCitationBadge } from "./components/ResearchCitationBadge";
import { LemoWake } from "./components/LemoWake";
import { LemoWakeAvatar } from "./components/LemoWakeAvatar";
import { VIDEO_STYLES } from "./styles/catalog";
import { VideoStyleId } from "./styles/types";
import { getUseCase } from "./use-cases";

export interface ShortsMainVideoProps {
  useCaseId?: "deepseek-r1" | "google-willow" | "transformer-attention";
  styleId?: VideoStyleId;
  showAvatar?: boolean;
}

export const ShortsMainVideo: React.FC<ShortsMainVideoProps> = ({
  useCaseId = "transformer-attention",
  styleId,
  showAvatar = true,
}) => {
  const frame = useCurrentFrame();
  const useCase = getUseCase(useCaseId);
  const activeStyleId = styleId || useCase.recommendedStyle || "dark-keynote";
  const activeStyle = VIDEO_STYLES[activeStyleId] || VIDEO_STYLES["dark-keynote"];

  const { timeline, hook, diagram, takeaway, citation } = useCase;

  // Cinematic Camera Rig driven by style dynamics and timeline
  const maxZoom = activeStyle.cameraDynamics.zoomIntensity;
  const cameraZoom = interpolate(
    frame,
    [0, timeline.totalDurationInFrames],
    [1, maxZoom],
    { extrapolateRight: "clamp" }
  );

  const cameraPanY = interpolate(
    frame,
    [0, timeline.totalDurationInFrames],
    [0, -14],
    { extrapolateRight: "clamp" }
  );

  const sec1 = timeline.sections[0];
  const sec2A = timeline.sections[1];
  const sec2B = timeline.sections[2];
  const sec3 = timeline.sections[3];

  const avatarStyleMode =
    activeStyleId === "scifi-hud"
      ? "scifi"
      : activeStyleId === "exploded-teardown"
      ? "blueprint"
      : "keynote";

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        overflow: "hidden",
        backgroundColor: activeStyle.palette.background,
        backgroundImage: activeStyle.palette.backgroundRadial
          ? `radial-gradient(circle at 50% 40%, ${activeStyle.palette.backgroundRadial} 0%, ${activeStyle.palette.background} 85%)`
          : undefined,
        transform: `scale(${cameraZoom}) translateY(${cameraPanY}px)`,
        transformOrigin: "center center",
      }}
    >
      <ParallaxLayers>
        {/* 1. Persistent Top Header: Traceable Evidence Citation (FACTS.md) */}
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
            source={citation.source}
            claimRef={citation.claimRef}
            isVerified={true}
          />
        </div>

        {/* 2. Persistent Bottom Bar: Live Narration Waveform & Style Indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 70,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            zIndex: 50,
          }}
        >
          <AudioWaveform barCount={28} color={activeStyle.palette.primaryAccent} />
          <div
            style={{
              fontFamily: activeStyle.typography.fontFamily,
              fontSize: "14px",
              color: activeStyle.palette.textSecondary,
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Google AI Studio Multi-Speaker • Aoede + Puck • {activeStyle.name}
          </div>
        </div>

        {/* ========================================================
            SCENE 1: RESEARCH HOOK & INTUITION (0 - 90 frames)
            ======================================================== */}
        <Sequence durationInFrames={sec1.durationInFrames} name={sec1.id}>
          <div
            style={{
              position: "absolute",
              top: 220,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "48px",
            }}
          >
            <SpatialTypography
              title={hook.title}
              subtitle={`${hook.subtitle} • ${activeStyle.name}`}
              accentWord={hook.accentWord}
              delay={0}
            />

            <FloatingCard
              badge={hook.badge}
              headline={hook.headline}
              body={hook.body}
              metrics={hook.metrics}
              accentColor={activeStyle.palette.primaryAccent}
              delay={10}
            />
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 210,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 40,
            }}
          >
            <KineticCaptions text={sec1.subtitleText} />
          </div>
        </Sequence>

        {/* ========================================================
            SCENE 2A: TECHNICAL CORE / 3D SCENE (90 - 145 frames)
            ======================================================== */}
        <Sequence from={sec2A.startFrame} durationInFrames={sec2A.durationInFrames} name={sec2A.id}>
          <div
            style={{
              position: "absolute",
              top: 180,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <SpatialTypography
              title="TECHNICAL DEEP-DIVE"
              subtitle={useCase.title}
              accentWord="DEEP-DIVE"
              delay={sec2A.startFrame}
            />

            <ThreeHeroScene
              label={diagram.sublabel}
              sublabel="Hardware-Accelerated Compute Architecture"
            />
          </div>

          {/* Lemo-Wake Layered Presenter (Speaker 2: Puck / Inquirer) */}
          {showAvatar && (
            <div
              style={{
                position: "absolute",
                bottom: 300,
                right: 70,
                zIndex: 45,
              }}
            >
              <LemoWakeAvatar
                name="Puck"
                role="Lead Inquirer"
                isSpeaking={true}
                accentColor={activeStyle.palette.primaryAccent}
                styleMode={avatarStyleMode}
                avatarVariant="engineer"
              />
            </div>
          )}

          <div
            style={{
              position: "absolute",
              bottom: 210,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 40,
            }}
          >
            <KineticCaptions text={sec2A.subtitleText} />
          </div>
        </Sequence>

        {/* ========================================================
            SCENE 2B: LEMO-WAKE SCHEMATIC LOOP (145 - 200 frames)
            ======================================================== */}
        <Sequence from={sec2B.startFrame} durationInFrames={sec2B.durationInFrames} name={sec2B.id}>
          <div
            style={{
              position: "absolute",
              top: 180,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <SpatialTypography
              title={diagram.title}
              subtitle="Lemo-Wake Schematic Loop • 30 FPS"
              accentWord="SCHEMATIC"
              delay={sec2B.startFrame}
            />

            <LemoWake
              title={diagram.title}
              badge={diagram.badge}
              accentColor={activeStyle.palette.primaryAccent}
              diagramType={diagram.diagramType}
              delay={sec2B.startFrame}
            />
          </div>

          {/* Lemo-Wake Layered Presenter (Speaker 1: Aoede / Lead Scientist) */}
          {showAvatar && (
            <div
              style={{
                position: "absolute",
                bottom: 300,
                right: 70,
                zIndex: 45,
              }}
            >
              <LemoWakeAvatar
                name="Aoede"
                role="Lead AI Scientist"
                isSpeaking={true}
                accentColor={activeStyle.palette.primaryAccent}
                styleMode={avatarStyleMode}
                avatarVariant="researcher"
              />
            </div>
          )}

          <div
            style={{
              position: "absolute",
              bottom: 210,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 40,
            }}
          >
            <KineticCaptions text={sec2B.subtitleText} />
          </div>
        </Sequence>

        {/* ========================================================
            SCENE 3: EMPIRICAL FINDINGS & CTA (200 - 300 frames)
            ======================================================== */}
        <Sequence from={sec3.startFrame} durationInFrames={sec3.durationInFrames} name={sec3.id}>
          <div
            style={{
              position: "absolute",
              top: 240,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "48px",
            }}
          >
            <SpatialTypography
              title={takeaway.title}
              subtitle={takeaway.subtitle}
              accentWord={takeaway.accentWord}
              delay={sec3.startFrame}
            />

            <FloatingCard
              badge={takeaway.badge}
              headline={takeaway.headline}
              body={takeaway.body}
              metrics={takeaway.metrics}
              accentColor={activeStyle.palette.secondaryAccent || "#10B981"}
              delay={sec3.startFrame + 5}
            />
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 210,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 40,
            }}
          >
            <KineticCaptions text={sec3.subtitleText} />
          </div>
        </Sequence>
      </ParallaxLayers>
    </div>
  );
};

export const MainComposition: React.FC = () => {
  return (
    <Composition
      id="ShortsMainComposition"
      component={ShortsMainVideo}
      durationInFrames={300}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        useCaseId: "deepseek-r1",
        styleId: "scifi-hud",
        showAvatar: true,
      }}
    />
  );
};
