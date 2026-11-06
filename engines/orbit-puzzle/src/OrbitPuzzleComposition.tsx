import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneBackdrop, SectionLabel, ProgressRail } from "@visuals/index";
import type { OrbitPuzzle } from "./model";
const Orbit: React.FC<{ radius: number; speed: number; phase: number; color: string; frame: number }> = ({ radius, speed, phase, color, frame }) => {
  const angle = frame * speed + phase;
  const x = 540 + Math.cos(angle) * radius;
  const y = 850 + Math.sin(angle) * radius * 0.72;
  return <g><ellipse cx="540" cy="850" rx={radius} ry={radius * 0.72} fill="none" stroke={color} strokeOpacity=".32" strokeWidth="2" /><circle cx={x} cy={y} r="25" fill={color} opacity=".18" /><circle cx={x} cy={y} r="15" fill={color} /></g>;
};
export const OrbitPuzzleComposition: React.FC<OrbitPuzzle> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = frame >= props.revealFrame;
  const intro = spring({ frame, fps, config: { damping: 18 } });
  const revealProgress = spring({ frame: frame - props.revealFrame, fps, config: { damping: 18, stiffness: 90 } });
  const timer = Math.max(0, 8 - Math.floor(Math.max(0, frame - 390) / fps));
  const colors = ["#55D6FF", "#A78BFA", "#72E6B2"];
  return <SceneBackdrop colors={["#07111F", "#122B43"]}>
    <div style={{ position: "absolute", top: 110, left: 72, right: 72, display: "flex", justifyContent: "space-between" }}><SectionLabel>{props.title}</SectionLabel><span style={{ color: "#8DA4BA", fontSize: 18 }}>PATTERN CHALLENGE</span></div>
    <div style={{ position: "absolute", top: 220, left: 70, right: 70, textAlign: "center", opacity: intro }}><div style={{ color: "#FFD166", fontSize: 22, letterSpacing: 5, fontWeight: 800 }}>OBSERVE THE PATTERN</div><div style={{ color: "#F4F8FC", fontSize: 58, fontWeight: 900, marginTop: 24 }}>{props.prompt}</div></div>
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}><circle cx="540" cy="850" r="38" fill="#FFD166" />{props.orbitRadii.map((radius, index) => <Orbit key={radius} radius={radius} speed={props.orbitSpeeds[index] ?? 0.01} phase={index * 1.2} color={colors[index % colors.length] ?? "#55D6FF"} frame={frame} />)}</svg>
    <div style={{ position: "absolute", top: 1330, left: 86, right: 86, padding: 30, borderRadius: 28, border: "1px solid #24435C", background: "rgba(13,27,45,.94)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: "#8DA4BA", fontSize: 20 }}><span>YOUR CHALLENGE</span><strong style={{ color: reveal ? "#72E6B2" : "#FFD166" }}>{reveal ? "SOLVED" : `${timer}s`}</strong></div>
      <div style={{ display: "flex", gap: 16, marginTop: 26 }}>{props.options.map((option, index) => <div key={option} style={{ flex: 1, padding: "30px 8px", textAlign: "center", borderRadius: 16, border: `2px solid ${reveal && index === props.answerIndex ? "#72E6B2" : "#24435C"}`, color: reveal && index === props.answerIndex ? "#72E6B2" : "#F4F8FC", fontSize: 30, fontWeight: 800 }}>{option}{reveal && index === props.answerIndex ? " ✓" : ""}</div>)}</div>
      <div style={{ marginTop: 22, textAlign: "center", color: "#72E6B2", fontSize: 20, opacity: reveal ? revealProgress : 0 }}>ANSWER REVEALED</div>
    </div>
    <div style={{ position: "absolute", bottom: 110, left: 72, right: 72 }}><ProgressRail progress={interpolate(frame, [0, 900], [0, 1], { extrapolateRight: "clamp" })} /></div>
  </SceneBackdrop>;
};
