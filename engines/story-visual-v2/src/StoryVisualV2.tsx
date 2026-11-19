import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import type { MindNestLang } from "../../../content/mindnest/fables";
import { mindNestStoryText } from "./content";
import { useStoryFonts } from "./fonts";
import { STORY_STYLES, type StoryStyleId } from "./presets";
import { SceneLayer } from "./SceneLayer";
import { StoryUI } from "./StoryUI";

export const STORY_V2_FRAMES = 240;

export interface StoryVisualV2Props { lang: MindNestLang; fable: number; style: StoryStyleId; page?: number }

/** StoryVisualEngine V2: <SceneLayer> (art, language-free) + <StoryUI> (text). */
export const StoryVisualV2: React.FC<StoryVisualV2Props> = ({ lang, fable, style, page = 3 }) => {
  useStoryFonts();
  const { durationInFrames } = useVideoConfig();
  const s = STORY_STYLES[style];
  const text = React.useMemo(() => mindNestStoryText(lang, fable, page), [lang, fable, page]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <SceneLayer style={s} />
      <StoryUI style={s} text={text} captionFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
