import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { DESIGN } from "../designSystem";
import { SceneIntro } from "./scenes/SceneIntro";
import { SceneHook } from "./scenes/SceneHook";
import { SceneBenchmarkStack } from "./scenes/SceneBenchmarkStack";
import { SceneDataReveal } from "./scenes/SceneDataReveal";
import { SceneInsight } from "./scenes/SceneInsight";
import { SceneOutro } from "./scenes/SceneOutro";
import { CADGrid } from "./shared/CADGrid";

// Total: 4500 frames @ 30fps = 150s
const SCENE_OFFSETS = {
  intro: 0,
  hook: 60,
  stack: 150,
  mmlu: 300,
  models: 420,
  investment: 540,
  insight: 660,
  outro: 750,
};

export const Ep01Composition: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: DESIGN.colors.bgDeep }}>
      <CADGrid />

      <Sequence from={SCENE_OFFSETS.intro} durationInFrames={60}>
        <SceneIntro />
      </Sequence>

      <Sequence from={SCENE_OFFSETS.hook} durationInFrames={90}>
        <SceneHook />
      </Sequence>

      <Sequence from={SCENE_OFFSETS.stack} durationInFrames={150}>
        <SceneBenchmarkStack />
      </Sequence>

      <Sequence from={SCENE_OFFSETS.mmlu} durationInFrames={120}>
        <SceneDataReveal
          label="MMLU Score — General Knowledge"
          aiValue={90.0}
          humanValue={89.8}
          aiLabel="Gemini Ultra"
          unit="%"
          source="Stanford AI Index 2026, p.47"
        />
      </Sequence>

      <Sequence from={SCENE_OFFSETS.models} durationInFrames={120}>
        <SceneDataReveal
          label="New Frontier Models Released (2023)"
          aiValue={149}
          aiLabel="Total Models"
          unit=""
          source="Stanford AI Index 2026, p.19"
          accentColor={DESIGN.colors.accentWarm}
        />
      </Sequence>

      <Sequence from={SCENE_OFFSETS.investment} durationInFrames={120}>
        <SceneDataReveal
          label="US AI Private Investment (2023)"
          aiValue={67.2}
          aiLabel=""
          unit="B"
          prefix="$"
          source="Stanford AI Index 2026, p.121"
          accentColor={DESIGN.colors.accentGreen}
        />
      </Sequence>

      <Sequence from={SCENE_OFFSETS.insight} durationInFrames={90}>
        <SceneInsight />
      </Sequence>

      <Sequence from={SCENE_OFFSETS.outro} durationInFrames={90}>
        <SceneOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
