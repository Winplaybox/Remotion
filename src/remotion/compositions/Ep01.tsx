import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { DESIGN } from "../designSystem";
import { SceneIntro } from "./scenes/SceneIntro";
import { SceneHook } from "./scenes/SceneHook";
import { SceneBenchmarkStack3D } from "./scenes/SceneBenchmarkStack3D";
import { SceneDataReveal } from "./scenes/SceneDataReveal";
import { SceneWhatIf } from "./scenes/SceneWhatIf";
import { SceneInsight } from "./scenes/SceneInsight";
import { SceneCTA } from "./scenes/SceneCTA";
import { CADGrid } from "./shared/CADGrid";
import { EP01_BEATS, EP01_CAPTIONS, computeOffsets } from "./ep01Timing";

const offsets = computeOffsets();

export const Ep01Composition: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: DESIGN.colors.bgDeep }}>
      <CADGrid />

      {EP01_BEATS.map((b, i) => {
        const from = offsets[i] as number;
        return (
          <Sequence key={b.beat} from={from} durationInFrames={b.durationFrames}>
            <Audio src={staticFile(`audio/ep01/${b.audioFile}`)} />
          </Sequence>
        );
      })}

      <Sequence from={offsets[0]} durationInFrames={EP01_BEATS[0].durationFrames}>
        <SceneHook caption={EP01_CAPTIONS[0]} />
      </Sequence>

      <Sequence from={offsets[1]} durationInFrames={EP01_BEATS[1].durationFrames}>
        <SceneIntro caption={EP01_CAPTIONS[1]} />
      </Sequence>

      <Sequence from={offsets[2]} durationInFrames={EP01_BEATS[2].durationFrames}>
        <SceneBenchmarkStack3D caption={EP01_CAPTIONS[2]} />
      </Sequence>

      <Sequence from={offsets[3]} durationInFrames={EP01_BEATS[3].durationFrames}>
        <SceneDataReveal
          label="New Frontier Models Released (2023)"
          aiValue={149}
          aiLabel="Total Models"
          unit=""
          source="Stanford AI Index 2026, p.19"
          caption={EP01_CAPTIONS[3]}
          accentColor={DESIGN.colors.accentWarm}
        />
      </Sequence>

      <Sequence from={offsets[4]} durationInFrames={EP01_BEATS[4].durationFrames}>
        <SceneDataReveal
          label="US AI Private Investment (2023)"
          aiValue={67}
          aiLabel=""
          unit="B"
          prefix="$"
          source="Stanford AI Index 2026, p.121"
          caption={EP01_CAPTIONS[4]}
          accentColor={DESIGN.colors.accentGreen}
        />
      </Sequence>

      <Sequence from={offsets[5]} durationInFrames={EP01_BEATS[5].durationFrames}>
        <SceneWhatIf caption={EP01_CAPTIONS[5]} />
      </Sequence>

      <Sequence from={offsets[6]} durationInFrames={EP01_BEATS[6].durationFrames}>
        <SceneInsight caption={EP01_CAPTIONS[6]} />
      </Sequence>

      <Sequence from={offsets[7]} durationInFrames={EP01_BEATS[7].durationFrames}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
