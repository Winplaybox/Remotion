import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, useBundledFonts } from "@visuals/fonts";
import { VoiceCues } from "@visuals/VoiceCues";
import { SoundBed, duckFromCues, type Sfx } from "@visuals/Sound";
import { PrevAnswerCard } from "@visuals/PrevAnswer";
import { AskOutro } from "@visuals/AskOutro";
import { StyledScene } from "@visuals/styles";
import { askOutroSfx, followTapAt } from "../../ask-outro";
import type { CodeLock } from "./model";

export const CodeLockComposition: React.FC<CodeLock> = (p) => {
  useBundledFonts();
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const introFrames = Math.round(p.introSeconds * fps);
  const localFrame = frame - introFrames;
  const t = localFrame / fps;
  const progress = Math.max(0, Math.min(1, t / p.playSeconds));
  const reveal = spring({ frame: localFrame, fps, config: { damping: 14 } });
  const timeLeft = Math.max(0, Math.ceil(p.playSeconds - t));
  const sfx: Sfx[] = [
    ...(p.introSeconds ? [{ src: "sfx/ding.mp3", at: 0.15, volume: 0.4 }] : []),
    { src: "sfx/pop.mp3", at: p.introSeconds + 0.25, volume: 0.4 },
    ...[3, 2, 1].map((n): Sfx => ({ src: "sfx/tick.mp3", at: p.introSeconds + p.playSeconds - n, volume: 0.5 })),
    ...askOutroSfx(p.askOutro, p.introSeconds + p.playSeconds)
  ];
  const clueY = (i: number) => 590 + i * 164;
  const scene = (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, ${p.palette.panel}, ${p.palette.bgTop} 62%, ${p.palette.bgBottom})` }}>
      <div style={{ position: "absolute", top: 58, left: 54, right: 54, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff", fontFamily: FONT.ui, fontWeight: 900, fontSize: 29 }}>
        <span style={{ letterSpacing: 3 }}>{p.brand}</span>
        <span style={{ color: p.palette.gold, fontFamily: FONT.display, fontSize: 44 }}>#{String(p.postNo).padStart(3, "0")}</span>
      </div>
      <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", opacity: reveal }}>
        <div style={{ fontFamily: FONT.display, fontSize: 104, color: "#fff", letterSpacing: 2 }}>{p.title}</div>
        <div style={{ fontFamily: FONT.ui, fontSize: 32, fontWeight: 700, color: "#D8E8FF", marginTop: 8 }}>{p.subtitle}</div>
        <div style={{ width: 780, height: 13, margin: "26px auto 0", borderRadius: 20, background: "#FFFFFF22", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress * 100}%`, background: p.palette.accent, boxShadow: `0 0 22px ${p.palette.accent}` }} />
        </div>
        <div style={{ marginTop: 12, fontFamily: FONT.mono, fontSize: 38, fontWeight: 800, color: timeLeft <= 3 ? "#FF5A68" : p.palette.gold }}>{t < 0 ? "" : timeLeft > 0 ? `${timeLeft}s` : "TIME'S UP!"}</div>
      </div>
      <div style={{ position: "absolute", top: 420, left: 60, right: 60, height: 1120, borderRadius: 38, border: `3px solid ${p.palette.accent}99`, background: "rgba(3,10,24,.72)", boxShadow: `0 0 60px ${p.palette.accent}22` }} />
      <div style={{ position: "absolute", top: 455, width: "100%", textAlign: "center", color: p.palette.gold, fontFamily: FONT.display, fontSize: 46, letterSpacing: 3 }}>VAULT ACCESS LOG</div>
      {p.clues.map((c, i) => {
        const k = spring({ frame: localFrame - (i * 7), fps, config: { damping: 13 } });
        return <div key={i} style={{ position: "absolute", top: clueY(i), left: 92, right: 92, height: 132, borderRadius: 22, padding: "16px 24px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 24, opacity: k, transform: `translateX(${(1-k)*90}px)`, background: "#13294B", border: `2px solid ${p.palette.accent}66` }}>
          <div style={{ width: 70, height: 70, borderRadius: 18, background: p.palette.accent, color: "#06101F", display: "grid", placeItems: "center", fontFamily: FONT.display, fontSize: 40 }}>#{i+1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontFamily: FONT.mono, fontWeight: 900, fontSize: 43, letterSpacing: 12 }}>{c.guess.split("").join(" ")}</div>
            <div style={{ color: "#C5D7F3", fontFamily: FONT.ui, fontWeight: 700, fontSize: 23, marginTop: 3 }}>{c.correct} CORRECT · {c.rightPlace} IN RIGHT PLACE</div>
          </div>
          <div style={{ color: p.palette.gold, fontSize: 32 }}>✓</div>
        </div>;
      })}
      <div style={{ position: "absolute", top: 1455, left: 90, right: 90, display: "flex", justifyContent: "center", gap: 18 }}>
        {Array.from({length:p.digits},(_,i)=><div key={i} style={{ width: 112, height: 116, borderRadius: 20, border: `3px solid ${p.palette.gold}`, background: "#07162D", display: "grid", placeItems: "center", color: "#fff", fontFamily: FONT.display, fontSize: 76, boxShadow: `0 0 26px ${p.palette.gold}44` }}>?</div>)}
      </div>
      <div style={{ position: "absolute", top: 1610, width: "100%", textAlign: "center", color: "#fff", fontFamily: FONT.ui, fontWeight: 900, fontSize: 34 }}>CAN YOU CRACK IT? COMMENT YOUR CODE!</div>
      <div style={{ position: "absolute", top: 1400, right: 82, color: p.palette.accent, fontFamily: FONT.mono, fontWeight: 800, fontSize: 22, letterSpacing: 1, opacity: 0.72, textShadow: `0 0 12px ${p.palette.accent}99` }}>@DimaagLock</div>
      <AskOutro from={introFrames + p.playSeconds * fps} a={p.askOutro} accent={p.palette.accent} tapAt={followTapAt(p.askOutro)} />
      {p.introSeconds > 0 && p.prevAnswer ? <PrevAnswerCard seconds={p.introSeconds} heading={`PREVIOUS PUZZLE #${String(p.postNo - 1).padStart(3, "0")} ANSWER`} answer={p.prevAnswer} accent={p.palette.accent} bg={`linear-gradient(180deg, ${p.palette.bgTop}, ${p.palette.bgBottom})`} /> : null}
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill>
      <VoiceCues cues={p.voice} />
      {p.sound ? <SoundBed music="sfx/music_puzzle.mp3" musicVolume={0.15} duck={duckFromCues(p.voice)} sfx={sfx} /> : null}
      {/* Channel look from the code-only style catalogue (e.g. sci-fi-hud: vault / hacker HUD). */}
      {p.style ? <StyledScene style={p.style}>{scene}</StyledScene> : scene}
    </AbsoluteFill>
  );
};
