import React, { useMemo } from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { captionPages, type ShortClip } from "./model";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const ShortClipComposition: React.FC<ShortClip> = (p) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const { fps, width: W, height: H, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const src = /^https?:/.test(p.src) ? p.src : staticFile(p.src);
  const startFrom = Math.round(p.start * fps);
  const endAt = Math.round(p.end * fps);
  const pages = useMemo(() => captionPages(p.words), [p.words]);
  const page = pages.find((pg) => t >= pg.start - 0.05 && t <= pg.end + 0.35);
  const fitH = (W * p.height) / p.width;
  const crop = p.framing === "crop" || fitH >= H * 0.9;
  const hookIn = spring({ frame, fps, config: { damping: 14 } });
  const hookOut = interpolate(t, [2.8, 3.3], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {crop ? (
        <OffthreadVideo src={src} startFrom={startFrom} endAt={endAt} style={{ width: W, height: H, objectFit: "cover" }} />
      ) : (
        <>
          <OffthreadVideo src={src} startFrom={startFrom} endAt={endAt} muted style={{ position: "absolute", width: W, height: H, objectFit: "cover", filter: "blur(30px) brightness(0.5)", transform: "scale(1.2)" }} />
          <div style={{ position: "absolute", top: (H - fitH) / 2 - 80, left: 0, width: W, height: fitH }}>
            <OffthreadVideo src={src} startFrom={startFrom} endAt={endAt} style={{ width: W, height: fitH, objectFit: "contain" }} />
          </div>
        </>
      )}

      {p.hook && t < 3.3 ? (
        <div style={{ position: "absolute", top: 170, left: 50, right: 50, display: "flex", justifyContent: "center", opacity: hookOut, transform: `scale(${0.7 + hookIn * 0.3})` }}>
          <div style={{ fontFamily: FONT.display, fontSize: Math.min(110, 1800 / Math.max(8, p.hook.length)), lineHeight: 1.02, color: "#111", background: p.accent, padding: "14px 30px", borderRadius: 18, textAlign: "center", boxShadow: "0 10px 0 rgba(0,0,0,.35)" }}>{p.hook}</div>
        </div>
      ) : null}

      {page ? (
        <div style={{ position: "absolute", top: crop ? H * 0.68 : (H + fitH) / 2 - 40, left: 60, right: 60, textAlign: "center", fontFamily: FONT.ui, fontWeight: 900, fontSize: 76, lineHeight: 1.15, textTransform: "uppercase" }}>
          {page.words.map((w, i) => {
            const on = t >= w.start && t < w.end + 0.05;
            const pop = on ? 1.08 : 1;
            return (
              <span key={i} style={{ display: "inline-block", marginRight: "0.25em", color: on ? p.accent : "#fff", transform: `scale(${pop})`, WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 rgba(0,0,0,.5)" }}>{w.word}</span>
            );
          })}
        </div>
      ) : null}

      {p.handle ? <div style={{ position: "absolute", bottom: 230, width: "100%", textAlign: "center", fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, color: "#fff", textShadow: "0 2px 6px #000" }}>{p.handle}</div> : null}
      <div style={{ position: "absolute", bottom: 0, left: 0, height: 10, width: `${(frame / durationInFrames) * 100}%`, background: p.accent }} />
    </AbsoluteFill>
  );
};
