import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { VoiceCues } from "@visuals/VoiceCues";
import { SoundBed, duckFromCues, type Sfx } from "@visuals/Sound";
import { PrevAnswerCard } from "@visuals/PrevAnswer";
import { AskOutro } from "@visuals/AskOutro";
import { askOutroSfx, followTapAt } from "../../ask-outro";
import { rampedTime, templateAnswer, type Template } from "./model";

/**
 * Layout contract (1080x1920, 30 fps) shared by every engine:
 *   0-180   brand row + post number      180-470 title + subtitle + timer
 *   470-1500 the puzzle / scene          1500-1700 footer CTA / captions      >1750 handle
 * Timeline contract: [PrevAnswerCard introSeconds] -> [puzzle playSeconds] -> [AskOutro: question -> comment + FOLLOW].
 * The AskOutro covers only the top/bottom strips, so keep the puzzle drawn (not dimmed) underneath it.
 */
export const TemplateComposition: React.FC<Template> = (p) => {
  useBundledFonts();
  const { fps } = useVideoConfig();
  const introFrames = Math.round(p.introSeconds * fps);
  const frame = useCurrentFrame() - introFrames; // puzzle time
  const t = frame / fps;
  const spin = rampedTime(p, t);
  const answer = templateAnswer(p);
  const timeUp = t >= p.playSeconds;
  const titleIn = spring({ frame, fps, config: { damping: 14 } });
  const timeLeft = Math.max(0, Math.ceil(p.playSeconds - t));
  const rows = Math.ceil(p.count / p.cols);
  const cell = Math.min(900 / p.cols, 1000 / rows);
  const o = p.introSeconds;
  const sfx: Sfx[] = [
    ...(o > 0 ? [{ src: "sfx/ding.mp3", at: 0.15, volume: 0.4 }] : []),
    { src: "sfx/pop.mp3", at: o + 0.25, volume: 0.35 },
    ...[3, 2, 1].map((k): Sfx => ({ src: "sfx/tick.mp3", at: o + p.playSeconds - k, volume: 0.5 })),
    ...askOutroSfx(p.askOutro, o + p.playSeconds)
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
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 40, color: timeLeft <= 3 ? "#FF5A3C" : p.palette.accent, marginTop: 16 }}>{timeUp ? "TIME UP!" : `${timeLeft}s`}</div>
      </div>
      {/* REPLACE: your puzzle. Keep it visible after time-up — viewers re-check it while the AskOutro runs. */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: p.count }, (_, i) => {
          const x = 540 + ((i % p.cols) - (p.cols - 1) / 2) * cell;
          const y = 1000 + (Math.floor(i / p.cols) - (rows - 1) / 2) * cell;
          const odd = i === answer.index;
          const beat = Math.sin(spin * Math.PI * 2 * (odd ? 1.35 : 1) + i * 0.4);
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r={cell * (0.28 + 0.06 * beat)} fill={p.palette.line} fillOpacity={0.18} stroke={p.palette.line} strokeWidth={3} />
              <circle r={cell * 0.1} fill={p.palette.body} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", top: 1560, width: "100%", textAlign: "center", fontFamily: FONT.ui, fontWeight: 900, fontSize: 40, color: "#fff" }}>COMMENT KARO: ROW + NUMBER 👇</div>
      <div style={{ position: "absolute", top: 1780, width: "100%", textAlign: "center", fontFamily: FONT.mono, fontSize: 28, color: p.palette.line, opacity: 0.7 }}>{p.handle}</div>
      <AskOutro from={introFrames + p.playSeconds * fps} a={p.askOutro} accent={p.palette.accent} tapAt={followTapAt(p.askOutro)} />
      {o > 0 && p.prevAnswer ? <PrevAnswerCard seconds={o} heading={`PICHHLE PUZZLE #${String(p.postNo - 1).padStart(3, "0")} KA JAWAB`} answer={p.prevAnswer} accent={p.palette.accent} bg={`linear-gradient(180deg, ${p.palette.bgTop}, ${p.palette.bgBottom})`} /> : null}
    </AbsoluteFill>
  );
};
