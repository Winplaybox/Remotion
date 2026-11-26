import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ADVANCE, chunkAt, chunkCaption } from "./captions";
import { fontsFor } from "./fonts";
import { FRAME, RADIUS, type StoryStyleConfig, type StoryText } from "./types";

/**
 * Everything that is TEXT: brand line, moral headline, chunked caption. Sits on top of <SceneLayer> and never
 * touches the art. Layout is fixed by `composition` tokens; per-style only colours / separation change.
 */

const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

function quoteEffect(s: StoryStyleConfig): React.CSSProperties {
  const c = s.cards.quoteBacking;
  switch (s.cards.quoteStyle) {
    case "glow":
      return { textShadow: `0 0 18px ${c}, 0 0 36px ${c}, 0 0 60px ${c}, 0 2px 2px rgba(0,0,0,0.08)` };
    case "shadow":
      return { textShadow: `0 3px 0 ${c}, 0 6px 24px ${c}, 0 0 48px ${c}` };
    case "outline":
      return { WebkitTextStroke: `13px ${c}`, paintOrder: "stroke fill", wordSpacing: "0.14em", textShadow: s.cards.shadow } as React.CSSProperties;
    case "plate":
      return {};
  }
}

export const StoryUI: React.FC<{ style: StoryStyleConfig; text: StoryText; captionFrames: number }> = ({ style: s, text, captionFrames }) => {
  const frame = useCurrentFrame();
  const f = fontsFor(text.script, text.lang);
  const ty = s.typography;
  const side = FRAME.safeSide;

  // Headline size from the longest line so long languages (es/de) shrink instead of overflowing.
  const longest = Math.max(...text.headline.map((l) => l.length));
  const titleSize = Math.round(Math.max(76, Math.min(118, (FRAME.width - 2 * side) / (longest * ADVANCE[text.script] * 1.08))));
  const capSize = text.script === "cjk" ? 40 : 46;
  const capWidth = FRAME.width - side - FRAME.railRight - 20;
  const chunks = chunkCaption(text.caption, text.script, capSize, capWidth);
  const cur = chunkAt(chunks, Math.max(0, frame - 24), captionFrames - 24);

  const inBrand = ease(frame, 0, 14);
  const inKick = ease(frame, 6, 22);
  const inHead = ease(frame, 10, 30);
  const capIn = ease(cur.local, 0, 8) * ease(frame, 20, 32);

  const dir = text.rtl ? "rtl" : "ltr";
  const capBottom = s.composition.storyPosition;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* top wash: integrates the type with the plate (no box) */}
      <div style={{ position: "absolute", left: 0, top: 0, width: FRAME.width, height: 720, background: `linear-gradient(to bottom, ${s.cards.topWash} 0%, ${s.cards.topWash} 35%, rgba(0,0,0,0) 100%)` }} />

      {/* brand line */}
      <div style={{ position: "absolute", top: FRAME.safeTop, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 27, letterSpacing: "0.34em", color: ty.brand, opacity: inBrand, ...(s.cards.quoteStyle === "outline" ? { WebkitTextStroke: `6px ${s.cards.quoteBacking}`, paintOrder: "stroke fill" } : { textShadow: `0 0 10px ${s.cards.quoteBacking}, 0 0 22px ${s.cards.quoteBacking}` }) } as React.CSSProperties}>
        <span>{text.brand}</span>
        <span style={{ width: 9, height: 9, borderRadius: RADIUS.pill, background: ty.accent, marginRight: "0.34em" }} />
        <span style={{ opacity: 0.8 }}>{text.episode}</span>
      </div>

      {/* moral headline: kicker + two editorial lines over the scene */}
      <div dir={dir} style={{ position: "absolute", top: s.composition.titlePosition, left: side, right: side, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 20, fontFamily: f.display, fontWeight: 700, fontSize: 50, lineHeight: 1.1, color: ty.accent, opacity: inKick, transform: `translateY(${(1 - inKick) * 14}px)`, ...(s.cards.quoteStyle === "outline" ? { WebkitTextStroke: `8px ${s.cards.quoteBacking}`, paintOrder: "stroke fill" } : { textShadow: quoteEffect(s).textShadow }) } as React.CSSProperties}>
          <span style={{ width: 44, height: 4, borderRadius: RADIUS.pill, background: ty.accent, opacity: 0.7 }} />
          <span>{text.kicker}</span>
          <span style={{ width: 44, height: 4, borderRadius: RADIUS.pill, background: ty.accent, opacity: 0.7 }} />
        </div>
        <div style={{ marginTop: 14, fontFamily: f.display, fontWeight: ty.titleWeight, fontSize: titleSize, lineHeight: text.script === "deva" ? 1.18 : 1.08, color: ty.ink, opacity: inHead, transform: `translateY(${(1 - inHead) * 24}px)`, ...quoteEffect(s) }}>
          <div>{text.headline[0]}</div>
          <div>{text.headline[1]}</div>
        </div>
      </div>

      {/* bottom scrim for the caption */}
      {s.cards.storyStyle === "scrim" ? (
        <div style={{ position: "absolute", left: 0, bottom: 0, width: FRAME.width, height: capBottom + 360, background: `linear-gradient(to top, ${s.cards.storyBacking} 0%, ${s.cards.storyBacking} 30%, rgba(0,0,0,0) 100%)` }} />
      ) : null}

      {/* chunked caption: max two lines, inside Shorts safe area (bottom + right action rail) */}
      <div dir={dir} style={{ position: "absolute", bottom: capBottom, left: side, width: capWidth, display: "flex", justifyContent: "center" }}>
        <div style={{
          fontFamily: f.body, fontWeight: ty.bodyWeight, fontSize: capSize, lineHeight: 1.32, color: ty.captionInk, textAlign: "center",
          opacity: capIn, transform: `translateY(${(1 - capIn) * 10}px)`,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          ...(s.cards.storyStyle === "plate"
            ? { background: s.cards.storyBacking, borderRadius: RADIUS[s.cards.radius], padding: "18px 34px", boxShadow: s.cards.shadow, backdropFilter: "blur(6px)" }
            : { textShadow: `0 1px 2px ${s.cards.storyBacking}, 0 0 14px ${s.cards.storyBacking}` })
        } as React.CSSProperties}>
          {chunks[cur.index]}
        </div>
      </div>
    </AbsoluteFill>
  );
};
