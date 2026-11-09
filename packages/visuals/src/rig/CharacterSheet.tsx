import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT, useBundledFonts } from "../fonts";
import { Character, type Pose } from "./Character";
import { PRESETS, PRESET_IDS } from "./presets";

/** Still/preview of the whole cast (Studio: Rig/CharacterSheet) — used to review looks before they go into videos. */
export const CharacterSheet: React.FC<{ pose: Pose; talking: boolean }> = ({ pose, talking }) => {
  useBundledFonts();
  const frame = useCurrentFrame();
  const cols = 4;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#1B1530,#2A1F3D)" }}>
      <div style={{ position: "absolute", top: 40, width: "100%", textAlign: "center", fontFamily: FONT.display, fontSize: 72, color: "#FFD27A" }}>JASOOS BHAI — CAST</div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {PRESET_IDS.map((id, i) => {
          const x = 135 + (i % cols) * 270;
          const y = 720 + Math.floor(i / cols) * 560;
          return (
            <g key={id}>
              <circle cx={x} cy={y - 240} r={150} fill="#ffffff10" />
              <g transform={`translate(${x} ${y}) scale(0.78)`}>
                <Character look={id} pose={pose} talking={talking} frame={frame + i * 7} seed={id} />
              </g>
              <text x={x} y={y + 50} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={34} fill="#fff">{PRESETS[id].label}</text>
              <text x={x} y={y + 88} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={24} fill="#FFD27A">{id}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
