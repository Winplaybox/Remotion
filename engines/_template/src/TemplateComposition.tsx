import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { VoiceCues } from "@visuals/VoiceCues";
import { SoundBed, duckFromCues, type Sfx } from "@visuals/Sound";
import { rampedTime, templateAnswer, type Template } from "./model";

/**
 * Layout contract (1080x1920, 30 fps) shared by every engine:
 *   0-180   brand row + post number      180-470 title + subtitle + timer
 *   470-1500 the puzzle / scene          1500-1700 footer CTA / captions      >1750 handle
 */
export const TemplateComposition: React.FC<Template> = (p) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const spin = rampedTime(p, t);
  const answer = templateAnswer(p);
  const revealed = t >= p.playSeconds;
  const endStart = (p.playSeconds + p.revealSeconds) * fps;
  const endP = p.endCard.show ? Math.min(1, Math.max(0, (frame - endStart) / 12)) : 0;
  const titleIn = spring({ frame, fps, config: { damping: 14 } });
  const timeLeft = Math.max(0, Math.ceil(p.playSeconds - t));
  const rows = Math.ceil(p.count / p.cols);
  const cell = Math.min(900 / p.cols, 1000 / rows);
  const sfx: Sfx[] = [
    { src: "sfx/pop.mp3", at: 0.25, volume: 0.35 },
    ...[3, 2, 1].map((k): Sfx => ({ src: "sfx/tick.mp3", at: p.playSeconds - k, volume: 0.5 })),
    { src: "sfx/ding.mp3", at: p.playSeconds, volume: 0.55 },
    ...(p.endCard.show ? [{ src: "sfx/whoosh.mp3", at: p.playSeconds + p.revealSeconds - 0.1, volume: 0.4 }] : [])
  ];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${p.palette.bgTop}, ${p.palette.bgBottom})` }}>
      <VoiceCues cues={p.voice} />
      {p.sound ? <SoundBed music="sfx/music_puzzle.mp3" musicVolume={0.16} duck={duckFromCues(p.voice)} sfx={sfx} /> : null}
      <div style={{ position: "absolute", top: 60, left: 60, right: 60, display: "flex", justifyContent: "space-between", fontFamily: FONT.ui, fontWeight: 800, fontSize: 30, color: p.palette.body }}>
        <span>{p.brand}</span><span style={{ color: p.palette.accent, fontFamily: FONT.display, fontSize: 48 }}>#{String(p.postNo).padStart(3, "0")}</span>
      </div>
      <div style={{ position: "absolute", top: 190, width: "100%", textAlign: "center", opacity: titleIn, transform: `translateY(${(1 - titleIn) * -30}px)` }}>
        <div style={{ fontFamily: FONT.display, fontSize: Math.min(110, 1800 / p.title.length), color: "#fff" }}>{p.title}</div>
        <div style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 34, color: p.palette.body, opacity: 0.85 }}>{p.subtitle}</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 40, color: timeLeft <= 3 ? "#FF5A3C" : p.palette.accent, marginTop: 16 }}>{revealed ? "TIME UP!" : `${timeLeft}s`}</div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: p.count }, (_, i) => {
          const x = 540 + ((i % p.cols) - (p.cols - 1) / 2) * cell;
          const y = 1000 + (Math.floor(i / p.cols) - (rows - 1) / 2) * cell;
          const odd = i === answer.index;
          const beat = Math.sin(spin * Math.PI * 2 * (odd ? 1.35 : 1) + i * 0.4);
          const highlight = revealed && odd;
          return (
            <g key={i} transform={`translate(${x} ${y})`} opacity={revealed && !odd ? 0.25 : 1}>
              <circle r={cell * (0.28 + 0.06 * beat)} fill={p.palette.line} fillOpacity={0.18} stroke={p.palette.line} strokeWidth={3} />
              <circle r={cell * 0.1} fill={p.palette.body} />
              {highlight ? <circle r={cell * 0.45} fill="none" stroke={p.palette.accent} strokeWidth={6} /> : null}
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", top: 1560, width: "100%", textAlign: "center", fontFamily: FONT.ui, fontWeight: 900, fontSize: 40, color: revealed ? p.palette.accent : "#fff" }}>
        {revealed ? `JAWAB: ROW ${answer.row} · #${answer.col}` : "COMMENT KARO: ROW + NUMBER 👇"}
      </div>
      <div style={{ position: "absolute", top: 1780, width: "100%", textAlign: "center", fontFamily: FONT.mono, fontSize: 28, color: p.palette.line, opacity: 0.7 }}>{p.handle}</div>
      {endP > 0 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(5,4,16,${0.88 * endP})`, opacity: endP }}>
          <div style={{ fontFamily: FONT.display, fontSize: 130, color: p.palette.accent }}>{p.endCard.title}</div>
          <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 46, color: "#fff", textAlign: "center", maxWidth: 860, marginTop: 40 }}>{p.endCard.line}</div>
          <div style={{ marginTop: 50, fontFamily: FONT.ui, fontWeight: 900, fontSize: 40, color: "#071018", background: p.palette.accent, padding: "22px 50px", borderRadius: 99, transform: `scale(${interpolate(Math.sin(frame / 6), [-1, 1], [0.97, 1.03])})` }}>{p.endCard.button}</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
