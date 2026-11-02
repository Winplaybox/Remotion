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
import { AIAvatar } from "./components/AIAvatar";

export const ShortsMainVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Global Camera Movement: Gentle push-in with subtle pan
  const cameraZoom = interpolate(frame, [0, 300], [1, 1.05]);
  const cameraPanY = interpolate(frame, [0, 300], [0, -15]);

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
        {/* Persistent Top Header: Research Citation Badge */}
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
            claimRef="ArXiv:1706.03762"
            isVerified={true}
          />
        </div>

        {/* Persistent Bottom Bar: Narration Audio Waveform Indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 70,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            zIndex: 50,
          }}
        >
          <div
            style={{
              fontFamily: "'Segoe UI', Roboto, sans-serif",
              fontSize: "16px",
              color: "#64748B",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            AI Narration (Hinglish) • 44.1kHz Sync
          </div>
          <AudioWaveform barCount={24} color="#00F5FF" />
        </div>

        {/* Floating AI Avatar Host in PiP mode */}
        <div
          style={{
            position: "absolute",
            bottom: 145,
            left: 60,
            zIndex: 60,
          }}
        >
          <AIAvatar
            name="Aria"
            role="Lead AI Explainer"
            mode="pip"
            accentColor="#00F5FF"
            isSpeaking={true}
          />
        </div>

        {/* SCENE 1: Hook & Question (Frames 0 - 90) */}
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
              gap: "40px",
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
            }}
          >
            <KineticCaptions text="Kya aapne socha hai ki AI aapki baatein kaise samajhta hai?" />
          </div>
        </Sequence>

        {/* SCENE 2: 3D Hero Scene - Attention Mechanism (Frames 90 - 200) */}
        <Sequence from={90} durationInFrames={110} name="Scene2_3D_Hero">
          <div
            style={{
              position: "absolute",
              top: 210,
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
              subtitle="Deep Architectural Core"
              accentWord="ATTENTION"
              delay={90}
            />

            <ThreeHeroScene label="Self-Attention Matrix • Q, K, V" />

            <FloatingCard
              badge="Section 3.2 Citation"
              headline="Parallel Context Connections"
              body="Har token dusre sabhi tokens ke saath weighted probability calculate karta hai ek saath."
              accentColor="#7928CA"
              delay={100}
            />
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
            }}
          >
            <KineticCaptions text="Transformer model har word ko ek saath parallel scan karta hai." />
          </div>
        </Sequence>

        {/* SCENE 3: 2.5D Spatial Outro & Conclusion (Frames 200 - 300) */}
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
              gap: "40px",
            }}
          >
            <SpatialTypography
              title="THE FUTURE OF REASONING"
              subtitle="Empirical Research Findings"
              accentWord="FUTURE"
              delay={200}
            />

            <FloatingCard
              badge="Stanford AI Index 2026"
              headline="Matrix Multiplication at Massive Scale"
              body="Intelligence is the mathematical byproduct of loss minimization on trillions of training tokens."
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
