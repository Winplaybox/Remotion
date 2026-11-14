import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "@visuals/fonts";
import { StoryDioramaComposition } from "./StoryDioramaComposition";
import { FPS } from "./model";
import { SAGA_H, SAGA_W, sagaSegments, sceneStarts, type SagaLong } from "./saga-long-model";

/**
 * 16:9 long video: the portrait diorama (1080x1920) scaled into the centre column, with a chapter list on the left
 * and the current chapter + progress + subscribe on the right. The centre column (608x1080 at x=656) is what the
 * Instagram / Facebook vertical teaser crops.
 */
const STORY_W = 1080, STORY_H = 1920;
const SCALE = SAGA_H / STORY_H; // 0.5625
const COL_W = STORY_W * SCALE; // 607.5
const COL_X = (SAGA_W - COL_W) / 2; // 656.25

export const SagaLongComposition: React.FC<SagaLong> = (p) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const starts = sceneStarts(p);
  const segs = sagaSegments(p);
  const t = frame / FPS;
  const chapterStart = p.chapters.map((c) => starts[c.startScene] ?? 0);
  const outroStart = starts[p.outroScene] ?? Infinity;
  let current = -1;
  chapterStart.forEach((s, i) => { if (t >= s) current = i; });
  if (t >= outroStart) current = p.chapters.length;
  const pal = p.palette;
  const progress = frame / Math.max(1, durationInFrames - 1);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 90% at 50% 50%, #2A2140, #120E1C)` }}>
      {/* centre: the stories */}
      <div style={{ position: "absolute", left: COL_X, top: 0, width: COL_W, height: SAGA_H, overflow: "hidden", boxShadow: "0 0 60px rgba(0,0,0,.6)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: STORY_W, height: STORY_H, transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
          {segs.map((g, i) => {
            const from = Math.round((starts[g.from] ?? 0) * FPS);
            const scenes = p.scenes.slice(g.from, g.to);
            const len = Math.round(scenes.reduce((a, s) => a + s.seconds, 0) * FPS);
            return (
              <Sequence key={i} from={from} durationInFrames={len} name={g.chapter < 0 ? "intro" : g.chapter >= p.chapters.length ? "outro" : p.chapters[g.chapter]!.title}>
                <AbsoluteFill style={{ width: STORY_W, height: STORY_H }}>
                  <StoryDioramaComposition {...p} tag={g.tag} tagAccent={g.tagAccent} scenes={scenes} />
                </AbsoluteFill>
              </Sequence>
            );
          })}
        </div>
      </div>

      {/* left: season + chapter list */}
      <div style={{ position: "absolute", left: 56, top: 64, width: COL_X - 112, color: "#FFF3D1" }}>
        <div style={{ fontFamily: FONT.display, fontSize: 30, letterSpacing: 3, color: pal.accent2 }}>{p.brand}</div>
        <div style={{ fontFamily: FONT.display, fontSize: 92, lineHeight: 1, marginTop: 14 }}>{p.seasonTitle}</div>
        <div style={{ fontFamily: FONT.display, fontSize: 34, color: pal.accent2, marginTop: 8, letterSpacing: 1 }}>{p.seasonSub}</div>
        <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 10 }}>
          {p.chapters.map((c, i) => {
            const on = i === current, done = i < current;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: FONT.display, fontSize: on ? 38 : 30, letterSpacing: 1,
                color: on ? "#1C1A17" : done ? "rgba(255,243,209,.45)" : "#FFF3D1", background: on ? pal.accent2 : "transparent",
                padding: on ? "6px 16px" : "2px 16px", borderRadius: 8, transition: "none" }}>
                <span style={{ fontFamily: FONT.mono, fontSize: 22, fontWeight: 700, opacity: 0.8 }}>{String(i + 1).padStart(2, "0")}</span>
                {c.title}
                {done ? <span style={{ fontSize: 24 }}>✓</span> : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* right: now playing + subscribe */}
      <div style={{ position: "absolute", left: COL_X + COL_W + 56, top: 64, width: SAGA_W - (COL_X + COL_W) - 112, color: "#FFF3D1", height: SAGA_H - 128 }}>
        {current >= 0 && current < p.chapters.length ? (
          <>
            <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 26, color: pal.accent2, letterSpacing: 2 }}>AB DEKH RAHE HAIN</div>
            <div style={{ fontFamily: FONT.display, fontSize: 150, lineHeight: 1, marginTop: 8 }}>
              {String(current + 1).padStart(2, "0")}<span style={{ fontSize: 60, opacity: 0.6 }}>/{p.chapters.length}</span>
            </div>
            <div style={{ fontFamily: FONT.display, fontSize: 64, lineHeight: 1.05, color: pal.accent2, marginTop: 6 }}>{p.chapters[current]!.title}</div>
          </>
        ) : (
          <div style={{ fontFamily: FONT.display, fontSize: 72, lineHeight: 1.05, marginTop: 40 }}>{current < 0 ? "SHURU KARTE HAIN" : "AAPKI FAVOURITE?"}</div>
        )}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 150 }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 22, fontWeight: 700, letterSpacing: 2, opacity: 0.8 }}>POORI KAHANI</div>
          <div style={{ marginTop: 12, height: 14, borderRadius: 7, background: "rgba(255,243,209,.18)", overflow: "hidden" }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", background: pal.accent2 }} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, bottom: 0, display: "flex", alignItems: "center", gap: 14, fontFamily: FONT.display, fontSize: 36, letterSpacing: 1,
          background: "#E03A2E", color: "#fff", padding: "14px 26px", borderRadius: 12, boxShadow: "0 6px 0 rgba(0,0,0,.35)" }}>
          SUBSCRIBE <span style={{ fontFamily: FONT.mono, fontSize: 24, opacity: 0.9 }}>{p.handle || "@EpicBharatSaga"}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
