import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SectionLabel, ProgressRail } from "@visuals/index";
import type { SanatanEpisode } from "./model";
const Motif: React.FC<{ type: string; frame: number }> = ({ type, frame }) => {
  const rotation = frame * 0.035;
  return <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.2 }}><g transform={`translate(540 880) rotate(${rotation})`} fill="none" stroke="#F4C56A" strokeWidth="3">{[170, 250, 330, 410].map((radius) => <circle key={radius} r={radius} />)}{Array.from({ length: 12 }, (_, index) => <ellipse key={index} rx={type === "lotus" ? 105 : 150} ry="350" transform={`rotate(${index * 15})`} />)}<path d="M0 -390 L338 195 L-338 195 Z M0 390 L338 -195 L-338 -195 Z" /></g></svg>;
};
const StoryScene: React.FC<{ heading: string; chapter: string; narration: string; palette: readonly [string, string]; motif: string; duration: number }> = (scene) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 75 } });
  const fade = interpolate(frame, [scene.duration - 24, scene.duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [0, scene.duration], [1.04, 1.12], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: `linear-gradient(150deg, ${scene.palette[0]}, ${scene.palette[1]})`, color: "#FFF7E8", opacity: fade }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(255,202,118,.22), transparent 58%)", transform: `scale(${zoom})` }} /><Motif type={scene.motif} frame={frame} />
    <div style={{ position: "absolute", top: 140, left: 72, right: 72, textAlign: "center", opacity: enter }}><SectionLabel color="#F4C56A">{scene.chapter}</SectionLabel></div>
    <div style={{ position: "absolute", top: 520, left: 72, right: 72, textAlign: "center", opacity: enter, transform: `translateY(${(1 - enter) * 36}px)` }}>
      <div style={{ fontSize: 70, lineHeight: 1.18, fontWeight: 800, fontFamily: "Georgia, serif", textShadow: "0 8px 30px rgba(0,0,0,.3)" }}>{scene.heading}</div>
      <div style={{ width: 150, height: 3, background: "#F4C56A", margin: "48px auto" }} />
      <div style={{ fontSize: 31, lineHeight: 1.55, fontFamily: "Arial,sans-serif", color: "#F5E6D0" }}>{scene.narration}</div>
    </div>
  </AbsoluteFill>;
};
export const SanatanStoryComposition: React.FC<SanatanEpisode> = (episode) => {
  const frame = useCurrentFrame();
  let cursor = 0;
  const scenes = episode.scenes.map((scene) => { const from = cursor; cursor += scene.durationFrames; return { scene, from }; });
  return <AbsoluteFill style={{ background: "#120F22" }}>
    {scenes.map(({ scene, from }) => <Sequence key={scene.id} from={from} durationInFrames={scene.durationFrames}><StoryScene {...scene} duration={scene.durationFrames} /></Sequence>)}
    <div style={{ position: "absolute", bottom: 160, left: 72, right: 72 }}><ProgressRail progress={frame / Math.max(1, cursor)} color="#F4C56A" /></div>
    <div style={{ position: "absolute", bottom: 95, left: 0, right: 0, textAlign: "center", color: "#E6D4B6", fontSize: 18, letterSpacing: 4 }}>SANATAN STORIES • WISDOM • TRADITION</div>
  </AbsoluteFill>;
};
