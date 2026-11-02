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

export const ShortsMainVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Cinematic Camera Rig: Continuous subtle push-in & parallax drift
  const cameraZoom = interpolate(frame, [0, 300], [1, 1.04]);
  const cameraPanY = interpolate(frame, [0, 300], [0, -12]);

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        overflow: "hidden",
        backgroundColor: "#030712",
        transform: `scale(${cameraZoom}) translateY(${cameraPanY}px)`,
        transformOrigin: "center center",
      }}
    >
      <ParallaxLayers>
        {/* 1. Persistent Top Header: Verified Research Citation */}
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

        {/* 2. Persistent Bottom Bar: Live Narration Waveform */}
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
          <AudioWaveform barCount={26} color="#00F5FF" />
          <div
            style={{
              fontFamily: "'Segoe UI', Roboto, sans-serif",
              fontSize: "14px",
              color: "#64748B",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Google AI Studio Speech Generation • 44.1kHz Multi-Speaker
          </div>
        </div>

        {/* ========================================================
            SCENE 1: HOOK & VECTOR SPACE REVEAL (Frames 0 - 90)
            ======================================================== */}
        <Sequence durationInFrames={90} name="Scene1_Hook">
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
              subtitle="Series A • AI Explained"
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
              accentColor="#00F5FF"
              delay={10}
            />
          </div>

          {/* Subtitle Bar for Scene 1 */}
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
            <KineticCaptions text="Kya aapne socha hai ki AI aapki baatein kaise samajhta hai?" />
          </div>
        </Sequence>

        {/* ========================================================
            SCENE 2: 3D CORE & LEMO-WAKE ARCHITECTURE (Frames 90 - 200)
            Part A (90-145): Hero 3D Attention Core
            Part B (145-200): Lemo-Wake Exploded Architecture Loop
            ======================================================== */}
        <Sequence from={90} durationInFrames={110} name="Scene2_Architecture">
          <div
            style={{
              position: "absolute",
              top: 180,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <SpatialTypography
              title="MULTI-HEAD ATTENTION"
              subtitle={frame < 145 ? "Deep 3D Architectural Core" : "Lemo-Wake Schematic Loop"}
              accentWord="ATTENTION"
              delay={90}
            />

            {frame < 145 ? (
              <ThreeHeroScene
                label="Self-Attention Matrix • Q, K, V"
                sublabel="8 Parallel Attention Heads • Real-time Token Weighting"
              />
            ) : (
              <LemoWake
                title="Figure 1 • Multi-Head Attention (Vaswani 2017)"
                badge="LEMO-WAKE LOOP • 30 FPS"
                accentColor="#00F5FF"
                delay={145}
              />
            )}
          </div>

          {/* Subtitle Bar for Scene 2 */}
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
            <KineticCaptions text="Transformer model har word ko ek saath parallel scan karta hai." />
          </div>
        </Sequence>

        {/* ========================================================
            SCENE 3: EMPIRICAL FINDINGS & CTA (Frames 200 - 300)
            ======================================================== */}
        <Sequence from={200} durationInFrames={100} name="Scene3_Outro">
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
              delay={200}
            />

            <FloatingCard
              badge="Compute Scaling Law"
              headline="Matrix Multiplication at Massive Scale"
              body="Intelligence is the mathematical byproduct of loss minimization on trillions of training tokens across high-bandwidth clusters."
              metrics={[
                { label: "Training Flops", value: "10²⁶" },
                { label: "Verification", value: "100%" },
              ]}
              accentColor="#10B981"
              delay={205}
            />
          </div>

          {/* Subtitle Bar for Scene 3 */}
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
            <KineticCaptions text="Aise hi real research concepts ko samajhne ke liye subscribe karein!" />
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
    />
  );
};
