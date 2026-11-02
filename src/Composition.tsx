import React from "react";
import {
  Composition,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { TIMELINE } from "./timeline";
import { ParallaxLayers } from "./components/ParallaxLayers";
import { SpatialTypography } from "./components/SpatialTypography";
import { FloatingCard } from "./components/FloatingCard";
import { ThreeHeroScene } from "./components/ThreeHeroScene";
import { KineticCaptions } from "./components/KineticCaptions";
import { AudioWaveform } from "./components/AudioWaveform";
import { ResearchCitationBadge } from "./components/ResearchCitationBadge";
import { LemoWake } from "./components/LemoWake";
import { VIDEO_STYLES } from "./styles/catalog";
import { VideoStyleId } from "./styles/types";

export interface ShortsMainVideoProps {
  styleId?: VideoStyleId;
}

export const ShortsMainVideo: React.FC<ShortsMainVideoProps> = ({
  styleId = "dark-keynote",
}) => {
  const frame = useCurrentFrame();
  const activeStyle = VIDEO_STYLES[styleId] || VIDEO_STYLES["dark-keynote"];

  // Cinematic Camera Rig driven by style dynamics and timeline
  const maxZoom = activeStyle.cameraDynamics.zoomIntensity;
  const cameraZoom = interpolate(
    frame,
    [0, TIMELINE.totalDurationInFrames],
    [1, maxZoom],
    { extrapolateRight: "clamp" }
  );

  const cameraPanY = interpolate(
    frame,
    [0, TIMELINE.totalDurationInFrames],
    [0, -14],
    { extrapolateRight: "clamp" }
  );

  const sec1 = TIMELINE.sections[0];
  const sec2A = TIMELINE.sections[1];
  const sec2B = TIMELINE.sections[2];
  const sec3 = TIMELINE.sections[3];

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
            source="Vaswani et al. 2017"
            claimRef="ArXiv:1706.03762 • Section 3.2"
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
            SCENE 1: THE VECTOR PARADOX HOOK (0 - 90 frames)
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
              title="HOW CHATGPT UNDERSTANDS YOU"
              subtitle={`Series A • AI Explained • ${activeStyle.name}`}
              accentWord="UNDERSTANDS"
              delay={0}
            />

            <FloatingCard
              badge="Breakthrough Insight"
              headline="Words are not text, they are vectors."
              body="Jab aap prompt type karte ho, model har word ko 12,288 dimensions ke mathematical space mein convert karta hai."
              metrics={[
                { label: "Dimensions", value: "12,288" },
                { label: "Vocabulary", value: "100k+" },
              ]}
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
            SCENE 2A: 3D ATTENTION CORE IGNITE (90 - 145 frames)
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
              title="MULTI-HEAD ATTENTION"
              subtitle="Deep 3D Architectural Core"
              accentWord="ATTENTION"
              delay={sec2A.startFrame}
            />

            <ThreeHeroScene
              label="Self-Attention Matrix • Q, K, V"
              sublabel="8 Parallel Attention Heads • Real-time Token Weighting"
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
            <KineticCaptions text={sec2A.subtitleText} />
          </div>
        </Sequence>

        {/* ========================================================
            SCENE 2B: LEMO-WAKE ARCHITECTURE LOOP (145 - 200 frames)
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
              title="PARALLEL ATTENTION HEADS"
              subtitle="Lemo-Wake Schematic Loop • Figure 1"
              accentWord="PARALLEL"
              delay={sec2B.startFrame}
            />

            <LemoWake
              title="Figure 1 • Multi-Head Attention (Vaswani 2017)"
              badge="LEMO-WAKE LOOP • 30 FPS"
              accentColor={activeStyle.palette.primaryAccent}
              delay={sec2B.startFrame}
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
              title="THE FUTURE OF REASONING"
              subtitle="Stanford AI Index Empirical Findings"
              accentWord="FUTURE"
              delay={sec3.startFrame}
            />

            <FloatingCard
              badge="Compute Scaling Law"
              headline="Matrix Multiplication at Massive Scale"
              body="Intelligence is the mathematical byproduct of loss minimization on trillions of training tokens across high-bandwidth clusters."
              metrics={[
                { label: "Training Flops", value: "10²⁶" },
                { label: "Verification", value: "100%" },
              ]}
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
      durationInFrames={TIMELINE.totalDurationInFrames}
      fps={TIMELINE.fps}
      width={1080}
      height={1920}
      defaultProps={{
        styleId: "dark-keynote" as VideoStyleId,
      }}
    />
  );
};
