import React from "react";
import { AbsoluteFill } from "remotion";
import { Character } from "../rig/Character";
import { SetBackground } from "../rig/Sets";
import { STYLE_BY_ID } from "./recipes";
import { StyledScene, useStyleFrame } from "./StyledScene";

const Scene: React.FC = () => {
  const f = useStyleFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <SetBackground set="haveli" t={f / 30} />
        <g transform="translate(250 1480) scale(0.95)"><Character look="jasoos" action="talk" frame={f} seed="s1" exportMode /></g>
        <g transform="translate(560 1480) scale(0.95)"><Character look="seth" action="suspicious" frame={f} seed="s2" exportMode /></g>
        <g transform="translate(850 1480) scale(0.95)"><Character look="dadi" action="afraid" frame={f} seed="s3" exportMode /></g>
      </svg>
    </AbsoluteFill>
  );
};

/** One catalogue style on a sample scene (Studio: Styles/StyleShowcase). Status label sits OUTSIDE the style filter. */
export const StyleShowcase: React.FC<{ styleId: string }> = ({ styleId }) => {
  const s = STYLE_BY_ID[styleId];
  return (
    <AbsoluteFill>
      <StyledScene style={styleId}><Scene /></StyledScene>
      <div style={{ position: "absolute", left: 0, right: 0, top: 60, textAlign: "center", fontFamily: "Inter", fontWeight: 900, fontSize: 64, color: "#fff", textShadow: "0 4px 0 #000" }}>{s?.name}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: "Inter", fontWeight: 800, fontSize: 34, color: s?.status === "ready" ? "#9BE3B0" : s?.status === "approx" ? "#FFD27A" : "#F6A6A6", textShadow: "0 3px 0 #000" }}>{s?.status.toUpperCase()}</div>
    </AbsoluteFill>
  );
};
