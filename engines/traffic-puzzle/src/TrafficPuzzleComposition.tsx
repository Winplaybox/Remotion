import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SectionLabel, ProgressRail } from "@visuals/index";
import type { TrafficPuzzle } from "./model";
export const TrafficPuzzleComposition: React.FC<TrafficPuzzle> = (puzzle) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealAt = 780;
  const reveal = spring({ frame: frame - revealAt, fps, config: { damping: 18 } });
  const solved = frame >= revealAt;
  const cell = 116;
  const boardLeft = (1080 - puzzle.size * cell) / 2;
  const boardTop = 560;
  const move = interpolate(frame, [680, 780], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const timer = Math.max(0, 10 - Math.floor(Math.max(0, frame - 360) / fps));
  return <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #1B2C3B, #09121D 72%)", color: "#F4F7FA", fontFamily: "Arial,sans-serif" }}>
    <div style={{ position: "absolute", top: 110, left: 72, right: 72, display: "flex", justifyContent: "space-between" }}><SectionLabel color="#FFD447">GRIDLOCK</SectionLabel><span style={{ color: "#91A5B5" }}>LEVEL 01</span></div>
    <div style={{ position: "absolute", top: 205, left: 70, right: 70, textAlign: "center" }}><h1 style={{ fontSize: 54, margin: 0 }}>{puzzle.title}</h1><p style={{ color: "#91A5B5", fontSize: 24 }}>Clear the road to reach the exit</p></div>
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <rect x={boardLeft - 12} y={boardTop - 12} width={puzzle.size * cell + 24} height={puzzle.size * cell + 24} rx="28" fill="#263746" stroke="#486173" strokeWidth="5" />
      {Array.from({ length: puzzle.size + 1 }, (_, index) => <g key={index}><path d={`M${boardLeft + index * cell} ${boardTop} V${boardTop + puzzle.size * cell}`} stroke="#B9C8D3" strokeOpacity=".2" strokeDasharray="8 12" /><path d={`M${boardLeft} ${boardTop + index * cell} H${boardLeft + puzzle.size * cell}`} stroke="#B9C8D3" strokeOpacity=".2" strokeDasharray="8 12" /></g>)}
      {puzzle.vehicles.map((vehicle) => {
        const x = boardLeft + vehicle.col * cell + (vehicle.isTarget ? move * cell * 3.5 : 0);
        const y = boardTop + vehicle.row * cell;
        const width = (vehicle.axis === "horizontal" ? vehicle.length : 1) * cell - 12;
        const height = (vehicle.axis === "vertical" ? vehicle.length : 1) * cell - 12;
        return <g key={vehicle.id} transform={`translate(${x + 6} ${y + 6})`}><rect width={width} height={height} rx="18" fill={vehicle.color} stroke="#fff" strokeOpacity=".4" strokeWidth="3" /><rect x="12" y="12" width={Math.max(20, width - 24)} height={Math.max(20, height - 24)} rx="12" fill="#07101A" opacity=".12" /><text x={width / 2} y={height / 2 + 8} fill="#0B1A25" textAnchor="middle" fontSize="24" fontWeight="900">{vehicle.isTarget ? "YOU" : vehicle.id}</text></g>;
      })}
      <path d={`M${boardLeft + puzzle.size * cell + 4} ${boardTop + puzzle.exitRow * cell + cell / 2} h48 m-18 -18 l18 18 -18 18`} stroke="#63D9A2" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{ position: "absolute", top: 1370, left: 82, right: 82, padding: 30, borderRadius: 28, background: "rgba(9,18,29,.94)", border: "1px solid #344D60" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22 }}><span style={{ color: "#91A5B5" }}>TIME LEFT</span><strong style={{ color: solved ? "#63D9A2" : "#FFD447" }}>{solved ? "CLEAR!" : `00:${String(timer).padStart(2, "0")}`}</strong></div>
      <div style={{ textAlign: "center", marginTop: 18, fontSize: 22, opacity: solved ? reveal : 1 }}>{solved ? "EXIT FOUND — PUZZLE SOLVED" : "CAN YOU FIND THE ESCAPE ROUTE?"}</div>
    </div>
    <div style={{ position: "absolute", bottom: 110, left: 72, right: 72 }}><ProgressRail progress={frame / 1050} color="#FFD447" /></div>
  </AbsoluteFill>;
};
