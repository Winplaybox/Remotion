import React from "react";
import { Composition } from "remotion";
import { ShortsMainVideo } from "./Composition";
import { TIMELINE } from "./timeline";
import { VIDEO_STYLES } from "./styles/catalog";
import { VideoStyleId } from "./styles/types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Default Main Composition */}
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

      {/* Style-Specific Compositions from Lemo-Opuscar Catalog */}
      {Object.values(VIDEO_STYLES).map((style) => (
        <Composition
          key={style.id}
          id={`Style-${style.id}`}
          component={ShortsMainVideo}
          durationInFrames={TIMELINE.totalDurationInFrames}
          fps={TIMELINE.fps}
          width={1080}
          height={1920}
          defaultProps={{
            styleId: style.id,
          }}
        />
      ))}
    </>
  );
};
